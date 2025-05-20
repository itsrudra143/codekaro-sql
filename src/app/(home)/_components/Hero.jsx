"use client";
import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center py-20 px-4 text-white">
      {/* Heading with Glow Effect */}
      <h1 className="text-5xl md:text-6xl font-bold text-white">
        <span className="text-white">Code.</span>{" "}
        <span className="text-blue-400">Share.</span>{" "}
        <span className="text-blue-500 drop-shadow-[0_0_10px_#3b82f6]">
          Analyse.
        </span>
      </h1>

      {/* Subheading */}
      <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl">
        Turn your coding passion into progress by sharing your work and tracking
        every success along the way.
      </p>

      {/* Call to Action Button */}
      <Link href="/dashboard">
        <button className="mt-6 px-6 py-3 text-lg font-semibold bg-blue-500 hover:bg-blue-700 transition-all rounded-lg flex items-center gap-2">
          Start Coding Here 🚀
        </button>
      </Link>

      {/* Image of Code Editor */}
      <div className="mt-10">
        <img
          src="/Code-editor.png"
          alt="Code Editor Preview"
          className="rounded-xl shadow-lg w-[1200px]"
        />
      </div>

      {/* Glow effect styling */}
      <style jsx>{`
        .glow-text {
          text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </section>
  );
};

export default Hero;
