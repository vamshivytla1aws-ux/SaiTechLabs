import { courses } from "@/data/courses";
import { programJourney, programSteps } from "@/data/program";
import { trainers } from "@/data/trainers";
import { getDb } from "@/lib/db";

export type KnowledgeSection = { id: string; title: string; route: string; content: string; keywords?: string[] };

const baseKnowledge: KnowledgeSection[] = [
  { id: "company", title: "About SaiTech Labs", route: "/about", keywords: ["company", "about", "mission", "vision", "saitech"], content: "SaiTech Labs is an industry-focused technology training institute in Anantapur. It bridges academic learning and real-world technology careers through fundamentals, guided practice, modern platforms, communication, and interview readiness. Its motto is Innovate, Educate, Accelerate. It does not promise jobs, placements, salaries, or outcomes." },
  { id: "program", title: "60-Day Complete Skills Booster Program", route: "/program", keywords: ["program", "60-day", "booster", "duration", "curriculum"], content: `A focused 60-day program for B.Tech 3rd Year students, B.Tech Final Year students, and recent graduates. The journey is ${programJourney.join(" → ")}. Learning areas: ${programSteps.map((step) => step.title).join(", ")}. It includes Cloud basics across AWS, Google Cloud and Azure; AI basics; DevOps basics including CI/CD and automation; Databricks and data engineering; hands-on projects; resume building; interactive learning; personality and communication development; and interview preparation. Exact schedules and fees must be confirmed with a counselor.` },
  { id: "admissions", title: "Admissions", route: "/admissions", keywords: ["admission", "enroll", "join", "apply", "aadhaar"], content: "The public Admission Enquiry form lets prospective learners share their name, phone, email, qualification, college, current status, preferred course, training mode, Aadhaar number if they wish, and a message. Aadhaar is not required for an enquiry; it is requested when a learner is enrolled. Enquiry details are stored for the SaiTech Labs team to follow up. Use the Admissions page to submit interest." },
  { id: "contact", title: "Contact SaiTech Labs", route: "/contact", keywords: ["contact", "phone", "call", "whatsapp", "address", "location", "directions"], content: "Phone and WhatsApp: +91 94939 69696. Address: Kalyandurgam Road, Opp. Zudio, Anantapur. The Contact page has call, WhatsApp, directions, and enquiry options. Do not invent an email address, business hours, fees, or schedules." },
  { id: "navigation", title: "Website navigation", route: "/", keywords: ["navigate", "navigation", "website", "page", "link"], content: "Public pages: Home /, About /about, 60-Day Program /program, Courses /courses, Trainers /trainers, Admissions /admissions, Contact /contact, Privacy /privacy, and Terms /terms." },
  { id: "trainers", title: "Trainer panel", route: "/trainers", keywords: ["trainer", "faculty", "mentor", "founder", ...trainers.map((trainer) => trainer.name)], content: trainers.map((trainer) => `${trainer.name} — ${trainer.role}; ${trainer.experience}; ${trainer.highlights.join("; ")}; expertise: ${trainer.expertise.join(", ")}.`).join(" ") },
  ...courses.map((course) => ({ id: `course-${course.slug}`, title: course.title, route: "/courses", keywords: ["course", "training", course.slug, course.shortTitle, ...course.topics], content: `${course.title}: ${course.description} Topics: ${course.topics.join(", ")}. Ideal for ${course.audience}. Contact a counselor for exact program details, fees, and schedule.` })),
];

async function databaseCourses(): Promise<KnowledgeSection[]> {
  try {
    const records = await getDb().course.findMany({ where: { isActive: true }, select: { slug: true, name: true, shortDescription: true, description: true, durationDays: true }, orderBy: { name: "asc" }, take: 50 });
    return records.map((course) => ({ id: `managed-course-${course.slug}`, title: course.name, route: "/courses", keywords: ["course", "training", course.slug, course.name], content: `${course.name}: ${course.shortDescription}. ${course.description}. Duration: ${course.durationDays} days. Contact a counselor for fees, schedule, availability, and enrollment details.` }));
  } catch {
    return [];
  }
}

const stopWords = new Set(["a", "an", "are", "do", "does", "for", "how", "i", "in", "is", "me", "of", "the", "to", "what", "which", "who", "your"]);
const singular: Record<string, string> = { admissions: "admission", courses: "course", fees: "fee", programs: "program", schedules: "schedule", students: "student", technologies: "technology", trainers: "trainer" };

function tokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9+&-]/g, " ").split(/\s+/).map((token) => singular[token] || token).filter((token) => token.length > 1 && !stopWords.has(token)));
}

export function retrieveKnowledge(message: string, page: string, sections: KnowledgeSection[], limit = 6) {
  const query = tokens(message);
  return sections.map((section) => {
    const haystack = tokens(`${section.id} ${section.title} ${section.route} ${section.content}`);
    const keywords = tokens(section.keywords?.join(" ") || "");
    let score = section.route === page ? 1 : 0;
    for (const token of query) if (keywords.has(token)) score += 8;
    for (const token of query) if (haystack.has(token)) score += token.length > 5 ? 3 : 1;
    return { section, score };
  }).sort((a, b) => b.score - a.score).slice(0, limit).map(({ section }) => section);
}

export async function getRelevantWebsiteKnowledge(message: string, page: string) {
  return retrieveKnowledge(message, page, [...baseKnowledge, ...(await databaseCourses())]);
}

export const approvedWebsiteKnowledge = baseKnowledge;
