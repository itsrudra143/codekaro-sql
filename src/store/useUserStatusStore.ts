import { create } from "zustand";

interface UserStatusState {
  isPro: boolean | null;
  isLoadingProStatus: boolean;
  fetchUserProStatus: (userId: string | null) => Promise<void>;
  setProStatus: (isPro: boolean) => void;
  clearProStatus: () => void;
}

const getInitialProStatus = (): boolean | null => {
  if (typeof window === "undefined") {
    return null; // No local storage on server
  }
  const storedStatus = localStorage.getItem("user-pro-status");
  return storedStatus ? JSON.parse(storedStatus) : null;
};

export const useUserStatusStore = create<UserStatusState>((set, get) => ({
  isPro: getInitialProStatus(),
  isLoadingProStatus: false,

  fetchUserProStatus: async (userId: string | null) => {
    if (!userId) {
      // If no userId (e.g., signed out), clear status
      get().clearProStatus();
      return;
    }

    set({ isLoadingProStatus: true });

    // Attempt to load from local storage first for immediate UI update (if not already loaded by getInitialProStatus)
    // This covers cases where the store is initialized after the initial check might have run.
    const localStatus = getInitialProStatus();
    if (localStatus !== null && get().isPro === null) {
      set({ isPro: localStatus });
    }

    try {
      const response = await fetch("/api/users/status"); // This API should ideally be user-specific if called with auth
      if (!response.ok) {
        // If response indicates not pro (e.g., 403, or a specific error structure)
        // or if any other error, treat as not pro for now and let UI reflect it.
        console.warn(
          `Error fetching pro status: ${response.status} ${response.statusText}`
        );
        const errorData = await response.json().catch(() => null);
        const newIsPro =
          errorData && typeof errorData.isPro === "boolean"
            ? errorData.isPro
            : false;
        set({ isPro: newIsPro, isLoadingProStatus: false });
        if (typeof window !== "undefined") {
          localStorage.setItem("user-pro-status", JSON.stringify(newIsPro));
        }
        return;
      }
      const data: { isPro: boolean } = await response.json();
      const newIsPro = data.isPro || false;
      set({ isPro: newIsPro, isLoadingProStatus: false });
      if (typeof window !== "undefined") {
        localStorage.setItem("user-pro-status", JSON.stringify(newIsPro));
      }
    } catch (error) {
      console.error("Failed to fetch user pro status:", error);
      // On critical fetch error, default to false and update localStorage
      set({ isPro: false, isLoadingProStatus: false });
      if (typeof window !== "undefined") {
        localStorage.setItem("user-pro-status", JSON.stringify(false));
      }
    }
  },

  setProStatus: (isPro: boolean) => {
    set({ isPro, isLoadingProStatus: false });
    if (typeof window !== "undefined") {
      localStorage.setItem("user-pro-status", JSON.stringify(isPro));
    }
  },

  clearProStatus: () => {
    set({ isPro: null, isLoadingProStatus: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("user-pro-status");
    }
  },
}));
