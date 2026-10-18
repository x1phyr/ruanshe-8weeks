#!/usr/bin/env node
// /Users/milu/code_lib/study/ruanshe-8weeks/scripts/verify_data.mjs
// Milestone 1: Automated Programmatic Validation of Ruanshe Data Assets

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..");
const PRIMARY_DATA_DIR = path.join(REPO_ROOT, "src/data");
const MIRROR_DATA_DIR = "/Users/milu/code_lib/study/软设/src/data";

const BANNED_PATTERNS = [
  /\bTODO\b/i,
  /\bPLACEHOLDER\b/i,
  /\bTBD\b/i,
  /\bDUMMY\b/i,
  /\bFIXME\b/i,
  /\bLOREM IPSUM\b/i,
  /待补充/
];

let passedChecks = 0;

function assertCheck(condition, message) {
  if (!condition) {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${message}`);
    process.exit(1);
  } else {
    passedChecks++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${message}`);
  }
}

function checkBannedText(obj, location = "root") {
  if (typeof obj === "string") {
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(obj)) {
        throw new Error(`Banned pattern ${pattern} found at ${location}: "${obj.slice(0, 100)}"`);
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => checkBannedText(item, `${location}[${index}]`));
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      checkBannedText(value, `${location}.${key}`);
    }
  }
}

console.log("\n=======================================================");
console.log("  RUANSHE DATA ASSET AUTOMATED VERIFICATION SUITE");
console.log("=======================================================\n");

// -------------------------------------------------------------
// Check 1: Existence of Primary and Mirrored Files
// -------------------------------------------------------------
console.log("--- 1. Dual-Repo File Synchrony & Existence ---");
const REQUIRED_FILES = [
  "questions.json",
  "caseStudies.json",
  "flashcards.json",
  "cheatsheet.json",
  "studyPlans.json",
  "knowledgePoints.json",
  "confusionPairs.json",
  "mindMaps.json",
  "sprintPlan.json"
];

for (const file of REQUIRED_FILES) {
  const pPath = path.join(PRIMARY_DATA_DIR, file);
  const mPath = path.join(MIRROR_DATA_DIR, file);
  assertCheck(fs.existsSync(pPath), `Primary dataset exists: ${file}`);
  assertCheck(fs.existsSync(mPath), `Mirrored dataset exists: ${file}`);

  const pContent = fs.readFileSync(pPath, "utf-8");
  const mContent = fs.readFileSync(mPath, "utf-8");
  assertCheck(pContent === mContent, `Identical dual-repo sync: ${file}`);
}

