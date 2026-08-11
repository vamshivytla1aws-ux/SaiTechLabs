const siteTerms = [
  "saitech", "sai tech", "course", "training", "program", "admission", "admissions", "enroll", "trainer", "faculty", "founder",
  "cloud", "aws", "azure", "gcp", "google cloud", "ai", "machine learning", "devops", "databricks", "data", "database", "oltp",
  "interview", "resume", "student", "btech", "graduate", "contact", "phone", "address", "location", "anantapur", "fee", "fees", "price",
  "schedule", "timing", "duration", "classroom", "online", "website", "page", "privacy", "terms", "whatsapp", "hello", "hi", "help",
];

const injectionTerms = ["ignore previous", "ignore all", "system prompt", "developer message", "reveal prompt", "show your instructions", "environment variable", "api key", "database password", "admin password", "jailbreak"];

const obviousGeneralTerms = ["weather", "capital of", "write code", "solve equation", "recipe", "movie", "cricket score", "stock price", "politics", "president of", "translate this"];

export type ScopeResult = "allowed" | "injection" | "out_of_scope";

export function classifyAssistantMessage(message: string): ScopeResult {
  const normalized = message.toLowerCase();
  if (injectionTerms.some((term) => normalized.includes(term))) return "injection";
  if (obviousGeneralTerms.some((term) => normalized.includes(term))) return "out_of_scope";
  if (siteTerms.some((term) => normalized.includes(term))) return "allowed";
  return normalized.split(/\s+/).length <= 3 ? "allowed" : "out_of_scope";
}

export const scopeMessage = "I’m SaiTech AI, so I can only help with SaiTech Labs courses, the 60-day program, trainers, admissions, contact details, and website navigation.";
