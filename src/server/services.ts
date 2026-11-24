import path from "node:path";

import { createAccessService } from "@/server/access";
import { createBatchService } from "@/server/batches";
import { db } from "@/server/db";
import { createGalleryService } from "@/server/gallery";
import { createOrderService } from "@/server/orders";
import { createDiskPhotoStorage } from "@/server/photo-storage";
import { createProfileService } from "@/server/profiles";
import { createRecipeService } from "@/server/recipes";
import { createRideService } from "@/server/rides";
import { shrinkGalleryPhoto } from "@/server/shrink-photo";
import { createWeatherService, openMeteo } from "@/server/weather";

export const access = createAccessService(db, {
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(","),
});

export const batches = createBatchService(db, access);

export const orders = createOrderService(db, access);

export const recipes = createRecipeService(db, access);

export const rides = createRideService(db, access);

export const photos = createDiskPhotoStorage(
  process.env.PHOTO_STORAGE_DIR ?? path.join(process.cwd(), ".data", "photos"),
);

export const profiles = createProfileService(db, access, photos);

export const gallery = createGalleryService(db, access, rides, photos, shrinkGalleryPhoto);

export const weather = createWeatherService(rides, openMeteo);
