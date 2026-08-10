import { requireAdminPermission } from "@/lib/admin-auth";
export default async function ContactsLayout({ children }: { children: React.ReactNode }) { await requireAdminPermission("admissions:manage"); return children; }
