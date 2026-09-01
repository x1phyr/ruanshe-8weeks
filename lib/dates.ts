import { examConfig } from "@/lib/config";

const WEEKDAY_CN = ["日", "一", "二", "三", "四", "五", "六"] as const;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(simulateDate?: string | null): string {
  if (simulateDate) return simulateDate;
  return formatISODate(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function diffDays(from: string, to: string): number {
  const a = parseISODate(from).getTime();
  const b = parseISODate(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function weekdayLabel(iso: string): string {
  return `周${WEEKDAY_CN[parseISODate(iso).getDay()]}`;
}

export function formatDateCn(iso: string): string {
  const date = parseISODate(iso);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m} 月 ${d} 日`;
}

export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}-${d}`;
}

export function examCountdown(today: string): number {
  return diffDays(today, examConfig.examDate);
}

export function inRange(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
