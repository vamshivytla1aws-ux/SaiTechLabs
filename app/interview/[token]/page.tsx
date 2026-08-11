import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { CandidateInterview } from "@/components/interviews/CandidateInterview";
import { findCandidateInterview, safeCandidateInterview } from "@/lib/interviews/candidate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Secure Mock Interview | SaiTech Labs", robots: { index: false, follow: false, noarchive: true }, referrer: "no-referrer" };

export default async function InterviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const interview = await findCandidateInterview(token);
  if (!interview) notFound();
  const initial = safeCandidateInterview(interview);
  return <div className="interview-root">
    <header className="interview-header"><Logo /><span>Secure assessment</span></header>
    <CandidateInterview token={token} initial={initial} />
  </div>;
}
