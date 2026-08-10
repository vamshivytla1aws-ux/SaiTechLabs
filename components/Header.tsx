"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  ["Home", "/"], ["Program", "/program"], ["Courses", "/courses"], ["Trainers", "/trainers"],
  ["About", "/about"], ["Admissions", "/admissions"], ["Contact", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${compact ? "compact" : ""}`}>
      <div className="container nav-wrap">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={href} className={pathname === href ? "active" : ""} href={href}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <a href="tel:+919493969696" className="icon-call" aria-label="Call SaiTech Labs"><Phone size={18} /></a>
          <Link href="/admissions" className="button button-primary nav-cta">Enroll now</Link>
          <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      <nav id="mobile-menu" className={`mobile-nav ${open ? "open" : ""}`} aria-label="Mobile navigation">
        <div className="container">
          {links.map(([label, href]) => <Link key={href} className={pathname === href ? "active" : ""} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/admissions" className="button button-primary" onClick={() => setOpen(false)}>Enroll now</Link>
        </div>
      </nav>
    </header>
  );
}
