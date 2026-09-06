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
  // —— Week 1：章1 计算机组成 + 章2 程序语言/编译 ——
  {
    week: 1,
    dayInWeek: 1,
    title: "计算机系统概述与数制编码",
    topic: "系统概述与编码",
    module: "计算机组成",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "章1开场：冯·诺依曼结构、层次、数制转换、原码反码补码、校验码。上午小题为主。",
  },
  {
    week: 1,
    dayInWeek: 2,
    title: "CPU 与指令系统",
    topic: "CPU 与指令",
    module: "计算机组成",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "指令周期、寻址方式、CISC/RISC。会对照考法，不背微指令表。",
  },
  {
    week: 1,
    dayInWeek: 3,
    title: "存储体系与 Cache",
    topic: "存储与 Cache",
    module: "计算机组成",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "主存编址、Cache 映射（直接/全相联/组相联）、写策略、命中率计算。",
  },
  {
    week: 1,
    dayInWeek: 4,
    title: "流水线 / 总线 / 输入输出",
    topic: "流水线与 I/O",
    module: "计算机组成",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "流水线吞吐与加速比、冒险；总线仲裁；中断 / DMA / 通道。",
  },
  {
    week: 1,
    dayInWeek: 5,
    title: "程序语言基础",
    topic: "程序语言",
    module: "程序语言",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "章2：语言分类、编译型/解释型、绑定时机、参数传递（值/引用/名）。",
  },
  {
    week: 1,
    dayInWeek: 6,
    title: "编译：词法与语法分析",
    topic: "词法语法分析",
    module: "程序语言",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "有限自动机、正则；LL / LR 直觉、文法二义性。上午概念题为主。",
  },
  {
    week: 1,
    dayInWeek: 7,
    title: "编译：中间代码与本周复盘",
    topic: "中间代码与复盘",
    module: "程序语言",
    kind: "review",
    durationMin: 45,
    status: "live",
    blurb: "四元式、解释与编译对比；把计组计算题与编译易混点过一遍。",
  },
  // —— Week 2：章3 数据结构 ——
  {
    week: 2,
    dayInWeek: 1,
    title: "复杂度 + 线性结构",
    topic: "复杂度与线性表",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "大 O 比较、数组/链表操作复杂度。软考考概念与推演，不考手写刷题。",
  },
  {
    week: 2,
    dayInWeek: 2,
    title: "栈与队列",
    topic: "栈与队列",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "进出序、循环队列判空满、表达式求值与括号匹配考法。",
  },
  {
    week: 2,
    dayInWeek: 3,
    title: "树：遍历 / 堆 / Huffman",
    topic: "树",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "先中后序、层次遍历、完全二叉树、堆调整、Huffman 带权路径长。",
  },
  {
    week: 2,
    dayInWeek: 4,
    title: "图：BFS / DFS / 最短路 / MST",
    topic: "图",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "BFS、DFS、Dijkstra、Floyd、Prim、Kruskal。会对照适用条件与复杂度即可。",
  },
  {
    week: 2,
    dayInWeek: 5,
    title: "排序 + 算法填空（完形）",
    topic: "排序与填空",
    module: "数据结构",
    kind: "case",
    durationMin: 90,
    status: "live",
    blurb:
      "稳定与不稳定、最好最坏平均；下午常见遍历/排序挖空。v1 用选择题完形。",
  },
  {
    week: 2,
    dayInWeek: 6,
    title: "查找 + 哈希 + 串",
    topic: "查找哈希与串",
    module: "数据结构",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "折半判定树、散列冲突与装填因子；KMP / 朴素匹配只记思想。",
  },
  {
    week: 2,
    dayInWeek: 7,
    title: "本周错题复盘",
    topic: "数据结构复盘",
    module: "数据结构",
    kind: "review",
    durationMin: 45,
    status: "live",
    blurb: "只复盘图、树、排序易混点；不新开贪心 / DP / 回溯专题。",
  },
  // —— Week 3：章4 OS + 章5 软工开场（现有 live 内容落点）——
  {
    week: 3,
    dayInWeek: 1,
    title: "进程 / 线程 / 调度",
    topic: "进程与调度",
    module: "操作系统",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "三态五态、抢占、时间片、FCFS / SJF / 优先级 / RR。",
  },
  {
    week: 3,
    dayInWeek: 2,
    title: "同步互斥 / 死锁 / PV",
    topic: "同步与死锁",
    module: "操作系统",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "临界区、信号量、死锁四条件、银行家。PV 题按模板算。",
  },
  {
    week: 3,
    dayInWeek: 3,
    title: "存储管理",
    topic: "存储管理",
    module: "操作系统",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "分页分段、页面置换 FIFO / LRU / Clock、抖动。",
  },
  {
    week: 3,
    dayInWeek: 4,
    title: "文件与设备",
    topic: "文件与设备",
    module: "操作系统",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "目录结构、索引分配、SPOOLing、中断与 DMA。",
  },
  {
    week: 3,
    dayInWeek: 5,
    title: "操作系统综合复盘",
    topic: "OS 复盘",
    module: "操作系统",
    kind: "review",
    durationMin: 45,
    status: "live",
    blurb: "调度计算、PV 位置、缺页走势图三类易错过一遍。",
  },
  {
    week: 3,
    dayInWeek: 6,
    title: "内聚与耦合",
    topic: "内聚与耦合",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    makeup: true,
    blurb:
      "章5开场。模块内部职责是否集中、模块之间依赖有多紧。软考必考七种耦合。",
  },
  {
    week: 3,
    dayInWeek: 7,
    title: "生命周期 + 开发模型 + V 模型",
    topic: "开发模型",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "按需求稳定度与风险选型；V 模型把每层设计与对应测试阶段一一配对。",
  },
  // —— Week 4：章5 软工续 + 章6 结构化/DFD ——
  {
    week: 4,
    dayInWeek: 1,
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
    week: 4,
    dayInWeek: 2,
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
    week: 4,
    dayInWeek: 3,
    title: "软件质量与其他软工要点",
    topic: "软件质量",
    module: "软件工程",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "质量模型、评审、配置管理、估算速记。把测试与过程串成一张网。",
  },
  {
    week: 4,
    dayInWeek: 4,
    title: "DFD / 数据流图基础",
    topic: "数据流图基础",
    module: "结构化方法",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "章6：加工、数据流、文件、源点汇点；分层与编号规则。",
  },
  {
    week: 4,
    dayInWeek: 5,
    title: "DFD / 数据字典 / 平衡原则",
    topic: "数据流图",
    module: "结构化方法",
    kind: "case",
    durationMin: 90,
    status: "live",
    blurb:
      "父图与子图数据流平衡、加工编号、数据字典条目。下午案例分析主阵地。",
  },
  {
    week: 4,
    dayInWeek: 6,
    title: "结构化方法与模块设计",
    topic: "结构化设计",
    module: "结构化方法",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "从 DFD 到模块结构、事务/变换分析；与内聚耦合对照。",
  },
  {
    week: 4,
    dayInWeek: 7,
    title: "软工 + DFD 本周复盘",
    topic: "软工复盘",
    module: "软件工程",
    kind: "review",
    durationMin: 45,
    status: "live",
    blurb: "测试覆盖、V 模型配对、DFD 平衡三类错题过一遍。",
  },
  // —— Week 5：章7 OO/UML/模式 + 章8 算法精要 + 上午卷 ——
  {
    week: 5,
    dayInWeek: 1,
    title: "用例图 + 类图精讲",
    topic: "UML 用例与类图",
    module: "面向对象",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "章7：参与者、包含/扩展/泛化；类图多重度与导航是高频坑。",
  },
  {
    week: 5,
    dayInWeek: 2,
    title: "顺序图 / 状态图 / 活动图",
    topic: "UML 行为图",
    module: "面向对象",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "生命线与激活条、状态迁移事件、活动图分叉汇合。",
  },
  {
    week: 5,
    dayInWeek: 3,
    title: "面向对象基础与原则",
    topic: "OO 原则",
    module: "面向对象",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "封装继承多态；开闭、里氏、依赖倒置。开闭是设计模式总纲。",
  },
  {
    week: 5,
    dayInWeek: 4,
    title: "设计模式：创建 / 结构 / 行为",
    topic: "设计模式",
    module: "面向对象",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "单例工厂适配器装饰代理；策略观察者模板方法。看意图；易混对放一起记。",
  },
  {
    week: 5,
    dayInWeek: 5,
    title: "算法精要（考试高频）",
    topic: "算法精要",
    module: "算法",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb:
      "章8精要：分治/贪心等考试经典题型与适用条件；不深挖 DP/回溯，不堆 LeetCode。",
  },
  {
    week: 5,
    dayInWeek: 6,
    title: "上午综合卷",
    topic: "上午综合卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "morning",
    blurb: "150 分钟计时壳 + 用法指导；自备合法真题，站内不贴整卷原文。",
  },
  {
    week: 5,
    dayInWeek: 7,
    title: "下午案例卷",
    topic: "下午案例卷",
    module: "真题卷",
    kind: "paper",
    durationMin: 150,
    status: "paper",
    paperSlot: "afternoon",
    blurb: "150 分钟下午节奏 + 踩点答法；案例原文请用合法材料。",
  },
  // —— Week 6：章9 数据库 + 章10 网络与安全 ——
  {
    week: 6,
    dayInWeek: 1,
    title: "关系模型 + E-R + 完整性",
    topic: "关系模型",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "章9：实体联系转表、主外键、实体/参照/用户定义完整性。",
  },
  {
    week: 6,
    dayInWeek: 2,
    title: "范式与规范化",
    topic: "范式",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "1NF / 2NF / 3NF / BCNF，部分依赖与传递依赖是送分也是陷阱。",
  },
  {
    week: 6,
    dayInWeek: 3,
    title: "SQL 查询",
    topic: "SQL",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "连接、分组、嵌套、存在量词。上午选择 + 下午补全都会出。",
  },
  {
    week: 6,
    dayInWeek: 4,
    title: "事务 / 并发 / 索引",
    topic: "事务与索引",
    module: "数据库",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "ACID、隔离级别、封锁；视图可更新、B+ 树与最左前缀。",
  },
  {
    week: 6,
    dayInWeek: 5,
    title: "计算机网络体系",
    topic: "计算机网络",
    module: "网络与安全",
    kind: "learn",
    durationMin: 45,
    status: "live",
    makeup: true,
    blurb: "章10：OSI / TCP-IP、可靠传输、路由与 IP 编址、子网划分。",
  },
  {
    week: 6,
    dayInWeek: 6,
    title: "网络安全 + 密码学",
    topic: "网络安全",
    module: "网络与安全",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "对称/非对称、摘要、数字签名、HTTPS 握手角色。",
  },
  {
    week: 6,
    dayInWeek: 7,
    title: "常见攻击与本周复盘",
    topic: "攻击与复盘",
    module: "网络与安全",
    kind: "review",
    durationMin: 45,
    status: "live",
    blurb: "XSS/SQL 注入/CSRF/钓鱼；把数据库范式与网络错题过一遍。",
  },
  // —— Week 7：章11 知产 + 章12 系统分析/Web + 英语/薄弱/卷 ——
  {
    week: 7,
    dayInWeek: 1,
    title: "标准化与知识产权",
    topic: "知识产权与标准",
    module: "法律法规",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "章11：著作权归属、保护期、侵权；国家标准编号速记。",
  },
  {
    week: 7,
    dayInWeek: 2,
    title: "系统分析与设计基础",
    topic: "系统分析设计",
    module: "系统分析与设计",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "章12：可行性、需求、概要/详细设计文档要点；与软工模型对照。",
  },
  {
    week: 7,
    dayInWeek: 3,
    title: "Web 应用与系统架构",
    topic: "Web 与架构",
    module: "系统分析与设计",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "B/S、MVC、常见 Web 技术栈考点；架构风格速记。",
  },
  {
    week: 7,
    dayInWeek: 4,
    title: "专业英语 + 薄弱项",
    topic: "英语与薄弱项",
    module: "综合",
    kind: "learn",
    durationMin: 45,
    status: "live",
    blurb: "术语比长难句更划算；只打错题本里反复出现的点，不新开大专题。",
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
    blurb: "第二次上午全真节奏：计时 + 真题用法；不贴受版权保护的整卷。",
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
    blurb: "第二次下午全真节奏：计时 + 案例踩点；不贴受版权保护的案例原文。",
  },
  {
    week: 7,
    dayInWeek: 7,
    title: "错题总复盘",
    topic: "总复盘",
    module: "查漏补缺",
    kind: "review",
    durationMin: 45,
    status: "live",
    blurb: "只看「待复习」和连续错过的题，不要再铺新范围。",
  },
  // —— Week 8：冲刺，不学新章 ——
  {
    week: 8,
    dayInWeek: 1,
    title: "上午选择题冲刺",
    topic: "上午冲刺",
    module: "冲刺",
    kind: "sprint",
    durationMin: 45,
    status: "live",
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
    status: "live",
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
    status: "live",
    blurb: "30 分钟：耦合七种、覆盖强度、V 模型配对、边界值、范式。",
  },
  {
    week: 8,
    dayInWeek: 4,
    title: "考前清单 + 最后过一遍",
    topic: "考前清单",
    module: "冲刺",
    kind: "sprint",
    durationMin: 30,
    status: "live",
    blurb: "证件、计算器规则、答题卡、时间分配。考试日不是学习日。",
  },
];

