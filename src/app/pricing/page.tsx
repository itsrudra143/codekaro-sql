"use client";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import React, { useEffect, useState, useCallback } from "react";
import ProPlanView from "./_components/ProPlanView"; // Assuming this component exists or will be created
import NavigationHeader from "@/components/NavigationHeader"; // Adjust path as needed
import { ENTERPRISE_FEATURES, FEATURES } from "./_constants"; // Assuming these exist or will be created
import { Star } from "lucide-react";
import FeatureCategory from "./_components/FeatureCategory"; // Assuming these exist or will be created
import FeatureItem from "./_components/FeatureItem"; // Assuming these exist or will be created
import UpgradeButton from "./_components/UpgradeButton"; // Assuming this component exists or will be created
import LoginButton from "@/components/LoginButton"; // Adjust path as needed

const fetchUserProStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/users/status");
    if (!response.ok) {
      console.error(`Error fetching pro status: ${response.status}`);
      const errorData = await response.json().catch(() => null); // Try to parse error, ignore if not JSON
      if (errorData && typeof errorData.isPro === 'boolean') return errorData.isPro; // API might return isPro:false on error
      return false;
    }
    const data = await response.json();
    return data.isPro || false;
  } catch (error) {
    console.error("Failed to fetch user pro status:", error);
    return false;
  }
};

function PricingPage() {
  const { user, isSignedIn } = useUser();
  const [isProUser, setIsProUser] = useState<boolean | null>(null);

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

  if (isProUser === null && isSignedIn) {
    // Optional: Add a loading state
    return (
      <div className="relative min-h-screen bg-[#0a0a0f] selection:bg-blue-500/20 selection:text-blue-200">
        <NavigationHeader />
        <div className="flex justify-center items-center h-[calc(100vh-200px)] text-white">
          Loading pricing...
        </div>
      </div>
    );
  }

  if (isProUser) {
    return <ProPlanView />;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] selection:bg-blue-500/20 selection:text-blue-200">
      <NavigationHeader />
      <main className="relative pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="relative inline-block">
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-10" />
              <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-8">
                Elevate Your <br />
                Development Experience
              </h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join the next generation of developers with our professional suite of tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {ENTERPRISE_FEATURES.map((feature) => (
              <div key={feature.label} className="group relative bg-gradient-to-b from-[#12121a] to-[#0a0a0f] rounded-2xl p-6 hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4 ring-1 ring-gray-800/60 group-hover:ring-blue-500/20">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {feature.label}
                  </h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10" />
            <div className="relative bg-[#12121a]/90 backdrop-blur-xl rounded-2xl">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <div className="relative p-8 md:p-12">
                <div className="text-center mb-12">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-gray-800/60 mb-6">
                    <Star className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-semibold text-white mb-4">
                    Lifetime Pro Access
                  </h2>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-2xl text-gray-400">₹</span>
                    <span className="text-6xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text">
                      500
                    </span>
                    <span className="text-xl text-gray-400">one-time</span>
                  </div>
                  <p className="text-gray-400 text-lg">
                    Unlock the full potential of Code-Karo
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 mb-12">
                  <FeatureCategory label="Development">
                    {FEATURES.development.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureCategory>
                  <FeatureCategory label="Collaboration">
                    {FEATURES.collaboration.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureCategory>
                  <FeatureCategory label="Deployment">
                    {FEATURES.deployment.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureCategory>
                </div>

                <div className="flex justify-center">
                  <SignedIn>
                    <UpgradeButton />
                  </SignedIn>
                  <SignedOut>
                    <LoginButton />
                  </SignedOut>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default PricingPage; 