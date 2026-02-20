/**
 * Create GHOST25 Upgrade Coupon — 25% off first invoice
 *
 * Run with: npx tsx scripts/create-upgrade-coupon.ts
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function createUpgradeCoupon() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment");
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  });

  const couponId = "GHOST25";

  try {
    // Check if coupon already exists
    try {
      const existing = await stripe.coupons.retrieve(couponId);
      console.log(`⚠️  Coupon "${couponId}" already exists:`);
      console.log(`   - ${existing.percent_off}% off`);
      console.log(`   - Duration: ${existing.duration}`);
      console.log(`   - Name: ${existing.name}`);
      return;
    } catch (e: unknown) {
      if (e instanceof Error && (e as Error & { code?: string }).code !== "resource_missing") {
        throw e;
      }
      // Coupon doesn't exist, continue to create
    }

    // Create the coupon
    const coupon = await stripe.coupons.create({
      id: couponId,
      percent_off: 25,
      duration: "once", // Applies to first invoice only
      name: "GhostMyData - 25% off first payment",
      metadata: {
        campaign: "agent_upgrade_recommendation",
        created_by: "script",
      },
    });

    console.log("✅ Coupon created successfully!");
    console.log(`   - ID: ${coupon.id}`);
    console.log(`   - Discount: ${coupon.percent_off}% off`);
    console.log(`   - Duration: ${coupon.duration}`);
    console.log(`   - Name: ${coupon.name}`);

    // Also create a promotion code for easier sharing
    const promoCode = await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: couponId },
      code: couponId, // Use same code
      metadata: {
        campaign: "agent_upgrade_recommendation",
      },
    });

    console.log(`\n✅ Promotion code created!`);
    console.log(`   - Code: ${promoCode.code}`);
    console.log(`   - Active: ${promoCode.active}`);

  } catch (error: unknown) {
    console.error("❌ Error creating coupon:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createUpgradeCoupon();
