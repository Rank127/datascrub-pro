import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQuarterlyReport } from "@/lib/corporate/compliance-report";

// GET — generate or list compliance reports
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    select: { id: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "generate") {
    const report = await generateQuarterlyReport(account.id);
    if (!report) {
      return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
    return NextResponse.json({ report });
  }

  // Default: return available report periods
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const quarters = [];

  for (let q = currentQuarter; q >= 1; q--) {
    quarters.push({
      label: `Q${q} ${now.getFullYear()}`,
      year: now.getFullYear(),
      quarter: q,
    });
  }

  return NextResponse.json({ availableReports: quarters });
}
