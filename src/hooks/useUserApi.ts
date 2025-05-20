import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  userId: string;
  email: string;
  name: string;
  isPro: boolean;
  proSince: string | null;
  lemonSqueezyCustomerId: string | null;
  lemonSqueezyOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useUserApi() {
  const { userId, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId || !isSignedIn) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  const createOrUpdateUser = useCallback(async () => {
    if (!userId || !isSignedIn || !clerkUser) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.fullName || clerkUser.username || 'Anonymous',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create/update user');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn, clerkUser]);

  const updateProStatus = useCallback(async (isPro: boolean, lemonSqueezyCustomerId?: string, lemonSqueezyOrderId?: string) => {
    if (!userId || !isSignedIn) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPro,
          lemonSqueezyCustomerId,
          lemonSqueezyOrderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update pro status');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  // Fetch user on mount or when auth state changes
  useEffect(() => {
    if (userId && isSignedIn) {
      fetchUser().then((userData) => {
        // If user doesn't exist, create it
        if (!userData) {
          createOrUpdateUser();
        }
      });
    } else {
      setUser(null);
    }
  }, [userId, isSignedIn, fetchUser, createOrUpdateUser]);

  return {
    user,
    isLoading,
    error,
    fetchUser,
    createOrUpdateUser,
    updateProStatus,
  };
} 