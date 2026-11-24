"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Photo = { id: string; photoKey: string; authorName: string };

// Thumbnails that open the photo large. The native dialog brings the keyboard behaviour:
// Escape closes it and focus goes back to the thumbnail.
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Photo | null>(null);
  const hasOpen = open !== null;

  function show(photo: Photo) {
    setOpen(photo);
    dialog.current?.showModal();
  }

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => show(photo)}
              className="group relative block aspect-square w-full overflow-hidden rounded-sm bg-card focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- private photo served by the app, already sized */}
              <img
                src={`/fotos/${photo.photoKey}`}
                alt={`Foto enviada por ${photo.authorName}`}
                loading="lazy"
                className="size-full object-cover transition-opacity group-hover:opacity-85"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
        aria-label="Foto do passeio"
        className="m-auto max-h-[92dvh] w-[min(92vw,64rem)] bg-background p-0 text-foreground backdrop:bg-black/85"
      >
        {hasOpen && (
          <div className="flex max-h-[92dvh] flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element -- private photo served by the app, already sized */}
            <img
              src={`/fotos/${open.photoKey}`}
              alt={`Foto enviada por ${open.authorName}`}
              className="min-h-0 w-full flex-1 object-contain"
            />
            <div className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm text-cream-dim">Enviada por {open.authorName}</p>
              <Button type="button" variant="outline" onClick={() => dialog.current?.close()}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
