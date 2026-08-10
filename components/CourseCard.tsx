import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Course } from "@/data/courses";

export function CourseCard({ course, detailed = false }: { course: Course; detailed?: boolean }) {
  const Icon = course.icon;
  return <article className={`course-card ${detailed ? "detailed" : ""}`}>
    <div className="card-icon"><Icon /></div><h3>{course.title}</h3><p>{course.description}</p>
    <ul>{course.topics.map(topic => <li key={topic}><Check />{topic}</li>)}</ul>
    {detailed && <><div className="audience"><strong>Ideal for</strong><span>{course.audience}</span></div><p className="program-details">Contact Counselor for Program Details</p><div className="card-actions"><Link href={`/courses#${course.slug}`}>View details <ArrowUpRight /></Link><Link className="button button-outline" href="/admissions">Enroll now</Link></div></>}
  </article>;
}
