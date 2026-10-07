/**
 * Fixed 16-day sprint schedule for Soft Exam 软件设计师.
 * Calendar: 2026-10-08 … 2026-10-23 (exam 2026-10-24 = rest, no new learning).
 * Independent of the 8-week startDate calendar — for late starters.
 */

import { examConfig } from "@/lib/config";
import { diffDays, examCountdown } from "@/lib/dates";

export type SprintPhase = 1 | 2 | 3;

/** CTA hint for dashboard / plan deep-links. */
export type SprintPracticeHint =
  | "module"
  | "mock"
  | "mistakes"
  | "weak"
  | "case"
  | "wrap";

export interface SprintDay {
  date: string;
  phase: SprintPhase;
  title: string;
  focus: string;
  tip: string;
  practiceHint?: SprintPracticeHint;
  /** Aligns with StudyDay.module when a practice module chip exists. */
  moduleKey?: string;
}

export const SPRINT_START = "2026-10-08";
export const SPRINT_END = "2026-10-23";

export const sprintPhaseLabel: Record<SprintPhase, string> = {
  1: "高频上午选择",
  2: "模考与弱项",
  3: "案例收口",
};

export const sprintDays: SprintDay[] = [
  // —— Phase 1：10/8–10/14 HF MCQ ——
  {
    date: "2026-10-08",
    phase: 1,
    title: "软工 / UML / 设计模式",
    focus: "类图依赖方向；策略 / 工厂 / 观察者",
    tip: "不追完整 8 周课表。上午选择优先：类图箭头方向与三种模式意图分清即可。",
    practiceHint: "module",
    moduleKey: "面向对象",
  },
  {
    date: "2026-10-09",
    phase: 1,
    title: "数据库",
    focus: "范式、ACID、隔离级别",
    tip: "1NF/2NF/3NF 与部分/传递依赖；ACID 四字；隔离级别由低到高别背错。",
    practiceHint: "module",
    moduleKey: "数据库",
  },
  {
    date: "2026-10-10",
    phase: 1,
    title: "操作系统",
    focus: "死锁四条件、银行家、调度、进程/线程共享",
    tip: "死锁四条件要能举反例；调度算法适用场景；进程与线程共享什么不共享什么。",
    practiceHint: "module",
    moduleKey: "操作系统",
  },
  {
    date: "2026-10-11",
    phase: 1,
    title: "数据结构",
    focus: "复杂度、树/图、排序场景",
    tip: "大 O 比较、树遍历与图最短路/MST 适用条件；排序稳定性和场景题。",
    practiceHint: "module",
    moduleKey: "数据结构",
  },
  {
    date: "2026-10-12",
    phase: 1,
    title: "网络与安全",
    focus: "OSI / TCP-IP；对称/非对称；防火墙五元组",
    tip: "层与协议对照；对称加密与非对称角色；五元组过滤直觉题。",
    practiceHint: "module",
    moduleKey: "网络与安全",
  },
  {
    date: "2026-10-13",
    phase: 1,
    title: "计算机组成 + 程序语言",
    focus: "Cache / 流水线、编译阶段、文法",
    tip: "Cache 映射与命中率、流水线加速比；编译阶段顺序与文法二义性点到为止。",
    practiceHint: "module",
    moduleKey: "计算机组成",
  },
  {
    date: "2026-10-14",
    phase: 1,
    title: "知识产权 + 标准化 + 英语",
    focus: "期限 / 归属；英语不空",
    tip: "著作权归属与保护期速记；国家标准编号；英语题宁猜不空。",
    practiceHint: "module",
    moduleKey: "法律法规",
  },
  // —— Phase 2：10/15–10/19 mocks ——
  {
    date: "2026-10-15",
    phase: 2,
    title: "一键上午模考",
    focus: "套 1 上午自编模考 · 计时交卷",
    tip: "整卷节奏优先；交卷后看成绩单，弱模块记下来明天补。",
    practiceHint: "mock",
  },
  {
    date: "2026-10-16",
    phase: 2,
    title: "错题 + 弱项 MODULE ACCURACY",
    focus: "只打到期错题与正确率偏低模块",
    tip: "流程：错题本 → 模块练习 →（有余力再看讲义）。不新开冷门章。",
    practiceHint: "weak",
  },
  {
    date: "2026-10-17",
    phase: 2,
    title: "一键上午模考",
    focus: "套 2 上午自编模考 · 计时交卷",
    tip: "第二套对照第一套弱项；时间分配按真实卷面练习。",
    practiceHint: "mock",
  },
  {
    date: "2026-10-18",
    phase: 2,
    title: "错题 + 弱项 MODULE ACCURACY",
    focus: "模考后错题狂刷 + 弱模块抽练",
    tip: "连续错过的知识点优先；每日地板 15 分钟也算完成。",
    practiceHint: "weak",
  },
  {
    date: "2026-10-19",
    phase: 2,
    title: "下午案例结构",
    focus: "问题 → 依据 → 结论",
    tip: "下午不追求写满：先读清问什么，再写依据与结论，踩点得分。",
    practiceHint: "case",
    moduleKey: "结构化方法",
  },
  // —— Phase 3：10/20–10/23 wrap ——
  {
    date: "2026-10-20",
    phase: 3,
    title: "DFD / 结构化 + OO 案例问法",
    focus: "数据流平衡、用例/类图补全问法",
    tip: "DFD 父图子图平衡；UML 补图常见问法过一遍即可。",
    practiceHint: "case",
    moduleKey: "结构化方法",
  },
  {
    date: "2026-10-21",
    phase: 3,
    title: "算法识别 + 系统分析与设计",
    focus: "算法识别题；可行性 / 需求 / 设计文档要点",
    tip: "分治/贪心适用条件；系统分析文档层级与软工模型对照。",
    practiceHint: "module",
    moduleKey: "系统分析与设计",
  },
  {
    date: "2026-10-22",
    phase: 3,
    title: "第二套上午或错题狂刷 + 案例 1 道",
    focus: "上午再练一手 + 下午案例一题踩点",
    tip: "有精力开第二套上午；否则错题本 + 自写一道案例结构即可。",
    practiceHint: "mock",
  },
  {
    date: "2026-10-23",
    phase: 3,
    title: "错题本 + 易混对照表",
    focus: "只看错题与易混，不学新章",
    tip: "考试日前一天：证件、时间分配、易混对照。考试日不学新。",
    practiceHint: "wrap",
  },
];

