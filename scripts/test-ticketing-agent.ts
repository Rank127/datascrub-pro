/**
 * Test script for the Ticketing Agent
 *
 * Run: npx tsx scripts/test-ticketing-agent.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Import the agent functions dynamically
async function main() {
  console.log("🧪 Testing Ticketing Agent\n");
  console.log("=".repeat(50));

  // Check if ANTHROPIC_API_KEY is set
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set in environment");
    console.log("\nSet it with: export ANTHROPIC_API_KEY=your_key");
    process.exit(1);
  }
  console.log("✅ ANTHROPIC_API_KEY is configured\n");

  // Import agent module
  const { analyzeTicket } = await import("../src/lib/agents/ticketing-agent");

  // Test cases
  const testCases = [
    {
      name: "Simple Scan Error",
      context: {
        id: "test-1",
        ticketNumber: "TKT-2026-00001",
        type: "SCAN_ERROR",
        status: "OPEN",
        priority: "NORMAL",
        subject: "Scan not working",
        description: "I tried to scan but it shows an error. Can you help?",
        userName: "John Doe",
        userEmail: "john@example.com",
        userPlan: "PRO",
        previousComments: [],
      },
    },
    {
      name: "Frustrated Customer",
      context: {
        id: "test-2",
        ticketNumber: "TKT-2026-00002",
        type: "REMOVAL_FAILED",
        status: "OPEN",
        priority: "HIGH",
        subject: "REMOVAL NOT WORKING!!!",
        description: "This is RIDICULOUS! I've been waiting for 3 weeks and my data is STILL on these sites! I'm extremely frustrated and considering a refund!",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        userPlan: "ENTERPRISE",
        previousComments: [],
        userHistory: {
          accountAge: 200,
          totalTickets: 5,
          resolvedTickets: 4,
          averageResolutionTime: 24,
          totalScans: 50,
          totalExposures: 120,
          removalsCompleted: 80,
          isVIP: true,
          lastInteraction: new Date(),
        },
        sentiment: {
          score: -0.8,
          urgency: "high" as const,
          frustration: true,
          keywords: ["ridiculous", "frustrated", "refund"],
        },
      },
    },
    {
      name: "Feature Request",
      context: {
        id: "test-3",
        ticketNumber: "TKT-2026-00003",
        type: "FEATURE_REQUEST",
        status: "OPEN",
        priority: "LOW",
        subject: "Can you add dark web monitoring?",
        description: "It would be great if you could add dark web monitoring to find if my data has been leaked. Thanks for the great service!",
        userName: "Bob Wilson",
        userEmail: "bob@example.com",
        userPlan: "FREE",
        previousComments: [],
        sentiment: {
          score: 0.3,
          urgency: "low" as const,
          frustration: false,
          keywords: [],
        },
      },
    },
    {
      name: "Legal Threat (Critical)",
      context: {
        id: "test-4",
        ticketNumber: "TKT-2026-00004",
        type: "OTHER",
        status: "OPEN",
        priority: "URGENT",
        subject: "Attorney involvement",
        description: "I have contacted my attorney regarding your failure to remove my data. I expect immediate action or we will pursue legal remedies.",
        userName: "Critical User",
        userEmail: "critical@example.com",
        userPlan: "PRO",
        previousComments: [],
        sentiment: {
          score: -1,
          urgency: "critical" as const,
          frustration: true,
          keywords: ["attorney", "lawsuit"],
        },
      },
    },
  ];

  // Run tests
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log("-".repeat(50));
    console.log(`Subject: ${testCase.context.subject}`);
    console.log(`Type: ${testCase.context.type} | Plan: ${testCase.context.userPlan}`);

    if (testCase.context.sentiment) {
      console.log(`Sentiment: ${testCase.context.sentiment.score} | Urgency: ${testCase.context.sentiment.urgency}`);
    }

    console.log("\n⏳ Analyzing with AI...\n");

    try {
      const result = await analyzeTicket(testCase.context as any);

      console.log("📤 AI Response:");
      console.log("-".repeat(30));
      console.log(`Can Auto-Resolve: ${result.canAutoResolve ? "✅ Yes" : "❌ No"}`);
      console.log(`Needs Human Review: ${result.needsHumanReview ? "⚠️ Yes" : "✅ No"}`);
      console.log(`Suggested Priority: ${result.priority}`);
      console.log(`\nResponse to User:\n${result.response}`);
      console.log(`\nInternal Note:\n${result.internalNote}`);

      if (result.managerReviewItems?.length > 0) {
        console.log(`\n🚨 Manager Review Items:`);
        result.managerReviewItems.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item}`);
        });
      }

      console.log(`\nSuggested Actions: ${result.suggestedActions.join(", ")}`);
    } catch (error) {
      console.error(`❌ Error:`, error);
    }

    console.log("\n" + "=".repeat(50));
  }

  console.log("\n✅ All tests completed!");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
