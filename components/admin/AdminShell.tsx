"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Contact, Gauge, LogOut, Menu, Settings, X } from "lucide-react";

const nav = [["Dashboard", "/admin/dashboard", Gauge], ["Admissions", "/admin/admissions", ClipboardList], ["Contact enquiries", "/admin/contact-enquiries", Contact], ["Settings", "/admin/settings", Settings]] as const;
export function AdminShell({ admin, children }: { admin: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  async function logout() { setBusy(true); await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
  return <div className="admin-root"><aside className={`admin-sidebar ${open ? "open" : ""}`}><div className="admin-brand"><span>SL</span><div><strong>SaiTech Labs</strong><small>Admin portal</small></div><button className="admin-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div><nav aria-label="Admin navigation">{nav.map(([label, href, Icon]) => <Link key={href} className={pathname.startsWith(href) ? "active" : ""} href={href} onClick={() => setOpen(false)}><Icon />{label}</Link>)}</nav><div className="admin-profile"><span>{admin.name.slice(0, 1).toUpperCase()}</span><div><strong>{admin.name}</strong><small>{admin.email}</small></div></div><button className="admin-logout" onClick={logout} disabled={busy}><LogOut />{busy ? "Signing out…" : "Sign out"}</button></aside>{open && <button className="admin-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}<section className="admin-workspace"><header className="admin-topbar"><button onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><div><strong>SaiTech Labs</strong><small>Lead operations</small></div></header><main className="admin-main">{children}</main></section></div>;
}
