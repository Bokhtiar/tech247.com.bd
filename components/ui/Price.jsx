import { formatBDT } from "@/lib/format";

export default function Price({ value, className = "" }) {
  return <span className={`badge-bdt ${className}`}>{formatBDT(value)}</span>;
}
