# 软设 8 周通关 · 交接文档

> 截至 **2026-09-09**（Asia/Shanghai）。给后续维护者 / Agent 的完整交接。

## 1. 产品目标

面向在职开发者的 **软考中级 · 软件设计师** 日训工具：打开就知道今天约 45 分钟做什么——复习错题 → 学一个小专题 → 立刻做题 → 记错题 → 完成本日。

- **不是**百科、招生页、题库倾销站
- **无账号 / 无服务端 API / 无 AI 讲解**；进度全在浏览器本地
- 目标场次：`lib/config.ts` → `examDate: "2026-10-24"`（2026 下半年软件设计师；实际开考以准考证为准）

## 2. 地址与托管

| 项 | URL |
| --- | --- |
| GitHub（主托管） | https://github.com/x1phyr/ruanshe-8weeks |
| GitHub Pages | https://x1phyr.github.io/ruanshe-8weeks/ |

- Pages 为项目站点，资源前缀 / `basePath` 为 **`/ruanshe-8weeks`**
- 仓库 Pages source 选 **GitHub Actions**（不要用 branch `/docs`）
- 推到 `main` 后由 `.github/workflows/pages.yml` 构建 `out/` 并部署

## 3. 技术栈

- **Next.js** App Router · **静态导出**（`output: "export"`）
- TypeScript · Tailwind CSS · shadcn/ui
- **Zustand** + `persist` → `localStorage`（键名 `ruanshe-8weeks-v1`）
- `next.config.ts`：`basePath` / `assetPrefix` = `/ruanshe-8weeks`，`trailingSlash: true`，图片 `unoptimized`
- PWA：`public/manifest.webmanifest` + `public/sw.js`（壳页 SW；完整做题仍建议联网）

## 4. 课程与内容现状（2026-09-09）

### 4.1 日程结构

- **53 日**连续专题表（约 8 周）；第 8 周 4 日冲刺，不学新章
- 进度键稳定为 `week-N/day-M`，**不**绑死日历日期
- 开课日 `startDate` 用户自选（默认本地今天 / Asia/Shanghai）；第 1 日对齐开课日，后续整体平移
- **考试日不随开课日改动**；若 53 日排到考试后，仪表盘同时展示「距考试」与「还剩几课」

### 4.2 教程章节顺序（12 章）

按《软件设计师教程》第 5 版 **12 章顺序**排进日程（专业英语 / 试卷日 / 薄弱项 / 冲刺穿插，不打乱章序）：

| 周 | 教程章节 |
| --- | --- |
| W1 | 章1 计算机组成 + 章2 程序语言/编译 |
| W2 | 章3 数据结构（软考向） |
| W3 | 章4 操作系统 + 章5 软件工程开场 |
| W4 | 章5 软件工程续 + 章6 结构化方法/DFD |
| W5 | 章7 面向对象/UML/模式 + 章8 算法精要；穿插卷 |
| W6 | 章9 数据库 + 章10 网络与安全 |
| W7 | 章11 标准化/知产 + 章12 系统分析与设计（含 Web）+ 英语/薄弱/卷 |
| W8 | 冲刺复盘 |

### 4.3 内容状态与题量

| 指标 | 数值 |
| --- | --- |
| 课程日 | **53** |
| `status: live` | **49**（完整讲义 + 练习；冲刺日 4～6 题） |
| `status: paper` | **4**（计时壳 + 用法指导 + 站内自编模考） |
| 自编模考 | 上午各 **75** / 下午各 **20**（两套：W5d6/d7、W7d5/d6） |
| **全站题目总数（精确）** | **630** |

计数方式（可复现）：

```bash
npx tsx -e 'import { questions } from "./data/questions.ts"; import { mockPaperQuestions } from "./data/mock-papers.ts";
const daily = questions.filter(q => !q.id.startsWith("q-mock-"));
console.log({ total: questions.length, daily: daily.length, mock: mockPaperQuestions.length });'

```

预期输出：`{ total: 630, daily: 440, mock: 190 }`（`questions` 数组末尾 `...mockPaperQuestions`，190 = 75+20+75+20）。

试卷日（`paper`，**非法拷真题**）：

| dayId | 槽位 |
| --- | --- |
| week-5/day-6 | 上午模考 75 |
| week-5/day-7 | 下午案例风格 20 |
| week-7/day-5 | 上午模考 75 |
| week-7/day-6 | 下午案例风格 20 |

## 5. 功能清单

