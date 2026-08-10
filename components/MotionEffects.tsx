"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MotionEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const timers: number[] = [];
    const sections = Array.from(document.querySelectorAll<HTMLElement>(
      "main > section:not(.home-hero):not(.page-hero)",
    ));
    const cards = Array.from(document.querySelectorAll<HTMLElement>(
      ".course-grid .course-card, .trainer-grid .trainer-card",
    ));

    root.classList.add("motion-ready");
    sections.forEach(section => section.classList.add("reveal-section"));
    cards.forEach(card => card.classList.add("reveal-card"));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const isCard = element.classList.contains("reveal-card");
        const siblings = isCard
          ? Array.from(element.closest(".course-grid, .trainer-grid")?.querySelectorAll(".reveal-card") ?? [])
          : [];
        const delay = isCard ? Math.min(Math.max(siblings.indexOf(element), 0) * 70, 420) : 0;

        timers.push(window.setTimeout(() => {
          element.classList.add("is-revealed");
          if (isCard) {
            timers.push(window.setTimeout(() => element.classList.add("reveal-settled"), 500));
          }
        }, delay));
        observer.unobserve(element);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8%" });

    [...sections, ...cards].forEach(element => observer.observe(element));

    return () => {
      observer.disconnect();
      timers.forEach(timer => window.clearTimeout(timer));
      root.classList.remove("motion-ready");
    };
  }, [pathname]);

  return null;
}
