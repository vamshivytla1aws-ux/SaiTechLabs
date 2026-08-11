import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InterviewBuilder } from "@/components/admin/InterviewForms";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { experienceRanges, interviewTechnologies } from "@/lib/interviews/config";

export default async function NewInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("admissions:manage");
  const { id } = await params;
  const admission = await getDb().admission.findUnique({ where: { id }, select: { studentName: true, email: true } });
  if (!admission) notFound();
  return <div className="admin-page"><Link className="admin-back" href={`/admin/admissions/${id}`}><ArrowLeft />Back to {admission.studentName}</Link><div className="admin-page-head"><div><p className="admin-kicker">Admissions · mock interviews</p><h1>Configure assessment</h1><p>Invitation will be sent to {admission.email} only after questions are reviewed and approved.</p></div></div><InterviewBuilder admissionId={id} technologies={interviewTechnologies} experienceRanges={experienceRanges} /></div>;
}
