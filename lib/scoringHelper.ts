/**
 * lib/scoringHelper.ts
 *
 * Intelligent fuzzy scoring engine for afternoon case study fill-in-the-blanks.
 * Performs trimmed, case-insensitive, punctuation-normalized comparison against
 * standard and acceptable answers, supporting multi-alias variants.
 */

export interface Blank {
  blankIndex: string | number;
  label?: string;
  standardAnswer: string;
  acceptableAnswers?: string[];
  points: number;
  explanation?: string;
}

export interface BlankEvaluation {
  isCorrect: boolean;
  earnedPoints: number;
  totalPoints: number;
  userAnswer: string;
}

export interface SubQuestion {
  subQuestionId?: string | number;
  prompt?: string;
  blanks: Blank[];
}

export interface CaseStudy {
  id: string;
  title: string;
  type: string;
  typeName?: string;
  year?: string;
  source?: string;
  background?: string;
  description?: string;
  scenario?: string;
  diagramDescription?: string;
  diagramSvgOrText?: string;
  relations?: string[];
  pseudocode?: string;
  solvingTips?: string[];
  subQuestions: SubQuestion[];
  examTips?: string;
}

export interface CaseEvaluation {
  totalEarned: number;
  totalPoints: number;
  isPassed: boolean;
  blankResults: Record<string, BlankEvaluation>;
  answeredCount: number;
  totalBlanks: number;
}

/**
 * Normalizes symbols, punctuation, quotes, case, and whitespace for fuzzy comparison.
 */
export function normalizeCompact(str: string | undefined | null): string {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/[，、]/g, ",")
    .replace(/[；]/g, ";")
    .replace(/[：]/g, ":")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[“”‘’']/g, '"')
    .replace(/;+$/g, "")
    .replace(/\s+/g, "");
}

/**
 * Evaluates a user input against a single blank.
 */
export function evaluateBlankAnswer(
  userAnswer: string | undefined | null,
  blank: Blank
): BlankEvaluation {
  const totalPoints = Number(blank?.points) || 0;

  if (!userAnswer || typeof userAnswer !== "string") {
    return {
      isCorrect: false,
      earnedPoints: 0,
      totalPoints,
      userAnswer: "",
    };
  }

  const cleanUser = userAnswer.trim();
  if (!cleanUser) {
    return {
      isCorrect: false,
      earnedPoints: 0,
      totalPoints,
      userAnswer: "",
    };
  }

  const normalizedUser = cleanUser.toLowerCase().replace(/\s+/g, " ");
  const compactUser = normalizeCompact(cleanUser);

  // Candidate pool: standardAnswer + acceptableAnswers
  const candidates: string[] = [
    blank.standardAnswer,
    ...(Array.isArray(blank.acceptableAnswers) ? blank.acceptableAnswers : []),
  ].filter(Boolean);

  const isMatch = candidates.some((candidate) => {
    const cleanCand = candidate.trim().toLowerCase().replace(/\s+/g, " ");
    if (cleanCand === normalizedUser) return true;
    if (compactUser && normalizeCompact(cleanCand) === compactUser) return true;

    // Support slash-separated aliases, e.g. "学生/教职工读者"
    if (cleanCand.includes("/")) {
      const parts = cleanCand.split("/").map((p) => p.trim());
      if (
        parts.some(
          (p) =>
            p === normalizedUser ||
            (compactUser && normalizeCompact(p) === compactUser)
        )
      ) {
        return true;
      }
    }

    // Support "或"-separated aliases, e.g. "大于0或>0"
    if (cleanCand.includes("或")) {
      const parts = cleanCand.split("或").map((p) => p.trim());
      if (
        parts.some(
          (p) =>
            p === normalizedUser ||
            (compactUser && normalizeCompact(p) === compactUser)
        )
      ) {
        return true;
      }
    }

    return false;
  });

  return {
    isCorrect: isMatch,
    earnedPoints: isMatch ? totalPoints : 0,
    totalPoints,
    userAnswer: cleanUser,
  };
}

/**
 * Evaluates all blanks across all subquestions in a case study.
 */
export function evaluateCase(
  caseStudy: CaseStudy | undefined | null,
  caseAnswers: Record<string, string> = {}
): CaseEvaluation {
  let totalEarned = 0;
  let totalPoints = 0;
  let answeredCount = 0;
  let totalBlanks = 0;
  const blankResults: Record<string, BlankEvaluation> = {};

  if (!caseStudy || !Array.isArray(caseStudy.subQuestions)) {
    return {
      totalEarned: 0,
      totalPoints: 15,
      isPassed: false,
      blankResults: {},
      answeredCount: 0,
      totalBlanks: 0,
    };
  }

  caseStudy.subQuestions.forEach((sq) => {
    if (Array.isArray(sq.blanks)) {
      sq.blanks.forEach((b) => {
        totalBlanks += 1;
        totalPoints += Number(b.points) || 0;

        const blankKey = String(b.blankIndex);
        const userText =
          caseAnswers[blankKey] ?? caseAnswers[String(b.blankIndex)] ?? "";
        if (typeof userText === "string" && userText.trim()) {
          answeredCount += 1;
        }

        const res = evaluateBlankAnswer(userText, b);
        blankResults[blankKey] = res;
        totalEarned += res.earnedPoints;
      });
    }
  });

  // Ruankao 60% threshold: 9 / 15 points
  const isPassed = totalEarned >= 9;

  return {
    totalEarned,
    totalPoints: totalPoints || 15,
    isPassed,
    blankResults,
    answeredCount,
    totalBlanks,
  };
}
