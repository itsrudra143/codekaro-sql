"use client";

import { useUserApi } from "@/hooks/useUserApi";
import { createContext, useContext, ReactNode } from "react";

interface UserContextType {
  user: any;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<any>;
  createOrUpdateUser: () => Promise<any>;
  updateProStatus: (isPro: boolean, lemonSqueezyCustomerId?: string, lemonSqueezyOrderId?: string) => Promise<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userApi = useUserApi();

  return (
    <UserContext.Provider value={userApi}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 