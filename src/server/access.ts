import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { loadOfferedBikeModels } from "@/server/bike-model-list";
import { resolveBike } from "@/server/bike-models";
import type { Database } from "@/server/db";
import { recordName } from "@/server/display-name";

export type AccessState = "none" | "pending" | "approved" | "rejected" | "blocked";

export type Access = {
  state: AccessState;
  isAdmin: boolean;
};

export type JoinRequestInput = {
  fullName: string;
  whatsapp: string;
  bikeModel: string;
  engineSize: string;
};

export type JoinRequestField = keyof JoinRequestInput;

type AccessErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ALREADY_REQUESTED"
  | "ALREADY_DECIDED"
  | "INVALID_STATE"
  | "LAST_ADMIN"
  | "INVALID_INPUT";

export class AccessError extends Error {
  readonly name = "AccessError";

  constructor(
    readonly code: AccessErrorCode,
    readonly fieldErrors: Partial<Record<JoinRequestField, string>> = {},
  ) {
    super(code);
  }
}

export type DecisionSummary = {
  kind:
    | "APPROVED"
    | "REJECTED"
    | "REVERTED"
    | "BLOCKED"
    | "UNBLOCKED"
    | "PROMOTED"
    | "DEMOTED";
  authorName: string;
  createdAt: Date;
};

export type JoinRequestSummary = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  fullName: string;
  whatsapp: string;
  bikeModel: string;
  engineSize: number;
  createdAt: Date;
  accountName: string | null;
  accountEmail: string | null;
  accountImage: string | null;
  isAdmin: boolean;
  lastDecision: DecisionSummary | null;
};

const stateByStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  BLOCKED: "blocked",
} as const satisfies Record<JoinRequestSummary["status"], AccessState>;

const joinRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(80, "Use no máximo 80 caracteres."),
  whatsapp: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine(
      (digits) => digits.length >= 10 && digits.length <= 13,
      "Informe o WhatsApp com DDD, por exemplo (21) 98888-7777.",
    ),
  bikeModel: z
    .string()
    .trim()
    .min(2, "Informe o modelo da moto.")
    .max(60, "Use no máximo 60 caracteres."),
  engineSize: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "Informe a cilindrada em números, por exemplo 900.")
    .transform(Number),
});

const requestInclude = {
  user: { select: { name: true, email: true, image: true, role: true } },
  decisions: {
    orderBy: { createdAt: "desc" },
    take: 1,
    include: { author: { select: { name: true, email: true } } },
  },
} as const;

type AccessOptions = {
  adminEmails: string[];
};

