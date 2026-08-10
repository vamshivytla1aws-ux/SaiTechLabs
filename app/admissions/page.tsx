import type { Metadata } from "next";
import { AdmissionForm } from "@/components/AdmissionForm";
import { PageHero } from "@/components/PageHero";
export const metadata: Metadata = { title: "Admissions", description: "Register your interest in SaiTech Labs training programs." };
export default function AdmissionsPage() { return <><PageHero eyebrow="Admissions" title="Take the first step toward focused technology learning." description="Share your learning interests below. This Phase 1 form demonstrates the admission experience and does not send or store data." /><section className="section form-section"><div className="container narrow-container"><div className="form-header"><p className="eyebrow">Admission enquiry</p><h2>Tell us about your learning goals</h2><p>Fields marked with * are required.</p></div><AdmissionForm /></div></section></>; }
