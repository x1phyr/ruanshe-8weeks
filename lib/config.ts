export const examConfig = {
  examDate: "2026-10-24",
  examName: "2026 下半年 软件设计师",
  examLevel: "软考中级 · 软件设计师",
  studyStart: "2026-09-01",
  studyEnd: "2026-10-23",
  makeupDays: ["2026-09-20", "2026-10-10"] as const,
  holidays: {
    midAutumn: {
      start: "2026-09-25",
      end: "2026-09-27",
      name: "中秋",
    },
    nationalDay: {
      start: "2026-10-01",
      end: "2026-10-07",
      name: "国庆",
    },
  },
} as const;

export const STORAGE_KEY = "ruanshe-8weeks-v1";

export const APP_NAME = "软设 8 周通关";
export const APP_TAGLINE = "45 分钟日训 · 软考中级软件设计师";
