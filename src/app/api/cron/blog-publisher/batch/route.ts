/**
 * Blog Batch Publisher — one-time blitz endpoint
 *
 * Generates and publishes as many blog posts as possible within the time limit.
 * Processes topics sequentially (each takes ~30-40s via Claude Haiku).
 * With maxDuration=300s, can publish ~7-8 posts per call.
 *
 * Call multiple times to drain the entire topic queue.
 *
 * POST /api/cron/blog-publisher/batch
 * Auth: CRON_SECRET header or admin session
 */

import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { generateTopicIdeas } from "@/lib/agents/seo-agent/blog-generator";
import { writeAndPublishPost } from "@/lib/agents/seo-agent/blog-writer";

export const maxDuration = 300;

const JOB_NAME = "blog-publisher";
const DEADLINE_MS = 270_000; // stop 30s before maxDuration

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get ALL remaining topics
    const ideas = await generateTopicIdeas();
    console.log(`[${JOB_NAME}:batch] ${ideas.length} topics remaining. Blitzing...`);

    if (ideas.length === 0) {
      return NextResponse.json({
        status: "complete",
        message: "All topics already published",
        postsPublished: 0,
      });
    }

    const published: { slug: string; title: string; category: string }[] = [];
    const failed: string[] = [];

    for (const idea of ideas) {
      if (Date.now() - startTime >= DEADLINE_MS) {
        console.log(`[${JOB_NAME}:batch] Time limit hit after ${published.length} posts`);
        break;
      }

      console.log(`[${JOB_NAME}:batch] [${published.length + 1}] Generating: ${idea.title}`);
      const slug = await writeAndPublishPost(idea);

      if (slug) {
        published.push({ slug, title: idea.title, category: idea.category });
      } else {
        failed.push(idea.slug);
      }
    }

    const duration = Date.now() - startTime;
    const remaining = ideas.length - published.length - failed.length;

    await logCronExecution({
      jobName: JOB_NAME,
      status: remaining > 0 ? "PARTIAL" : "SUCCESS",
      duration,
      message: `Batch: ${published.length} published, ${failed.length} failed, ${remaining} remaining`,
      metadata: {
        mode: "batch",
        postsPublished: published.length,
        postsFailed: failed.length,
        topicsRemaining: remaining,
        posts: published,
      },
    });

    return NextResponse.json({
      status: remaining > 0 ? "partial" : "complete",
      postsPublished: published.length,
      postsFailed: failed.length,
      topicsRemaining: remaining,
      posts: published,
      failed,
      duration,
      message: remaining > 0
        ? `Published ${published.length}. Call again to publish ${remaining} more.`
        : `All done! ${published.length} posts published.`,
    });
  } catch (error) {
    console.error(`[${JOB_NAME}:batch] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch failed" },
      { status: 500 }
    );
  }
}
