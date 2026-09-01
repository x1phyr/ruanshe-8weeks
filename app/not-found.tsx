import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="label-caps">404</div>
      <h1 className="mt-2 text-xl font-medium">没有这个页面</h1>
      <p className="mt-2 text-sm text-muted-foreground">回到仪表盘继续今天的 45 分钟。</p>
      <Link href="/" className="mt-5 text-sm text-brand hover:underline">
        回今日
      </Link>
    </div>
  );
}
