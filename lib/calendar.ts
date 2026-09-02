import { examConfig } from "@/lib/config";
import { addDaysISO, inRange } from "@/lib/dates";
import type { ContentStatus, DayKind, HolidayKind, StudyDay, WeekMeta } from "@/lib/types";

interface DaySeed {
  week: number;
  dayInWeek: number;
  title: string;
  topic: string;
  module: string;
  kind: DayKind;
  durationMin: number;
  status: ContentStatus;
  makeup?: boolean;
  paperSlot?: "morning" | "afternoon";
  blurb: string;
}

function holidayOf(date: string): HolidayKind | undefined {
  if (
    inRange(
      date,
      examConfig.holidays.midAutumn.start,
      examConfig.holidays.midAutumn.end,
    )
  ) {
    return "mid-autumn";
  }
  if (
    inRange(
      date,
      examConfig.holidays.nationalDay.start,
      examConfig.holidays.nationalDay.end,
    )
  ) {
    return "national-day";
  }
  return undefined;
}

const seeds: DaySeed[] = [
  {
    week: 1,
    dayInWeek: 1,
    title: "内聚与耦合",
    topic: "内聚与耦合",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "模块内部职责是否集中、模块之间依赖有多紧。软考必考七种耦合，不要只背「四种」。",
  },
  {
    week: 1,
    dayInWeek: 2,
    title: "生命周期 + 开发模型 + V 模型",
    topic: "开发模型",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "按需求稳定度与风险选型；V 模型把每层设计与对应测试阶段一一配对。",
  },
  {
    week: 1,
    dayInWeek: 3,
    title: "黑盒测试",
    topic: "黑盒测试",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "等价类、边界值、因果图、错误推测。区间边界题几乎每年都出现。",
  },
  {
    week: 1,
    dayInWeek: 4,
    title: "白盒测试 + McCabe",
    topic: "白盒测试",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "覆盖强度排序、判定覆盖 ≠ 条件覆盖、环形复杂度 V(G)=E−N+2=P+1。",
  },
  {
    week: 1,
    dayInWeek: 5,
    title: "DFD / 数据字典 / 平衡原则",
    topic: "数据流图",
    module: "软件工程",
    kind: "case",
    durationMin: 90,
    status: "stub",
    blurb:
      "父图与子图数据流平衡、加工编号、数据字典条目。下午案例分析主阵地。",
  },
  {
    week: 1,
    dayInWeek: 6,
    title: "UML 五图 + 类关系",
    topic: "UML 基础",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb:
      "用例、类、顺序、状态、活动；关联 / 聚合 / 组合 / 依赖 / 泛化 / 实现。",
  },
  {
    week: 1,
    dayInWeek: 7,
    title: "面向对象基础 + 本周错题",
    topic: "面向对象",
    module: "软件工程",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "封装、继承、多态、抽象；把本周软件工程错题过一遍。",
  },
  {
    week: 2,
    dayInWeek: 1,
    title: "复杂度 + 线性结构",
    topic: "复杂度与线性表",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb:
      "大 O 比较、栈队列数组链表的操作复杂度。软考考概念与推演，不考手写刷题。",
  },
  {
    week: 2,
    dayInWeek: 2,
    title: "树：遍历 / 堆 / Huffman",
    topic: "树",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "先中后序、层次遍历、完全二叉树、堆调整、Huffman 带权路径长。",
  },
  {
    week: 2,
    dayInWeek: 3,
    title: "图：BFS / DFS / 最短路 / 最小生成树",
    topic: "图",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb:
      "BFS、DFS、Dijkstra、Floyd、Prim、Kruskal。会对照适用条件与复杂度即可。",
  },
  {
    week: 2,
    dayInWeek: 4,
    title: "排序 + 查找",
    topic: "排序与查找",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb:
      "稳定与不稳定、最好最坏平均、折半查找判定树。不把贪心 / DP 当本日专题。",
  },
  {
    week: 2,
    dayInWeek: 5,
    title: "算法填空（C / Java 完形）",
    topic: "算法填空",
    module: "数据结构",
    kind: "case",
    durationMin: 90,
    status: "stub",
    blurb:
      "下午常见：给一段遍历 / 排序 / 建树代码挖空。v1 用选择题完形代替手写填空。",
  },
  {
    week: 2,
    dayInWeek: 6,
    title: "哈希 + 字符串",
    topic: "哈希与字符串",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "散列函数、冲突处理、装填因子；KMP / 朴素匹配考法。",
  },
  {
    week: 2,
    dayInWeek: 7,
    title: "本周错题复盘",
    topic: "数据结构复盘",
    module: "数据结构",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "只复盘本周图、树、排序的易混点，不新开算法范式专题。",
  },
  {
    week: 3,
    dayInWeek: 1,
    title: "关系模型 + E-R + 完整性",
    topic: "关系模型",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "实体联系转表、主外键、实体/参照/用户定义完整性。",
  },
  {
    week: 3,
    dayInWeek: 2,
    title: "范式与规范化",
    topic: "范式",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "1NF / 2NF / 3NF / BCNF，部分依赖与传递依赖是送分也是送命题陷阱。",
  },
  {
    week: 3,
    dayInWeek: 3,
    title: "SQL 查询",
    topic: "SQL",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "连接、分组、嵌套、存在量词。上午选择 + 下午补全都会出。",
  },
  {
    week: 3,
    dayInWeek: 4,
    title: "事务 / 并发 / 封锁",
    topic: "事务与并发",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "ACID、隔离级别、共享/排他锁、死锁、两段锁。",
  },
  {
    week: 3,
    dayInWeek: 5,
    title: "数据库设计案例",
    topic: "数据库案例",
    module: "数据库",
    kind: "case",
    durationMin: 90,
    status: "stub",
    blurb: "读题干补 E-R、补关系模式、写约束。按下午题节奏练。",
  },
  {
    week: 3,
    dayInWeek: 6,
    title: "调休 · 本周错题复盘",
    topic: "数据库复盘",
    module: "数据库",
    kind: "review",
    durationMin: 45,
    status: "stub",
    makeup: true,
    blurb: "调休工作日按 45 分钟工作日处理，只复盘，不开长案例。",
  },
  {
    week: 3,
    dayInWeek: 7,
    title: "视图 / 索引 / 查询优化",
    topic: "索引与优化",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "视图可更新条件、B+ 树索引、选择率与最左前缀。",
  },
  {
    week: 4,
    dayInWeek: 1,
    title: "用例图 + 类图精讲",
    topic: "UML 用例与类图",
    module: "UML 与模式",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "参与者、包含/扩展/泛化；类图多重度与导航是高频坑。",
  },
  {
    week: 4,
    dayInWeek: 2,
    title: "顺序图 / 状态图 / 活动图",
    topic: "UML 行为图",
    module: "UML 与模式",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "生命线与激活条、状态迁移事件、活动图分叉汇合。",
  },
  {
    week: 4,
    dayInWeek: 3,
    title: "设计模式：创建型 + 结构型",
    topic: "创建与结构模式",
    module: "UML 与模式",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "单例、工厂、抽象工厂、适配器、装饰、代理、外观。看意图不看背名。",
  },
  {
    week: 4,
    dayInWeek: 4,
    title: "中秋 · 轻量复盘",
    topic: "UML 复盘",
    module: "UML 与模式",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "中秋假期，只过类关系与模式意图对照表。",
  },
  {
    week: 4,
    dayInWeek: 5,
    title: "设计模式案例（行为型）",
    topic: "行为型模式",
    module: "UML 与模式",
    kind: "case",
    durationMin: 90,
    status: "stub",
    blurb: "策略、观察者、模板方法、命令、状态。下午常要求「补类图选模式」。",
  },
  {
    week: 4,
    dayInWeek: 6,
    title: "中秋 · 架构风格速记",
    topic: "架构风格",
    module: "UML 与模式",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "管道过滤、分层、C2、MVC、微内核。假期短训即可。",
  },
  {
    week: 4,
    dayInWeek: 7,
    title: "本周错题 + 模式对比",
    topic: "模式对比",
    module: "UML 与模式",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "把「看起来像」的模式对放在一起：装饰 vs 代理、策略 vs 状态。",
  },
  {
    week: 5,
    dayInWeek: 1,
    title: "进程 / 线程 / 调度",
    topic: "进程与调度",
    module: "操作系统",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "三态五态、抢占、时间片、FCFS / SJF / 优先级 / RR。",
  },
  {
    week: 5,
    dayInWeek: 2,
    title: "同步互斥 / 死锁 / PV",
    topic: "同步与死锁",
    module: "操作系统",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "临界区、信号量、死锁四条件、银行家。PV 题按模板算。",
  },
  {
    week: 5,
    dayInWeek: 3,
    title: "国庆 · 存储管理速记",
    topic: "存储管理",
    module: "操作系统",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "国庆短训：分页分段、页面置换 FIFO / LRU / Clock。",
  },
  {
    week: 5,
    dayInWeek: 4,
    title: "国庆 · 文件与设备",
    topic: "文件与设备",
    module: "操作系统",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "目录结构、索引分配、SPOOLing、中断与 DMA。",
  },
  {
    week: 5,
    dayInWeek: 5,
    title: "上午综合卷（OS + 计组）",
    topic: "上午综合卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "morning",
    blurb: "按上午 150 分钟计时。v1 先用计时器占位，完整卷库后续接入。",
  },
  {
    week: 5,
    dayInWeek: 6,
    title: "下午案例卷（OS / 计组）",
    topic: "下午案例卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "afternoon",
    blurb: "下午案例卷占位。先走完计时与收尾，卷面稍后补上。",
  },
  {
    week: 5,
    dayInWeek: 7,
    title: "计算机组成：CPU / 流水 / Cache",
    topic: "计算机组成",
    module: "计算机组成",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "指令周期、流水线吞吐、Cache 映射与写策略。",
  },
  {
    week: 6,
    dayInWeek: 1,
    title: "编译原理：词法 / 语法 / 中间代码",
    topic: "编译原理",
    module: "编译原理",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "有限自动机、LL / LR 直觉、四元式。上午小题为主。",
  },
  {
    week: 6,
    dayInWeek: 2,
    title: "国庆末 · 计算机网络体系",
    topic: "计算机网络",
    module: "计算机网络",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "OSI / TCP-IP、可靠传输、路由与 IP 编址。",
  },
  {
    week: 6,
    dayInWeek: 3,
    title: "网络安全 + 密码学",
    topic: "网络安全",
    module: "信息安全",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "对称/非对称、摘要、数字签名、HTTPS 握手角色。",
  },
  {
    week: 6,
    dayInWeek: 4,
    title: "专业英语阅读",
    topic: "专业英语",
    module: "英语",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "每年 5 分左右。认术语比读长难句更划算。",
  },
  {
    week: 6,
    dayInWeek: 5,
    title: "调休 · 知识产权与标准",
    topic: "知识产权与标准",
    module: "法律法规",
    kind: "review",
    durationMin: 45,
    status: "stub",
    makeup: true,
    blurb: "调休工作日 45 分钟：著作权归属、侵权、国家标准编号。",
  },
  {
    week: 6,
    dayInWeek: 6,
    title: "下午案例卷",
    topic: "下午案例卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "afternoon",
    blurb: "第二场下午卷占位。保持 150 分钟节奏。",
  },
  {
    week: 6,
    dayInWeek: 7,
    title: "本周错题复盘",
    topic: "综合复盘",
    module: "综合",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "编译、网络、安全、知产、英语错题过一遍。",
  },
  {
    week: 7,
    dayInWeek: 1,
    title: "薄弱项：软件工程查漏",
    topic: "软工查漏",
    module: "查漏补缺",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "只打本周前错题里反复出现的软工点，不新开大专题。",
  },
  {
    week: 7,
    dayInWeek: 2,
    title: "薄弱项：数据结构查漏",
    topic: "DSA 查漏",
    module: "查漏补缺",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "对照错题本：图算法适用条件、排序稳定性、Huffman。",
  },
  {
    week: 7,
    dayInWeek: 3,
    title: "薄弱项：数据库 + UML",
    topic: "库与 UML 查漏",
    module: "查漏补缺",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "范式判定 + 类关系 + 模式意图，下午分数大户。",
  },
  {
    week: 7,
    dayInWeek: 4,
    title: "薄弱项：OS + 计组 + 网络",
    topic: "系统查漏",
    module: "查漏补缺",
    kind: "learn",
    durationMin: 45,
    status: "stub",
    blurb: "调度计算、Cache 映射、子网划分，上午容易算错的三类。",
  },
  {
    week: 7,
    dayInWeek: 5,
    title: "上午真题卷",
    topic: "上午真题卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "morning",
    blurb: "完整上午节奏。v1 计时占位。",
  },
  {
    week: 7,
    dayInWeek: 6,
    title: "下午真题卷",
    topic: "下午真题卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "afternoon",
    blurb: "完整下午节奏。v1 计时占位。",
  },
  {
    week: 7,
    dayInWeek: 7,
    title: "错题总复盘",
    topic: "总复盘",
    module: "查漏补缺",
    kind: "review",
    durationMin: 45,
    status: "stub",
    blurb: "只看「待复习」和连续错过的题，不要再铺新范围。",
  },
  {
    week: 8,
    dayInWeek: 1,
    title: "上午选择题冲刺",
    topic: "上午冲刺",
    module: "冲刺",
    kind: "sprint",
    durationMin: 45,
    status: "stub",
    blurb: "冲刺周只收口：高频陷阱清单，不学新体系。",
  },
  {
    week: 8,
    dayInWeek: 2,
    title: "下午案例冲刺",
    topic: "下午冲刺",
    module: "冲刺",
    kind: "sprint",
    durationMin: 45,
    status: "stub",
    blurb: "DFD 平衡、E-R 转表、UML 补图、算法填空四件套过一遍。",
  },
  {
    week: 8,
    dayInWeek: 3,
    title: "高频陷阱速记",
    topic: "陷阱速记",
    module: "冲刺",
    kind: "sprint",
    durationMin: 30,
    status: "stub",
    blurb: "30 分钟：耦合七种、覆盖强度、V 模型配对、边界值。",
  },
  {
    week: 8,
    dayInWeek: 4,
    title: "考前清单 + 最后过一遍",
    topic: "考前清单",
    module: "冲刺",
    kind: "sprint",
    durationMin: 30,
    status: "stub",
    blurb: "证件、计算器规则、答题卡、时间分配。考试日不是学习日。",
  },
];

