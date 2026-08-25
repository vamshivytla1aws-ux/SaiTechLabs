import type { LucideIcon } from "lucide-react";
import { BrainCircuit, Cloud, CodeXml, Database, GitBranch, MessageSquareText, Network, Warehouse } from "lucide-react";

export type Course = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  topics: string[];
  audience: string;
  icon: LucideIcon;
};

export const courses: Course[] = [
  { slug: "cloud", title: "Comprehensive Cloud", shortTitle: "Cloud", description: "Understand essential cloud concepts, services and architectures across leading platforms.", topics: ["AWS", "Google Cloud", "Microsoft Azure"], audience: "Students and early-career professionals", icon: Cloud },
  { slug: "ai-ml", title: "Artificial Intelligence & Machine Learning", shortTitle: "AI & ML", description: "Build a clear foundation in AI, machine learning concepts and modern AI tools.", topics: ["AI fundamentals", "ML concepts", "Modern AI tools"], audience: "Learners beginning their AI journey", icon: BrainCircuit },
  { slug: "devops", title: "DevOps Engineering", shortTitle: "DevOps", description: "Learn the workflows and tools that help teams build, test and release software reliably.", topics: ["CI/CD", "Automation", "Version control", "Containers"], audience: "Cloud and software engineering aspirants", icon: GitBranch },
  { slug: "databricks", title: "Big Data with Databricks", shortTitle: "Databricks", description: "Explore the lakehouse approach, data engineering workflows and big data processing.", topics: ["Databricks", "Lakehouse fundamentals", "Data engineering", "Big data processing"], audience: "Data engineering aspirants", icon: Network },
  { slug: "database", title: "Database Fundamentals", shortTitle: "Database", description: "Learn how operational data is structured, stored, queried and managed.", topics: ["OLTP", "Relational databases", "SQL concepts"], audience: "All technology learners", icon: Database },
  { slug: "warehousing", title: "Data Warehousing", shortTitle: "Data Warehousing", description: "Understand analytical data models, warehouse fundamentals and modern data flows.", topics: ["Warehousing", "Data modeling", "ETL concepts", "Analytics foundations"], audience: "Data and analytics aspirants", icon: Warehouse },
  { slug: "soft-skills", title: "Public Speaking & Soft Skills", shortTitle: "Soft Skills", description: "Develop the communication and professional presence needed in modern workplaces.", topics: ["Communication", "Presentation", "Professional behavior", "Confidence"], audience: "Students and entry-level professionals", icon: MessageSquareText },
  { slug: "interviews", title: "Interview Preparation", shortTitle: "Interview Preparation", description: "Practice technical communication, structured problem-solving and real interview scenarios.", topics: ["Technical interviews", "Mock AI Interviews", "Case studies", "Real-world scenarios"], audience: "Job-seeking students and graduates", icon: CodeXml },
];
