# 软设 8 周通关

面向在职开发者的 **软考中级 · 软件设计师** 日训工具，不是百科，也不是招生页。打开就能知道今天 45 分钟做什么：复习错题 → 学一个小专题 → 立刻做题 → 记错题 → 完成本日。

目标场次：2026 下半年软件设计师。倒计时读取 `lib/config.ts` 里的 `examDate`（当前为 `2026-10-24`）。实际开考时间以准考证为准。

开课日 `startDate` 由用户自选，默认是浏览器本地时区的今天（Asia/Shanghai），存在 Zustand `localStorage`，不写死 `2026-09-01`。课程是连续 53 日的专题表：第 1 日对齐开课日，后面的日期整体平移。进度按稳定的 `week-N/day-M` 日号记录，不跟日历日期绑死。考试日不随开课日改动；若 53 日排到考试之后，仪表盘会同时写出「距考试还有几天」和「还剩几课」，不会另造一个考试日。

## 地址

- GitHub（主托管）：[https://github.com/x1phyr/ruanshe-8weeks](https://github.com/x1phyr/ruanshe-8weeks)
- GitHub Pages：[https://x1phyr.github.io/ruanshe-8weeks/](https://x1phyr.github.io/ruanshe-8weeks/)
- Origin 副本：[https://cursor.com/codebase/okra/tmp-ba5e13b7413c92e8](https://cursor.com/codebase/okra/tmp-ba5e13b7413c92e8)

Pages 是项目站点，资源前缀为 `/ruanshe-8weeks`。仓库设置里 Pages source 选 **GitHub Actions**（不要用 branch `/docs`）。推到 `main` 后由 `.github/workflows/pages.yml` 构建 `out/` 并部署。

## 交接文档

完整维护交接见 [docs/HANDOFF.md](docs/HANDOFF.md)（产品目标、内容现状、功能清单、关键文件、约束与建议下一步）。


## 本地运行

```bash
npm install
npm run dev
```

开发服务器带 `basePath`，打开 [http://127.0.0.1:43180/ruanshe-8weeks/](http://127.0.0.1:43180/ruanshe-8weeks/)。无需登录。进度、作答、错题和开课日存在浏览器 `localStorage`（键名 `ruanshe-8weeks-v1`）。

静态导出（与 Pages 相同）：

```bash
npm run build
```

产物在 `out/`。这是纯静态站，没有服务端 API。

## 当前功能

- **53 日课程**：按教程 12 章顺序排进 8 周；进度键 `week-N/day-M`，开课日 `startDate` 自选（默认本地今天）
- **解锁**：第 1 日开放，完成本日才解锁下一日；调试 `unlockAll` 可全解锁浏览（不自动标完成）
- **日训 `/learn`**：讲义 → 练习 → 完成本日；试卷日自编模考上午 **85** / 下午 **25**（非法拷真题）
- **计划 `/plan`**：按开课日排实际日期；支持跳到指定日（受解锁约束）
- **练习 `/practice`**：模块刷题、关键词搜索、**随机 20 题** / **限时 20 分钟**（不足则全抽；到时自动交卷）；模块正确率弱项（作答统计）；仪表盘弱项卡也可开随机 / 限时卷
- **测验体验**：题号导航 / 标记、键盘快捷键、结束 **scorecard**（正确率与分专题）
- **专注模式**：日训 / 测验页「专注」开关，隐藏侧栏与底栏（偏好写入 localStorage）；右下角可随时退出
- **仪表盘**：倒计时、总进度、连续学习 streak、正确率、明日预览、薄弱模块、只练错题（到期优先）
- **错题本 `/mistakes`**：待复习 / 学习中 / 已掌握；导出 JSON/CSV
- **进度备份**：调试设置内导出/导入完整本地进度；可重置进度（保留全解锁与模拟日）
- **移动端**：仪表盘齿轮入口调试设置（模拟今日、全解锁、备份/重置）
- **PWA**：GitHub Pages 可「安装到桌面」（manifest + 壳页 Service Worker；完整做题仍建议联网）
- **边界**：未开课 / 计划结束后不崩；考试日不随开课日改动

## 内容深度

课程按《软件设计师教程》第 5 版 **12 章顺序** 排进 8 周 / 53 日（第 8 周 4 日冲刺，不学新章）。专业英语、试卷日、薄弱项与冲刺复盘穿插在对应周，不打乱知识章序。

| 周 | 教程章节 |
| --- | --- |
| W1 | 章1 计算机组成 + 章2 程序语言/编译 |
| W2 | 章3 数据结构（软考向，不含贪心/DP/回溯专题） |
| W3 | 章4 操作系统 + 章5 软件工程开场 |
| W4 | 章5 软件工程续 + 章6 结构化方法/DFD |
| W5 | 章7 面向对象/UML/模式 + 章8 算法精要；穿插卷 |
| W6 | 章9 数据库 + 章10 网络与安全 |
| W7 | 章11 标准化/知产 + 章12 系统分析与设计（含 Web）+ 英语/薄弱/卷 |
| W8 | 冲刺复盘 |

已写完整讲义 + 练习题（**非试卷日 ≥12 题**；`status: live`）。试卷日见下表 `paper`：

| 课程日 | 专题 |
| --- | --- |
| week-1/day-1 | 计算机系统概述与数制编码 |
| week-1/day-2 | CPU 与指令系统 |
| week-1/day-3 | 存储体系与 Cache |
| week-1/day-4 | 流水线 / 总线 / 输入输出 |
| week-1/day-5 | 程序语言基础 |
| week-1/day-6 | 编译：词法与语法分析 |
| week-1/day-7 | 编译：中间代码与本周复盘 |
| week-2/day-1 | 复杂度 + 线性结构 |
| week-2/day-2 | 栈与队列 |
| week-2/day-3 | 树：遍历 / 堆 / Huffman |
| week-2/day-4 | 图：BFS / DFS / 最短路 / MST |
| week-2/day-5 | 排序 + 算法填空（完形） |
| week-2/day-6 | 查找 + 哈希 + 串 |
| week-2/day-7 | 本周错题复盘 |
| week-3/day-1 | 进程 / 线程 / 调度 |
| week-3/day-2 | 同步互斥 / 死锁 / PV |
| week-3/day-3 | 存储管理 |
| week-3/day-4 | 文件与设备 |
| week-3/day-5 | 操作系统综合复盘 |
| week-3/day-6 | 内聚与耦合（含七种耦合） |
| week-3/day-7 | 生命周期 + 开发模型 + V 模型 |
| week-4/day-1 | 黑盒测试 |
| week-4/day-2 | 白盒测试 + McCabe |
| week-4/day-3 | 软件质量与其他软工要点 |
| week-4/day-4 | DFD / 数据流图基础 |
| week-4/day-5 | DFD / 数据字典 / 平衡原则（案例） |
| week-4/day-6 | 结构化方法与模块设计 |
| week-4/day-7 | 软工 + DFD 本周复盘 |
| week-5/day-1 | 用例图 + 类图精讲 |
| week-5/day-2 | 顺序图 / 状态图 / 活动图 |
| week-5/day-3 | 面向对象基础与原则 |
| week-5/day-4 | 设计模式：创建 / 结构 / 行为 |
| week-5/day-5 | 算法精要（考试高频） |
| week-5/day-6 | 上午综合卷（`status: paper`，计时壳 + 真题用法指导） |
| week-5/day-7 | 下午案例卷（`status: paper`，计时壳 + 踩点答法） |
| week-6/day-1 | 关系模型 + E-R + 完整性 |
| week-6/day-2 | 范式与规范化 |
| week-6/day-3 | SQL 查询 |
| week-6/day-4 | 事务 / 并发 / 索引 |
| week-6/day-5 | 计算机网络体系 |
| week-6/day-6 | 网络安全 + 密码学 |
| week-6/day-7 | 常见攻击与本周复盘 |
| week-7/day-1 | 标准化与知识产权 |
| week-7/day-2 | 系统分析与设计基础 |
| week-7/day-3 | Web 应用与系统架构 |
| week-7/day-4 | 专业英语 + 薄弱项 |
| week-7/day-5 | 上午真题卷（`status: paper`，计时壳 + 真题用法指导） |
| week-7/day-6 | 下午真题卷（`status: paper`，计时壳 + 踩点答法） |
| week-7/day-7 | 错题总复盘 |
| week-8/day-1 | 上午选择题冲刺（`kind: sprint`） |
| week-8/day-2 | 下午案例冲刺（`kind: sprint`） |
| week-8/day-3 | 高频陷阱速记（`kind: sprint`） |
| week-8/day-4 | 考前清单 + 最后过一遍（`kind: sprint`） |

**53 日内容已全部就绪**：49 日 `status: live`（完整讲义 + 练习题；**非试卷日 ≥12 题**），4 日 `status: paper`（150 分钟计时壳 + 用法指导 + 站内自编模考：上午各 **85** 题、下午各 **25** 道案例风格单选；**不**提供受版权保护的真题/案例原文）。正式卷面书写请自备合法材料。进度键仍是 `week-N/day-M`。

## 配置

```ts
// lib/config.ts
examDate: "2026-10-24"
```

倒计时和考试日展示都读这份配置，不要把日期写进零散文案。开课日不在配置里：首次访问取本地今天，之后读 `startDate`（Zustand persist）。

## 技术

Next.js App Router 静态导出 · TypeScript · Tailwind CSS · shadcn/ui · Zustand（persist）。无账号、无云同步、无 AI 讲解。
