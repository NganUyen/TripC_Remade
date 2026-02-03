"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { CategorySlider } from "./CategorySlider";
import { ChatWidget } from "./ChatWidget";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCustomLayout = pathname?.startsWith("/ping") || pathname?.startsWith("/help-center");
  const isPayment = pathname?.startsWith("/payment");

  if (isCustomLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {!isPayment && <CategorySlider />}
      {children}
      <ChatWidget />
    </>
  );
}
