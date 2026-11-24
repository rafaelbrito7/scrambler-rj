import { MotorcycleIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

type BikePhotoProps = { photoKey: string | null; className?: string; sizes?: string };

// A bike always sits in the same 4:3 frame. Without a photo the frame stays, quietly, so
// lists keep their rhythm.
export function BikePhoto({ photoKey, className = "", sizes = "10rem" }: BikePhotoProps) {
  const hasPhoto = photoKey !== null;

  return (
    <div className={`relative aspect-[4/3] shrink-0 overflow-hidden rounded-sm bg-card ${className}`}>
      {hasPhoto && (
        <Image src={`/fotos/${photoKey}`} alt="" fill unoptimized sizes={sizes} className="object-cover" />
      )}
      {!hasPhoto && (
        <span className="grid size-full place-items-center text-cream-dim/60">
          <MotorcycleIcon aria-hidden className="size-1/3" />
        </span>
      )}
    </div>
  );
}