// -------------------------------------------------------------
// Check 2: Pure Text / Zero-Placeholder Inspection
// -------------------------------------------------------------
console.log("\n--- 2. Zero-Placeholder & Purity Guard ---");
for (const file of REQUIRED_FILES) {
  const filePath = path.join(PRIMARY_DATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  try {
    checkBannedText(data, file);
    assertCheck(true, `Purity verified (0 TODO/Placeholder): ${file}`);
  } catch (err) {
    assertCheck(false, `Purity check failed: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Check 3: questions.json Verification
// -------------------------------------------------------------
console.log("\n--- 3. Morning Questions (questions.json) ---");
const questions = JSON.parse(fs.readFileSync(path.join(PRIMARY_DATA_DIR, "questions.json"), "utf-8"));
assertCheck(Array.isArray(questions), "questions.json is an array");
assertCheck(questions.length >= 220, `Question count (${questions.length}) >= 220`);

const qDomains = new Map();
const qAnswers = { A: 0, B: 0, C: 0, D: 0 };
const qIds = new Set();

for (const q of questions) {
  assertCheck(!qIds.has(q.id), `Unique question ID: ${q.id}`);
  qIds.add(q.id);

  assertCheck(Boolean(q.domain && q.domain.length > 2), `Valid domain for ${q.id}: ${q.domain}`);
  assertCheck(Boolean(q.stem && q.stem.length >= 10), `Valid stem length for ${q.id}`);
  assertCheck(Boolean(q.options && typeof q.options === "object"), `Valid options object for ${q.id}`);
  assertCheck(Boolean(q.options.A && q.options.B && q.options.C && q.options.D), `All 4 options present for ${q.id}`);
  assertCheck(["A", "B", "C", "D"].includes(q.answer), `Valid answer key for ${q.id}: ${q.answer}`);
  assertCheck(Boolean((q.analysis || q.explanation) && (q.analysis || q.explanation).length >= 30), `Detailed explanation for ${q.id}`);

  qDomains.set(q.domain, (qDomains.get(q.domain) || 0) + 1);
  qAnswers[q.answer]++;
}

assertCheck(qDomains.size === 9, `All 9 knowledge domains covered (got ${qDomains.size})`);
for (const [dom, count] of qDomains.entries()) {
  assertCheck(count >= 20, `Domain [${dom}] count (${count}) >= 20`);
}

const totalQ = questions.length;
for (const [key, count] of Object.entries(qAnswers)) {
  const pct = (count / totalQ) * 100;
  assertCheck(pct >= 18.0 && pct <= 35.0, `Option ${key} balanced: ${count} (${pct.toFixed(2)}%)`);
}

// -------------------------------------------------------------
// Check 4: caseStudies.json Verification
// -------------------------------------------------------------
console.log("\n--- 4. Afternoon Cases (caseStudies.json) ---");
const cases = JSON.parse(fs.readFileSync(path.join(PRIMARY_DATA_DIR, "caseStudies.json"), "utf-8"));
assertCheck(Array.isArray(cases), "caseStudies.json is an array");
assertCheck(cases.length >= 25, `Case studies count (${cases.length}) >= 25`);

const caseTypes = new Map();
const caseIds = new Set();
let totalBlanks = 0;

for (const c of cases) {
  assertCheck(!caseIds.has(c.id), `Unique case ID: ${c.id}`);
  caseIds.add(c.id);

  assertCheck(["DFD", "DATABASE", "UML", "ALGORITHM", "DESIGN_PATTERN"].includes(c.type), `Valid case type: ${c.type}`);
  assertCheck(Boolean(c.title && c.title.length > 5), `Valid title for ${c.id}`);
  assertCheck(Boolean((c.scenario || c.background) && (c.scenario || c.background).length > 40), `Valid scenario for ${c.id}`);
  assertCheck(Boolean((c.diagramSvgOrText || c.diagramSvg) && (c.diagramSvgOrText || c.diagramSvg).length > 20), `Valid diagram for ${c.id}`);
  assertCheck(Array.isArray(c.subQuestions) && c.subQuestions.length >= 2, `Subquestions present for ${c.id}`);

  let caseScore = 0;
  for (const sq of c.subQuestions) {
    assertCheck(Boolean((sq.prompt || sq.questionStem) && (sq.prompt || sq.questionStem).length > 5), `Valid subquestion prompt in ${c.id}`);
    assertCheck(Array.isArray(sq.blanks) && sq.blanks.length >= 1, `Blanks array present in subquestion of ${c.id}`);

    for (const b of sq.blanks) {
      totalBlanks++;
      assertCheck(Boolean(b.standardAnswer && b.standardAnswer.length > 0), `Standard answer present for blank ${b.blankIndex || b.id} in ${c.id}`);
      assertCheck(Array.isArray(b.acceptableAnswers) && b.acceptableAnswers.length >= 1, `Acceptable answers array present for blank in ${c.id}`);
      assertCheck(b.acceptableAnswers.includes(b.standardAnswer), `standardAnswer is self-contained in acceptableAnswers for blank in ${c.id}`);
      assertCheck(typeof (b.points || b.score) === "number" && (b.points || b.score) > 0, `Valid points for blank in ${c.id}`);
      assertCheck(Boolean(b.explanation && b.explanation.length > 5), `Explanation present for blank in ${c.id}`);
      caseScore += (b.points || b.score);
    }
  }

  assertCheck(caseScore === 15, `Case ${c.id} total score equals 15 points (got ${caseScore})`);
  caseTypes.set(c.type, (caseTypes.get(c.type) || 0) + 1);
}

assertCheck(caseTypes.size === 5, `All 5 case types present (got ${caseTypes.size})`);
for (const [t, count] of caseTypes.entries()) {
  assertCheck(count >= 5, `Case type [${t}] count (${count}) >= 5`);
}
assertCheck(totalBlanks >= 180, `Total interactive blanks (${totalBlanks}) >= 180`);

// -------------------------------------------------------------
// Check 5: flashcards.json Verification
// -------------------------------------------------------------
console.log("\n--- 5. 3D Flashcards (flashcards.json) ---");
const cards = JSON.parse(fs.readFileSync(path.join(PRIMARY_DATA_DIR, "flashcards.json"), "utf-8"));
assertCheck(Array.isArray(cards), "flashcards.json is an array");
assertCheck(cards.length >= 100, `Flashcard count (${cards.length}) >= 100`);

const cardDomains = new Map();
const cardIds = new Set();
for (const card of cards) {
  assertCheck(!cardIds.has(card.id), `Unique flashcard ID: ${card.id}`);
  cardIds.add(card.id);

  assertCheck(Boolean(card.domain && card.domain.length > 2), `Domain present for ${card.id}`);
  assertCheck(Boolean(card.title && card.title.length > 2), `Title present for ${card.id}`);
  assertCheck(Boolean(card.formula && card.formula.length > 3), `Formula present for ${card.id}`);
  assertCheck(Boolean(card.mnemonic && card.mnemonic.length > 3), `Mnemonic present for ${card.id}`);
  assertCheck(Boolean(card.explanation && card.explanation.length > 15), `Explanation present for ${card.id}`);
  assertCheck(Boolean(card.trapAlert && card.trapAlert.length > 5), `Trap alert present for ${card.id}`);

  cardDomains.set(card.domain, (cardDomains.get(card.domain) || 0) + 1);
}
assertCheck(cardDomains.size === 9, `All 9 domains covered in flashcards (got ${cardDomains.size})`);

// -------------------------------------------------------------
// Check 6: cheatsheet.json Verification
// -------------------------------------------------------------
console.log("\n--- 6. CheatSheet & MindMap Hub (cheatsheet.json) ---");
const cheatsheet = JSON.parse(fs.readFileSync(path.join(PRIMARY_DATA_DIR, "cheatsheet.json"), "utf-8"));
assertCheck(cheatsheet && typeof cheatsheet === "object", "cheatsheet.json is an object");

// 4 Pages
assertCheck(Array.isArray(cheatsheet.fourPages) && cheatsheet.fourPages.length === 4, `4-page cheat sheet has exactly 4 pages (got ${cheatsheet.fourPages?.length})`);
for (let i = 0; i < 4; i++) {
  const page = cheatsheet.fourPages[i];
  assertCheck(page.page === i + 1, `Page number ${i + 1} matches`);
  assertCheck(Array.isArray(page.modules) && page.modules.length >= 2, `Page ${i + 1} has >= 2 modules`);
  for (const mod of page.modules) {
    assertCheck(Boolean(mod.name && mod.content && Array.isArray(mod.keyPoints)), `Module ${mod.name} is complete`);
  }
}

// 100 Core Points
assertCheck(Array.isArray(cheatsheet.core100Points) && cheatsheet.core100Points.length === 100, `core100Points has exactly 100 items (got ${cheatsheet.core100Points?.length})`);
for (let num = 1; num <= 100; num++) {
  const pt = cheatsheet.core100Points[num - 1];
  assertCheck(pt.id === num, `Point #${num} ID matches`);
  assertCheck(Boolean(pt.title && pt.summary && pt.domain && pt.memoryTip), `Point #${num} fields complete`);
}

// Confusion Pairs
assertCheck(Array.isArray(cheatsheet.confusionPairs) && cheatsheet.confusionPairs.length >= 30, `confusionPairs count (${cheatsheet.confusionPairs?.length}) >= 30`);
for (const pair of cheatsheet.confusionPairs) {
  assertCheck(Boolean(pair.id && pair.title && pair.conceptA && pair.conceptB && pair.distinction && pair.examTrap), `Confusion pair #${pair.id} complete`);
}

// Mind Maps
assertCheck(Array.isArray(cheatsheet.mindMaps) && cheatsheet.mindMaps.length === 8, `mindMaps has exactly 8 chapters (got ${cheatsheet.mindMaps?.length})`);
for (const mm of cheatsheet.mindMaps) {
  assertCheck(Boolean(mm.chapterId && mm.chapterTitle && Array.isArray(mm.nodes) && mm.nodes.length > 0), `Mind map chapter ${mm.chapterId} complete`);
}

// -------------------------------------------------------------
// Check 7: studyPlans.json Verification
// -------------------------------------------------------------
console.log("\n--- 7. Dynamic Study Plans (studyPlans.json) ---");
const studyPlans = JSON.parse(fs.readFileSync(path.join(PRIMARY_DATA_DIR, "studyPlans.json"), "utf-8"));
assertCheck(studyPlans && typeof studyPlans === "object", "studyPlans.json is an object");

// 8-week regular plan
assertCheck(Array.isArray(studyPlans.regular8Weeks) && studyPlans.regular8Weeks.length === 8, `regular8Weeks has exactly 8 weeks (got ${studyPlans.regular8Weeks?.length})`);
let totalDays = 0;
for (const week of studyPlans.regular8Weeks) {
  assertCheck(Array.isArray(week.dailyTasks) && week.dailyTasks.length === 7, `Week ${week.week} has 7 daily tasks`);
  totalDays += week.dailyTasks.length;
}
assertCheck(totalDays === 56, `8-week plan has exactly 56 days (got ${totalDays})`);

// Crash sprint plans
assertCheck(Boolean(studyPlans.crashSprintPlans && studyPlans.crashSprintPlans["5"]), "5-day sprint plan present");
assertCheck(studyPlans.crashSprintPlans["5"].length === 5, "5-day sprint plan has 5 days");
for (const day of studyPlans.crashSprintPlans["5"]) {
  assertCheck(Boolean(day.radarTarget && day.radarTarget.morningScore >= 45 && day.radarTarget.afternoonScore >= 45), `Day ${day.day} radar targets safety line (>= 45)`);
  assertCheck(Array.isArray(day.highYieldTasks) && day.highYieldTasks.length >= 5, `Day ${day.day} has high yield tasks`);
}

// -------------------------------------------------------------
// Check 8: Legacy Old Question Clean-up Verification
// -------------------------------------------------------------
console.log("\n--- 8. Legacy Code Clean-up Verification ---");
const legacyFile = path.join(REPO_ROOT, "data/questions.ts");
assertCheck(fs.existsSync(legacyFile), "data/questions.ts exists as shim");
const legacyContent = fs.readFileSync(legacyFile, "utf-8");
const legacyLines = legacyContent.split("\n").length;
assertCheck(legacyLines < 200, `data/questions.ts purged to clean shim (< 200 lines, got ${legacyLines} lines)`);
assertCheck(legacyContent.includes("src/data/questions.json"), "data/questions.ts correctly re-exports new questions.json");

// -------------------------------------------------------------
// Final Summary
// -------------------------------------------------------------
console.log("\n=======================================================");
console.log(`  ALL ${passedChecks} CHECKS PASSED SUCCESSFULLY (0 FAILURES)`);
console.log("=======================================================\n");
process.exit(0);
