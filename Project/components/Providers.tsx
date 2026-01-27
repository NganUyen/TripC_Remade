"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Please add it to your .env.local file."
  );
}

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.warn(
    "Missing NEXT_PUBLIC_CONVEX_URL. Convex features will be disabled."
  );
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
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
