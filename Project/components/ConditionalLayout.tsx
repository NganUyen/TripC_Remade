"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { CategorySlider } from "./CategorySlider";
import { ChatWidget } from "./ChatWidget";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDeveloperRoute = pathname?.startsWith("/ping");

  if (isDeveloperRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <CategorySlider />
      {children}
      <ChatWidget />
    </>
  );
}
