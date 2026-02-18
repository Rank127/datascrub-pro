/**
 * Blog Publisher Cron
 *
 * Runs DAILY at 4 AM UTC. Publishes 1 high-quality blog post per run.
 * Picks top-priority topics not yet covered, generates full posts
 * via Claude Sonnet for higher quality, saves to AutoBlogPost table.
 *
 * Schedule: 0 4 * * *  (daily at 4 AM UTC)
 * Target: 7 posts/week, 30 posts/month
 */

import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { getTopBlogIdeas } from "@/lib/agents/seo-agent/blog-generator";
import { writeAndPublishPost } from "@/lib/agents/seo-agent/blog-writer";

export const maxDuration = 300;

const JOB_NAME = "blog-publisher";
const POSTS_PER_RUN = 1; // Sonnet takes ~120-180s/post — 1 post fits within 300s Vercel limit
const DEADLINE_MS = 270_000; // 270s safety margin (maxDuration=300)

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[${JOB_NAME}] Starting blog publisher (target: ${POSTS_PER_RUN} posts)...`);

    // Get more ideas than we need, so we can skip collisions
    const ideas = await getTopBlogIdeas(POSTS_PER_RUN * 3);

    if (ideas.length === 0) {
      console.log(`[${JOB_NAME}] No new topics to write about`);
      await logCronExecution({
        jobName: JOB_NAME,
        status: "SUCCESS",
        duration: Date.now() - startTime,
        message: "All topics covered — no new posts to generate",
        metadata: { postsPublished: 0, reason: "all_topics_covered" },
      });
      return NextResponse.json({ status: "no_new_topics" });
    }

    // Publish up to POSTS_PER_RUN posts, with time-boxing
    const published: { slug: string; title: string; category: string }[] = [];
    let attempted = 0;

    for (const idea of ideas) {
      if (published.length >= POSTS_PER_RUN) break;
      if (Date.now() - startTime >= DEADLINE_MS) {
        console.log(`[${JOB_NAME}] Time limit approaching, stopping at ${published.length} posts`);
        break;
      }

      attempted++;
      console.log(`[${JOB_NAME}] Generating post ${published.length + 1}/${POSTS_PER_RUN}: ${idea.title}`);

      const slug = await writeAndPublishPost(idea);
      if (slug) {
        published.push({ slug, title: idea.title, category: idea.category });
        console.log(`[${JOB_NAME}] Published: /blog/${slug}`);
      }
    }

    if (published.length === 0) {
      console.log(`[${JOB_NAME}] Failed to publish any posts after ${attempted} attempts`);
      await logCronExecution({
        jobName: JOB_NAME,
        status: "FAILED",
        duration: Date.now() - startTime,
        message: `Generation failed after trying ${attempted} topics`,
        metadata: { postsPublished: 0, reason: "generation_failed", topicsAttempted: attempted },
      });
      return NextResponse.json({ status: "generation_failed" });
    }

    // No email notification — CronLog tracks published posts in admin dashboard

    const duration = Date.now() - startTime;
    const isPartial = published.length < POSTS_PER_RUN && ideas.length >= POSTS_PER_RUN;

    await logCronExecution({
      jobName: JOB_NAME,
      status: isPartial ? "PARTIAL" : "SUCCESS",
      duration,
      message: `Published ${published.length}/${POSTS_PER_RUN} posts`,
      metadata: {
        postsPublished: published.length,
        posts: published,
        topicsAttempted: attempted,
        topicsRemaining: ideas.length - published.length,
      },
    });

    return NextResponse.json({
      status: "published",
      postsPublished: published.length,
      posts: published,
      topicsRemaining: ideas.length - published.length,
      duration,
    });
  } catch (error) {
    console.error(`[${JOB_NAME}] Error:`, error);
    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Blog publisher failed" },
      { status: 500 }
    );
  }
}