export function createAccessService(db: Database, options: AccessOptions) {
  const adminEmails = new Set(
    options.adminEmails.map((email) => email.trim().toLowerCase()).filter(Boolean),
  );

  async function getAccess(userId: string): Promise<Access> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, joinRequest: { select: { status: true } } },
    });

    if (!user?.joinRequest) return { state: "none", isAdmin: false };

    const state = stateByStatus[user.joinRequest.status];

    return { state, isAdmin: state === "approved" && user.role === "ADMIN" };
  }

  async function assertAdmin(userId: string) {
    const access = await getAccess(userId);

    if (!access.isAdmin) throw new AccessError("FORBIDDEN");
  }

  async function submitJoinRequest(userId: string, input: JoinRequestInput) {
    const bike = resolveBike(await loadOfferedBikeModels(db), input.bikeModel, input.engineSize);
    const parsed = joinRequestSchema.safeParse({
      ...input,
      bikeModel: bike.model,
      engineSize: bike.engineSize,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<JoinRequestField, string>> = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as JoinRequestField;

        fieldErrors[field] ??= issue.message;
      }

      throw new AccessError("INVALID_INPUT", fieldErrors);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, joinRequest: { select: { id: true } } },
    });

    if (!user) throw new AccessError("NOT_FOUND");
    if (user.joinRequest) throw new AccessError("ALREADY_REQUESTED");

    const isInitialAdmin = adminEmails.has(user.email?.toLowerCase() ?? "");

    try {
      return await db.$transaction(async (tx) => {
        const request = await tx.joinRequest.create({
          data: {
            userId,
            ...parsed.data,
            status: isInitialAdmin ? "APPROVED" : "PENDING",
            decidedAt: isInitialAdmin ? new Date() : null,
          },
        });

        if (isInitialAdmin) {
          await tx.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
        }

        // The request stays as what was evaluated; the profile is the copy the person edits.
        const firstBike = await tx.bike.create({
          data: {
            userId,
            model: parsed.data.bikeModel,
            engineSize: parsed.data.engineSize,
            listedModelId: bike.listedModelId,
          },
        });

        await tx.profile.create({
          data: {
            userId,
            fullName: parsed.data.fullName,
            whatsapp: parsed.data.whatsapp,
            mainBikeId: firstBike.id,
          },
        });

        return request;
      });
    } catch (error) {
      const isDuplicate =
        typeof error === "object" && error !== null && "code" in error && error.code === "P2002";

      if (isDuplicate) throw new AccessError("ALREADY_REQUESTED");

      throw error;
    }
  }

  function summarize(
    request: Awaited<ReturnType<typeof findRequests>>[number],
  ): JoinRequestSummary {
    const [decision] = request.decisions;

    return {
      id: request.id,
      status: request.status,
      fullName: request.fullName,
      whatsapp: request.whatsapp,
      bikeModel: request.bikeModel,
      engineSize: request.engineSize,
      createdAt: request.createdAt,
      accountName: request.user.name,
      accountEmail: request.user.email,
      accountImage: request.user.image,
      isAdmin: request.user.role === "ADMIN",
      lastDecision: decision
        ? {
            kind: decision.kind,
            authorName: decision.author.name ?? decision.author.email ?? "Administrador",
            createdAt: decision.createdAt,
          }
        : null,
    };
  }

  function findRequests(isPending: boolean) {
    return db.joinRequest.findMany({
      where: isPending ? { status: "PENDING" } : { status: { not: "PENDING" }, decisions: { some: {} } },
      orderBy: isPending ? { createdAt: "asc" } : { decidedAt: "desc" },
      include: requestInclude,
    });
  }

  async function listPending(adminId: string) {
    await assertAdmin(adminId);

    return (await findRequests(true)).map(summarize);
  }

  async function listDecided(adminId: string) {
    await assertAdmin(adminId);

    return (await findRequests(false)).map(summarize);
  }

  async function countPending(adminId: string) {
    await assertAdmin(adminId);

    return db.joinRequest.count({ where: { status: "PENDING" } });
  }

  async function decide(adminId: string, requestId: string, decision: "approve" | "reject") {
    await assertAdmin(adminId);

    const status = decision === "approve" ? "APPROVED" : "REJECTED";

    await db.$transaction(async (tx) => {
      // The status guard makes the first decision win when two admins act at once.
      const updated = await tx.joinRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: { status, decidedAt: new Date() },
      });

      if (updated.count === 0) {
        const exists = await tx.joinRequest.count({ where: { id: requestId } });

        throw new AccessError(exists ? "ALREADY_DECIDED" : "NOT_FOUND");
      }

      await tx.accessDecision.create({
        data: { joinRequestId: requestId, authorId: adminId, kind: status },
      });
    });
  }

  async function revertRejection(adminId: string, requestId: string) {
    await assertAdmin(adminId);

    await db.$transaction(async (tx) => {
      const updated = await tx.joinRequest.updateMany({
        where: { id: requestId, status: "REJECTED" },
        data: { status: "APPROVED", decidedAt: new Date() },
      });

      if (updated.count === 0) {
        const exists = await tx.joinRequest.count({ where: { id: requestId } });

        throw new AccessError(exists ? "INVALID_STATE" : "NOT_FOUND");
      }

      await tx.accessDecision.create({
        data: { joinRequestId: requestId, authorId: adminId, kind: "REVERTED" },
      });
    });
  }

  // Everyone who is or has been inside the group: approved and blocked, by name.
  async function listParticipants(adminId: string) {
    await assertAdmin(adminId);

    const requests = await db.joinRequest.findMany({
      where: { status: { in: ["APPROVED", "BLOCKED"] } },
      include: {
        ...requestInclude,
        user: {
          select: {
            ...requestInclude.user.select,
            profile: { select: { fullName: true, nickname: true, whatsapp: true, mainBike: true } },
          },
        },
      },
    });

    // People are listed by what their profile says now, not by what they wrote when joining.
    return requests
      .map((request) => {
        const profile = request.user.profile;

        return {
          ...summarize(request),
          userId: request.userId,
          fullName: profile ? recordName(profile) : request.fullName,
          whatsapp: profile?.whatsapp ?? request.whatsapp,
          bikeModel: profile?.mainBike.model ?? request.bikeModel,
          engineSize: profile?.mainBike.engineSize ?? request.engineSize,
        };
      })
      .toSorted((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
  }

  // Every change that can take an administrator away runs one at a time behind this lock, so
  // two requests arriving together cannot each see the other as the administrator who stays.
  async function assertKeepsAnAdmin(tx: Prisma.TransactionClient, requestId: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(7201)`;

    const activeAdmins = await tx.joinRequest.findMany({
      where: { status: "APPROVED", user: { role: "ADMIN" } },
      select: { id: true },
    });
    const isLastOne = activeAdmins.length === 1 && activeAdmins[0].id === requestId;

    if (isLastOne) throw new AccessError("LAST_ADMIN");
  }

  // Blocking only flips the access state. Orders, payments and ride answers stay as they are.
  async function setBlocked(adminId: string, requestId: string, isBlocking: boolean) {
    await assertAdmin(adminId);

    const from = isBlocking ? "APPROVED" : "BLOCKED";
    const to = isBlocking ? "BLOCKED" : "APPROVED";

    await db.$transaction(async (tx) => {
      if (isBlocking) await assertKeepsAnAdmin(tx, requestId);

      const updated = await tx.joinRequest.updateMany({
        where: { id: requestId, status: from },
        data: { status: to, decidedAt: new Date() },
      });

      if (updated.count === 0) {
        const exists = await tx.joinRequest.count({ where: { id: requestId } });

        throw new AccessError(exists ? "INVALID_STATE" : "NOT_FOUND");
      }

      await tx.accessDecision.create({
        data: {
          joinRequestId: requestId,
          authorId: adminId,
          kind: isBlocking ? "BLOCKED" : "UNBLOCKED",
        },
      });
    });
  }

  // Administrators all have the same powers; only an approved participant can become one.
  async function setAdmin(adminId: string, requestId: string, isPromoting: boolean) {
    await assertAdmin(adminId);

    await db.$transaction(async (tx) => {
      if (!isPromoting) await assertKeepsAnAdmin(tx, requestId);

      const request = await tx.joinRequest.findUnique({
        where: { id: requestId },
        select: { userId: true, status: true },
      });

      if (!request) throw new AccessError("NOT_FOUND");
      if (request.status !== "APPROVED") throw new AccessError("INVALID_STATE");

      const updated = await tx.user.updateMany({
        where: { id: request.userId, role: isPromoting ? "PARTICIPANT" : "ADMIN" },
        data: { role: isPromoting ? "ADMIN" : "PARTICIPANT" },
      });

      if (updated.count === 0) throw new AccessError("INVALID_STATE");

      await tx.accessDecision.create({
        data: {
          joinRequestId: requestId,
          authorId: adminId,
          kind: isPromoting ? "PROMOTED" : "DEMOTED",
        },
      });
    });
  }

  function promote(adminId: string, requestId: string) {
    return setAdmin(adminId, requestId, true);
  }

  function demote(adminId: string, requestId: string) {
    return setAdmin(adminId, requestId, false);
  }

  function block(adminId: string, requestId: string) {
    return setBlocked(adminId, requestId, true);
  }

  function unblock(adminId: string, requestId: string) {
    return setBlocked(adminId, requestId, false);
  }

  return {
    listParticipants,
    block,
    unblock,
    promote,
    demote,
    getAccess,
    submitJoinRequest,
    listPending,
    listDecided,
    countPending,
    decide,
    revertRejection,
  };
}

export type AccessService = ReturnType<typeof createAccessService>;
