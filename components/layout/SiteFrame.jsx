"use client";

import { Suspense } from "react";
import { StoreProvider } from "@/components/store/StoreProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Overlays from "@/components/layout/Overlays";

export default function SiteFrame({ categories = [], products = [], brands = [], children }) {
  return (
    <StoreProvider categories={categories} products={products} brands={brands}>
      <Suspense fallback={<div className="h-36 border-b border-line bg-surface" />}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1720px] flex-1 px-2 py-4 sm:px-4 sm:py-6">{children}</main>
      <Footer />
      <Overlays />
    </StoreProvider>
  );
}
