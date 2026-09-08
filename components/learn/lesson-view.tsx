"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Surface } from "@/components/ui-bits";
import { pad2 } from "@/lib/dates";
import type { Lesson, LessonBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

function Callout({
  tone,
  title,
  body,
}: {
  tone: "tip" | "trap" | "exam";
  title: string;
  body: string;
}) {
  const label = tone === "tip" ? "TIP" : tone === "trap" ? "TRAP" : "EXAM";
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5",
        tone === "trap" && "border-destructive/30 bg-destructive/5",
        tone === "exam" && "border-brand/30 bg-brand/5",
        tone === "tip" && "border-border bg-background",
      )}
    >
      <div className="label-caps">
        {label} · {title}
      </div>
      <p className="mt-1 text-sm leading-6">{body}</p>
    </div>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-sm leading-7 text-foreground/90">{block.text}</p>;
    case "h2":
      return (
        <h2 className="pt-2 text-[15px] font-medium tracking-tight">{block.text}</h2>
      );
    case "h3":
      return <h3 className="text-sm font-medium text-foreground/90">{block.text}</h3>;
    case "ul":
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-6">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <Callout
          tone={block.callout.tone}
          title={block.callout.title}
          body={block.callout.body}
        />
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            {block.table.caption ? (
              <caption className="sr-only">{block.table.caption}</caption>
            ) : null}
            <thead className="bg-background text-muted-foreground">
              <tr>
                {block.table.headers.map((header) => (
                  <th key={header} className="px-3 py-2 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 align-top leading-6">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "rank":
      return (
        <div className="rounded-md border border-border bg-background px-3 py-2.5">
          <div className="label-caps">{block.title}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {block.items.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="rounded-sm border border-border px-2 py-0.5 text-xs">
                  {item}
                </span>
                {i < block.items.length - 1 ? (
                  <span className="font-mono text-[10px] text-muted-foreground">→</span>
                ) : null}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{block.direction}</div>
        </div>
      );
    default:
      return null;
  }
}

function SkimStrip({
  keyPoints,
  minutes,
  defaultExpanded = true,
}: {
  keyPoints: string[];
  minutes: number;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  if (keyPoints.length === 0) return null;

  return (
    <Surface className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-hover/60"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="label-caps">30 秒速览</span>
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
              {pad2(keyPoints.length)} POINTS · {minutes} MIN
            </span>
          </div>
          {!open ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {keyPoints[0]}
              {keyPoints.length > 1 ? ` · +${keyPoints.length - 1}` : ""}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
        <span className="sr-only">{open ? "收起" : "展开"}</span>
      </button>
      {open ? (
        <ol className="space-y-1 border-t border-border px-3 py-2.5">
          {keyPoints.map((point, i) => (
            <li key={point} className="flex gap-2 text-[13px] leading-5">
              <span className="w-5 shrink-0 pt-px font-mono text-[10px] tracking-wide text-muted-foreground">
                {pad2(i + 1)}
              </span>
              <span className="min-w-0 text-foreground/90">{point}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </Surface>
  );
}

export function LessonView({
  lesson,
  defaultSkimExpanded = true,
}: {
  lesson: Lesson;
  /** Learn-day default: expanded. Collapse optional. */
  defaultSkimExpanded?: boolean;
}) {
  return (
    <div className="space-y-4">
      <SkimStrip
        keyPoints={lesson.keyPoints}
        minutes={lesson.minutes}
        defaultExpanded={defaultSkimExpanded}
      />
      {lesson.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
