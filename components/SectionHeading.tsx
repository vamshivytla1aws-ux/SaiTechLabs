export function SectionHeading({ eyebrow, title, description, align = "center", light = false }: { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; light?: boolean }) {
  return <div className={`section-heading ${align} ${light ? "light" : ""}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>;
}
