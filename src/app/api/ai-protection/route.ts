import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlan } from "@/lib/admin";

// AI Protection source categories
const AI_TRAINING_SOURCES = [
  "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
  "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI"
];
const FACIAL_RECOGNITION_SOURCES = [
  "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE", "YANDEX_IMAGES"
];
const VOICE_CLONING_SOURCES = ["ELEVENLABS", "RESEMBLE_AI", "MURF_AI"];
const ALL_AI_SOURCES = [...AI_TRAINING_SOURCES, ...FACIAL_RECOGNITION_SOURCES, ...VOICE_CLONING_SOURCES];

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user info for plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });
    const userPlan = getEffectivePlan(user?.email, user?.plan || "FREE");

    // Fetch AI-related exposures by category
    const [aiTrainingExposures, facialRecognitionExposures, voiceCloningExposures, optedOutCount] = await Promise.all([
      prisma.exposure.findMany({
        where: { userId, source: { in: AI_TRAINING_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: {
          id: true,
          source: true,
          sourceUrl: true,
          sourceName: true,
          dataType: true,
          dataPreview: true,
          severity: true,
          status: true,
          isWhitelisted: true,
          firstFoundAt: true,
          requiresManualAction: true,
          manualActionTaken: true,
        },
      }),
      prisma.exposure.findMany({
        where: { userId, source: { in: FACIAL_RECOGNITION_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: {
          id: true,
          source: true,
          sourceUrl: true,
          sourceName: true,
          dataType: true,
          dataPreview: true,
          severity: true,
          status: true,
          isWhitelisted: true,
          firstFoundAt: true,
          requiresManualAction: true,
          manualActionTaken: true,
        },
      }),
      prisma.exposure.findMany({
        where: { userId, source: { in: VOICE_CLONING_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: {
          id: true,
          source: true,
          sourceUrl: true,
          sourceName: true,
          dataType: true,
          dataPreview: true,
          severity: true,
          status: true,
          isWhitelisted: true,
          firstFoundAt: true,
          requiresManualAction: true,
          manualActionTaken: true,
        },
      }),
      prisma.exposure.count({
        where: {
          userId,
          source: { in: ALL_AI_SOURCES },
          OR: [
            { status: "REMOVED" },
            { manualActionTaken: true },
          ],
        },
      }),
    ]);

    // Count pending (active and not marked as done)
    const pendingCount = await prisma.exposure.count({
      where: {
        userId,
        source: { in: ALL_AI_SOURCES },
        status: "ACTIVE",
        manualActionTaken: false,
      },
    });

    const totalExposures = aiTrainingExposures.length + facialRecognitionExposures.length + voiceCloningExposures.length;

    return NextResponse.json({
      stats: {
        total: totalExposures,
        aiTraining: aiTrainingExposures.length,
        facialRecognition: facialRecognitionExposures.length,
        voiceCloning: voiceCloningExposures.length,
        optedOut: optedOutCount,
        pending: pendingCount,
      },
      exposures: {
        aiTraining: aiTrainingExposures,
        facialRecognition: facialRecognitionExposures,
        voiceCloning: voiceCloningExposures,
      },
      userPlan,
    });
  } catch (error) {
    console.error("AI protection data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI protection data" },
      { status: 500 }
    );
  }
}
