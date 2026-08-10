import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { TrainerCard } from "@/components/TrainerCard";
import { trainers } from "@/data/trainers";
export const metadata: Metadata = { title: "Trainers", description: "Meet the industry professionals guiding SaiTech Labs learners." };
export default function TrainersPage() { return <><PageHero eyebrow="Learn from industry leaders" title="Guidance shaped by real-world technology experience." description="Training designed and delivered by professionals with practical technology and corporate perspectives."><Link className="button button-gold" href="/program">Explore program <ArrowRight /></Link></PageHero><section className="section"><div className="container"><SectionHeading eyebrow="Our faculty" title="Meet Our Industry Experts" description="Trainer information is structured for easy updates as final profiles and professional photographs are confirmed." /><div className="trainer-grid">{trainers.map(t => <TrainerCard key={t.name} trainer={t} />)}</div></div></section><CTASection title="Learn with purpose and expert guidance." /></>; }
