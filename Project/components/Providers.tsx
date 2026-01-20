"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        layout: {
          socialButtonsVariant: "blockButton",
          socialButtonsPlacement: "top",
        },
        variables: {
          colorPrimary: "#FF5E1F",
          colorBackground: "#fcfaf8",
          borderRadius: "1rem",
        },
        elements: {
          socialButtonsBlockButton: "w-full",
          formButtonPrimary: "bg-[#FF5E1F] hover:bg-[#E54810]",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
