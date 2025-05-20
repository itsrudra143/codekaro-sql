import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-blue-400 transition">
            CodeKaro
          </Link>
          <Link href="/" className="text-sm hover:text-blue-400 transition">
            ← Back to Home
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignIn appearance={{ baseTheme: dark }} />
        </div>
      </div>
    </div>
  );
}
