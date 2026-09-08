import { parseISODate } from "@/lib/dates";

export interface DailyTrap {
  title: string;
  body: string;
}

/** Softeng / DB / UML / OS / net / IP / English / DS 等常考易错点，短提示。 */
export const DAILY_TRAPS: DailyTrap[] = [
  {
    title: "耦合度别倒序",
    body: "内容耦合最紧、非直接耦合最松。别把「数据耦合」和「控制耦合」排反；问「耦合度最高」先找内容/公共。",
  },
  {
    title: "白盒 vs 黑盒",
    body: "白盒看路径/语句/分支；黑盒看输入输出与等价类。题目若给源码结构却让你划等价类，多半是在挖坑。",
  },
  {
    title: "内聚别跟耦合混",
    body: "内聚看模块内部：功能内聚最好，偶然内聚最差。问「内聚度最高」找功能内聚，别答成低耦合。",
  },
  {
    title: "2NF / 3NF / BCNF",
    body: "2NF 消部分依赖，3NF 消传递依赖，BCNF 每个决定因素都是候选键。别只背条文，先画依赖再判。",
  },
  {
    title: "主键与候选键",
    body: "候选键可有多个，主键只选一个；外键参照的是被参照表的候选键，不一定是「名叫主键」的那列。",
  },
  {
    title: "UML 箭头方向",
    body: "泛化空心三角指向父类；实现虚线三角指向接口；依赖虚线箭头指向被用方。方向反了概念分直接没。",
  },
  {
    title: "聚合 vs 组合",
    body: "组合是强整体—部分（同生共死），聚合可独立存在。空心/实心菱形画在整体端，别画到部分端。",
  },
  {
    title: "调度算法别混",
    body: "FCFS 公平但平均等待可能很长；SJF 平均等待短；时间片轮转偏交互；优先级要防饥饿。问「平均等待最短」常选 SJF。",
  },
  {
    title: "进程 vs 线程",
    body: "进程有独立地址空间；同进程线程共享代码与数据段、各有栈。问「切换开销更小」通常是线程。",
  },
  {
    title: "死锁四条件",
    body: "互斥、占有且等待、不可抢占、循环等待——破任一即可。银行家是避免，不是检测后的恢复。",
  },
  {
    title: "对称加密 vs 摘要",
    body: "加密可逆、要密钥；摘要/哈希不可逆，用来验完整性。问「防篡改」常是哈希或 MAC，不是单纯对称加密。",
  },
  {
    title: "数字签名谁用私钥",
    body: "签名用发送方私钥，验证用发送方公钥。别和密钥交换、数字信封搞反谁持有私钥。",
  },
  {
    title: "防火墙与入侵检测",
    body: "防火墙管进出策略（拦/放）；IDS/IPS 偏检测与告警（或阻断）。「防内网横向」别只答边界防火墙。",
  },
  {
    title: "著作权自动产生",
    body: "软件著作权自创作完成起自动产生，登记是确权便利而非产生前提。专利要申请授权；商标要注册。",
  },
  {
    title: "保护期别记错",
    body: "法人作品等软件著作权保护期常考发表后 50 年；自然人有生之年加死后 50 年。别和专利 20 年混。",
  },
  {
    title: "排序稳定性",
    body: "稳定：插入、冒泡、归并（常见讲法）。不稳定：快排、堆排、希尔、选择。多关键字排序要稳定算法。",
  },
  {
    title: "栈与队列用途",
    body: "栈：递归、括号匹配、表达式求值；队列：BFS、缓冲、打印队列。别把 DFS 递归实现答成队列。",
  },
  {
    title: "树的遍历序列",
    body: "前序根左右、中序左根右、后序左右根。由前+中或后+中可建树；只有前+后一般不能唯一确定。",
  },
  {
    title: "专业英语先扫题干",
    body: "先圈核心名词（coupling、normalization、throughput），再回原文定位，别从第一句逐词翻译到选项。",
  },
  {
    title: "吞吐与响应别混",
    body: "吞吐量看单位时间完成量；响应时间看从请求到首次响应。提高吞吐不一定缩短单笔响应。",
  },
  {
    title: "DFD 父子守恒",
    body: "父图一个加工拆到子图时，进出数据流名称与条数要对齐。子图凭空多流或少流就是送命题。",
  },
];

/** Day-of-year 1..366 for an ISO calendar date (local parse). */
export function dayOfYear(iso: string): number {
  const date = parseISODate(iso);
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.round((date.getTime() - start.getTime()) / 86_400_000);
}

/** Pick trap by (day-of-year mod length); `iso` should be simulate-aware today. */
export function dailyTrapForDate(iso: string): DailyTrap {
  const idx = dayOfYear(iso) % DAILY_TRAPS.length;
  return DAILY_TRAPS[idx] ?? DAILY_TRAPS[0];
}
