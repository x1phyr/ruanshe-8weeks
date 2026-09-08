import { parseISODate } from "@/lib/dates";

export interface DailyTrap {
  title: string;
  body: string;
  /** Matches StudyDay.module when tip maps to a calendar module. */
  module?: string;
}

/** Softeng / DB / UML / OS / net / IP / English / DS 等常考易错点，短提示。 */
export const DAILY_TRAPS: DailyTrap[] = [
  {
    title: "耦合度别倒序",
    body: "内容耦合最紧、非直接耦合最松。别把「数据耦合」和「控制耦合」排反；问「耦合度最高」先找内容/公共。",
    module: "软件工程",
  },
  {
    title: "白盒 vs 黑盒",
    body: "白盒看路径/语句/分支；黑盒看输入输出与等价类。题目若给源码结构却让你划等价类，多半是在挖坑。",
    module: "软件工程",
  },
  {
    title: "内聚别跟耦合混",
    body: "内聚看模块内部：功能内聚最好，偶然内聚最差。问「内聚度最高」找功能内聚，别答成低耦合。",
    module: "软件工程",
  },
  {
    title: "2NF / 3NF / BCNF",
    body: "2NF 消部分依赖，3NF 消传递依赖，BCNF 每个决定因素都是候选键。别只背条文，先画依赖再判。",
    module: "数据库",
  },
  {
    title: "主键与候选键",
    body: "候选键可有多个，主键只选一个；外键参照的是被参照表的候选键，不一定是「名叫主键」的那列。",
    module: "数据库",
  },
  {
    title: "UML 箭头方向",
    body: "泛化空心三角指向父类；实现虚线三角指向接口；依赖虚线箭头指向被用方。方向反了概念分直接没。",
    module: "面向对象",
  },
  {
    title: "聚合 vs 组合",
    body: "组合是强整体—部分（同生共死），聚合可独立存在。空心/实心菱形画在整体端，别画到部分端。",
    module: "面向对象",
  },
  {
    title: "调度算法别混",
    body: "FCFS 公平但平均等待可能很长；SJF 平均等待短；时间片轮转偏交互；优先级要防饥饿。问「平均等待最短」常选 SJF。",
    module: "操作系统",
  },
  {
    title: "进程 vs 线程",
    body: "进程有独立地址空间；同进程线程共享代码与数据段、各有栈。问「切换开销更小」通常是线程。",
    module: "操作系统",
  },
  {
    title: "死锁四条件",
    body: "互斥、占有且等待、不可抢占、循环等待——破任一即可。银行家是避免，不是检测后的恢复。",
    module: "操作系统",
  },
  {
    title: "对称加密 vs 摘要",
    body: "加密可逆、要密钥；摘要/哈希不可逆，用来验完整性。问「防篡改」常是哈希或 MAC，不是单纯对称加密。",
    module: "网络与安全",
  },
  {
    title: "数字签名谁用私钥",
    body: "签名用发送方私钥，验证用发送方公钥。别和密钥交换、数字信封搞反谁持有私钥。",
    module: "网络与安全",
  },
  {
    title: "防火墙与入侵检测",
    body: "防火墙管进出策略（拦/放）；IDS/IPS 偏检测与告警（或阻断）。「防内网横向」别只答边界防火墙。",
    module: "网络与安全",
  },
  {
    title: "著作权自动产生",
    body: "软件著作权自创作完成起自动产生，登记是确权便利而非产生前提。专利要申请授权；商标要注册。",
    module: "法律法规",
  },
  {
    title: "保护期别记错",
    body: "法人作品等软件著作权保护期常考发表后 50 年；自然人有生之年加死后 50 年。别和专利 20 年混。",
    module: "法律法规",
  },
  {
    title: "排序稳定性",
    body: "稳定：插入、冒泡、归并（常见讲法）。不稳定：快排、堆排、希尔、选择。多关键字排序要稳定算法。",
    module: "数据结构",
  },
  {
    title: "栈与队列用途",
    body: "栈：递归、括号匹配、表达式求值；队列：BFS、缓冲、打印队列。别把 DFS 递归实现答成队列。",
    module: "数据结构",
  },
  {
    title: "树的遍历序列",
    body: "前序根左右、中序左根右、后序左右根。由前+中或后+中可建树；只有前+后一般不能唯一确定。",
    module: "数据结构",
  },
  {
    title: "专业英语先扫题干",
    body: "先圈核心名词（coupling、normalization、throughput），再回原文定位，别从第一句逐词翻译到选项。",
    module: "综合",
  },
  {
    title: "吞吐与响应别混",
    body: "吞吐量看单位时间完成量；响应时间看从请求到首次响应。提高吞吐不一定缩短单笔响应。",
    module: "系统分析与设计",
  },
  {
    title: "DFD 父子守恒",
    body: "父图一个加工拆到子图时，进出数据流名称与条数要对齐。子图凭空多流或少流就是送命题。",
    module: "结构化方法",
  },
  {
    title: "补码运算符号位",
    body: "补码加减可连同符号位一起算；溢出看进位是否一致，别把符号位进位当成「结果符号」直接抄。",
    module: "计算机组成",
  },
  {
    title: "Cache 映射别混",
    body: "直接映射：主存块只能进唯一行；全相联：任意行；组相联：先定组再组内相联。问冲突多常指向直接映射。",
    module: "计算机组成",
  },
  {
    title: "流水线加速比",
    body: "理想加速比≈段数，但有气泡/相关。吞吐看单位时间完成指令数，别把「延迟」和「吞吐」答反。",
    module: "计算机组成",
  },
  {
    title: "中断 vs DMA",
    body: "中断靠 CPU 介入传少量数据；DMA 由控制器搬块数据，少占 CPU。大批量传输优先想 DMA。",
    module: "计算机组成",
  },
  {
    title: "传值 vs 传引用",
    body: "传值改形参不影响实参；传引用/传地址可改实参对象。题目若写「交换两变量失败」，多半是传值。",
    module: "程序语言",
  },
  {
    title: "编译阶段别串台",
    body: "词法→语法→语义→中间代码→优化→目标代码。报「未声明标识符」偏语义；括号不配偏语法。",
    module: "程序语言",
  },
  {
    title: "静态绑定 vs 动态",
    body: "静态（早）绑定在编译期定地址/类型；动态（晚）绑定在运行期。多态虚调用常考动态绑定。",
    module: "程序语言",
  },
  {
    title: "时间复杂度别只看循环",
    body: "嵌套循环要看每层次数是否相乘；二分是 log n；递归看递推式。问「最坏」别答平均情况。",
    module: "算法",
  },
  {
    title: "贪心 vs 动态规划",
    body: "贪心每步局部最优且需证明整体最优；DP 有最优子结构+重叠子问题。背包题别见「最优」就瞎选贪心。",
    module: "算法",
  },
  {
    title: "哈希冲突处理",
    body: "开放定址（线性/二次探测）在表内找空位；链地址挂溢出链。装载因子过高，查找性能会掉。",
    module: "数据结构",
  },
  {
    title: "图的最短路径",
    body: "Dijkstra 要求非负权；有负权边想 Bellman-Ford / SPFA 类。Floyd 是任意点对，别和单源混用场景。",
    module: "数据结构",
  },
  {
    title: "页面置换 Belady",
    body: "FIFO 可能出现帧数增多缺页反而增（Belady）；LRU / 最优通常无此怪象。题干给访问序列先手算。",
    module: "操作系统",
  },
  {
    title: "PV 操作谁先谁后",
    body: "P 申请（可能阻塞），V 释放（可能唤醒）。同步：谁生产谁 V、谁消费谁 P；互斥对临界区前后成对。",
    module: "操作系统",
  },
  {
    title: "事务 ACID",
    body: "原子性全成或全撤；一致性约束不被破坏；隔离并发像串行；持久性提交后不丢。脏读/不可重复/幻读对应隔离级别。",
    module: "数据库",
  },
  {
    title: "SQL 连接别漏条件",
    body: "多表连接漏 JOIN 条件易成笛卡尔积。外连接保留一端无匹配行；问「必须出现」看 LEFT/RIGHT。",
    module: "数据库",
  },
  {
    title: "OSI 与 TCP/IP 别硬套",
    body: "常考：IP 在网络层、TCP/UDP 在运输层、HTTP 在应用层。ARP 解析 IP→MAC，别答成路由协议。",
    module: "网络与安全",
  },
  {
    title: "TCP 与 UDP 选用",
    body: "要可靠、有序、拥塞控制选 TCP；要低延迟、可丢包（音视频/DNS 等）常选 UDP。三次握手是 TCP 建连。",
    module: "网络与安全",
  },
  {
    title: "用例图谁是参与者",
    body: "参与者是系统外角色（人/外部系统），椭圆是用例。别把系统内部模块画成参与者。",
    module: "面向对象",
  },
  {
    title: "设计模式别只背名",
    body: "单例保唯一实例；观察者一对多通知；工厂封装创建。题干给「解耦创建」多半工厂/抽象工厂，不是装饰器。",
    module: "面向对象",
  },
  {
    title: "可行性研究四维",
    body: "技术、经济、社会/法律、操作（或进度）可行性。别把「需求是否提全」误当成可行性结论。",
    module: "系统分析与设计",
  },
  {
    title: "冲刺日先收口错题",
    body: "临场前优先清到期错题与弱项模块，少开新专题。模考对时对节奏，别在生僻边角耗光精力。",
    module: "冲刺",
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
