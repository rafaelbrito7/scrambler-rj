import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { AccessError, createAccessService } from "@/server/access";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });

const profile = {
  fullName: "Bruna Tavares",
  whatsapp: "(21) 98888-7777",
  bikeModel: "Scrambler 900",
  engineSize: "900",
};

async function createUser(email: string) {
  return db.user.create({ data: { email, name: email.split("@")[0] } });
}

async function createAdmin() {
  const admin = await createUser("chefe@exemplo.com");

  await access.submitJoinRequest(admin.id, profile);

  return admin;
}

async function expectAccessError(action: Promise<unknown>, code: AccessError["code"]) {
  await expect(action).rejects.toMatchObject({ name: "AccessError", code });
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$disconnect();
});

describe("pedido de ingresso", () => {
  it("deixa quem ainda não pediu sem acesso e sem pedido", async () => {
    const user = await createUser("novo@exemplo.com");

    expect(await access.getAccess(user.id)).toEqual({ state: "none", isAdmin: false });
  });

  it("coloca o pedido em avaliação e guarda o WhatsApp só com dígitos", async () => {
    const user = await createUser("novo@exemplo.com");

    await access.submitJoinRequest(user.id, profile);

    expect(await access.getAccess(user.id)).toEqual({ state: "pending", isAdmin: false });

    const admin = await createAdmin();
    const [pending] = await access.listPending(admin.id);

    expect(pending).toMatchObject({ fullName: "Bruna Tavares", whatsapp: "21988887777", engineSize: 900 });
  });

  it("não cria um segundo pedido para a mesma conta", async () => {
    const user = await createUser("novo@exemplo.com");

    await access.submitJoinRequest(user.id, profile);

    await expectAccessError(access.submitJoinRequest(user.id, profile), "ALREADY_REQUESTED");
    expect(await db.joinRequest.count({ where: { userId: user.id } })).toBe(1);
  });

  it("recusa dados incompletos e aponta os campos", async () => {
    const user = await createUser("novo@exemplo.com");

    await expect(
      access.submitJoinRequest(user.id, { ...profile, whatsapp: "123", bikeModel: "Bonneville T120", engineSize: "abc" }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT", fieldErrors: { whatsapp: expect.any(String), engineSize: expect.any(String) } });
  });

  it("aprova na hora e torna administrador quem está na lista inicial", async () => {
    const admin = await createAdmin();

    expect(await access.getAccess(admin.id)).toEqual({ state: "approved", isAdmin: true });
  });
});

describe("avaliação de perfil", () => {
  it("aprovar libera o acesso e registra quem decidiu", async () => {
    const admin = await createAdmin();
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    await access.decide(admin.id, request.id, "approve");

    expect(await access.getAccess(user.id)).toEqual({ state: "approved", isAdmin: false });
    expect(await access.countPending(admin.id)).toBe(0);

    const [decided] = await access.listDecided(admin.id);

    expect(decided).toMatchObject({ id: request.id, status: "APPROVED", lastDecision: { kind: "APPROVED", authorName: "chefe" } });
  });

  it("reprovar mantém o acesso negado", async () => {
    const admin = await createAdmin();
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    await access.decide(admin.id, request.id, "reject");

    expect(await access.getAccess(user.id)).toEqual({ state: "rejected", isAdmin: false });
  });

  it("um pedido já avaliado não aceita outra decisão", async () => {
    const admin = await createAdmin();
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    await access.decide(admin.id, request.id, "approve");

    await expectAccessError(access.decide(admin.id, request.id, "reject"), "ALREADY_DECIDED");
    expect(await access.getAccess(user.id)).toMatchObject({ state: "approved" });
  });

  it("grava uma única decisão quando dois administradores decidem ao mesmo tempo", async () => {
    const admin = await createAdmin();
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    const results = await Promise.allSettled([
      access.decide(admin.id, request.id, "approve"),
      access.decide(admin.id, request.id, "reject"),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await db.accessDecision.count({ where: { joinRequestId: request.id } })).toBe(1);
  });

  it("reverter uma reprovação libera o acesso sem novo cadastro", async () => {
    const admin = await createAdmin();
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    await access.decide(admin.id, request.id, "reject");
    await access.revertRejection(admin.id, request.id);

    expect(await access.getAccess(user.id)).toEqual({ state: "approved", isAdmin: false });
    expect(await db.accessDecision.count({ where: { joinRequestId: request.id } })).toBe(2);
  });

  it("só reverte pedidos reprovados", async () => {
    const admin = await createAdmin();
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    await expectAccessError(access.revertRejection(admin.id, request.id), "INVALID_STATE");
  });
});

describe("permissões", () => {
  it("rider aprovado não lista, não conta e não decide pedidos", async () => {
    const admin = await createAdmin();
    const participant = await createUser("rider@exemplo.com");
    const participantRequest = await access.submitJoinRequest(participant.id, profile);

    await access.decide(admin.id, participantRequest.id, "approve");

    const newcomer = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(newcomer.id, profile);

    await expectAccessError(access.listPending(participant.id), "FORBIDDEN");
    await expectAccessError(access.listDecided(participant.id), "FORBIDDEN");
    await expectAccessError(access.countPending(participant.id), "FORBIDDEN");
    await expectAccessError(access.decide(participant.id, request.id, "approve"), "FORBIDDEN");
    await expectAccessError(access.revertRejection(participant.id, request.id), "FORBIDDEN");
    expect(await access.getAccess(newcomer.id)).toMatchObject({ state: "pending" });
  });

  it("solicitante em avaliação não aprova o próprio pedido", async () => {
    const user = await createUser("novo@exemplo.com");
    const request = await access.submitJoinRequest(user.id, profile);

    await expectAccessError(access.decide(user.id, request.id, "approve"), "FORBIDDEN");
  });
});

describe("bloquear rider", () => {
  async function setup() {
    const admin = await createAdmin();
    const user = await createUser("ana@exemplo.com");
    const request = await access.submitJoinRequest(user.id, { ...profile, fullName: "Ana Reis" });

    await access.decide(admin.id, request.id, "approve");

    return { admin, user, request };
  }

  it("corta o acesso de quem foi bloqueado e registra quem bloqueou", async () => {
    const { admin, user, request } = await setup();

    await access.block(admin.id, request.id);

    expect(await access.getAccess(user.id)).toEqual({ state: "blocked", isAdmin: false });

    const blocked = (await access.listParticipants(admin.id)).find(
      (participant) => participant.id === request.id,
    );

    expect(blocked).toMatchObject({ status: "BLOCKED", fullName: "Ana Reis", whatsapp: "21988887777" });
    expect(blocked?.lastDecision).toMatchObject({ kind: "BLOCKED", authorName: "chefe" });
    expect(blocked?.lastDecision?.createdAt).toBeInstanceOf(Date);
  });

  it("devolve o acesso ao desbloquear, com o cadastro intacto", async () => {
    const { admin, user, request } = await setup();

    await access.block(admin.id, request.id);
    await access.unblock(admin.id, request.id);

    expect(await access.getAccess(user.id)).toEqual({ state: "approved", isAdmin: false });

    const [restored] = await access.listParticipants(admin.id);

    expect(restored).toMatchObject({ status: "APPROVED", fullName: "Ana Reis", engineSize: 900 });
    expect(restored.lastDecision?.kind).toBe("UNBLOCKED");
  });

  it("lista aprovados e bloqueados por nome, sem pedidos em avaliação ou reprovados", async () => {
    const { admin, request } = await setup();
    const waiting = await createUser("espera@exemplo.com");
    const refused = await createUser("negado@exemplo.com");

    await access.submitJoinRequest(waiting.id, { ...profile, fullName: "Zeca Pendente" });

    const refusedRequest = await access.submitJoinRequest(refused.id, {
      ...profile,
      fullName: "Zico Negado",
    });

    await access.decide(admin.id, refusedRequest.id, "reject");
    await access.block(admin.id, request.id);

    const participants = await access.listParticipants(admin.id);

    expect(participants.map((participant) => [participant.fullName, participant.status, participant.isAdmin])).toEqual([
      ["Ana Reis", "BLOCKED", false],
      ["Bruna Tavares", "APPROVED", true],
    ]);
  });

  it("só bloqueia quem está aprovado e só desbloqueia quem está bloqueado", async () => {
    const { admin, request } = await setup();
    const waiting = await createUser("espera@exemplo.com");
    const pending = await access.submitJoinRequest(waiting.id, profile);

    await expectAccessError(access.unblock(admin.id, request.id), "INVALID_STATE");
    await expectAccessError(access.block(admin.id, pending.id), "INVALID_STATE");
    await expectAccessError(access.block(admin.id, "inexistente"), "NOT_FOUND");

    await access.block(admin.id, request.id);

    await expectAccessError(access.block(admin.id, request.id), "INVALID_STATE");
  });

  it("não deixa rider bloquear, desbloquear nem ver a lista com telefones", async () => {
    const { admin, user, request } = await setup();
    const adminRequest = (await access.listParticipants(admin.id)).find(
      (participant) => participant.isAdmin,
    );

    await expectAccessError(access.block(user.id, adminRequest?.id ?? ""), "FORBIDDEN");
    await expectAccessError(access.listParticipants(user.id), "FORBIDDEN");

    await access.block(admin.id, request.id);

    await expectAccessError(access.unblock(user.id, request.id), "FORBIDDEN");
  });
});

describe("administradores", () => {
  async function approve(adminId: string, email: string, fullName: string) {
    const user = await createUser(email);
    const request = await access.submitJoinRequest(user.id, { ...profile, fullName });

    await access.decide(adminId, request.id, "approve");

    return { user, request };
  }

  async function requestOf(adminId: string, userEmailName: string) {
    const participants = await access.listParticipants(adminId);
    const found = participants.find((participant) => participant.accountName === userEmailName);

    if (!found) throw new Error(`Rider ${userEmailName} não encontrado.`);

    return found;
  }

  it("promove um rider aprovado, que passa a ter os mesmos poderes", async () => {
    const admin = await createAdmin();
    const ana = await approve(admin.id, "ana@exemplo.com", "Ana Reis");

    await access.promote(admin.id, ana.request.id);

    expect(await access.getAccess(ana.user.id)).toEqual({ state: "approved", isAdmin: true });
    expect((await requestOf(ana.user.id, "ana")).lastDecision).toMatchObject({
      kind: "PROMOTED",
      authorName: "chefe",
    });
    await expectAccessError(access.promote(admin.id, ana.request.id), "INVALID_STATE");
  });

  it("só promove quem está aprovado", async () => {
    const admin = await createAdmin();
    const waiting = await createUser("espera@exemplo.com");
    const pending = await access.submitJoinRequest(waiting.id, profile);
    const ana = await approve(admin.id, "ana@exemplo.com", "Ana Reis");

    await access.block(admin.id, ana.request.id);

    await expectAccessError(access.promote(admin.id, pending.id), "INVALID_STATE");
    await expectAccessError(access.promote(admin.id, ana.request.id), "INVALID_STATE");
    await expectAccessError(access.promote(admin.id, "inexistente"), "NOT_FOUND");
  });

  it("tira o papel de outro administrador e registra a mudança", async () => {
    const admin = await createAdmin();
    const ana = await approve(admin.id, "ana@exemplo.com", "Ana Reis");

    await access.promote(admin.id, ana.request.id);
    await access.demote(ana.user.id, (await requestOf(admin.id, "chefe")).id);

    expect(await access.getAccess(admin.id)).toEqual({ state: "approved", isAdmin: false });
    expect((await requestOf(ana.user.id, "chefe")).lastDecision?.kind).toBe("DEMOTED");
    await expectAccessError(access.demote(ana.user.id, ana.request.id), "LAST_ADMIN");
  });

  it("recusa rebaixar ou bloquear o único administrador", async () => {
    const admin = await createAdmin();
    const own = await requestOf(admin.id, "chefe");

    await approve(admin.id, "ana@exemplo.com", "Ana Reis");

    await expectAccessError(access.demote(admin.id, own.id), "LAST_ADMIN");
    await expectAccessError(access.block(admin.id, own.id), "LAST_ADMIN");
    expect(await access.getAccess(admin.id)).toEqual({ state: "approved", isAdmin: true });
  });

  it("não conta um administrador bloqueado como quem fica", async () => {
    const admin = await createAdmin();
    const ana = await approve(admin.id, "ana@exemplo.com", "Ana Reis");
    const own = await requestOf(admin.id, "chefe");

    await access.promote(admin.id, ana.request.id);
    await access.block(admin.id, ana.request.id);

    await expectAccessError(access.demote(admin.id, own.id), "LAST_ADMIN");
    await expectAccessError(access.block(admin.id, own.id), "LAST_ADMIN");
  });

  it("mantém um administrador quando dois se rebaixam ou se bloqueiam ao mesmo tempo", async () => {
    for (const change of ["demote", "block"] as const) {
      await resetDatabase(db);

      const admin = await createAdmin();
      const ana = await approve(admin.id, "ana@exemplo.com", "Ana Reis");
      const own = await requestOf(admin.id, "chefe");

      await access.promote(admin.id, ana.request.id);

      const results = await Promise.allSettled([
        access[change](admin.id, ana.request.id),
        access[change](ana.user.id, own.id),
      ]);
      const remaining = [await access.getAccess(admin.id), await access.getAccess(ana.user.id)].filter(
        (viewer) => viewer.isAdmin,
      );

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(remaining).toHaveLength(1);
    }
  });

  it("não deixa rider promover nem rebaixar", async () => {
    const admin = await createAdmin();
    const ana = await approve(admin.id, "ana@exemplo.com", "Ana Reis");
    const bia = await approve(admin.id, "bia@exemplo.com", "Bia Luz");

    await expectAccessError(access.promote(ana.user.id, bia.request.id), "FORBIDDEN");
    await expectAccessError(access.promote(ana.user.id, ana.request.id), "FORBIDDEN");
    await expectAccessError(
      access.demote(ana.user.id, (await requestOf(admin.id, "chefe")).id),
      "FORBIDDEN",
    );
  });
});
