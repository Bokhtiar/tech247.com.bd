export default function EmptyProducts({ title = "No products found" }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-12 text-center">
      <i className="fa-solid fa-box-open text-3xl text-ink-muted" />
      <p className="mt-3 text-sm font-bold text-ink-strong">{title}</p>
    </div>
  );
}
