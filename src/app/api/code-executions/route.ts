import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { LANGUAGE_CONFIG } from "@/app/dashboard/_constants"; // Import language config

// GET /api/code-executions - Get all code executions for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const codeExecutions = await prisma.codeExecution.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(codeExecutions);
  } catch (error) {
    console.error("Error fetching code executions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/code-executions - Execute code via Piston and save the record
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let executionResult = {
    // Define structure for saving
    output: null as string | null,
    error: null as string | null,
  };

  try {
    const body = await req.json();
    const { language, code, input } = body;

    if (
      !language ||
      typeof language !== "string" ||
      !code ||
      typeof code !== "string"
    ) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 }
      );
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }

    // --- Call Piston API ---
    const pistonResponse = await fetch(
      "https://emkc.org/api/v2/piston/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: langConfig.pistonRuntime.language,
          version: langConfig.pistonRuntime.version,
          files: [{ content: code }],
          stdin: input || "", // Pass input to stdin
        }),
      }
    );

    if (!pistonResponse.ok) {
      // Handle non-2xx responses from Piston itself
      const errorText = await pistonResponse.text();
      console.error(
        `Piston API Error (${pistonResponse.status}): ${errorText}`
      );
      executionResult.error = `Code execution service error (Status: ${pistonResponse.status}). Please try again later.`;
      // Still save the record, but with the error
    } else {
      const pistonData = await pistonResponse.json();

      if (pistonData.message) {
        // Handle API-level errors from Piston
        executionResult.error = pistonData.message;
      } else if (pistonData.run?.code !== 0) {
        // Handle runtime/compile errors
        executionResult.error =
          pistonData.run.stderr ||
          pistonData.run.output ||
          "Execution failed with non-zero exit code";
      } else {
        // Success
        executionResult.output = pistonData.run?.output?.trim() ?? "";
      }
    }
    // --- End Piston API Call ---

    // --- Save Execution Record to DB ---
    try {
      await prisma.codeExecution.create({
        data: {
          userId,
          language,
          code,
          // input, // Optionally save input if schema supports it
          output: executionResult.output,
          error: executionResult.error,
        },
      });
    } catch (dbError) {
      console.error("Error saving code execution to DB:", dbError);
      // Log DB error but still return Piston result to user if available
      // Potentially return a specific error if saving is critical
    }
    // --- End DB Save ---

    // Return the execution result (output/error) from Piston
    return NextResponse.json({
      output: executionResult.output,
      error: executionResult.error,
    });
  } catch (error) {
    // Catch errors from JSON parsing, Piston fetch network issues, etc.
    console.error("Error processing code execution request:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Internal server error during execution";
    // Attempt to save with the error if possible
    try {
      const body = await req.json().catch(() => ({})); // Try to get body again, default empty
      await prisma.codeExecution
        .create({
          data: {
            userId: userId || "unknown", // Fallback needed
            language: body?.language || "unknown",
            code: body?.code || "",
            output: null,
            error: message.substring(0, 1000), // Limit error length
          },
        })
        .catch((dbError) =>
          console.error("Failed to save error execution record:", dbError)
        );
    } catch (saveErr) {
      /* Ignore errors during error saving */
    }

    return NextResponse.json({ error: message, output: null }, { status: 500 });
  }
}
