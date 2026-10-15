import Link from "next/link";

export default function Logo({ onDark = false, compact = false }) {
  const ink = onDark ? "text-white" : "text-ink-strong";
  const bar = onDark ? "bg-white" : "bg-black";

  return (
    <Link href="/" className="flex items-center gap-2 select-none shrink-0">
      <span className={`flex items-center font-black tracking-tighter leading-none font-brand ${ink}`}>
        <span className="text-3xl sm:text-4xl">T</span>
        <span className="relative mx-0.5 inline-flex h-7 w-4 flex-col justify-between sm:h-8">
          <span className={`h-1.5 w-full rounded-sm sm:h-2 ${bar}`} />
          <span className="h-1 w-full rounded-sm bg-brand sm:h-1.5" />
          <span className="h-1.5 w-full rounded-sm bg-brand sm:h-2" />
        </span>
        <span className="text-3xl sm:text-4xl">CH</span>
        <span className="ml-1 text-3xl italic text-brand sm:text-4xl">2</span>
        <span className="relative text-3xl sm:text-4xl">
          4
          <i className="fa-solid fa-bolt absolute -top-1 -right-2 text-xs text-brand" />
        </span>
      </span>
      {compact ? null : (
        <span className="ml-3 hidden flex-col border-l-2 border-slate-300 pl-2.5 xl:flex">
          <span className="text-[9px] font-bold uppercase leading-tight tracking-widest text-ink-muted">
            Where Technology
          </span>
          <span className="text-[9px] font-black uppercase leading-tight tracking-widest text-brand">
            Meets Trust
          </span>
        </span>
      )}
    </Link>
  );
}
