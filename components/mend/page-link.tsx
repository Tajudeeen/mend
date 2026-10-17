import type { ComponentPropsWithoutRef } from "react";

type PageLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

// Page boundaries use document navigation so the hosted dispatch/auth boundary
// and destination document load without depending on a client router transition.
export default function PageLink({ href, children, ...props }: PageLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