const weekSeeds: Omit<WeekMeta, 'start' | 'end'>[] = [
  {
    week: 1,
    title: "软件工程 + DFD",
    subtitle: "内聚耦合、模型、测试、数据流图",
  },
  {
    week: 2,
    title: "数据结构（软考向）",
    subtitle: "复杂度、树、图、排序查找、哈希；不含贪心 / DP 专题",
  },
  {
    week: 3,
    title: "数据库",
    subtitle: "E-R、范式、SQL、事务；09-20 调休只复盘",
  },
  {
    week: 4,
    title: "UML 与设计模式",
    subtitle: "五图、类关系、模式；09-26 案例",
  },
  {
    week: 5,
    title: "操作系统 + 计算机组成",
    subtitle: "进程存储、计组；10-03 / 10-04 卷",
  },
  {
    week: 6,
    title: "编译 / 网络 / 安全 / 知产 / 英语",
    subtitle: "10-10 知产与标准；10-11 下午卷",
  },
  {
    week: 7,
    title: "薄弱项 + 真题卷",
    subtitle: "查漏四天 + 10-17 / 10-18 卷",
  },
  {
    week: 8,
    title: "冲刺",
    subtitle: "仅四天，考试日不排课",
  },
];

export function dayIdOf(week: number, dayInWeek: number): string {
  return `week-${week}/day-${dayInWeek}`;
}

