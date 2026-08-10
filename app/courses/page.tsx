import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { courses } from "@/data/courses";
export const metadata: Metadata = { title: "Courses", description: "Explore training in Cloud, AI, DevOps, Databricks, data, communication and interview preparation." };
export default function CoursesPage() { return <><PageHero eyebrow="Technology training" title="Develop practical skills for modern IT careers." description="Explore focused learning areas that combine essential concepts with guided practical application."><Link className="button button-gold" href="/admissions">Start your journey <ArrowRight /></Link></PageHero><section className="section"><div className="container"><div className="course-grid detailed-grid">{courses.map(course => <div id={course.slug} key={course.slug}><CourseCard course={course} detailed /></div>)}</div></div></section><CTASection title="Not sure which course fits your goals?" text="Talk to a counselor for clear, no-pressure guidance on the right learning path." /></>; }
