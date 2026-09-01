import { KindPill, Surface } from "@/components/ui-bits";
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

export function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-4">
      <Surface className="p-3">
        <div className="label-caps">Key points · {lesson.minutes} MIN</div>
        <ul className="mt-2 space-y-1.5">
          {lesson.keyPoints.map((point) => (
            <li key={point} className="flex gap-2 text-sm leading-6">
              <KindPill tone="brand">·</KindPill>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Surface>
      {lesson.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
