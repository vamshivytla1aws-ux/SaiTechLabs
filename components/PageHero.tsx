import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="page-hero"><div className="hero-grid-lines" /><div className="container page-hero-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>{children}</div></section>;
}
