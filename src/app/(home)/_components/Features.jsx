"use client";
import React from "react";

const features = [
  {
    emoji: "💻",
    title: "Online IDE with Multi-Language Support",
    description:
      "Code in 10 different languages—from Python to Go—all in one browser-based environment.",
  },
  {
    emoji: "🎨",
    title: "5 VSCode Themes",
    description:
      "Personalize your coding experience with five visually distinct themes.",
  },
  {
    emoji: "✨",
    title: "Smart Output Handling",
    description:
      "Instantly see success or error states for every code run—no more guessing.",
  },
  {
    emoji: "💎",
    title: "Flexible Pricing",
    description:
      "Choose between Free and Pro plans, so you only pay for what you need.",
  },
  {
    emoji: "🤝",
    title: "Community-Driven Sharing",
    description:
      "Share, discover, and collaborate on snippets with developers worldwide.",
  },
  {
    emoji: "🔍",
    title: "Advanced Filtering & Search",
    description:
      "Quickly find the exact snippet you need using powerful search tools.",
  },
  {
    emoji: "👤",
    title: "Personal Profile & History",
    description:
      "Track every execution in your own profile to monitor growth and progress.",
  },
  {
    emoji: "📊",
    title: "Comprehensive Statistics",
    description:
      "Dive into your performance data and glean insights from detailed analytics.",
  },
  {
    emoji: "⚙️",
    title: "Customizable Font Size",
    description:
      "Adjust editor font sizes to maintain comfort and readability while you code.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="py-20 text-white text-center px-6"
    >
      <h2 className="text-4xl font-bold text-white mb-6">
        Amazing Features 🚀
      </h2>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12">
        Experience our innovative features and unlock the future of coding—where
        every keystroke sparks creativity and endless possibilities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-xl shadow-sm shadow-blue-300 
                       hover:shadow-lg hover:shadow-blue-400  
                       transform transition-transform duration-300 ease-in-out 
                       hover:-translate-y-2 flex flex-col items-center"
          >
            <span className="text-3xl text-blue-400 mb-4">{feature.emoji}</span>
            <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
            <p className="text-gray-300 mt-2">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
