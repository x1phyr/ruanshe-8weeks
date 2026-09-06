# 软设 8 周通关

面向在职开发者的 **软考中级 · 软件设计师** 日训工具，不是百科，也不是招生页。打开就能知道今天 45 分钟做什么：复习错题 → 学一个小专题 → 立刻做题 → 记错题 → 完成本日。

目标场次：2026 下半年软件设计师。倒计时读取 `lib/config.ts` 里的 `examDate`（当前为 `2026-10-24`）。实际开考时间以准考证为准。

开课日 `startDate` 由用户自选，默认是浏览器本地时区的今天（Asia/Shanghai），存在 Zustand `localStorage`，不写死 `2026-09-01`。课程是连续 53 日的专题表：第 1 日对齐开课日，后面的日期整体平移。进度按稳定的 `week-N/day-M` 日号记录，不跟日历日期绑死。考试日不随开课日改动；若 53 日排到考试之后，仪表盘会同时写出「距考试还有几天」和「还剩几课」，不会另造一个考试日。

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

开发服务器带 `basePath`，打开 [http://127.0.0.1:43180/ruanshe-8weeks/](http://127.0.0.1:43180/ruanshe-8weeks/)。无需登录。进度、作答、错题和开课日存在浏览器 `localStorage`（键名 `ruanshe-8weeks-v1`）。

静态导出（与 Pages 相同）：

```bash
npm run build
```

产物在 `out/`。这是纯静态站，没有服务端 API。

## v1 包含什么

- 仪表盘 `/`：当前周/日、考试倒计时、总进度、今日时长与专题、任务清单、正确率、待复习数；可改开课日，并提供「用今天」重置
- 专注日训 `/learn`，以及 `/learn/week-1/day-1` 这类按日路由（`generateStaticParams` 仍按课程日号生成）
- 8 周日历 `/plan`：按开课日排出的实际日期，含调休标注、中秋/国庆（落在对应公历日时）、试卷日
- 模块练习 `/practice`（同一题库）
- 错题本 `/mistakes`：待复习 / 学习中 / 已掌握
- 侧栏「模拟今日」：覆盖系统日期，便于联调；可重置本地进度。与开课日是两件事
- 解锁规则：第 1 日开放；完成本日才解锁下一日，不允许跳关
- 今天早于开课日：未开课状态；今天晚于最后学习日：冲刺/复盘空状态，不崩

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

已写完整讲义 + 7～8 道软考风格单选题（`status: live`）：

| 课程日 | 专题 |
| --- | --- |
| week-3/day-6 | 内聚与耦合（含七种耦合） |
| week-3/day-7 | 生命周期 + 开发模型 + V 模型 |
| week-4/day-1 | 黑盒测试 |
| week-4/day-2 | 白盒测试 + McCabe |

其余学习日出现在 `/plan`，带标题、时长和占位说明。week-4/day-5 另有 2 道 DFD 分析题。试卷日提供 150 分钟计时，完整真题卷不在 v1。进度键仍是 `week-N/day-M`；重排后同一日号含义已按章序更新。

## 配置

```ts
// lib/config.ts
examDate: "2026-10-24"
```

倒计时和考试日展示都读这份配置，不要把日期写进零散文案。开课日不在配置里：首次访问取本地今天，之后读 `startDate`（Zustand persist）。

## 技术

Next.js App Router 静态导出 · TypeScript · Tailwind CSS · shadcn/ui · Zustand（persist）。无账号、无云同步、无 AI 讲解。
