import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getDropSubmission, getDropPortalUrl, getDropProfileReadiness } from "@/lib/drop";
import { isCaRegisteredBroker, getCaRegisteredBrokerCount } from "@/lib/removers/data-broker-directory";

const dropSubmissionSchema = z.object({
  status: z.enum(["SUBMITTED", "CONFIRMED", "REVOKED"]),
  dropConfId: z.string().max(200).optional(),
});

// GET /api/drop — DROP status + profile readiness + coverage stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [submission, readiness, exposures] = await Promise.all([
      getDropSubmission(userId),
      getDropProfileReadiness(userId),
      prisma.exposure.findMany({
        where: { userId, status: { in: ["ACTIVE", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] } },
        select: { source: true },
      }),
    ]);

    const totalExposures = exposures.length;
    const dropCovered = exposures.filter(e => isCaRegisteredBroker(e.source)).length;
    const directHandled = totalExposures - dropCovered;

    return NextResponse.json({
      submission: submission || null,
      readiness,
      stats: {
        totalExposures,
        dropCoveredExposures: dropCovered,
        directHandledExposures: directHandled,
        caRegisteredBrokerCount: getCaRegisteredBrokerCount(),
      },
      dropPortalUrl: getDropPortalUrl(),
      info: {
        title: "California DELETE Act (SB 362)",
        description: "The California Delete Request and Opt-out Platform (DROP) lets you submit a single free deletion request that covers all ~530 CA-registered data brokers. Brokers must comply by August 1, 2026.",
        eligibility: "Available to all California residents. Non-CA residents may also benefit as many brokers honor DROP requests regardless of residency.",
        complianceDeadline: "August 1, 2026",
        penalty: "$200/day per unfulfilled request",
      },
    });
  } catch (error) {
    console.error("[DROP API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/drop — Record DROP submission
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = dropSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, dropConfId } = parsed.data;
    const userId = session.user.id;

    const submission = await prisma.dropSubmission.upsert({
      where: { userId },
      create: {
        userId,
        status,
        submittedAt: status === "SUBMITTED" || status === "CONFIRMED" ? new Date() : undefined,
        dropConfId: dropConfId || undefined,
        brokersAtSubmit: getCaRegisteredBrokerCount(),
      },
      update: {
        status,
        submittedAt: status === "SUBMITTED" || status === "CONFIRMED" ? new Date() : undefined,
        dropConfId: dropConfId || undefined,
        ...(status === "REVOKED" ? { notes: "User revoked DROP submission" } : {}),
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("[DROP API] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
