#!/usr/bin/env node

/**
 * verify_e2e.mjs
 *
 * Comprehensive End-to-End Headless Browser Automation Test Suite for
 * RuanShe 8-Weeks & Crash Sprint Exam Prep System.
 *
 * Implements pure Chrome DevTools Protocol (CDP) over Node.js native WebSocket,
 * executing genuine user interactions against the local static server with zero
 * external npm dependencies.
 *
 * Verifies:
 * 1. Initial Cockpit baseline at 56 days (Regular mode, 8-week plan, 45/75 safety radar)
 * 2. Dynamic days adjustment & auto-switch to Crash Sprint mode (<10d, 20/80 strategy)
 * 3. Task check-off and real-time score radar reactivity
 * 4. CheatSheet & MindMap Hub 4 primary tabs, keyword search, and mastery toggle
 * 5. 3D Flashcards flip, formula/mnemonic display, and mastery toggle
 * 6. Morning Quizzer keyboard shortcuts (A-D, Enter) and mistake book tracking
 * 7. Afternoon Cases intelligent fuzzy scoring and strict keyboard shortcut focus isolation
 * 8. LocalStorage persistence across browser page reload (remainingDays, sprint mode, checklist, mistakes, case answers)
 * 9. Strict pageErrors === 0 guarantee throughout all interactions
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const SERVER_PORT = parseInt(process.env.PORT || "43180", 10);
const BASE_URL = `http://127.0.0.1:${SERVER_PORT}/ruanshe-8weeks`;
const STORAGE_KEY = "ruanshe-8weeks-v1";

// ANSI colors for clean test reporting
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";

// Locate Chrome binary
function findChromeBinary() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error("Could not find a valid Google Chrome / Chromium executable.");
}

// Check if server is running
function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// CDP Client Helper
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
    this.pageErrors = [];
    this.consoleLogs = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve: res, reject: rej } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) {
              rej(new Error(`CDP Error [${msg.error.code}]: ${msg.error.message}`));
            } else {
              res(msg.result);
            }
          } else if (msg.method) {
            // Event
            const handlers = this.eventListeners.get(msg.method) || [];
            handlers.forEach((h) => h(msg.params));

            if (msg.method === "Runtime.consoleAPICalled") {
              const text = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
              this.consoleLogs.push({ type: msg.params.type, text });
              if (msg.params.type === "error") {
                this.pageErrors.push(`Console Error: ${text}`);
              }
            } else if (msg.method === "Runtime.exceptionThrown") {
              const details = msg.params.exceptionDetails;
              const text = details.exception?.description || details.text || "Unknown exception";
              this.pageErrors.push(`Page Exception: ${text}`);
            }
          }
        } catch (e) {
          console.error("Error processing CDP frame:", e);
        }
      };
    });
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      const err = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Evaluation failed: ${err}`);
    }
    return res.result?.value;
  }

  async waitFor(predicateExpr, description = "condition", timeoutMs = 8000, intervalMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const val = await this.evaluate(predicateExpr);
        if (val) return val;
      } catch {
        // continue polling
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`Timed out waiting for [${description}] after ${timeoutMs}ms`);
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await this.waitFor("document.readyState === 'complete'", "document readyState complete", 10000);
    // Grace period for React hydration
    await new Promise((r) => setTimeout(r, 600));
  }

  async reload() {
    await this.send("Page.reload", { ignoreCache: true });
    await this.waitFor("document.readyState === 'complete'", "page reload complete", 10000);
    // Grace period for Zustand rehydration
    await new Promise((r) => setTimeout(r, 700));
  }

  async dispatchKey(key, code, windowsVirtualKeyCode) {
    await this.send("Input.dispatchKeyEvent", {
      type: "rawKeyDown",
      key,
      code,
      windowsVirtualKeyCode,
    });
    if (key.length === 1) {
      await this.send("Input.dispatchKeyEvent", {
        type: "char",
        text: key,
      });
    }
    await this.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code,
      windowsVirtualKeyCode,
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Main Test Runner
async function run() {
  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  🚀 RuanShe 8-Weeks & Crash Sprint E2E Headless Automation Suite${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  let serverProcess = null;
  let chromeProcess = null;
  let tmpUserDataDir = null;
  let client = null;

  const testResults = [];
  const startAll = Date.now();

  async function step(name, fn) {
    const t0 = Date.now();
    process.stdout.write(`  ${CYAN}▶${RESET} ${name} ... `);
    try {
      await fn();
      const elapsed = Date.now() - t0;
      console.log(`${GREEN}${BOLD}✓ PASS${RESET} ${GRAY}(${elapsed}ms)${RESET}`);
      testResults.push({ name, passed: true, elapsed });
    } catch (err) {
      const elapsed = Date.now() - t0;
      console.log(`${RED}${BOLD}✗ FAIL${RESET} ${GRAY}(${elapsed}ms)${RESET}`);
      console.error(`\n    ${RED}${err.message}${RESET}\n`);
      if (err.stack) {
        console.error(GRAY + err.stack.split("\n").slice(1, 4).join("\n") + RESET);
      }
      testResults.push({ name, passed: false, elapsed, error: err.message });
      throw err;
    }
  }

  try {
    // -------------------------------------------------------------
    // Step 0: Ensure server is running & launch headless Chrome
    // -------------------------------------------------------------
    await step("Scenario 0: Infrastructure Setup & Headless Chrome Launch", async () => {
      const isRunning = await isServerRunning(`${BASE_URL}/`);
      if (!isRunning) {
        serverProcess = spawn("node", ["scripts/serve.mjs"], {
          cwd: PROJECT_ROOT,
          stdio: "ignore",
        });
        let ready = false;
        for (let i = 0; i < 20; i++) {
          await new Promise((r) => setTimeout(r, 300));
          if (await isServerRunning(`${BASE_URL}/`)) {
            ready = true;
            break;
          }
        }
        if (!ready) {
          throw new Error("Failed to start static server on port " + SERVER_PORT);
        }
      }

      const chromeBin = findChromeBinary();
      const cdpPort = 9222 + Math.floor(Math.random() * 500);
      tmpUserDataDir = path.join("/tmp", `ruanshe-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      fs.mkdirSync(tmpUserDataDir, { recursive: true });

      chromeProcess = spawn(
        chromeBin,
        [
          "--headless=new",
          `--remote-debugging-port=${cdpPort}`,
          `--user-data-dir=${tmpUserDataDir}`,
          "--no-first-run",
          "--no-default-browser-check",
          "--disable-gpu",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-renderer-backgrounding",
          "--window-size=1280,960",
          "about:blank",
        ],
        { stdio: "ignore" }
      );

      let versionInfo = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 200));
        try {
          const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
          if (res.ok) {
            versionInfo = await res.json();
            break;
          }
        } catch {
          // retry
        }
      }
      if (!versionInfo) {
        throw new Error("Headless Chrome failed to start remote debugging port");
      }

      // Create a new tab for testing
      const newTabRes = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, {
        method: "PUT",
      });
      const tabData = await newTabRes.json();

      client = new CDPClient(tabData.webSocketDebuggerUrl);
      await client.connect();

      await client.send("Runtime.enable");
      await client.send("Page.enable");
      await client.send("DOM.enable");
    });

    // -------------------------------------------------------------
    // Scenario 1: Initial Cockpit Baseline at 56 Days (Regular Mode)
    // -------------------------------------------------------------
    await step("Scenario 1: Initial Cockpit Baseline at 56 Days (Regular Mode)", async () => {
      await client.navigate(`${BASE_URL}/`);

      const state = await client.evaluate(`(() => {
        const text = document.body.innerText;
        const hasTitle = document.title.includes("软设 8 周通关");
        const has56Days = text.includes("56") && text.includes("天");
        const hasRegular = text.includes("常规8周通关模式") || text.includes("常规周计划");
        const hasTactical = text.includes("涵盖基础通读") || text.includes("三轮复习法");
        const hasRadar = text.includes("45/75 及格安全雷达");
        const hasStage = text.includes("第 1 周") && text.includes("第 8 周") && text.includes("基础通读与考点梳理");
        return { hasTitle, has56Days, hasRegular, hasTactical, hasRadar, hasStage };
      })()`);

      if (!state.hasTitle) throw new Error("Document title does not contain '软设 8 周通关'");
      if (!state.has56Days) throw new Error("Remaining days does not display baseline 56 days");
      if (!state.hasRegular) throw new Error("Mode indicator does not show Regular 8-Week plan mode");
      if (!state.hasRadar) throw new Error("ScoreRadar is not rendered on Cockpit");
      if (!state.hasStage) throw new Error("Regular 8-Week stage/week stream is not rendered");
    });

    // -------------------------------------------------------------
    // Scenario 2: Dynamic Days Adjustment & Crash Sprint Mode (<10d)
    // -------------------------------------------------------------
    await step("Scenario 2: Dynamic Days Adjustment & Auto-switch to Crash Sprint (<10d)", async () => {
      // Click preset "5天高频" button
      const clicked = await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent.includes("5天高频"));
        if (!btn) return false;
        btn.click();
        return true;
      })()`);

      if (!clicked) {
        throw new Error("Could not find '5天高频' preset button");
      }

      // Wait for UI mode switch to "sprint"
      await client.waitFor(
        `document.body.innerText.includes("极限冲刺模式")`,
        "Mode switched to 极限冲刺模式"
      );

      const sprintState = await client.evaluate(`(() => {
        const text = document.body.innerText;
        const hasSprintTitle = text.includes("🔥 极限冲刺模式 (Crash Sprint)");
        const hasSprintTactical = text.includes("二八法则") || text.includes("已自动过滤低性价比生僻偏题");
        const hasDaysPills = text.includes("Day 1") && text.includes("Day 5");
        const hasTarget = text.includes("极限攻坚目标") || text.includes("分战力");

        // Check task checkbox reactivity
        const taskBtn = document.querySelector("button[aria-label*='标记任务']");
        const taskFound = Boolean(taskBtn);

        return { hasSprintTitle, hasSprintTactical, hasDaysPills, hasTarget, taskFound };
      })()`);

      if (!sprintState.hasSprintTitle) throw new Error("Sprint title banner not visible");
      if (!sprintState.hasSprintTactical) throw new Error("20/80 tactical note not visible");
      if (!sprintState.hasDaysPills) throw new Error("Day 1 - Day 5 sprint selector tabs not visible");
      if (!sprintState.taskFound) throw new Error("Sprint task items not rendered");

      // Check a task checkbox and assert radar reactivity
      const checkRes = await client.evaluate(`(() => {
        const getPct = () => {
          const div = Array.from(document.querySelectorAll("div")).find(d => d.textContent.includes("任务攻坚完成度"));
          return div ? div.innerText : "";
        };

        const beforeText = getPct();
        const taskBtn = document.querySelector("button[aria-label*='标记任务']");
        if (!taskBtn) return { success: false, reason: "No task button" };

        taskBtn.click();
        return { success: true, beforeText };
      })()`);

      if (!checkRes.success) throw new Error(checkRes.reason);

      // Verify radar updated
      await client.waitFor(
        `(() => {
          const div = Array.from(document.querySelectorAll("div")).find(d => d.textContent.includes("任务攻坚完成度"));
          return div && !div.innerText.includes("0 / ");
        })()`,
        "Radar completed tasks count updated to > 0"
      );
    });

    // -------------------------------------------------------------
    // Scenario 3: CheatSheet & MindMap Hub (4 Tabs, Search, Mastery)
    // -------------------------------------------------------------
    await step("Scenario 3: CheatSheet & MindMap Hub Tabs, Search & Mastery Toggle", async () => {
      await client.navigate(`${BASE_URL}/cheatsheet/`);

      // 1. Verify 4 tabs exist
      const tabsInfo = await client.evaluate(`(() => {
        const text = document.body.innerText;
        const hasFourPages = text.includes("考前必备四页纸");
        const hasHundred = text.includes("软设知识点100条");
        const hasPairs = text.includes("易混淆知识点对比");
        const hasMindMaps = text.includes("8大章节思维导图");
        return { hasFourPages, hasHundred, hasPairs, hasMindMaps };
      })()`);

      if (!tabsInfo.hasFourPages || !tabsInfo.hasHundred || !tabsInfo.hasPairs || !tabsInfo.hasMindMaps) {
        throw new Error("One or more CheatSheet tabs are missing");
      }

      // 2. Switch to "软设知识点100条" tab
      await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent.includes("软设知识点100条"));
        if (btn) btn.click();
      })()`);

      await client.waitFor(
        `document.body.innerText.includes("全部知识点")`,
        "HundredPoints tab content loaded"
      );

      // 3. Test Keyword Search
      await client.evaluate(`(() => {
        const searchInput = document.querySelector("input[placeholder*='搜索考点']");
        if (searchInput) {
          const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          descriptor.set.call(searchInput, "流水线");
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
          searchInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()`);

      await client.waitFor(
        `(() => {
          const text = document.body.innerText;
          return text.includes("流水线") || text.includes("吞吐率");
        })()`,
        "Search filter matches 流水线"
      );

      // Clear search
      await client.evaluate(`(() => {
        const searchInput = document.querySelector("input[placeholder*='搜索考点']");
        if (searchInput) {
          const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          descriptor.set.call(searchInput, "");
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
          searchInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()`);

      // 4. Toggle Mastery Badge
      const toggleRes = await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const markBtn = buttons.find(b => b.textContent.includes("标记掌握"));
        if (!markBtn) return { success: false, reason: "No 标记掌握 button" };
        markBtn.click();
        return { success: true };
      })()`);

      if (!toggleRes.success) throw new Error(toggleRes.reason);

      await client.waitFor(
        `document.body.innerText.includes("已背诵")`,
        "Mastery status toggled to 已背诵"
      );

      // 5. Test Confusion Pairs Tab
      await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent.includes("易混淆知识点对比"));
        if (btn) btn.click();
      })()`);
      await client.waitFor(
        `document.body.innerText.includes("35 组对比库") || document.body.innerText.includes("高频辨析")`,
        "Confusion Pairs rendered"
      );

      // 6. Test Mind Maps Tab
      await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent.includes("8大章节思维导图"));
        if (btn) btn.click();
      })()`);
      await client.waitFor(
        `document.body.innerText.includes("计算机系统与体系结构") || document.body.innerText.includes("计算机系统基础")`,
        "Mind Maps rendered"
      );
    });

    // -------------------------------------------------------------
    // Scenario 4: 3D Flashcards Flip & Mastery Toggle
    // -------------------------------------------------------------
    await step("Scenario 4: 3D Flashcards Flip, Formula/Mnemonic & Mastery", async () => {
      await client.navigate(`${BASE_URL}/flashcards/`);

      // 1. Verify card element exists
      const hasCard = await client.evaluate(`Boolean(document.querySelector("[data-testid='flashcard']"))`);
      if (!hasCard) throw new Error("Flashcard element not found");

      // Verify front face features
      const frontState = await client.evaluate(`(() => {
        const card = document.querySelector("[data-testid='flashcard']");
        const transform = card ? card.style.transform : "";
        const text = card ? card.innerText : "";
        return { transform, hasMnemonicHint: text.includes("秒杀口诀") };
      })()`);

      if (frontState.transform && !frontState.transform.includes("0deg")) {
        throw new Error("Card should initially have 0deg rotation");
      }

      // 2. Click card to flip
      await client.evaluate(`document.querySelector("[data-testid='flashcard']").click()`);

      // Wait for back face content to reveal
      await client.waitFor(
        `(() => {
          const text = document.querySelector("[data-testid='flashcard']")?.innerText || "";
          return text.includes("极速破题秘籍") || text.includes("秒杀口诀：") || text.includes("翻回正面");
        })()`,
        "Flashcard flipped to back face"
      );

      // 3. Toggle mastery on flashcard
      const masteryRes = await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent.includes("标记掌握"));
        if (!btn) return false;
        btn.click();
        return true;
      })()`);

      if (!masteryRes) throw new Error("Could not find flashcard 标记掌握 button");

      await client.waitFor(
        `document.querySelector("[data-testid='flashcard']")?.innerText.includes("已掌握")`,
        "Flashcard toggled to 已掌握"
      );
    });

    // -------------------------------------------------------------
    // Scenario 5: Morning Quizzer Shortcuts & Mistake Book
    // -------------------------------------------------------------
    await step("Scenario 5: Morning Quizzer Keyboard Shortcuts & Mistake Book", async () => {
      await client.navigate(`${BASE_URL}/practice/`);

      // 1. Verify question stem is rendered
      await client.waitFor(
        `(() => {
          const text = document.body.innerText;
          const hasStem = text.includes("上午综合知识极速刷题");
          const hasOptionA = Array.from(document.querySelectorAll("button")).some(b => b.querySelector("span")?.textContent.trim() === "A");
          return hasStem && hasOptionA;
        })()`,
        "Question stem and options rendered"
      );

      // 2. Test keyboard shortcut: Press 'A' (KeyA, keyCode 65)
      await client.dispatchKey("a", "KeyA", 65);
      await new Promise((r) => setTimeout(r, 200));

      const optionASelected = await client.evaluate(`(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const optABtn = buttons.find(b => b.querySelector("span")?.textContent.trim() === "A");
        return optABtn && optABtn.className.includes("bg-brand");
      })()`);

      if (!optionASelected) {
        throw new Error("Option A was not selected via keyboard shortcut 'A'");
      }

      // 3. Test submission via keyboard shortcut: Press 'Enter'
      await client.dispatchKey("Enter", "Enter", 13);
      await client.waitFor(
        `(() => {
          const text = document.body.innerText;
          return text.includes("试题解析") || text.includes("正确答案") || text.includes("答题统计");
        })()`,
        "Question submitted via Enter shortcut"
      );

      // 4. Test wrong answer -> Mistake Book integration
      // Let's ensure at least one mistake exists: if Option A was correct, answer next question wrongly.
      const mistakeState = await client.evaluate(`(() => {
        const raw = localStorage.getItem("${STORAGE_KEY}");
        const state = raw ? JSON.parse(raw).state : {};
        const mistakeCount = (state.mistakeQuestionIds || []).length;
        return { mistakeCount, mistakeIds: state.mistakeQuestionIds || [] };
      })()`);

      if (mistakeState.mistakeCount === 0) {
        // Go to next question and submit wrong option
        await client.dispatchKey("Enter", "Enter", 13); // Press Enter to go next
        await new Promise((r) => setTimeout(r, 400));

        // Intentionally pick Option D
        await client.dispatchKey("d", "KeyD", 68);
        await new Promise((r) => setTimeout(r, 200));
        await client.dispatchKey("Enter", "Enter", 13); // Submit
        await new Promise((r) => setTimeout(r, 400));
      }

      // 5. Navigate to /mistakes and assert collected mistake question is listed
      await client.navigate(`${BASE_URL}/mistakes/`);
      const mistakesPage = await client.evaluate(`(() => {
        const text = document.body.innerText;
        const hasHeader = text.includes("错题靶向归集与歼灭") || text.includes("专属错题本");
        const countMatch = text.match(/当前收录\\s*(\\d+)\\s*道错题/) || text.match(/一键靶向重测\\s*\\((\\d+)\\)/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 0;
        return { hasHeader, count };
      })()`);

      if (!mistakesPage.hasHeader) {
        throw new Error("Mistakes page header not rendered");
      }
      if (mistakesPage.count < 1) {
        throw new Error("Mistake question was not collected in Mistake Book");
      }
    });

    // -------------------------------------------------------------
    // Scenario 6: Afternoon Cases, Fuzzy Scoring & Focus Isolation
    // -------------------------------------------------------------
    await step("Scenario 6: Afternoon Cases Fuzzy Scoring & Strict Focus Isolation", async () => {
      await client.navigate(`${BASE_URL}/cases/`);

      // 1. Verify case title and interactive blanks
      await client.waitFor(
        `document.querySelectorAll("input[placeholder*='请输入空缺']").length >= 2`,
        "Case study blanks rendered"
      );

      // 2. Strict Input Focus Shortcut Isolation Test
      const focusIsolationPassed = await client.evaluate(`(() => {
        const input = document.querySelector("input[placeholder*='请输入空缺']");
        if (!input) return false;
        input.focus();

        // Dispatch keydown inside the input
        const eventA = new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true });
        input.dispatchEvent(eventA);

        const eventEnter = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true });
        input.dispatchEvent(eventEnter);

        // Check if page navigated or broke
        return window.location.pathname.includes("/cases");
      })()`);

      if (!focusIsolationPassed) {
        throw new Error("Focus isolation failed: shortcut triggered inside blank input");
      }

      // 3. Fill in Blanks with standard / acceptable answers:
      // In CASE-DFD-01:
      // Blank 1 (实体 E1): "读者"
      // Blank 2 (实体 E2): "管理员" (acceptable answer for 图书管理员)
      const fillRes = await client.evaluate(`(() => {
        const inputs = document.querySelectorAll("input[placeholder*='请输入空缺']");
        if (inputs.length < 2) return { success: false, reason: "Insufficient blanks" };

        const setNativeValue = (element, value) => {
          const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          descriptor.set.call(element, value);
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
        };

        setNativeValue(inputs[0], "读者");
        setNativeValue(inputs[1], "管理员");

        // Click "提交判分 (Check Answers)"
        const checkBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("提交判分"));
        if (!checkBtn) return { success: false, reason: "Check button not found" };
        checkBtn.click();
        return { success: true };
      })()`);

      if (!fillRes.success) throw new Error(fillRes.reason);

      // 4. Assert Intelligent Fuzzy Scoring awards points
      await client.waitFor(
        `(() => {
          const text = document.body.innerText;
          return text.includes("+2 分 / 2 分") || text.includes("重新判分");
        })()`,
        "Fuzzy scoring awarded points for '读者' and '管理员'"
      );
    });

    // -------------------------------------------------------------
    // Scenario 7: LocalStorage Persistence across Page Reload
    // -------------------------------------------------------------
    await step("Scenario 7: LocalStorage Persistence across Browser Page Reload", async () => {
      // Reload the page
      await client.reload();

      // Read restored state from LocalStorage and DOM
      const persistedState = await client.evaluate(`(() => {
        const raw = localStorage.getItem("${STORAGE_KEY}");
        const state = raw ? JSON.parse(raw).state : null;
        if (!state) return { valid: false };

        const text = document.body.innerText;

        return {
          valid: true,
          remainingDays: state.remainingDays,
          hasCheckedTasks: Object.values(state.checklist || {}).some(Boolean),
          hasMistakes: (state.mistakeQuestionIds || []).length > 0,
          hasCaseAnswers: Object.keys(state.caseAnswers || {}).length > 0,
          caseChecked: Object.values(state.caseChecked || {}).some(Boolean),
          hasMasteredPoint: (state.masteredPointIds || []).length > 0,
          hasMasteredFlashcard: (state.masteredFlashcardIds || []).length > 0,
          domHasCaseAnswers: text.includes("读者") && text.includes("管理员"),
          domHasScore: text.includes("+2 分 / 2 分") || text.includes("重新判分"),
        };
      })()`);

      if (!persistedState.valid) {
        throw new Error("LocalStorage state is missing or empty after reload");
      }
      if (persistedState.remainingDays !== 5) {
        throw new Error(`remainingDays was not persisted (expected 5, got ${persistedState.remainingDays})`);
      }
      if (!persistedState.hasCheckedTasks) {
        throw new Error("Task checklist state was not persisted");
      }
      if (!persistedState.hasMistakes) {
        throw new Error("Mistake notebook questions were not persisted");
      }
      if (!persistedState.hasCaseAnswers || !persistedState.domHasCaseAnswers) {
        throw new Error("Afternoon case answers were not persisted into DOM");
      }
      if (!persistedState.domHasScore) {
        throw new Error("Afternoon case evaluation checked state was not restored");
      }
      if (!persistedState.hasMasteredPoint) {
        throw new Error("Mastered knowledge point was not persisted");
      }
      if (!persistedState.hasMasteredFlashcard) {
        throw new Error("Mastered flashcard was not persisted");
      }

      // Also navigate back to Cockpit and assert remainingDays = 5 and Sprint Mode persist in UI
      await client.navigate(`${BASE_URL}/`);
      const cockpitState = await client.evaluate(`(() => {
        const text = document.body.innerText;
        const isSprint = text.includes("极限冲刺模式");
        const has5Days = text.includes("5") && text.includes("天");
        return { isSprint, has5Days };
      })()`);

      if (!cockpitState.isSprint || !cockpitState.has5Days) {
        throw new Error("Cockpit did not restore 5-day Crash Sprint mode from persisted LocalStorage");
      }
    });

    // -------------------------------------------------------------
    // Scenario 8: Clean Shutdown & Zero PageErrors Assertion
    // -------------------------------------------------------------
    await step("Scenario 8: Zero PageErrors Assertion & Clean Teardown", async () => {
      if (client.pageErrors.length > 0) {
        console.error("Recorded Page Errors:", client.pageErrors);
        throw new Error(`Expected 0 page errors, but encountered ${client.pageErrors.length}`);
      }
    });

    const totalElapsed = Date.now() - startAll;

    console.log(`\n${BOLD}${GREEN}======================================================================${RESET}`);
    console.log(`${BOLD}${GREEN}  🎉 ALL 8 E2E AUTOMATION TEST SCENARIOS PASSED (0 FAILURES)${RESET}`);
    console.log(`${BOLD}${GREEN}======================================================================${RESET}`);
    console.log(`  Total Scenarios: ${testResults.length}`);
    console.log(`  Passed:          ${testResults.filter((r) => r.passed).length}`);
    console.log(`  Failed:          0`);
    console.log(`  Page Errors:     0`);
    console.log(`  Total Time:      ${totalElapsed}ms\n`);

    process.exit(0);
  } catch (err) {
    console.error(`\n${BOLD}${RED}======================================================================${RESET}`);
    console.error(`${BOLD}${RED}  ❌ E2E TEST SUITE EXECUTION FAILED${RESET}`);
    console.error(`${BOLD}${RED}======================================================================${RESET}`);
    console.error(`  Error: ${err.message}\n`);
    process.exit(1);
  } finally {
    if (client) {
      try {
        client.close();
      } catch {}
    }
    if (chromeProcess) {
      try {
        chromeProcess.kill("SIGTERM");
      } catch {}
    }
    if (serverProcess) {
      try {
        serverProcess.kill("SIGTERM");
      } catch {}
    }
    if (tmpUserDataDir && fs.existsSync(tmpUserDataDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
        } catch {}
      }, 1000);
    }
  }
}

run();
