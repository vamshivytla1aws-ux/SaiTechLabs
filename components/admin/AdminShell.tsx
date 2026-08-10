"use client";

import type { AdminRole } from "@/generated/prisma/enums";
import type { AdminPermission } from "@/lib/admin-permissions";
import { can } from "@/lib/admin-permissions";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Award, BookOpen, CalendarCheck, ClipboardList, Contact, CreditCard, FileBarChart, Gauge, GraduationCap, History, Link2, LogOut, Menu, MessageSquare, Settings, ShieldCheck, Users, UserRoundCog, X } from "lucide-react";

const nav: readonly [string, string, React.ComponentType<{ className?: string }>, AdminPermission][] = [
  ["Dashboard", "/admin/dashboard", Gauge, "dashboard:view"],
  ["Admissions", "/admin/admissions", ClipboardList, "admissions:manage"],
  ["Students", "/admin/students", GraduationCap, "students:manage"],
  ["Courses", "/admin/courses", BookOpen, "courses:manage"],
  ["Batches", "/admin/batches", Users, "batches:manage"],
  ["Trainers", "/admin/trainers", UserRoundCog, "trainers:manage"],
  ["Payments", "/admin/payments", CreditCard, "payments:manage"],
  ["Attendance", "/admin/attendance", CalendarCheck, "attendance:manage"],
  ["Feedback", "/admin/feedback", MessageSquare, "feedback:manage"],
  ["Certificates", "/admin/certificates", Award, "certificates:manage"],
  ["Public links", "/admin/public-links", Link2, "students:manage"],
  ["Reports", "/admin/reports", FileBarChart, "reports:view"],
  ["Contact enquiries", "/admin/contact-enquiries", Contact, "admissions:manage"],
  ["Users & roles", "/admin/users", ShieldCheck, "users:manage"],
  ["Audit log", "/admin/audit", History, "audit:view"],
  ["Settings", "/admin/settings", Settings, "dashboard:view"],
];

export function AdminShell({ admin, children }: { admin: { name: string; email: string; role: AdminRole }; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  async function logout() { setBusy(true); await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
  const items = nav.filter(([, , , permission]) => can(admin.role, permission));
  return <div className="admin-root"><aside className={`admin-sidebar ${open ? "open" : ""}`}><div className="admin-brand"><span>SL</span><div><strong>SaiTech Labs</strong><small>Operations portal</small></div><button className="admin-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div><nav aria-label="Admin navigation">{items.map(([label, href, Icon]) => <Link key={href} className={pathname.startsWith(href) ? "active" : ""} href={href} onClick={() => setOpen(false)}><Icon />{label}</Link>)}</nav><div className="admin-profile"><span>{admin.name.slice(0, 1).toUpperCase()}</span><div><strong>{admin.name}</strong><small>{admin.role.replaceAll("_", " ")} · {admin.email}</small></div></div><button className="admin-logout" onClick={logout} disabled={busy}><LogOut />{busy ? "Signing out..." : "Sign out"}</button></aside>{open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}<section className="admin-workspace"><header className="admin-topbar"><button onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><div><strong>SaiTech Labs</strong><small>Training operations</small></div></header><main className="admin-main">{children}</main></section></div>;
}
