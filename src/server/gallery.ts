import type { AccessService } from "@/server/access";
import type { Database } from "@/server/db";
import { groupName } from "@/server/display-name";
import { isAcceptedPhotoType, type PhotoStorage, type StoredPhoto } from "@/server/photo-storage";
import type { RideService } from "@/server/rides";

export const MAX_GALLERY_PHOTOS_PER_RIDER = 10;
export const MAX_GALLERY_PHOTOS_PER_RIDE = 150;
export const MAX_GALLERY_UPLOAD_BYTES = 12 * 1024 * 1024;

type GalleryErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "GALLERY_CLOSED"
  | "DID_NOT_ATTEND"
  | "INVALID_PHOTO"
  | "RIDER_LIMIT"
  | "RIDE_LIMIT";

export class GalleryError extends Error {
  readonly name = "GalleryError";

  constructor(readonly code: GalleryErrorCode) {
    super(code);
  }
}

export type GalleryPhoto = {
  id: string;
  photoKey: string;
  authorId: string;
  authorName: string;
  approved: boolean;
};

export type Gallery = {
  // False before the ride has set off and on a cancelled ride: nothing to show or send.
  isOpen: boolean;
  canUpload: boolean;
  remaining: number;
  approved: GalleryPhoto[];
  // What still waits for an administrator: the viewer's own, or everyone's for an administrator.
  pending: GalleryPhoto[];
};

// Makes a phone photo fit for the gallery. Injected so the tests need no real image.
export type PhotoShrinker = (photo: StoredPhoto) => Promise<StoredPhoto>;

