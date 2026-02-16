/**
 * Growth Analysis - Weekly Cron Job
 *
 * Schedule: Wednesdays 11am ET (0 15 * * 3 UTC)
 * Runs referral optimization + power user identification,
 * stores results in CronLog metadata for dashboard display.
 */

import { NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { optimizeReferrals, identifyPowerUsers } from "@/lib/agents/growth-agent";

export const maxDuration = 120;

const JOB_NAME = "growth-analysis";

export async function GET(request: Request) {
  const startTime = Date.now();

  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  try {
    // Run both analyses in parallel
    const [referralResult, powerUserResult] = await Promise.all([
      optimizeReferrals(),
      identifyPowerUsers(50),
    ]);

    const duration = Date.now() - startTime;

    // Store results in CronLog metadata for dashboard consumption
    await logCronExecution({
      jobName: JOB_NAME,
      status: "SUCCESS",
      duration,
      message: `Analyzed ${referralResult.analyzed} referrals, identified ${powerUserResult.identified} power users.`,
      metadata: {
        referrals: {
          analyzed: referralResult.analyzed,
          totalReferrers: referralResult.referralStats.totalReferrers,
          conversionRate: referralResult.referralStats.conversionRate,
          recommendations: referralResult.recommendations,
        },
        powerUsers: {
          identified: powerUserResult.identified,
          advocateCandidates: powerUserResult.powerUsers.filter(u => u.potentialAsAdvocate).length,
          topUsers: powerUserResult.powerUsers.slice(0, 10).map(u => ({
            email: u.email,
            score: u.score,
            segments: u.segments,
            scans: u.metrics.scans,
            removals: u.metrics.removals,
            tenure: u.metrics.tenure,
          })),
          insights: powerUserResult.insights,
        },
        viralCoefficient: referralResult.referralStats.avgReferralsPerUser > 0
          ? referralResult.referralStats.conversionRate * referralResult.referralStats.avgReferralsPerUser / 100
          : 0,
      },
    });

    return NextResponse.json({
      success: true,
      referralsAnalyzed: referralResult.analyzed,
      powerUsersIdentified: powerUserResult.identified,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Unknown error";

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message,
    });

    console.error("[GrowthAnalysis] Failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
