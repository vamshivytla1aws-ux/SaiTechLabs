import { z } from "zod";

export const assistantRoutes = ["/", "/about", "/program", "/courses", "/trainers", "/admissions", "/contact", "/privacy", "/terms"] as const;
export const suggestedLinkRoutes = ["/about", "/program", "/courses", "/trainers", "/admissions", "/contact"] as const;

const historyItem = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(800) }).strict();

export const assistantRequestSchema = z.object({
  message: z.string().trim().min(1, "Please enter a message.").max(800, "Please keep your message under 800 characters."),
  sessionId: z.string().regex(/^[a-zA-Z0-9_-]{16,80}$/, "Invalid session."),
  page: z.enum(assistantRoutes),
  history: z.array(historyItem).max(6).default([]),
}).strict();

export const assistantAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(1500),
  suggestedLinks: z.array(z.object({ label: z.string().trim().min(1).max(50), href: z.enum(suggestedLinkRoutes) }).strict()).max(3),
}).strict();

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
export type AssistantAnswer = z.infer<typeof assistantAnswerSchema>;

export const assistantOutputSchema = {
  type: "object", additionalProperties: false, required: ["answer", "suggestedLinks"], properties: {
    answer: { type: "string", maxLength: 1500 },
    suggestedLinks: { type: "array", maxItems: 3, items: { type: "object", additionalProperties: false, required: ["label", "href"], properties: {
      label: { type: "string", maxLength: 50 }, href: { type: "string", enum: suggestedLinkRoutes },
    } } },
  },
} as const;
