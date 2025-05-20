import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET /api/code-executions/:id - Get a specific code execution
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const codeExecution = await prisma.codeExecution.findUnique({
      where: { id },
    });

    if (!codeExecution) {
      return NextResponse.json({ error: 'Code execution not found' }, { status: 404 });
    }

    if (codeExecution.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(codeExecution);
  } catch (error) {
    console.error('Error fetching code execution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 