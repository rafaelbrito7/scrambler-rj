import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

// The way back up one level. It sits close under the header, as navigation, and leaves a clear
// breath before the page title, so the title still opens the content.
export function BackLink({ href, children }: BackLinkProps) {
  return (
    <div className="-mt-4 mb-5 sm:-mt-6 sm:mb-7">
      <Link
        href={href}
        className="group label inline-flex min-h-11 items-center gap-3 text-foreground transition-colors duration-200 hover:text-highlight"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-sm border border-input transition-[border-color,background-color,transform] duration-200 group-hover:-translate-x-0.5 group-hover:border-primary group-hover:bg-primary/15"
        >
          <ArrowLeftIcon weight="bold" className="size-4" />
        </span>
        {children}
      </Link>
    </div>
  );
}
