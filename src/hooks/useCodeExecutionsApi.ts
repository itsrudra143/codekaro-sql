import { useAuth } from "@clerk/nextjs";
import { useState, useCallback } from "react";

interface CodeExecution {
  id: string;
  userId: string;
  language: string;
  code: string;
  output: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useCodeExecutionsApi() {
  const { userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveExecution = useCallback(async (data: {
    language: string;
    code: string;
    output?: string;
    error?: string;
  }) => {
    if (!userId || !isSignedIn) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/code-executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save code execution');
      }

      const executionData = await response.json();
      return executionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  const getExecutions = useCallback(async () => {
    if (!userId || !isSignedIn) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/code-executions');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch code executions');
      }

      const executionsData = await response.json();
      return executionsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  const getExecution = useCallback(async (id: string) => {
    if (!userId || !isSignedIn) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/code-executions/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch code execution');
      }

      const executionData = await response.json();
      return executionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  return {
    isLoading,
    error,
    saveExecution,
    getExecutions,
    getExecution,
  };
} 