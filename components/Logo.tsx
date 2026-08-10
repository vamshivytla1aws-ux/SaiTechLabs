import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand-mark ${light ? "brand-mark-light" : ""}`} aria-label="SaiTech Labs home">
      <span className="brand-symbol" aria-hidden="true">S</span>
      <span><strong>SaiTech</strong><small>LABS</small></span>
    </Link>
  );
}
