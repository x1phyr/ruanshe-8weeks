# 软设 8 周通关

面向在职开发者的 **软考中级 · 软件设计师** 日训工具，不是百科，也不是招生页。打开就能知道今天 45 分钟做什么：复习错题 → 学一个小专题 → 立刻做题 → 记错题 → 完成本日。

目标场次：2026 下半年软件设计师。倒计时读取 `lib/config.ts` 里的 `examDate`（当前为 `2026-10-24`）。实际开考时间以准考证为准。

## 地址

- GitHub（主托管）：[https://github.com/x1phyr/ruanshe-8weeks](https://github.com/x1phyr/ruanshe-8weeks)
- GitHub Pages：[https://x1phyr.github.io/ruanshe-8weeks/](https://x1phyr.github.io/ruanshe-8weeks/)
- Origin 副本：[https://cursor.com/codebase/okra/tmp-ba5e13b7413c92e8](https://cursor.com/codebase/okra/tmp-ba5e13b7413c92e8)

Pages 是项目站点，资源前缀为 `/ruanshe-8weeks`。仓库设置里 Pages source 选 **GitHub Actions**（不要用 branch `/docs`）。推到 `main` 后由 `.github/workflows/pages.yml` 构建 `out/` 并部署。

## 本地运行

```bash
npm install
npm run dev
```

开发服务器带 `basePath`，打开 [http://127.0.0.1:43180/ruanshe-8weeks/](http://127.0.0.1:43180/ruanshe-8weeks/)。无需登录。进度、作答、错题和**学习开始日**存在浏览器 `localStorage`（键名 `ruanshe-8weeks-v1`）。

静态导出（与 Pages 相同）：

```bash
npm run build
```

产物在 `out/`。这是纯静态站，没有服务端 API。

## 学习开始日

53 日课表不再写死成 2026-09-01 至 2026-10-23。

- **首次打开**：开始日默认是浏览器本地时区的「今天」。第 1 周第 1 日就排在今天。
- **改开始日**：仪表盘上的日期选择器（或「用今天」）会把整份课表按同一偏移平移。`/plan` 列出的是平移后的实际日期。
- **进度按学习日保存**：完成记录、错题、作答都键在稳定 id（`week-N/day-M`）上，不跟日历日期绑死。改开始日不会清空进度。
- **「今天」**：仪表盘的今天仍是真实当前日期（侧栏「模拟今日」仍可覆盖，仅调试用）。若今天早于开始日，显示「还没开营」；若今天晚于课表最后一日，显示冲刺 / 复盘空态。
- **考试日独立**：倒计时始终指向 `examDate`（当前 `2026-10-24`）。如果开始日太晚，课表会与考试重叠——页面会同时写出「距考试还剩几天」和「课程还剩几日」，**不会**自动改考试日。

## v1 包含什么

- 仪表盘 `/`：当前周/日、考试倒计时、总进度、今日时长与专题、任务清单、正确率、待复习数、学习开始日
- 专注日训 `/learn`，以及 `/learn/week-1/day-1` 这类按日路由（静态导出按课程 id 预渲染，不按日历日期）
- 8 周日历 `/plan`：随开始日平移的 53 日课表，含题型（学习 / 案例 / 试卷 / 复盘 / 冲刺）
- 模块练习 `/practice`（同一题库）
- 错题本 `/mistakes`：待复习 / 学习中 / 已掌握
- 侧栏「模拟今日」：覆盖系统日期，便于联调；可重置本地进度（不重置开始日）
- 解锁规则：第 1 日开放；完成本日才解锁下一日，不允许跳关

## 内容深度

已写完整讲义 + 7～8 道软考风格单选题：

| 学习日 | 专题 |
| --- | --- |
| 第 1 周第 1 日 | 内聚与耦合（含七种耦合） |
| 第 1 周第 2 日 | 生命周期 + 开发模型 + V 模型 |
| 第 1 周第 3 日 | 黑盒测试 |
| 第 1 周第 4 日 | 白盒测试 + McCabe |

其余学习日出现在 `/plan`，带标题、实际日期、时长和一段占位说明。第 1 周第 5 日另有 2 道 DFD 分析题。试卷日提供 150 分钟计时，完整真题卷不在 v1。

## 配置

```ts
// lib/config.ts
examDate: "2026-10-24"        // 倒计时与考试日展示；不随开始日改动
templateStart: "2026-09-01"   // 原始 53 日模板的第 1 日，仅作内容参照
```

用户选择的开始日存在本地 `startDate`，不写进这份配置。倒计时和考试日展示都读 `examDate`，不要把日期写进零散文案。

## 技术

Next.js App Router 静态导出 · TypeScript · Tailwind CSS · shadcn/ui · Zustand（persist）。无账号、无云同步、无 AI 讲解。
