import { parseISODate } from "@/lib/dates";

export interface CoachTip {
  /** 0 = Sunday … 6 = Saturday (Date#getDay) */
  weekday: number;
  focus: string;
  tip: string;
}

/** Weekday coach tips — exam-writer tone, Asia/Shanghai calendar weekday via ISO date. */
export const COACH_TIPS: CoachTip[] = [
  {
    weekday: 1,
    focus: "软工 / DFD",
    tip: "DFD 分层必守恒：父图一个加工拆到子图，进出数据流名称与条数都要对齐，对不上就别交卷。",
  },
  {
    weekday: 2,
    focus: "数据结构",
    tip: "先分清问的是逻辑结构还是存储结构：顺序表与链表、栈与队列一混，送分题也会丢。",
  },
  {
    weekday: 3,
    focus: "数据库",
    tip: "范式别死背条文：找出完全函数依赖与传递依赖，3NF 与 BCNF 的边界题就能一眼定位。",
  },
  {
    weekday: 4,
    focus: "UML / 模式",
    tip: "类图关系先看箭头语义：关联、聚合、组合、依赖、泛化——方向写反，概念分直接没。",
  },
  {
    weekday: 5,
    focus: "OS / 网安 / 计组",
    tip: "这类题常考「谁管什么」：进程与线程、虚实地址、加密与摘要，张冠李戴最容易。",
  },
  {
    weekday: 6,
    focus: "案例读图",
    tip: "案例先抓目标与约束再读图：对照接口与数据落点作答，不要从第一段文字逐句翻译。",
  },
  {
    weekday: 0,
    focus: "错题复盘",
    tip: "复盘只问「当时为何选错」：概念混淆、条件漏读、计算跳步——分桶记下，下周少踩同一坑。",
  },
];

export function coachTipForDate(iso: string): CoachTip {
  const weekday = parseISODate(iso).getDay();
  return COACH_TIPS.find((item) => item.weekday === weekday) ?? COACH_TIPS[0];
}