export function scheduleDays(startDate: string): StudyDay[] {
  return seeds.map((seed, index) => {
    const date = addDaysISO(startDate, index);
    return {
      id: dayIdOf(seed.week, seed.dayInWeek),
      date,
      week: seed.week,
      dayInWeek: seed.dayInWeek,
      title: seed.title,
      topic: seed.topic,
      module: seed.module,
      kind: seed.kind,
      durationMin: seed.durationMin,
      status: seed.status,
      holiday: holidayOf(date),
      makeup: seed.makeup,
      paperSlot: seed.paperSlot,
      blurb: seed.blurb,
    };
  });
}

export function scheduleWeeks(startDate: string): WeekMeta[] {
  const days = scheduleDays(startDate);
  return weekSeeds.map((week) => {
    const inWeek = days.filter((day) => day.week === week.week);
    return {
      ...week,
      start: inWeek[0]?.date ?? startDate,
      end: inWeek[inWeek.length - 1]?.date ?? startDate,
    };
  });
}

export function lastPlannedDate(startDate: string): string {
  return addDaysISO(startDate, Math.max(0, seeds.length - 1));
}

export function getDayByDate(startDate: string, iso: string): StudyDay | undefined {
  return scheduleDays(startDate).find((day) => day.date === iso);
}

/** Identity list for static params and content keys. Dates follow a dummy start. */
export const studyDays: StudyDay[] = scheduleDays("2000-01-01");
export const weeks: WeekMeta[] = scheduleWeeks("2000-01-01");
export const CURRICULUM_LENGTH = seeds.length;

