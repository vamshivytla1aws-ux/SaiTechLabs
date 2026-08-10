export type Trainer = {
  name: string;
  initials: string;
  role: string;
  experience: string;
  expertise: string[];
  summary: string;
  image?: string;
};

export const trainers: Trainer[] = [
  { name: "Maccha", initials: "MA", role: "Cloud & Data Engineering", experience: "Experience details to be confirmed", expertise: ["Cloud", "Data Engineering"], summary: "Professional profile and detailed specialization will be added after confirmation." },
  { name: "Vasanth", initials: "VA", role: "AI & Machine Learning", experience: "Experience details to be confirmed", expertise: ["AI", "Machine Learning"], summary: "Professional profile and detailed specialization will be added after confirmation." },
  { name: "Ramesh", initials: "RA", role: "DevOps Engineering", experience: "Experience details to be confirmed", expertise: ["DevOps", "Automation"], summary: "Professional profile and detailed specialization will be added after confirmation." },
  { name: "Pradeep", initials: "PR", role: "Databricks & Big Data", experience: "Experience details to be confirmed", expertise: ["Databricks", "Big Data"], summary: "Professional profile and detailed specialization will be added after confirmation." },
  { name: "Srini", initials: "SR", role: "Professional & Interview Skills", experience: "Experience details to be confirmed", expertise: ["Communication", "Interview Readiness"], summary: "Professional profile and detailed specialization will be added after confirmation." },
];
