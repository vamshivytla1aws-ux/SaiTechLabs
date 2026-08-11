import assert from "node:assert/strict";
import test from "node:test";
import { generatedQuestionsSchema, hasDuplicateQuestions, manualQuestionSchema } from "../lib/interviews/config";
import { generateInterviewQuestions } from "../lib/interviews/openai";
import { calculatePercentage, clampScore, interviewResult } from "../lib/interviews/scoring";
import { createInterviewToken, hashInterviewToken } from "../lib/interviews/token";

const generated = {
  technology: "Java",
  difficulty: "INTERMEDIATE",
  question: "Explain how HashMap handles collisions and when its buckets become trees.",
  referenceAnswer: "HashMap uses buckets, equality checks, and treeification after thresholds to handle collisions efficiently.",
  rubric: { requiredPoints: ["Describes hashing and bucket lookup", "Explains equality checks"], bonusPoints: ["Mentions treeification thresholds"] },
  maxScore: 10,
};

test("AI question output requires hidden answer and rubric fields", () => {
  assert.equal(generatedQuestionsSchema.safeParse({ questions: [generated] }).success, true);
  assert.equal(generatedQuestionsSchema.safeParse({ questions: [{ ...generated, referenceAnswer: undefined }] }).success, false);
  assert.equal(generatedQuestionsSchema.safeParse({ questions: [{ ...generated, technology: "Unsupported" }] }).success, false);
});

test("manual question validation uses the same bounded rubric", () => {
  const manual = { technology: generated.technology, difficulty: generated.difficulty, questionText: generated.question, referenceAnswer: generated.referenceAnswer, rubric: generated.rubric, maxScore: 10 };
  assert.equal(manualQuestionSchema.safeParse(manual).success, true);
  assert.equal(manualQuestionSchema.safeParse({ ...manual, maxScore: 11 }).success, false);
});

test("normalized duplicate prevention catches punctuation and case changes", () => {
  assert.equal(hasDuplicateQuestions(["What is a Java HashMap?", "what is a java hashmap"]), true);
  assert.equal(hasDuplicateQuestions(["Explain a Java HashMap", "Explain SQL joins"]), false);
});

test("backend score math clamps values and determines thresholds", () => {
  assert.equal(clampScore(12, 10), 10);
  assert.equal(clampScore(-2, 10), 0);
  assert.equal(calculatePercentage(24, 30), 80);
  assert.equal(interviewResult(80, 70), "STRONG_PASS");
  assert.equal(interviewResult(72, 70), "PASS");
  assert.equal(interviewResult(58, 70), "REVIEW");
  assert.equal(interviewResult(30, 70), "FAIL");
});

test("secure interview tokens are random and only stable after hashing", () => {
  const first = createInterviewToken(); const second = createInterviewToken();
  assert.notEqual(first.token, second.token);
  assert.equal(first.tokenHash, hashInterviewToken(first.token));
  assert.equal(first.tokenHash.length, 64);
  assert.equal(first.tokenHash.includes(first.token), false);
});

test("OpenAI unavailable fails before any external API request", async () => {
  const oldKey = process.env.OPENAI_API_KEY; const oldModel = process.env.OPENAI_INTERVIEW_MODEL;
  delete process.env.OPENAI_API_KEY; process.env.OPENAI_INTERVIEW_MODEL = "gpt-5.5";
  await assert.rejects(() => generateInterviewQuestions({ technologies: ["Java"], experienceRange: "3-5 Years", difficulty: "MIXED", count: 1, existingQuestions: [] }), /OPENAI_API_KEY/);
  if (oldKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldKey;
  if (oldModel === undefined) delete process.env.OPENAI_INTERVIEW_MODEL; else process.env.OPENAI_INTERVIEW_MODEL = oldModel;
});
