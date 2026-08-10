import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function AdminIndex() { redirect((await getAuthenticatedAdmin()) ? "/admin/dashboard" : "/admin/login"); }
