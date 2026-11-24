"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PhotoFieldProps = {
  // The avatar as it is saved now, rendered by the server.
  current: React.ReactNode;
  hasPhoto: boolean;
  error?: string;
  hint?: string;
  previewClassName?: string;
};

// Nothing changes until the profile is saved: choosing a file shows a preview, and removing
// only marks the photo to be dropped.
const profileHint =
  "Opcional. JPG, PNG ou WebP de até 5 MB. Sem foto, aparece a da sua conta Google ou suas iniciais.";

export function PhotoField({
  current,
  hasPhoto,
  error,
  hint = profileHint,
  previewClassName = "size-24 rounded-full",
}: PhotoFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const hasPreview = previewUrl !== null;
  const hasError = Boolean(error);
  const showsCurrent = !hasPreview && !isRemoving;
  const showsRemovalNote = !hasPreview && isRemoving;
  const canRemove = hasPhoto && !isRemoving && !hasPreview;
  const describedBy = hasError ? "photo-hint photo-error" : "photo-hint";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setIsRemoving(false);
  }

  return (
    <Field data-invalid={hasError}>
      <FieldLabel htmlFor="photo">Foto</FieldLabel>
      <div className="flex items-center gap-4">
        {showsCurrent && current}
        {hasPreview && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, nothing to optimize
          <img src={previewUrl} alt="Foto escolhida" className={`shrink-0 object-cover ${previewClassName}`} />
        )}
        {showsRemovalNote && (
          <p className="text-sm text-cream-dim">A foto sai quando você salvar.</p>
        )}
      </div>

      <Input
        id="photo"
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        aria-invalid={hasError}
        aria-describedby={describedBy}
      />
      <input type="hidden" name="removePhoto" value={isRemoving ? "1" : ""} />
      <FieldDescription id="photo-hint">{hint}</FieldDescription>
      {hasError && <FieldError id="photo-error">{error}</FieldError>}

      {canRemove && (
        <Button type="button" variant="ghost" size="inline" onClick={() => setIsRemoving(true)} className="w-fit">
          Remover foto
        </Button>
      )}
      {showsRemovalNote && (
        <Button type="button" variant="ghost" size="inline" onClick={() => setIsRemoving(false)} className="w-fit">
          Manter a foto
        </Button>
      )}
    </Field>
  );
}
