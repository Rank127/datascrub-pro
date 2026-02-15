import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/admin";
import { URL_CORRECTIONS } from "@/lib/removals/url-corrections";

/**
 * GET /api/admin/url-corrections
 * Returns the current URL corrections registry.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "view_users_list")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      corrections: URL_CORRECTIONS,
      count: Object.keys(URL_CORRECTIONS).length,
    });
  } catch (error) {
    console.error("[Admin URL Corrections] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch corrections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/url-corrections
 * Accepts broker key + new URL pairs, validates them, and returns
 * a summary for manual application to the static corrections file.
 *
 * Body: { corrections: [{ brokerKey: string, oldUrl: string, newUrl: string }] }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "manage_system_config")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const corrections: Array<{
      brokerKey: string;
      oldUrl: string;
      newUrl: string;
    }> = body.corrections || [];

    if (!corrections.length) {
      return NextResponse.json(
        { error: "No corrections provided" },
        { status: 400 }
      );
    }

    // Validate each correction
    const results: Array<{
      brokerKey: string;
      oldUrl: string;
      newUrl: string;
      valid: boolean;
      status: number | "error";
      error?: string;
    }> = [];

    for (const correction of corrections) {
      try {
        new URL(correction.newUrl);
      } catch {
        results.push({
          ...correction,
          valid: false,
          status: "error",
          error: "Invalid URL format",
        });
        continue;
      }

      // Verify the new URL works
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(correction.newUrl, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          redirect: "follow",
        });
        clearTimeout(timeoutId);

        const isWorking =
          (response.status >= 200 && response.status < 400) ||
          response.status === 403;

        results.push({
          ...correction,
          valid: isWorking,
          status: response.status,
          error: isWorking ? undefined : `HTTP ${response.status}`,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        results.push({
          ...correction,
          valid: false,
          status: "error",
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Fetch failed",
        });
      }
    }

    const validCorrections = results.filter((r) => r.valid);
    const invalidCorrections = results.filter((r) => !r.valid);

    // Generate the code snippet for manual application
    const codeSnippet = validCorrections.length > 0
      ? validCorrections
          .map(
            (c) =>
              `  "${c.oldUrl}":\n    "${c.newUrl}",`
          )
          .join("\n")
      : null;

    return NextResponse.json({
      valid: validCorrections.length,
      invalid: invalidCorrections.length,
      results,
      codeSnippet: codeSnippet
        ? `// Add to src/lib/removals/url-corrections.ts URL_CORRECTIONS:\n${codeSnippet}`
        : null,
    });
  } catch (error) {
    console.error("[Admin URL Corrections] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process corrections" },
      { status: 500 }
    );
  }
}
