import Link from "next/link";

export default function Logo({ onDark = false, compact = false, alwaysWordmark = false }) {
  return (
    <Link href="/" className="flex shrink-0 items-center select-none" aria-label="TECH 24 home">
      <img
        src="/brand/tech247-logo.png?v=6"
        alt="TECH 24 — Where Technology Meets Trust"
        width={compact ? 140 : 180}
        height={compact ? 48 : 62}
        className={`block h-auto w-auto object-contain ${
          compact ? "max-h-10 max-w-[9rem] sm:max-h-11 sm:max-w-[10rem]" : "max-h-12 max-w-[11.5rem] sm:max-h-14 sm:max-w-[13.5rem]"
        }`}
        decoding="async"
      />
    </Link>
  );
}
