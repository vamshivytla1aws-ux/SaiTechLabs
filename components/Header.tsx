"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { label: "Home", href: "/", section: "home" },
  { label: "Program", href: "/program", section: "program" },
  { label: "Courses", href: "/courses", section: "courses" },
  { label: "Trainers", href: "/trainers", section: "trainers" },
  { label: "About", href: "/about", section: "about" },
  { label: "Admissions", href: "/admissions" },
  { label: "Contact", href: "/contact", section: "contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-section]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection((visible[0].target as HTMLElement).id);
    }, { rootMargin: "-20% 0px -62%", threshold: [0, 0.1] });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const linkState = (href: string, section?: string) => {
    const homeSection = pathname === "/" && section;
    return {
      href: homeSection ? `#${section}` : href,
      active: homeSection ? activeSection === section : pathname === href,
    };
  };

  return (
    <header className={`site-header ${scrolled ? "compact" : ""}`}>
      <div className="container nav-wrap">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(({ label, href, section }) => {
            const state = linkState(href, section);
            return <Link key={href} className={state.active ? "active" : ""} href={state.href} aria-current={state.active ? "page" : undefined}>{label}</Link>;
          })}
        </nav>
        <div className="nav-actions">
          <a href="tel:+919493969696" className="icon-call" aria-label="Call SaiTech Labs"><Phone size={18} /></a>
          <Link href="/admissions" className="button button-primary nav-cta">Enroll now</Link>
          <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      <nav id="mobile-menu" className={`mobile-nav ${open ? "open" : ""}`} aria-label="Mobile navigation">
        <div className="container">
          {links.map(({ label, href, section }) => {
            const state = linkState(href, section);
            return <Link key={href} className={state.active ? "active" : ""} href={state.href} aria-current={state.active ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>;
          })}
          <Link href="/admissions" className="button button-primary" onClick={() => setOpen(false)}>Enroll now</Link>
        </div>
      </nav>
    </header>
  );
}
