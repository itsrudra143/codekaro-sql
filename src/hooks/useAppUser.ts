import { useUser as useClerkUser } from "@clerk/nextjs";
import { useUser } from "@/components/providers/UserProvider";

export function useAppUser() {
  const { user: clerkUser, isSignedIn } = useClerkUser();
  const { user: appUser, isLoading, error, updateProStatus } = useUser();

  return {
    user: appUser,
    clerkUser,
    isSignedIn,
    isLoading,
    error,
    updateProStatus,
    isPro: appUser?.isPro || false,
  };
} 