"use client";
import React from "react";
import Link from "next/link";
import { Blocks } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const Header = () => {
  const { user } = useUser();
  return (
    <header className="bg-[#0a0a0f]/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg mx-6 my-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group relative">
          <div
            className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 
              group-hover:opacity-100 transition-all duration-500 blur-xl"
          />

          <div
            className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1
              ring-white/10 group-hover:ring-white/20 transition-all"
          >
            <Blocks className="size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          <div className="flex flex-col">
            <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
              Code-Karo
            </span>
            <span className="block text-xs text-blue-400/60 font-medium">
              Interactive Code Editor
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-8">
          <Link
            href="/"
            className="relative text-gray-300 text-lg font-medium transition-all duration-300
              hover:text-white hover:drop-shadow-[0_0_10px_#3b82f6]"
          >
            Home
          </Link>
          <Link
            href="/features"
            className="relative text-gray-300 text-lg font-medium transition-all duration-300
              hover:text-white hover:drop-shadow-[0_0_10px_#3b82f6]"
          >
            Features
          </Link>
          <Link
            href="/contact"
            className="relative text-gray-300 text-lg font-medium transition-all duration-300
              hover:text-white hover:drop-shadow-[0_0_10px_#3b82f6]"
          >
            Contact
          </Link>
        </nav>

        {!user ? (
          <Link href="/sign-in">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
              Signup
            </button>
          </Link>
        ) : (
          <UserButton />
        )}
      </div>
    </header>
  );
};

export default Header;
