/**
 * Create Product Hunt Launch Promo Coupon
 *
 * Run with: npx tsx scripts/create-promo-coupon.ts
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function createPromoCoupon() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment");
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  });

  const couponId = "HUNT50";

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
      percent_off: 50,
      duration: "once", // Applies to first invoice only
      name: "Product Hunt - 50% off 1st month",
      metadata: {
        campaign: "product_hunt_launch",
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
      coupon: couponId,
      code: couponId, // Use same code
      metadata: {
        campaign: "product_hunt_launch",
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

createPromoCoupon();
