import { InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr";

type InstagramLinkProps = { handle: string; variant?: "button" | "quiet" };

const variants = {
  button:
    "min-h-11 gap-2.5 rounded-sm border border-input px-3.5 font-semibold text-foreground hover:border-primary hover:bg-primary/15",
  quiet: "gap-1.5 text-sm text-cream-dim hover:text-highlight",
};

// A person's Instagram wherever it shows: the handle with the logo, opening their page.
export function InstagramLink({ handle, variant = "button" }: InstagramLinkProps) {
  const iconSize = variant === "button" ? "size-5 text-highlight" : "size-4";

  return (
    <a
      href={`https://www.instagram.com/${handle}/`}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex max-w-full items-center transition-colors duration-200 ${variants[variant]}`}
    >
      <InstagramLogoIcon aria-hidden weight={variant === "button" ? "fill" : "regular"} className={`shrink-0 ${iconSize}`} />
      <span className="truncate">
        <span className="sr-only">Instagram: </span>@{handle}
      </span>
    </a>
  );
}