export function getSprintDay(iso: string): SprintDay | undefined {
  return sprintDays.find((day) => day.date === iso);
}

export function sprintDaysByPhase(phase: SprintPhase): SprintDay[] {
  return sprintDays.filter((day) => day.phase === phase);
}

/** Inclusive count of sprint calendar days still ahead (including today). */
export function sprintDaysLeft(today: string): number {
  if (today > SPRINT_END) return 0;
  if (today < SPRINT_START) return sprintDays.length;
  return diffDays(today, SPRINT_END) + 1;
}

export type SprintFocusKind = "today" | "upcoming" | "wrap" | "exam" | "hidden";

export interface SprintFocus {
  kind: SprintFocusKind;
  day: SprintDay | null;
  /** Short status line for the card. */
  status: string;
}

/**
 * What the dashboard / plan should surface for `today`.
 * Visible when before/on exam and countdown ≤ 20 (near-exam window).
 * After exam → hidden.
 */
export function resolveSprintFocus(today: string): SprintFocus {
  const left = examCountdown(today);
  if (left < 0) {
    return { kind: "hidden", day: null, status: "考试已过" };
  }
  if (today === examConfig.examDate) {
    return {
      kind: "exam",
      day: null,
      status: "今天考试 · 不学新 · 按准考证作息",
    };
  }
  // Near-exam window: show sprint whenever ≤20 days left (covers 10/4…10/23).
  if (left > 20 && today < SPRINT_START) {
    return { kind: "hidden", day: null, status: "" };
  }

  const exact = getSprintDay(today);
  if (exact) {
    return {
      kind: "today",
      day: exact,
      status: `冲刺第 ${sprintDays.findIndex((d) => d.date === today) + 1} / ${sprintDays.length} 天`,
    };
  }

  if (today < SPRINT_START) {
    const next = sprintDays[0] ?? null;
    return {
      kind: "upcoming",
      day: next,
      status: next ? `冲刺从 ${SPRINT_START} 起 · 还有 ${diffDays(today, SPRINT_START)} 天` : "",
    };
  }

  // Between sprint end and exam (should not happen with current dates, but safe).
  if (today > SPRINT_END && today < examConfig.examDate) {
    return {
      kind: "wrap",
      day: null,
      status: "考前收口：只看错题本与易混对照，不学新章",
    };
  }

  return { kind: "hidden", day: null, status: "" };
}

export function isSprintCardVisible(today: string): boolean {
  return resolveSprintFocus(today).kind !== "hidden";
}
