import { FeedbackForm } from "@/components/operations/FeedbackForm";
import { requireStudent } from "@/lib/student-auth";

export default async function StudentFeedbackPage() {
  await requireStudent();
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Your voice matters</p><h1>Course feedback</h1><p>Share your experience with our training team. Your response is reviewed by authorized staff.</p></div></div><FeedbackForm endpoint="/api/student/feedback" kind="student" /></div>;
}
