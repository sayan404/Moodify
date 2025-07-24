import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const earlyAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = earlyAccessSchema.parse(body);

    // Check if email already registered
    const existingUser = await prisma.earlyAccessUser.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered for early access' },
        { status: 400 }
      );
    }

    // Create new early access registration
    const newRegistration = await prisma.earlyAccessUser.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
      },
    });

    return NextResponse.json({
      message: 'Successfully registered for early access',
      user: {
        id: newRegistration.id,
        email: newRegistration.email,
        name: newRegistration.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Early access registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register for early access' },
      { status: 500 }
    );
  }
} 