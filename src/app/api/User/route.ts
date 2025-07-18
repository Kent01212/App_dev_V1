// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAppSession } from '@/lib/auth';

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newUser = await prisma.user.create({
    data: {
      password: data.password,
      email: data.email,
      birth: data.birth
    },
  });
  return NextResponse.json(newUser);
}

export async function PATCH(req: NextRequest) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Don't allow updating certain fields this way
    delete data.id;
    delete data.email;
    delete data.password;
    delete data.hash;

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(session.user.id, 10),
      },
      data: {
        username: data.username,
        birth: data.birth ? new Date(data.birth) : null,
        // gender is not in the schema, so we ignore it.
        icon: data.icon,
        title: data.title, // Add this line
        // Add other fields like 'year' or 'class' if they are editable
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
