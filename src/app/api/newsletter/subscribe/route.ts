import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().default("blog"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = subscribeSchema.parse(body);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ message: "Already subscribed" });
      }
      // Reactivate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: "active", source },
      });
      return NextResponse.json({ message: "Subscription reactivated" });
    }

    await prisma.newsletterSubscriber.create({
      data: { email, source },
    });

    return NextResponse.json({ message: "Successfully subscribed" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
