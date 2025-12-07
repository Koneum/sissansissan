import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/users/[id]/push-token - Save push token
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { pushToken } = await request.json();

    if (!pushToken) {
      return NextResponse.json(
        { success: false, error: "Push token is required" },
        { status: 400 }
      );
    }

    // Update user's push token
    await prisma.user.update({
      where: { id },
      data: {
        // Store push token in metadata or a dedicated field
        // For now, we'll use a simple approach
        updatedAt: new Date(),
      },
    });

    // Store in a dedicated push tokens table if exists, or create one
    // For now, we'll use siteSettings as a simple storage
    const existingTokens = await prisma.siteSettings.findUnique({
      where: { key: "push_tokens" },
    });

    let tokens: Record<string, string> = {};
    if (existingTokens?.value) {
      try {
        tokens = typeof existingTokens.value === 'string' 
          ? JSON.parse(existingTokens.value) 
          : existingTokens.value as Record<string, string>;
      } catch {
        tokens = {};
      }
    }

    // Save token associated with user ID
    tokens[id] = pushToken;

    await prisma.siteSettings.upsert({
      where: { key: "push_tokens" },
      update: { value: tokens },
      create: { key: "push_tokens", value: tokens },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save push token" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/push-token - Remove push token
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingTokens = await prisma.siteSettings.findUnique({
      where: { key: "push_tokens" },
    });

    if (existingTokens?.value) {
      let tokens: Record<string, string> = {};
      try {
        tokens = typeof existingTokens.value === 'string' 
          ? JSON.parse(existingTokens.value) 
          : existingTokens.value as Record<string, string>;
      } catch {
        tokens = {};
      }

      // Remove token for this user
      delete tokens[id];

      await prisma.siteSettings.update({
        where: { key: "push_tokens" },
        data: { value: tokens },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing push token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove push token" },
      { status: 500 }
    );
  }
}
