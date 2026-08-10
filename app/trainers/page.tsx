import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { TrainerCard } from "@/components/TrainerCard";
import { trainers } from "@/data/trainers";

export const metadata: Metadata = {
  title: "Trainers",
  description: "Meet the experienced industry professionals guiding SaiTech Labs learners.",
  alternates: { canonical: "/trainers" },
};

export default function TrainersPage() {
  return <>
    <PageHero
      eyebrow="Learn from industry leaders"
      title="Guidance shaped by real-world technology experience."
      description="Learn from seasoned professionals with practical expertise across cloud, data, databases, development, DevOps, CRM, and big data."
    >
      <Link className="button button-gold" href="/program">Explore program <ArrowRight /></Link>
    </PageHero>
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Our faculty"
          title="Meet Our Industry Experts"
          description="Explore each trainer's experience and specialist expertise before viewing their complete profile."
        />
        <div className="trainer-grid">{trainers.map(trainer => <TrainerCard key={trainer.name} trainer={trainer} />)}</div>
      </div>
    </section>
    <CTASection title="Learn with purpose and expert guidance." />
  </>;
}
