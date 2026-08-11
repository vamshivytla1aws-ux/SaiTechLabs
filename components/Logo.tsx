import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand-mark ${light ? "brand-mark-light" : ""}`} aria-label="Sai TechLabs home">
      <span className="brand-logo-crop">
        <Image
          src="/images/brand/saitechlabs-logo.jpg"
          alt="Sai TechLabs — Innovate, Educate, Accelerate"
          width={1264}
          height={842}
          priority={!light}
          sizes={light ? "190px" : "145px"}
        />
      </span>
    </Link>
  );
}
