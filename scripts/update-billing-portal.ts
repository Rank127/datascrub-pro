// Update Stripe Billing Portal Configuration
import { readFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) process.env[key] = value;
    }
  });
} catch (_e) {}

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
});

async function updatePortalConfig() {
  const configId = "bpc_1SsAPs4ClPmQQvqazZR0WR5r";

  // Product and price IDs
  const products = {
    enterprise: {
      product: "prod_TpSBmqgFjoDb1G",
      prices: ["price_1SrnGs4ClPmQQvqaZqivDhnh"], // $29.99/month (40% OFF from $49.99)
    },
    pro: {
      product: "prod_TpSAXKgvPVwNyI",
      prices: ["price_1SrnFp4ClPmQQvqaG5iQkSwT"], // $11.99/month (40% OFF from $19.99)
    },
  };

  console.log("=== Updating Billing Portal Configuration ===\n");
  console.log("Config ID:", configId);

  const _updatedConfig = await stripe.billingPortal.configurations.update(configId, {
    business_profile: {
      headline: "Manage your GhostMyData subscription",
      privacy_policy_url: "https://ghostmydata.com/privacy",
      terms_of_service_url: "https://ghostmydata.com/terms",
    },
    features: {
      // Allow customers to update their subscription (upgrade/downgrade)
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"], // Allow changing price/plan
        proration_behavior: "create_prorations", // Pro-rate charges
        products: [
          {
            product: products.pro.product,
            prices: products.pro.prices,
          },
          {
            product: products.enterprise.product,
            prices: products.enterprise.prices,
          },
        ],
      },
      // Configure cancellation
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end", // Keep access until billing period ends
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "customer_service",
            "other",
          ],
        },
      },
      // Allow updating payment methods
      payment_method_update: {
        enabled: true,
      },
      // Show invoice history
      invoice_history: {
        enabled: true,
      },
      // Allow updating customer info
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address", "phone", "name"],
      },
    },
    default_return_url: "https://ghostmydata.com/dashboard/settings",
  });

  console.log("\n✓ Configuration updated successfully!\n");
  console.log("Features enabled:");
  console.log("  - Subscription upgrade/downgrade between Pro and Enterprise");
  console.log("  - Cancellation at period end (keeps access until billing cycle ends)");
  console.log("  - Cancellation reasons required");
  console.log("  - Payment method updates");
  console.log("  - Invoice history");
  console.log("  - Customer info updates");
  console.log("\nThis helps prevent duplicate subscriptions by allowing");
  console.log("users to upgrade/downgrade within the same subscription.");
}

updatePortalConfig().catch(console.error);
