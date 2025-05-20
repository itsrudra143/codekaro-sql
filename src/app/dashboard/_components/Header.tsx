"use client";
import Link from "next/link";
import { Blocks, Code2, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import RunButton from "./RunButton";
import HeaderProfileBtn from "./HeaderProfileBtn";
import React, { useEffect, useState, useCallback } from "react";

const fetchUserProStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/users/status");
    if (!response.ok) {
      // If response is not OK (e.g. 401, 500), assume not Pro or handle error
      console.error(`Error fetching pro status: ${response.status}`);
      const errorData = await response.json().catch(() => null); // Try to parse error, ignore if not JSON
      if (errorData && typeof errorData.isPro === 'boolean') return errorData.isPro; // API might return isPro:false on error
      return false;
    }
    const data = await response.json();
    return data.isPro || false; // Ensure it returns a boolean
  } catch (error) {
    console.error("Failed to fetch user pro status:", error);
    return false; // Default to not Pro on network error or other issues
  }
};

function Header() {
  const { user, isSignedIn } = useUser();
  const [isProUser, setIsProUser] = useState(false);

  const checkProStatus = useCallback(async () => {
    if (isSignedIn) {
      const proStatus = await fetchUserProStatus();
      setIsProUser(proStatus);
    } else {
      setIsProUser(false); // Not pro if not signed in
    }
  }, [isSignedIn]);

  useEffect(() => {
    checkProStatus();
  }, [checkProStatus]);

  return (
    <div className="relative z-10">
      <div
        className="flex items-center justify-between 
        bg-[#0a0a0f]/80 backdrop-blur-xl p-4 sm:p-6 mb-4 rounded-lg"
      >
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group relative">
            <div
              className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 
                group-hover:opacity-100 transition-all duration-500 blur-xl"
            />
            <div
              className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1
              ring-white/10 group-hover:ring-white/20 transition-all"
            >
              <Blocks className="size-5 sm:size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="block text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                Code-Karo
              </span>
              <span className="block text-xs text-blue-400/60 font-medium">
                Interactive Code Editor
              </span>
            </div>
          </Link>
          <Link
            href="/snippets"
            className="relative group flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 
                hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 
                to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
            <span
              className="text-sm font-medium relative z-10 group-hover:text-white
               transition-colors"
            >
              Snippets
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSelector />
            <LanguageSelector hasAccess={isProUser} />
          </div>

          {!isProUser && isSignedIn && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
                to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 
                transition-all duration-300 text-sm font-medium text-amber-400/90 hover:text-amber-300"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pro</span>
            </Link>
          )}

          {isSignedIn && (
            <RunButton />
          )}

          <div className="pl-2 sm:pl-3 border-l border-gray-800">
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
