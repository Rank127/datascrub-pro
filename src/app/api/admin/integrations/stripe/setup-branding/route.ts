import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { getStripe } from "@/lib/stripe";

export const maxDuration = 30;

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stripeClient = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "";
    const results: Record<string, unknown> = {};

    // Step 1: Upload icon and logo files to Stripe
    let iconFileId: string | undefined;
    let logoFileId: string | undefined;

    try {
      const iconResponse = await fetch(`${baseUrl}/icon-512.png`);
      if (iconResponse.ok) {
        const iconBuffer = Buffer.from(await iconResponse.arrayBuffer());
        const iconFile = await stripeClient.files.create({
          purpose: "business_icon",
          file: {
            data: iconBuffer,
            name: "ghostmydata-icon.png",
            type: "image/png",
          },
        });
        iconFileId = iconFile.id;
        results.iconFile = iconFile.id;
      }
    } catch (e) {
      results.iconUploadError = e instanceof Error ? e.message : "Failed to upload icon";
    }

    try {
      const logoResponse = await fetch(`${baseUrl}/logo.png`);
      if (logoResponse.ok) {
        const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
        const logoFile = await stripeClient.files.create({
          purpose: "business_logo",
          file: {
            data: logoBuffer,
            name: "ghostmydata-logo.png",
            type: "image/png",
          },
        });
        logoFileId = logoFile.id;
        results.logoFile = logoFile.id;
      }
    } catch (e) {
      results.logoUploadError = e instanceof Error ? e.message : "Failed to upload logo";
    }

    // Step 2: Update account branding via raw Stripe API
    // POST /v1/account updates the platform's own account (no ID needed)
    try {
      const brandingParams = new URLSearchParams();
      brandingParams.set("settings[branding][primary_color]", "#10b981");
      brandingParams.set("settings[branding][secondary_color]", "#0f172a");
      if (iconFileId) {
        brandingParams.set("settings[branding][icon]", iconFileId);
      }
      if (logoFileId) {
        brandingParams.set("settings[branding][logo]", logoFileId);
      }

      const brandingRes = await fetch("https://api.stripe.com/v1/account", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: brandingParams.toString(),
      });

      const brandingData = await brandingRes.json();

      if (brandingRes.ok) {
        results.branding = {
          status: "updated",
          primaryColor: "#10b981",
          secondaryColor: "#0f172a",
          icon: iconFileId || "unchanged",
          logo: logoFileId || "unchanged",
        };
      } else {
        results.brandingError = brandingData.error?.message || "Failed to update branding";
      }
    } catch (e) {
      results.brandingError = e instanceof Error ? e.message : "Failed to update branding";
    }

    // Step 3: Create billing portal configuration
    try {
      // Check for existing configurations
      const existingConfigs = await stripeClient.billingPortal.configurations.list({ limit: 5 });
      results.existingPortalConfigs = existingConfigs.data.length;

      const portalConfig = await stripeClient.billingPortal.configurations.create({
        business_profile: {
          headline: "GhostMyData — Manage Your Subscription",
          privacy_policy_url: `${baseUrl}/privacy`,
          terms_of_service_url: `${baseUrl}/terms`,
        },
        features: {
          customer_update: {
            allowed_updates: ["email", "name", "address", "phone"],
            enabled: true,
          },
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },
          subscription_cancel: {
            enabled: true,
            mode: "at_period_end",
            cancellation_reason: {
              enabled: true,
              options: [
                "too_expensive",
                "missing_features",
                "switched_service",
                "unused",
                "other",
              ],
            },
          },
        },
      });

      results.portalConfig = {
        id: portalConfig.id,
        headline: "GhostMyData — Manage Your Subscription",
        features: ["customer_update", "invoice_history", "payment_method_update", "subscription_cancel"],
      };
      results.action = `Set STRIPE_PORTAL_CONFIG_ID=${portalConfig.id} in your environment variables`;
    } catch (e) {
      results.portalConfigError = e instanceof Error ? e.message : "Failed to create portal config";
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Stripe branding setup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to setup branding" },
      { status: 500 }
    );
  }
}
