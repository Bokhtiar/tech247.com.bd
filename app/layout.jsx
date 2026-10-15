import { Suspense } from "react";
import { Inter, Rajdhani } from "next/font/google";
import SiteFrame from "@/components/layout/SiteFrame";
import { getBrands } from "@/service/brands";
import { getCategories } from "@/service/categories";
import { getProducts } from "@/service/products";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-rajdhani",
});

const themeBoot = `(function(){try{if(localStorage.getItem("tech24-theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export const metadata = {
  title: {
    default: "TECH24 | Where Technology Meets Trust",
    template: "%s · TECH24",
  },
  description: "Leading computer and technology retailer in Bangladesh. Authentic hardware, PC builder, warranty, and nationwide delivery.",
};

async function CatalogShell({ children }) {
  const [categories, products, brands] = await Promise.all([
    getCategories(),
    getProducts({ per_page: 100 }),
    getBrands(),
  ]);

  return (
    <SiteFrame categories={categories} products={products} brands={brands}>
      {children}
    </SiteFrame>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${rajdhani.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="flex min-h-screen flex-col bg-muted font-sans text-ink antialiased selection:bg-brand selection:text-white" suppressHydrationWarning>
        <Suspense fallback={<SiteFrame><p className="px-4 py-16 text-center text-sm text-ink-muted">Loading catalog...</p></SiteFrame>}>
          <CatalogShell>{children}</CatalogShell>
        </Suspense>
      </body>
    </html>
  );
}
