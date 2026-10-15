"use client";

import Link from "next/link";
import { useStore } from "@/components/store/StoreProvider";

export default function Footer() {
  const store = useStore();

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-900 pt-12 pb-8 text-xs text-slate-400">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="font-brand text-2xl font-black tracking-tighter text-white">
              T<span className="italic text-brand">ECH24</span>
            </div>
            <p className="max-w-sm leading-relaxed">
              TECH24 (&quot;Where Technology Meets Trust&quot;) is Bangladesh&apos;s premier technology destination for authentic computer hardware, laptops, desktop components, peripherals, and high-performance custom workstations.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-white">
              {["facebook-f", "youtube", "instagram", "linkedin-in"].map((icon) => (
                <a key={icon} href="https://tech24.com.bd" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 transition hover:bg-brand" aria-label={icon} suppressHydrationWarning>
                  <i className={`fa-brands fa-${icon}`} />
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider text-white uppercase">Customer Service</h2>
            <ul className="space-y-2">
              <li><button type="button" onClick={() => store.openUi("stores")} className="hover:text-white">Store Locator & Outlets</button></li>
              <li><Link href="/track" className="hover:text-white" suppressHydrationWarning>Track My Order</Link></li>
              <li><button type="button" onClick={() => store.openUi("emi")} className="hover:text-white">0% EMI Facilities</button></li>
              <li><Link href="/info/terms" className="hover:text-white" suppressHydrationWarning>Warranty & Returns</Link></li>
              <li><Link href="/info/delivery" className="hover:text-white" suppressHydrationWarning>Delivery Charges</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider text-white uppercase">Quick Hardware</h2>
            <ul className="space-y-2">
              <li><Link href="/pc-builder" className="font-semibold text-red-400 hover:text-white" suppressHydrationWarning>Online PC Builder</Link></li>
              <li><button type="button" onClick={() => store.browseCategory("processor")} className="hover:text-white">Processors & Motherboards</button></li>
              <li><button type="button" onClick={() => store.browseCategory("graphics-card")} className="hover:text-white">NVIDIA GeForce RTX 40-Series</button></li>
              <li><button type="button" onClick={() => store.browseCategory("laptop")} className="hover:text-white">Gaming & Productivity Laptops</button></li>
              <li><button type="button" onClick={() => store.browseCategory("monitor")} className="hover:text-white">High-Refresh Monitors</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider text-white uppercase">Contact Us</h2>
            <p className="flex items-center gap-2 font-semibold text-slate-300">
              <i className="fa-solid fa-headset text-brand" /> 16724 (10am - 8pm)
            </p>
            <p>Email: support@tech24.com.bd</p>
            <p>Corporate Office: Plot 18, Block B, Panthapath, Dhaka-1205</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Accepted Payment Methods:</span>
            <span className="rounded bg-[#D12053] px-2.5 py-1 text-[11px] font-bold text-white">bKash</span>
            <span className="rounded bg-[#F7921E] px-2.5 py-1 text-[11px] font-bold text-white">Nagad</span>
            <span className="rounded bg-[#8C3494] px-2.5 py-1 text-[11px] font-bold text-white">Rocket</span>
            <span className="rounded bg-[#1A1F71] px-2.5 py-1 text-[11px] font-black text-white italic">VISA</span>
            <span className="rounded bg-[#EB001B] px-2.5 py-1 text-[11px] font-bold text-white">MasterCard</span>
            <span className="rounded bg-[#006FCF] px-2.5 py-1 text-[11px] font-bold text-white">AMEX</span>
            <span className="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white">Cash on Delivery</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 TECH24 Bangladesh Ltd. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