const weekSeeds: Omit<WeekMeta, 'start' | 'end'>[] = [
  {
    week: 1,
    title: "计组 + 程序语言/编译",
    subtitle: "教程章1–2：组成原理、语言与编译基础",
  },
  {
    week: 2,
    title: "数据结构（软考向）",
    subtitle: "教程章3：线性/树/图/排序查找；不含贪心 DP 专题",
  },
  {
    week: 3,
    title: "操作系统 + 软件工程开场",
    subtitle: "教程章4 + 章5开场：OS 五日；内聚耦合、生命周期",
  },
  {
    week: 4,
    title: "软件工程续 + 结构化/DFD",
    subtitle: "教程章5–6：黑盒白盒、DFD 与结构化设计",
  },
  {
    week: 5,
    title: "OO/UML/模式 + 算法精要",
    subtitle: "教程章7–8；穿插上/下午卷占位",
  },
  {
    week: 6,
    title: "数据库 + 网络与安全",
    subtitle: "教程章9–10：库四日 + 网络与安全三日",
  },
  {
    week: 7,
    title: "知产 / 系统分析 / 卷",
    subtitle: "教程章11–12 + 英语薄弱项 + 上下午卷",
  },
  {
    week: 8,
    title: "冲刺",
    subtitle: "仅四天，不学新章；考试日不排课",
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
