import { z } from "zod";

export const interviewTechnologies = [
  "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Node.js", "SQL",
  "PostgreSQL", "MySQL", "Oracle", "Greenplum", "Redshift", "Databricks", "AWS", "Azure",
  "GCP", "DevOps", "Docker", "Kubernetes", "Linux", "Shell Scripting", "Terraform",
  "Data Engineering", "Spark", "Snowflake",
] as const;

export const experienceRanges = ["Fresher", "0-2 Years", "3-5 Years", "6-10 Years", "10+ Years"] as const;
export const interviewDurations = [20, 30, 45, 60, 90] as const;

const supportedTechnology = z.enum(interviewTechnologies);
const difficulty = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "MIXED"]);

export const createInterviewSchema = z.object({
  type: z.enum(["AI", "MANUAL", "MIXED"]),
  technologies: z.array(supportedTechnology).min(1).max(8),
  experienceRange: z.enum(experienceRanges),
  difficulty,
  questionCount: z.number().int().min(5).max(30),
  aiQuestionCount: z.number().int().min(0).max(30),
  manualQuestionCount: z.number().int().min(0).max(30),
  durationMinutes: z.union(interviewDurations.map((value) => z.literal(value)) as [z.ZodLiteral<20>, z.ZodLiteral<30>, z.ZodLiteral<45>, z.ZodLiteral<60>, z.ZodLiteral<90>]),
  passScore: z.number().int().min(40).max(95),
  expiresAt: z.string().datetime(),
}).strict().superRefine((data, ctx) => {
  if (data.aiQuestionCount + data.manualQuestionCount !== data.questionCount) ctx.addIssue({ code: "custom", path: ["questionCount"], message: "AI and manual counts must equal the total question count." });
  if (data.type === "AI" && (data.aiQuestionCount !== data.questionCount || data.manualQuestionCount !== 0)) ctx.addIssue({ code: "custom", path: ["aiQuestionCount"], message: "AI interviews must contain only AI questions." });
  if (data.type === "MANUAL" && (data.manualQuestionCount !== data.questionCount || data.aiQuestionCount !== 0)) ctx.addIssue({ code: "custom", path: ["manualQuestionCount"], message: "Manual interviews must contain only manual questions." });
  if (data.type === "MIXED" && (!data.aiQuestionCount || !data.manualQuestionCount)) ctx.addIssue({ code: "custom", path: ["type"], message: "Mixed interviews need both AI and manual questions." });
  if (new Date(data.expiresAt) <= new Date()) ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry must be in the future." });
});

export const rubricSchema = z.object({
  requiredPoints: z.array(z.string().trim().min(2).max(300)).min(1).max(10),
  bonusPoints: z.array(z.string().trim().min(2).max(300)).max(5),
}).strict();

export const generatedQuestionSchema = z.object({
  technology: supportedTechnology,
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  question: z.string().trim().min(15).max(2000),
  referenceAnswer: z.string().trim().min(20).max(6000),
  rubric: rubricSchema,
  maxScore: z.number().min(1).max(10),
}).strict();

export const generatedQuestionsSchema = z.object({ questions: z.array(generatedQuestionSchema).min(1).max(30) }).strict();

export const manualQuestionSchema = z.object({
  technology: supportedTechnology,
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  questionText: z.string().trim().min(15).max(2000),
  referenceAnswer: z.string().trim().min(20).max(6000),
  rubric: rubricSchema,
  maxScore: z.number().min(1).max(10).default(10),
}).strict();

export const answerSaveSchema = z.object({
  questionId: z.string().cuid(),
  answerText: z.string().max(12_000),
}).strict();

export const integrityEventSchema = z.object({
  type: z.enum(["PASTE_ATTEMPT", "COPY_ATTEMPT", "TAB_HIDDEN", "WINDOW_BLUR"]),
}).strict();

export const evaluationItemSchema = z.object({
  questionId: z.string().min(1),
  score: z.number().min(0).max(10),
  technicalAccuracy: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  practicalKnowledge: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  verdict: z.enum(["EXCELLENT", "GOOD", "PARTIAL", "WEAK", "INCORRECT"]),
  strengths: z.array(z.string().trim().max(300)).max(8),
  missingPoints: z.array(z.string().trim().max(300)).max(8),
  feedback: z.string().trim().min(2).max(1200),
}).strict();

export const evaluationBatchSchema = z.object({ evaluations: z.array(evaluationItemSchema).max(30) }).strict();

export function normalizedQuestion(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

export function hasDuplicateQuestions(values: string[]) {
  const normalized = values.map(normalizedQuestion);
  return new Set(normalized).size !== normalized.length;
}
