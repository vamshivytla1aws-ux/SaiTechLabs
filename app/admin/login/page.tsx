import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/AdminForms";
export const dynamic = "force-dynamic";
export default async function LoginPage(){if(await getAuthenticatedAdmin())redirect("/admin/dashboard");return <div className="admin-root admin-login-page"><div className="admin-login-card"><div className="admin-login-mark"><span>SL</span></div><p className="admin-kicker"><LockKeyhole/>Secure administration</p><h1>Welcome back</h1><p>Sign in to manage admission leads and contact enquiries.</p><LoginForm/><small className="admin-login-help">Authorised SaiTech Labs staff only.</small></div></div>}
