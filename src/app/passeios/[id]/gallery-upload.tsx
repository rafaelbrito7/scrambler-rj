"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { uploadRidePhoto } from "@/app/passeios/[id]/gallery-actions";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type GalleryUploadProps = { rideId: string; remaining: number };

export function GalleryUpload({ rideId, remaining }: GalleryUploadProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(0);
  const isSending = progress !== null;
  const hasError = error !== null;
  const hasSent = sent > 0 && !isSending;
  const sentText = sent === 1 ? "1 foto enviada" : `${sent} fotos enviadas`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const files = [...(input.current?.files ?? [])];

    if (files.length === 0) {
      setError("Escolha ao menos uma foto.");

      return;
    }

    if (files.length > remaining) {
      setError(remaining === 1 ? "Você ainda pode enviar 1 foto." : `Você ainda pode enviar ${remaining} fotos.`);

      return;
    }

    setError(null);
    setSent(0);

    let done = 0;

    for (const file of files) {
      setProgress(`Enviando ${done + 1} de ${files.length}…`);

      const data = new FormData();

      data.set("photo", file);

      const result = await uploadRidePhoto(rideId, data);

      if (result.error) {
        setError(result.error);

        break;
      }

      done += 1;
    }

    setSent(done);
    setProgress(null);

    if (input.current) input.current.value = "";

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl">
      <Field data-invalid={hasError}>
        <FieldLabel htmlFor="gallery-photos">Enviar fotos</FieldLabel>
        <Input
          ref={input}
          id="gallery-photos"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={isSending}
          aria-invalid={hasError}
          aria-describedby="gallery-hint"
        />
        <FieldDescription id="gallery-hint">
          {remaining === 1 ? "Você ainda pode enviar 1 foto" : `Você ainda pode enviar ${remaining} fotos`}{" "}
          deste passeio. Elas aparecem para o grupo depois que um administrador aprovar.
        </FieldDescription>
        {hasError && <FieldError>{error}</FieldError>}
      </Field>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" variant="outline" disabled={isSending} className="w-full sm:w-fit">
          {isSending ? progress : "Enviar"}
        </Button>
        <p role="status" className="text-sm text-cream-dim">
          {hasSent && `${sentText}. Aguardando aprovação.`}
        </p>
      </div>
    </form>
  );
}