export const firstDay = studyDays[0];
export const lastDay = studyDays[studyDays.length - 1];

export function getDayById(id: string, startDate?: string): StudyDay | undefined {
  const days = startDate ? scheduleDays(startDate) : studyDays;
  return days.find((day) => day.id === id);
}

export function getDayByWeekDay(
  week: number,
  dayInWeek: number,
  startDate?: string,
): StudyDay | undefined {
  const days = startDate ? scheduleDays(startDate) : studyDays;
  return days.find((day) => day.week === week && day.dayInWeek === dayInWeek);
}

export function getDaysByWeek(week: number, startDate?: string): StudyDay[] {
  const days = startDate ? scheduleDays(startDate) : studyDays;
  return days.filter((day) => day.week === week);
}

export function getWeekMeta(week: number, startDate?: string): WeekMeta | undefined {
  const list = startDate ? scheduleWeeks(startDate) : weeks;
  return list.find((item) => item.week === week);
}

export function getNextDay(id: string, startDate?: string): StudyDay | undefined {
  const days = startDate ? scheduleDays(startDate) : studyDays;
  const index = days.findIndex((day) => day.id === id);
  if (index < 0) return undefined;
  return days[index + 1];
}

export function getPrevDay(id: string, startDate?: string): StudyDay | undefined {
  const days = startDate ? scheduleDays(startDate) : studyDays;
  const index = days.findIndex((day) => day.id === id);
  if (index <= 0) return undefined;
  return days[index - 1];
}

export type PlanPhase = "not-started" | "active" | "after-plan";

export function planPhase(startDate: string, today: string): PlanPhase {
  if (today < startDate) return "not-started";
  if (today > lastPlannedDate(startDate)) return "after-plan";
  return "active";
}

export function dayHref(day: Pick<StudyDay, "week" | "dayInWeek">): string {
  return `/learn/week-${day.week}/day-${day.dayInWeek}`;
}

export const kindLabel: Record<DayKind, string> = {
  learn: "学习",
  case: "案例",
  paper: "试卷",
  review: "复盘",
  sprint: "冲刺",
};

export const holidayLabel: Record<HolidayKind, string> = {
  "mid-autumn": "中秋",
  "national-day": "国庆",
};
