#!/usr/bin/env node
/**
 * Quality audit for data/questions.ts + data/mock-papers.ts (combined export).
 * Checks: duplicate stems, duplicate ids, option text dupes, correct key,
 * empty/short stems/options, missing whyWrong for incorrect options.
 *
 * Usage: node scripts/qa-questions.mjs [--json] [--fix-report]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadQuestionsFromFile(relPath) {
  const filePath = path.join(root, relPath);
  const source = fs.readFileSync(filePath, "utf8");
  // Transpile TS → JS (strip types), then extract the array export via Function.
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      removeComments: false,
    },
    fileName: filePath,
  });
  // Remove import lines; keep only the array assignment we care about.
  const cleaned = outputText
    .replace(/^import\s+.*?from\s+["'].*?["'];?\s*$/gm, "")
    .replace(/^export\s+/gm, "");

  // Find first `const <name> = [` that looks like questions array
  const m = cleaned.match(
    /(?:const|let|var)\s+(\w*[Qq]uestions?\w*)\s*=\s*(\[[\s\S]*\]);?\s*(?:function|const|let|var|export|$)/,
  );
  if (!m) {
    // fallback: greedy first top-level array assigned to *questions*
    const m2 = cleaned.match(/(\w*[Qq]uestions?\w*)\s*=\s*(\[[\s\S]*\])/);
    if (!m2) throw new Error(`Could not extract questions array from ${relPath}`);
    return evalArray(m2[2], relPath);
  }
  return evalArray(m[2], relPath);
}

function evalArray(arraySrc, label) {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${arraySrc});`);
    const arr = fn();
    if (!Array.isArray(arr)) throw new Error("not an array");
    return arr.map((q, i) => ({ ...q, __source: label, __index: i }));
  } catch (e) {
    throw new Error(`Failed to eval array from ${label}: ${e.message}`);
  }
}

function normalizeStem(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .replace(/[\s()\uFF08\uFF09?\uFF1F]*$/g, "")
    .trim()
    .toLowerCase();
}

function isNearExact(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  // Ignore punctuation-only / comma insertion differences
  const strip = (s) => s.replace(/[，,、\s]/g, "");
  if (strip(a) === strip(b)) return true;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  // prefix near-match only when almost identical length
  if (longer.length - shorter.length <= 2 && longer.startsWith(shorter) && shorter.length >= 20)
    return true;
  // Levenshtein: only flag nearly identical stems (dist 1, or dist 2 with length>=24)
  // Avoid flagging pedagogically distinct pairs that differ by one content word (e.g. 传递 vs 部分).
  if (Math.abs(a.length - b.length) <= 2 && a.length > 16) {
    const dist = levenshtein(a, b);
    if (dist === 1) return true;
    if (dist === 2 && a.length >= 28 && strip(a).length === strip(b).length) return true;
  }
  return false;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function audit(questions) {
  const issues = [];
  const warn = [];

  // 2. Duplicate ids
  const byId = new Map();
  for (const q of questions) {
    if (!q.id) {
      issues.push({ type: "missing_id", q });
      continue;
    }
    if (!byId.has(q.id)) byId.set(q.id, []);
    byId.get(q.id).push(q);
  }
  for (const [id, list] of byId) {
    if (list.length > 1) {
      issues.push({
        type: "duplicate_id",
        id,
        count: list.length,
        sources: list.map((q) => `${q.__source}#${q.__index} day=${q.dayId}`),
      });
    }
  }

  // 1. Duplicate stems (within dayId + globally)
  const byDayStem = new Map(); // dayId -> Map(norm -> qs)
  const globalStem = new Map(); // norm -> qs
  for (const q of questions) {
    const norm = normalizeStem(q.stem);
    if (!byDayStem.has(q.dayId)) byDayStem.set(q.dayId, new Map());
    const dayMap = byDayStem.get(q.dayId);
    if (!dayMap.has(norm)) dayMap.set(norm, []);
    dayMap.get(norm).push(q);
    if (!globalStem.has(norm)) globalStem.set(norm, []);
    globalStem.get(norm).push(q);
  }

  // exact within day
  for (const [dayId, dayMap] of byDayStem) {
    for (const [norm, list] of dayMap) {
      if (list.length > 1) {
        issues.push({
          type: "duplicate_stem_same_day",
          dayId,
          norm: norm.slice(0, 80),
          ids: list.map((q) => q.id),
          stems: list.map((q) => q.stem),
        });
      }
    }
  }

  // exact global (across days) — report pairs that share same norm but different days
  for (const [norm, list] of globalStem) {
    if (list.length < 2) continue;
    const days = new Set(list.map((q) => q.dayId));
    if (days.size >= 2) {
      issues.push({
        type: "duplicate_stem_global",
        norm: norm.slice(0, 80),
        ids: list.map((q) => q.id),
        dayIds: [...days],
        stems: list.map((q) => q.stem),
      });
    }
  }

  // near-exact: O(n^2) within day only (bounded), plus sample global by first 20 chars bucket
  for (const [dayId, dayMap] of byDayStem) {
    const norms = [...dayMap.keys()];
    for (let i = 0; i < norms.length; i++) {
      for (let j = i + 1; j < norms.length; j++) {
        if (isNearExact(norms[i], norms[j]) && norms[i] !== norms[j]) {
          issues.push({
            type: "near_duplicate_stem_same_day",
            dayId,
            a: dayMap.get(norms[i]).map((q) => q.id),
            b: dayMap.get(norms[j]).map((q) => q.id),
            stemA: dayMap.get(norms[i])[0].stem,
            stemB: dayMap.get(norms[j])[0].stem,
          });
        }
      }
    }
  }

  // global near-dup via prefix buckets
  const buckets = new Map();
  for (const [norm, list] of globalStem) {
    const key = norm.slice(0, 24);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ norm, list });
  }
  for (const group of buckets.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (
          group[i].norm !== group[j].norm &&
          isNearExact(group[i].norm, group[j].norm)
        ) {
          const idsA = group[i].list.map((q) => q.id);
          const idsB = group[j].list.map((q) => q.id);
          issues.push({
            type: "near_duplicate_stem_global",
            a: idsA,
            b: idsB,
            stemA: group[i].list[0].stem,
            stemB: group[j].list[0].stem,
            dayIds: [
              ...new Set([
                ...group[i].list.map((q) => q.dayId),
                ...group[j].list.map((q) => q.dayId),
              ]),
            ],
          });
        }
      }
    }
  }

  for (const q of questions) {
    const opts = q.options ?? [];
    const keys = opts.map((o) => o.key);

    // 3. Option text duplicates within a question
    const texts = opts.map((o) => String(o.text ?? "").replace(/\s+/g, " ").trim());
    const seenText = new Map();
    texts.forEach((t, i) => {
      if (!seenText.has(t)) seenText.set(t, []);
      seenText.get(t).push(opts[i].key);
    });
    for (const [t, ks] of seenText) {
      if (t && ks.length > 1) {
        issues.push({
          type: "duplicate_option_text",
          id: q.id,
          dayId: q.dayId,
          keys: ks,
          text: t,
        });
      }
    }

    // 4. correct key not in options
    if (!keys.includes(q.correct)) {
      issues.push({
        type: "correct_key_missing",
        id: q.id,
        dayId: q.dayId,
        correct: q.correct,
        keys,
      });
    }

    // 5. Empty/very short stems or options
    const stem = String(q.stem ?? "").trim();
    if (stem.length < 8) {
      issues.push({
        type: "short_stem",
        id: q.id,
        dayId: q.dayId,
        stem,
        len: stem.length,
      });
    }
    for (const o of opts) {
      const t = String(o.text ?? "").trim();
      // Numeric / single-token MCQ answers (e.g. "0","栈","n") are valid; only flag empty.
      if (t.length < 1) {
        issues.push({
          type: "empty_option",
          id: q.id,
          dayId: q.dayId,
          key: o.key,
          text: t,
          len: t.length,
        });
      }
    }

    // 6. whyWrong missing for incorrect options (warn)
    const why = q.whyWrong ?? {};
    for (const o of opts) {
      if (o.key === q.correct) continue;
      const w = why[o.key];
      if (!w || String(w).trim().length === 0) {
        warn.push({
          type: "missing_whyWrong",
          id: q.id,
          dayId: q.dayId,
          key: o.key,
          optionText: o.text,
          correct: q.correct,
          stem: q.stem,
        });
      }
    }
  }

  return { issues, warn, total: questions.length };
}

function main() {
  // Load daily questions without the spread of mock papers, then concat mock.
  // questions.ts ends with ...mockPaperQuestions — our extractor may include
  // a ReferenceError if we eval the spread. So load files separately.
  const dailySrc = fs.readFileSync(path.join(root, "data/questions.ts"), "utf8");
  // Strip the spread line before transpile so we only get daily questions.
  const dailyStripped = dailySrc.replace(/\.\.\.\s*mockPaperQuestions\s*,?/g, "");
  const tmpDaily = path.join(root, "scripts/.tmp-daily-questions.ts");
  fs.writeFileSync(tmpDaily, dailyStripped);

  let daily;
  let mock;
  try {
    daily = loadQuestionsFromFile("scripts/.tmp-daily-questions.ts");
    mock = loadQuestionsFromFile("data/mock-papers.ts");
  } finally {
    try {
      fs.unlinkSync(tmpDaily);
    } catch {
      /* ignore */
    }
  }

  // Tag sources properly
  daily.forEach((q) => {
    q.__source = "data/questions.ts";
  });
  mock.forEach((q) => {
    q.__source = "data/mock-papers.ts";
  });

  const combined = [...daily, ...mock];
  const { issues, warn, total } = audit(combined);

  const byType = {};
  for (const i of issues) {
    byType[i.type] = (byType[i.type] || 0) + 1;
  }
  const warnByType = {};
  for (const w of warn) {
    warnByType[w.type] = (warnByType[w.type] || 0) + 1;
  }

  const report = {
    auditedAt: new Date().toISOString(),
    totalQuestions: total,
    dailyCount: daily.length,
    mockCount: mock.length,
    issueCount: issues.length,
    warnCount: warn.length,
    byType,
    warnByType,
    issues,
    warn,
  };

  const outPath = path.join(root, "scripts/qa-questions-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`Audited ${total} questions (daily=${daily.length}, mock=${mock.length})`);
  console.log(`Issues: ${issues.length}`, byType);
  console.log(`Warnings: ${warn.length}`, warnByType);
  console.log(`Report: ${outPath}`);

  // Print a readable summary of issues
  for (const i of issues) {
    console.log("\n[ISSUE]", i.type, JSON.stringify(i, null, 0).slice(0, 300));
  }
  if (warn.length && warn.length <= 40) {
    for (const w of warn) {
      console.log("\n[WARN]", w.type, w.id, w.key, (w.optionText || "").slice(0, 40));
    }
  } else if (warn.length > 40) {
    console.log(`\n[WARN] ${warn.length} missing whyWrong — see report JSON`);
    for (const w of warn.slice(0, 15)) {
      console.log("  ", w.id, w.key, (w.optionText || "").slice(0, 50));
    }
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  }

  // Non-zero exit only for hard issues (not warnings)
  if (issues.length > 0) process.exitCode = 1;
}

main();