| 能力 | 说明 |
| --- | --- |
| **startDate** | 开课日自选；日程整体平移 |
| **unlockAll** | 调试全解锁浏览（不自动标完成）；进度重置时保留 |
| **simulate** | 模拟「今日」日期（调试 / 赶进度） |
| **模块练习** | `/practice` 按模块刷已解锁题 |
| **搜索** | 关键词搜题干 / 知识点（受解锁约束） |
| **测验导航 / 标记 / 快捷键** | 题号跳转、标记、键盘操作；标记可按 `navKey` 进 sessionStorage |
| **scorecard** | 交卷后正确率与分专题汇总 |
| **薄弱模块** | 错题 + 作答统计；仪表盘弱项卡 |
| **streak** | 连续学习天数 |
| **错题导出** | `/mistakes` 导出 JSON / CSV |
| **进度备份** | 调试设置内导出 / 导入完整本地进度；可重置进度 |
| **计划跳转 / 打印** | `/plan` 跳到指定日（受解锁）；`window.print()` |
| **计划只看未完成** | `/plan` chip 隐藏 completedDays（zustand 持久化）；整周完成显示「本周已完成」 |
| **retry wrong** | 只练错题（到期优先） |
| **random20** | 随机抽至多 20 题（不足则全抽） |
| **timed20** | 限时 20 分钟卷；到时自动交卷 |
| **PWA** | 可「安装到桌面」（manifest + SW） |
| **专注模式 focus** | 隐藏侧栏 / 底栏；偏好持久化 |
| **celebrate** | 通关 / 完成庆祝路径（仪表盘随机 / 只练错题等入口） |
| **weekday tips** | `lib/coach-tips.ts` 按星期几教练提示 |
| **tomorrow preview** | 仪表盘明日预览 |
| **本周完成度** | 仪表盘紧凑卡片：当前周 completed/total + 细进度条，链到 /plan |
| **接着上次** | 仪表盘紧凑卡：sessions 中最近 `lastActiveAt` 的未完成已解锁日 → 日训；无则隐藏 |
| **今日推荐** | 仪表盘紧凑卡：弱项模块抽练 → 到期错题 → 今日焦点日训 / 随机20；一行中文理由 |
| **module accuracy** | `lib/module-stats.ts` 模块正确率 |

路由概览：`/` 仪表盘 · `/learn/[week]/[day]` 日训 · `/plan` · `/practice` · `/mistakes`。

## 6. 关键文件地图

| 路径 | 职责 |
| --- | --- |
| `lib/config.ts` | `examDate`、`STORAGE_KEY`、`BASE_PATH`、应用名 |
| `lib/calendar.ts` | 53 日课表元数据（title / module / kind / status） |
| `lib/store.ts` | Zustand 进度、错题、开课日、解锁、专注、streak |
| `lib/progress.ts` | 解锁、完课、通关判定 |
| `lib/backup.ts` | 进度备份导入导出 |
| `lib/module-stats.ts` | 模块正确率 |
| `lib/coach-tips.ts` | 星期提示 |
| `lib/dates.ts` / `lib/types.ts` | 日期工具与类型 |
| `data/lessons.ts` | 53 日讲义正文 |
| `data/questions.ts` | 日训题 + 合并模考题 |
| `data/mock-papers.ts` | 自编模考 190 题 |
| `components/dashboard-view.tsx` | 仪表盘 |
| `components/learn/*` | 日训会话、讲义、测验、试卷计时 |
| `components/practice-view.tsx` | 模块 / 搜索 / 随机 / 限时 |
| `components/plan-view.tsx` | 计划表、跳转、打印 |
| `components/mistakes-view.tsx` | 错题本 |
| `components/focus-mode.tsx` / `pwa-register.tsx` / `simulate-dialog.tsx` | 专注、PWA、模拟日 |
| `next.config.ts` | 静态导出与 basePath |
| `.github/workflows/pages.yml` | Pages 构建部署 |
| `docs/HANDOFF.md` | 本交接文档 |

## 7. 约束（务必遵守）

1. **未经用户明确同意，不要启动 Cloud Agent**（本仓库交接默认：本地改、本地 PR/merge 即可）。
2. **本地 PR / merge 可以**：在本机分支推送、开 PR、合并到 `main` 是正常协作路径。
3. **仓库内禁止放入未授权教材全文、受版权保护的真题或案例原文**。试卷日只提供计时壳、用法指导、**自编**模考题；正式卷面书写请用户自备合法材料。
4. 不要把 `examDate` 写死进零散文案；倒计时读 `lib/config.ts`。
5. 进度键用 `week-N/day-M`，不要改成绑死日历的键（否则用户改开课日会丢进度）。


## 8. 本地运行 / 构建 / 部署

- 安装依赖后执行开发脚本（端口 43180，路径含 basePath）
- 执行静态构建，产物目录为 out/
- 合并 main 后由 Actions 部署 Pages
- 资源路径必须包含 /ruanshe-8weeks

具体命令见仓库根目录 README「本地运行」一节。

## 9. 建议的下一步

1. 内容质量：校对讲义与解析措辞；补强易混点与 trap；统一 knowledgePath 粒度。
2. 更多下午案例向练习：在 live 日或冲刺日增加读图、DFD、UML、数据库案例风格小题（须自编）。
3. 可选云同步：目前仅 localStorage；多设备方案需用户明确同意后再设计；默认离线优先。
4. 题量与覆盖度复查：当前全站 630 题；可按模块正确率与错题热点定向加题。

## 10. 快速自检

- [ ] 静态构建通过
- [ ] Pages 能打开仪表盘与某一 live 日训
- [ ] 试卷日能进计时壳并拉起自编模考（75 / 20）
- [ ] 改 startDate 后计划日期平移、已完成 week-N/day-M 仍在
- [ ] 未引入教材扫描件或受版权保护原文

---

*文档生成日：2026-09-09。题量以仓库内 data/questions.ts + data/mock-papers.ts 导出数组为准。*

