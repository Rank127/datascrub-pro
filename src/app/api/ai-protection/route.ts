import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlan } from "@/lib/admin";

// AI Shield source categories (60 sources across 5 categories)
const AI_TRAINING_SOURCES = [
  "SPAWNING_AI", "LAION_AI", "STABILITY_AI", "OPENAI", "ANTHROPIC",
  "MIDJOURNEY", "META_AI", "GOOGLE_AI", "MICROSOFT_AI", "LINKEDIN_AI",
  "ADOBE_AI", "AMAZON_AI", "APPLE_AI", "X_AI", "REDDIT_AI",
  "SHUTTERSTOCK_AI", "GETTY_AI", "HUGGINGFACE", "COMMON_CRAWL", "COHERE_AI"
];

const FACIAL_RECOGNITION_SOURCES = [
  "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE",
  "YANDEX_IMAGES", "GOOGLE_IMAGES", "BING_IMAGES", "AMAZON_REKOGNITION",
  "FINDFACE", "KAIROS", "FACE_PLUS_PLUS"
];

const VOICE_CLONING_SOURCES = [
  "ELEVENLABS", "RESEMBLE_AI", "MURF_AI", "PLAY_HT", "DESCRIPT",
  "LOVO_AI", "REPLICA_STUDIOS", "COQUI_AI", "SPEECHIFY", "WELLSAID_LABS"
];

const DEEPFAKE_VIDEO_SOURCES = [
  "D_ID", "HEYGEN", "SYNTHESIA", "REFACE", "FACEAPP",
  "MYHERITAGE_DEEPNOSTALGIA", "WOMBO", "DEEP_ART_EFFECTS", "ROOP", "RUNWAY_ML"
];

const AI_AVATAR_SOURCES = [
  "LENSA_AI", "READY_PLAYER_ME", "ARTBREEDER", "DALL_E",
  "STARRY_AI", "NIGHTCAFE", "PIKA_LABS", "SUNO_AI"
];

const ALL_AI_SOURCES = [
  ...AI_TRAINING_SOURCES,
  ...FACIAL_RECOGNITION_SOURCES,
  ...VOICE_CLONING_SOURCES,
  ...DEEPFAKE_VIDEO_SOURCES,
  ...AI_AVATAR_SOURCES
];

const exposureSelect = {
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
};

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

    // Fetch AI-related exposures by category (5 categories now)
    const [
      aiTrainingExposures,
      facialRecognitionExposures,
      voiceCloningExposures,
      deepfakeVideoExposures,
      aiAvatarExposures,
      optedOutCount
    ] = await Promise.all([
      prisma.exposure.findMany({
        where: { userId, source: { in: AI_TRAINING_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: exposureSelect,
      }),
      prisma.exposure.findMany({
        where: { userId, source: { in: FACIAL_RECOGNITION_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: exposureSelect,
      }),
      prisma.exposure.findMany({
        where: { userId, source: { in: VOICE_CLONING_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: exposureSelect,
      }),
      prisma.exposure.findMany({
        where: { userId, source: { in: DEEPFAKE_VIDEO_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: exposureSelect,
      }),
      prisma.exposure.findMany({
        where: { userId, source: { in: AI_AVATAR_SOURCES } },
        orderBy: { firstFoundAt: "desc" },
        select: exposureSelect,
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

    const totalExposures =
      aiTrainingExposures.length +
      facialRecognitionExposures.length +
      voiceCloningExposures.length +
      deepfakeVideoExposures.length +
      aiAvatarExposures.length;

    return NextResponse.json({
      stats: {
        total: totalExposures,
        aiTraining: aiTrainingExposures.length,
        facialRecognition: facialRecognitionExposures.length,
        voiceCloning: voiceCloningExposures.length,
        deepfakeVideo: deepfakeVideoExposures.length,
        aiAvatar: aiAvatarExposures.length,
        optedOut: optedOutCount,
        pending: pendingCount,
        // Category counts for display
        categoryTotals: {
          aiTraining: AI_TRAINING_SOURCES.length,
          facialRecognition: FACIAL_RECOGNITION_SOURCES.length,
          voiceCloning: VOICE_CLONING_SOURCES.length,
          deepfakeVideo: DEEPFAKE_VIDEO_SOURCES.length,
          aiAvatar: AI_AVATAR_SOURCES.length,
          total: ALL_AI_SOURCES.length,
        },
      },
      exposures: {
        aiTraining: aiTrainingExposures,
        facialRecognition: facialRecognitionExposures,
        voiceCloning: voiceCloningExposures,
        deepfakeVideo: deepfakeVideoExposures,
        aiAvatar: aiAvatarExposures,
      },
      userPlan,
    });
  } catch (error) {
    console.error("AI Shield data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI Shield data" },
      { status: 500 }
    );
  }
}
