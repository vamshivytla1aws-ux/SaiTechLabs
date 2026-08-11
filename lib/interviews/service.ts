import { getDb } from "@/lib/db";
import { evaluateInterviewAnswers } from "@/lib/interviews/openai";
import { calculatePercentage, clampScore, interviewResult } from "@/lib/interviews/scoring";

export async function evaluateAndCompleteInterview(interviewId: string) {
  const db = getDb();
  const interview = await db.mockInterview.findUnique({
    where: { id: interviewId },
    include: { questions: { orderBy: { position: "asc" }, include: { answer: true } } },
  });
  if (!interview) throw new Error("Interview not found.");
  if (!interview.submittedAt || !["SUBMITTED", "EVALUATING"].includes(interview.status)) throw new Error("Only a submitted interview can be evaluated.");
  await db.mockInterview.update({ where: { id: interviewId }, data: { status: "EVALUATING", evaluationError: null } });
  try {
    const answered = interview.questions.filter((question) => question.answer?.answerText.trim());
    const ai = answered.length ? await evaluateInterviewAnswers(answered.map((question) => ({
      questionId: question.id,
      question: question.questionText,
      referenceAnswer: question.referenceAnswer,
      rubric: question.rubric,
      maxScore: question.maxScore,
      candidateAnswer: question.answer!.answerText,
    }))) : { evaluations: [], model: process.env.OPENAI_INTERVIEW_MODEL || "not-called" };
    const byId = new Map(ai.evaluations.map((item) => [item.questionId, item]));
    if (answered.some((question) => !byId.has(question.id)) || ai.evaluations.some((item) => !answered.some((question) => question.id === item.questionId))) throw new Error("OpenAI evaluation did not match the submitted questions.");
    let totalScore = 0;
    let totalMaxScore = 0;
    const writes = interview.questions.map((question) => {
      if (!question.answer) throw new Error("Submitted interview is missing an answer record.");
      totalMaxScore += question.maxScore;
      const item = byId.get(question.id);
      const score = item ? clampScore(item.score, question.maxScore) : 0;
      totalScore += score;
      return db.mockInterviewEvaluation.upsert({
        where: { answerId: question.answer.id },
        create: { answerId: question.answer.id, score, maxScore: question.maxScore, technicalAccuracy: item?.technicalAccuracy ?? 0, completeness: item?.completeness ?? 0, practicalKnowledge: item?.practicalKnowledge ?? 0, clarity: item?.clarity ?? 0, verdict: item?.verdict ?? "BLANK", strengths: item?.strengths ?? [], missingPoints: item?.missingPoints ?? ["No answer was submitted."], feedback: item?.feedback ?? "No answer was submitted.", model: item ? ai.model : "local-blank-rule" },
        update: { score, maxScore: question.maxScore, technicalAccuracy: item?.technicalAccuracy ?? 0, completeness: item?.completeness ?? 0, practicalKnowledge: item?.practicalKnowledge ?? 0, clarity: item?.clarity ?? 0, verdict: item?.verdict ?? "BLANK", strengths: item?.strengths ?? [], missingPoints: item?.missingPoints ?? ["No answer was submitted."], feedback: item?.feedback ?? "No answer was submitted.", model: item ? ai.model : "local-blank-rule" },
      });
    });
    const overallScore = calculatePercentage(totalScore, totalMaxScore);
    await db.$transaction([...writes, db.mockInterview.update({ where: { id: interviewId }, data: { status: "COMPLETED", result: interviewResult(overallScore, interview.passScore), overallScore, totalScore, totalMaxScore, evaluatedAt: new Date(), evaluationModel: ai.model, evaluationError: null } })]);
    return { overallScore, result: interviewResult(overallScore, interview.passScore), model: ai.model };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Evaluation failed.";
    await db.mockInterview.update({ where: { id: interviewId }, data: { status: "SUBMITTED", evaluationError: message } });
    throw error;
  }
}
