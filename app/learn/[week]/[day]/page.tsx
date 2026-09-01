import { notFound } from "next/navigation";
import { LearnSession } from "@/components/learn/learn-session";
import { getDayByWeekDay } from "@/lib/calendar";

export default async function LearnDayPage({
  params,
}: {
  params: Promise<{ week: string; day: string }>;
}) {
  const { week, day } = await params;
  const weekNum = Number(week.replace("week-", ""));
  const dayNum = Number(day.replace("day-", ""));
  const studyDay = getDayByWeekDay(weekNum, dayNum);
  if (!studyDay) notFound();
  return <LearnSession day={studyDay} />;
}