export function createGalleryService(
  db: Database,
  access: Pick<AccessService, "getAccess">,
  rides: Pick<RideService, "hasAttended">,
  photos: PhotoStorage,
  shrink: PhotoShrinker,
  now: () => Date = () => new Date(),
) {
  async function viewerOf(userId: string) {
    const viewer = await access.getAccess(userId);

    if (viewer.state !== "approved") throw new GalleryError("FORBIDDEN");

    return viewer;
  }

  async function findRide(rideId: string) {
    const ride = await db.ride.findUnique({
      where: { id: rideId },
      select: { status: true, startsAt: true },
    });

    if (!ride) throw new GalleryError("NOT_FOUND");

    return { isOpen: ride.status !== "CANCELLED" && ride.startsAt <= now() };
  }

  async function getGallery(viewerId: string, rideId: string): Promise<Gallery> {
    const viewer = await viewerOf(viewerId);
    const { isOpen } = await findRide(rideId);

    if (!isOpen) return { isOpen, canUpload: false, remaining: 0, approved: [], pending: [] };

    const [rows, attended] = await Promise.all([
      db.ridePhoto.findMany({
        where: { rideId, user: { joinRequest: { status: "APPROVED" } } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          photoKey: true,
          userId: true,
          approved: true,
          user: { select: { name: true, profile: { select: { fullName: true, nickname: true } } } },
        },
      }),
      rides.hasAttended(viewerId, rideId),
    ]);
    const all = rows.map((row) => ({
      id: row.id,
      photoKey: row.photoKey,
      authorId: row.userId,
      authorName: row.user.profile ? groupName(row.user.profile) : (row.user.name ?? "Rider"),
      approved: row.approved,
    }));
    const mine = all.filter((photo) => photo.authorId === viewerId).length;
    const canUpload = viewer.isAdmin || attended;
    const room = Math.min(
      MAX_GALLERY_PHOTOS_PER_RIDER - mine,
      MAX_GALLERY_PHOTOS_PER_RIDE - all.length,
    );

    return {
      isOpen,
      canUpload,
      remaining: canUpload ? Math.max(0, room) : 0,
      approved: all.filter((photo) => photo.approved),
      pending: all.filter((photo) => !photo.approved && (viewer.isAdmin || photo.authorId === viewerId)),
    };
  }

  async function addPhoto(userId: string, rideId: string, upload: StoredPhoto) {
    const viewer = await viewerOf(userId);
    const { isOpen } = await findRide(rideId);

    if (!isOpen) throw new GalleryError("GALLERY_CLOSED");
    if (!viewer.isAdmin && !(await rides.hasAttended(userId, rideId))) {
      throw new GalleryError("DID_NOT_ATTEND");
    }

    const isRejected =
      !isAcceptedPhotoType(upload.contentType) || upload.bytes.byteLength > MAX_GALLERY_UPLOAD_BYTES;

    if (isRejected) throw new GalleryError("INVALID_PHOTO");

    let small: StoredPhoto;

    try {
      small = await shrink(upload);
    } catch {
      throw new GalleryError("INVALID_PHOTO");
    }

    const photoKey = await photos.save(small);

    try {
      return await db.$transaction(async (tx) => {
        // The ride row is the queue: two uploads cannot both take the last free slot.
        await tx.$queryRaw`SELECT "id" FROM "Ride" WHERE "id" = ${rideId} FOR UPDATE`;

        const [inRide, mine] = await Promise.all([
          tx.ridePhoto.count({ where: { rideId } }),
          tx.ridePhoto.count({ where: { rideId, userId } }),
        ]);

        if (mine >= MAX_GALLERY_PHOTOS_PER_RIDER) throw new GalleryError("RIDER_LIMIT");
        if (inRide >= MAX_GALLERY_PHOTOS_PER_RIDE) throw new GalleryError("RIDE_LIMIT");

        return tx.ridePhoto.create({ data: { rideId, userId, photoKey }, select: { id: true } });
      });
    } catch (error) {
      await photos.remove(photoKey);

      throw error;
    }
  }

  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new GalleryError("FORBIDDEN");
  }

  async function approvePhoto(adminId: string, photoId: string) {
    await assertAdmin(adminId);

    const updated = await db.ridePhoto.updateMany({
      where: { id: photoId },
      data: { approved: true, reviewedAt: now() },
    });

    if (updated.count === 0) throw new GalleryError("NOT_FOUND");
  }

  // Refusing a pending photo and deleting a published one are the same act: the row and the
  // file both go. The person who sent a photo may take it back while it still waits.
  async function removePhoto(userId: string, photoId: string) {
    const viewer = await viewerOf(userId);
    const photo = await db.ridePhoto.findUnique({
      where: { id: photoId },
      select: { userId: true, approved: true, photoKey: true },
    });

    if (!photo) throw new GalleryError("NOT_FOUND");

    const isOwnPending = photo.userId === userId && !photo.approved;

    if (!viewer.isAdmin && !isOwnPending) throw new GalleryError("FORBIDDEN");

    await db.ridePhoto.delete({ where: { id: photoId } });
    await photos.remove(photo.photoKey);
  }

  // How many photos wait for approval on each ride, for the panel.
  async function countPendingByRide(adminId: string) {
    await assertAdmin(adminId);

    const groups = await db.ridePhoto.groupBy({
      by: ["rideId"],
      where: { approved: false },
      _count: { _all: true },
    });

    return new Map(groups.map((group) => [group.rideId, group._count._all]));
  }

  // How many published photos each ride has, for the list of rides.
  async function countPublishedByRide(viewerId: string) {
    await viewerOf(viewerId);

    const groups = await db.ridePhoto.groupBy({
      by: ["rideId"],
      where: { approved: true, user: { joinRequest: { status: "APPROVED" } } },
      _count: { _all: true },
    });

    return new Map(groups.map((group) => [group.rideId, group._count._all]));
  }

  // The photo route asks before serving a file: a pending gallery photo is only for whoever
  // sent it and for administrators. Any other photo key is not the gallery's business.
  async function canSeeFile(viewerId: string, photoKey: string) {
    const photo = await db.ridePhoto.findUnique({
      where: { photoKey },
      select: { userId: true, approved: true },
    });

    if (!photo || photo.approved || photo.userId === viewerId) return true;

    return (await access.getAccess(viewerId)).isAdmin;
  }

  return { getGallery, addPhoto, approvePhoto, removePhoto, countPendingByRide, countPublishedByRide, canSeeFile };
}

export type GalleryService = ReturnType<typeof createGalleryService>;
