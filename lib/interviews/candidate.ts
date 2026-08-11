import { getDb } from "@/lib/db";
import { hashInterviewToken } from "@/lib/interviews/token";

export async function findCandidateInterview(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  return getDb().mockInterview.findUnique({
    where: { tokenHash: hashInterviewToken(token) },
    include: {
      admission: { select: { studentName: true } },
      questions: { orderBy: { position: "asc" }, select: { id: true, position: true, technology: true, difficulty: true, questionText: true, maxScore: true, answer: { select: { answerText: true, savedAt: true } } } },
    },
  });
}

export function safeCandidateInterview(interview: NonNullable<Awaited<ReturnType<typeof findCandidateInterview>>>) {
  const deadline = interview.startedAt ? new Date(interview.startedAt.getTime() + interview.durationMinutes * 60_000) : null;
  return {
    id: interview.id,
    candidateName: interview.admission.studentName,
    technologies: interview.technologies,
    experienceRange: interview.experienceRange,
    difficulty: interview.difficulty,
    durationMinutes: interview.durationMinutes,
    questionCount: interview.questionCount,
    expiresAt: interview.expiresAt.toISOString(),
    status: interview.status,
    startedAt: interview.startedAt?.toISOString() ?? null,
    deadline: deadline?.toISOString() ?? null,
    submittedAt: interview.submittedAt?.toISOString() ?? null,
    result: interview.status === "COMPLETED" ? interview.result : null,
    questions: interview.startedAt ? interview.questions.map((question) => ({
      id: question.id, position: question.position, technology: question.technology, difficulty: question.difficulty,
      questionText: question.questionText, maxScore: question.maxScore,
      answerText: question.answer?.answerText ?? "", savedAt: question.answer?.savedAt.toISOString() ?? null,
    })) : [],
    serverNow: new Date().toISOString(),
  };
}
