import { cn } from "@/lib/utils";

export function PageFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker ? <div className="label-caps mb-1">{kicker}</div> : null}
        <h1 className="text-xl font-medium tracking-tight md:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Surface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-surface", className)}>
      {children}
    </div>
  );
}

export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0 px-4 py-3">
      <div className="label-caps">{label}</div>
      <div className="mt-1 font-mono text-lg tracking-wide text-foreground">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function KindPill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "brand" | "warn" | "ok";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-sm border px-1.5 font-mono text-[10px] tracking-wide",
        tone === "brand" && "border-brand/40 bg-brand/10 text-brand",
        tone === "warn" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "ok" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        tone === "default" && "border-border bg-background text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
