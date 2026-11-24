import Image from "next/image";

import { avatarSource, groupName } from "@/server/display-name";

type AvatarProps = {
  person: {
    fullName: string;
    nickname: string | null;
    photoKey: string | null;
    accountImage: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: { pixels: 40, box: "size-10", text: "text-sm" },
  md: { pixels: 56, box: "size-14", text: "text-lg" },
  lg: { pixels: 96, box: "size-24", text: "text-3xl" },
  xl: { pixels: 144, box: "size-28 sm:size-36", text: "text-4xl sm:text-5xl" },
};

// A person's picture wherever they are shown: their own photo, the one from their Google
// account, or their initials.
export function Avatar({ person, size = "md" }: AvatarProps) {
  const source = avatarSource(person);
  const dimensions = sizes[size];
  const name = groupName(person);

  if (source.kind === "initials") {
    return (
      <span
        role="img"
        aria-label={`Iniciais de ${name}`}
        className={`display inline-flex shrink-0 items-center justify-center rounded-full bg-cream text-asphalt ${dimensions.box} ${dimensions.text}`}
      >
        {source.text}
      </span>
    );
  }

  return (
    <Image
      src={source.url}
      alt={`Foto de ${name}`}
      width={dimensions.pixels}
      height={dimensions.pixels}
      // Stored photos are served only to signed-in participants, which the optimizer is not.
      unoptimized={source.kind === "photo"}
      className={`shrink-0 rounded-full object-cover ${dimensions.box}`}
    />
  );
}
