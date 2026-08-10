import Link from "next/link";
import { ArrowRight, ClipboardList, Contact, UserCheck, Users } from "lucide-react";
import { getDb } from "@/lib/db";

const labels: Record<string, string> = { NEW: "New", CONTACTED: "Contacted", FOLLOW_UP: "Follow up", JOINED: "Joined", NOT_INTERESTED: "Not interested", CLOSED: "Closed" };
function when(value: Date) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(value); }

export default async function Dashboard() {
  const db = getDb();
  const current = new Date();
  const today = new Date(current); today.setHours(0, 0, 0, 0);
  const week = new Date(current.getTime() - 7 * 86400000);
  const month = new Date(current.getFullYear(), current.getMonth(), 1);
  const [all, todayCount, weekCount, monthCount, newAdmissions, joined, newContacts, recentAdmissions, recentContacts] = await Promise.all([
    db.admission.count(), db.admission.count({ where: { createdAt: { gte: today } } }), db.admission.count({ where: { createdAt: { gte: week } } }), db.admission.count({ where: { createdAt: { gte: month } } }),
    db.admission.count({ where: { leadStatus: "NEW" } }), db.admission.count({ where: { leadStatus: "JOINED" } }), db.contactEnquiry.count({ where: { status: "NEW" } }),
    db.admission.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), db.contactEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Live overview</p><h1>Dashboard</h1><p>Admissions and enquiries at a glance.</p></div><Link className="admin-primary" href="/admin/admissions">View admissions <ArrowRight /></Link></div><div className="admin-metrics"><Metric label="All admissions" value={all} sub={`${todayCount} today · ${weekCount} in 7 days`} icon={<Users />} /><Metric label="This month" value={monthCount} sub="New submissions" icon={<ClipboardList />} /><Metric label="New leads" value={newAdmissions} sub={`${joined} joined`} icon={<UserCheck />} /><Metric label="New enquiries" value={newContacts} sub="Awaiting response" icon={<Contact />} /></div><div className="admin-dashboard-grid"><Recent title="Recent admissions" href="/admin/admissions" rows={recentAdmissions.map(v => ({ id: v.id, title: v.studentName, detail: v.course, status: labels[v.leadStatus], date: when(v.createdAt) }))} /><Recent title="Recent contact enquiries" href="/admin/contact-enquiries" rows={recentContacts.map(v => ({ id: v.id, title: v.name, detail: v.phone, status: labels[v.status], date: when(v.createdAt) }))} /></div></div>;
}
function Metric({ label, value, sub, icon }: { label: string; value: number; sub: string; icon: React.ReactNode }) { return <div className="admin-metric"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{sub}</p></div></div>; }
function Recent({ title, href, rows }: { title: string; href: string; rows: { id: string; title: string; detail: string; status: string; date: string }[] }) { return <section className="admin-panel"><header><h2>{title}</h2><Link href={href}>View all <ArrowRight /></Link></header>{rows.length ? <div className="admin-recent-list">{rows.map(row => <Link href={`${href}/${row.id}`} key={row.id}><div><strong>{row.title}</strong><small>{row.detail} · {row.date}</small></div><span className="admin-status">{row.status}</span></Link>)}</div> : <p className="admin-empty">No submissions yet.</p>}</section>; }
