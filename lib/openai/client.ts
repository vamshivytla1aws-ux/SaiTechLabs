import OpenAI from "openai";

let cached: { apiKey: string; client: OpenAI } | undefined;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI is not configured. Add OPENAI_API_KEY to Railway variables.");
  if (!cached || cached.apiKey !== apiKey) cached = { apiKey, client: new OpenAI({ apiKey }) };
  return cached.client;
}

export function getOpenAIModel() {
  const model = process.env.OPENAI_MODEL?.trim() || process.env.OPENAI_INTERVIEW_MODEL?.trim();
  if (!model) throw new Error("OpenAI model is not configured. Add OPENAI_MODEL to Railway variables.");
  return model;
}
