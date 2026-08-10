import { AdminUserAction, AdminUserForm } from "@/components/admin/OperationsForms";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export default async function UsersPage() {
  const admin = await requireAdminPermission("users:manage");
  const users = await getDb().adminUser.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } });
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Access control</p><h1>Users & roles</h1><p>Only super administrators can manage staff access.</p></div></div><div className="admin-detail-grid"><section className="admin-panel"><header><h2>Administrators</h2><small>{users.length} total</small></header><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last login</th><th>Access</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td>{user.role.replaceAll("_", " ")}</td><td>{user.isActive ? "Active" : "Inactive"}</td><td>{user.lastLoginAt?.toLocaleString("en-IN") || "Never"}</td><td><AdminUserAction id={user.id} role={user.role} isActive={user.isActive} isSelf={user.id === admin.id}/></td></tr>)}</tbody></table></div></section><aside className="admin-panel"><h2>Create administrator</h2><AdminUserForm /></aside></div></div>;
}
