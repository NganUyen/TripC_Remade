import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";
import { SyncSupabaseUser } from "@/components/SyncSupabaseUser";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TripC SuperApp - Category Slider Variant 2.9",
  description: "TripC Pro - Your all-in-one travel companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TripC",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5b21b6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
        <Providers>
          <SyncSupabaseUser />
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
        <Toaster
          position="bottom-left"
          toastOptions={{
            classNames: {
              error: "bg-red-500 text-white border-red-600",
            },
          }}
        />
      </body>
    </html>
  );
}
