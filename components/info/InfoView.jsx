"use client";

import Link from "next/link";

const pages = {
  terms: {
    title: "Terms of Service & Warranty Policy",
    body: "All computer hardware and consumer electronic devices distributed by TECH24 Bangladesh carry genuine manufacturer warranty under Bangladesh Computer Samity (BCS) policies. Warranty claims are handled at the IDB Bhaban and Multiplan service desks.",
  },
  delivery: {
    title: "Delivery Charges",
    body: "Inside Dhaka delivery is ৳60 and usually arrives within 24-48 hours. Outside Dhaka courier delivery is ৳120. Store pickup from IDB Bhaban or Multiplan Center is free.",
  },
};

export default function InfoView({ slug }) {
  const page = pages[slug] || pages.terms;

  return (
    <article className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-line bg-surface p-8 text-xs leading-relaxed text-ink-muted shadow-sm">
      <h1 className="text-2xl font-black tracking-tight text-ink-strong">{page.title}</h1>
      <p>{page.body}</p>
      <Link href="/" className="liquid-glass-red inline-block rounded-xl px-5 py-2.5 font-bold text-white">Return to Store</Link>
    </article>
  );
}
