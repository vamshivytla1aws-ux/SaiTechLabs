import { TrainerForm } from "@/components/admin/OperationsForms";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export default async function TrainersPage() {
  await requireAdminPermission("trainers:manage");
  const [trainers,adminUsers] = await Promise.all([getDb().trainer.findMany({ orderBy: { name: "asc" }, include: { adminUser:true,assignments: { include: { batch: true } } } }),getDb().adminUser.findMany({where:{role:"TRAINER",isActive:true,trainerProfile:null},orderBy:{name:"asc"}})]);
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Faculty</p><h1>Trainers</h1><p>Maintain trainer profiles and batch assignments.</p></div></div><div className="admin-detail-grid"><section className="admin-panel"><header><h2>Trainer directory</h2><small>{trainers.length} total</small></header>{trainers.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Trainer</th><th>Contact</th><th>Specialization</th><th>Assignments</th><th>Login</th><th>Status</th></tr></thead><tbody>{trainers.map((trainer) => <tr key={trainer.id}><td><strong>{trainer.name}</strong></td><td>{trainer.email}<small>{trainer.phone}</small></td><td>{trainer.specialization}</td><td>{trainer.assignments.map((item) => item.batch.code).join(", ") || "—"}</td><td>{trainer.adminUser?.email||"Not linked"}</td><td>{trainer.isActive ? "Active" : "Inactive"}</td></tr>)}</tbody></table></div> : <p className="admin-empty">No trainers yet.</p>}</section><aside className="admin-panel"><h2>Create trainer</h2><TrainerForm adminUsers={adminUsers.map(user=>({id:user.id,label:`${user.name} · ${user.email}`}))}/></aside></div></div>;
}
