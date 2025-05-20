"use client";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { UserProvider } from "./UserProvider";

function ApiClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <UserProvider>
        {children}
      </UserProvider>
    </ClerkProvider>
  );
}

export default ApiClientProvider; 