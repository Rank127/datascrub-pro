import Stripe from "stripe";

// Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY isn't set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// Price IDs - These should be created in your Stripe dashboard
export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
  ENTERPRISE_YEARLY: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_enterprise_yearly",
} as const;

// Plan to Price mapping
export const PLAN_TO_PRICE = {
  PRO: PRICE_IDS.PRO_MONTHLY,
  ENTERPRISE: PRICE_IDS.ENTERPRISE_MONTHLY,
} as const;

// Price to Plan mapping
export function getPlanFromPriceId(priceId: string): "PRO" | "ENTERPRISE" | "FREE" {
  if (priceId === PRICE_IDS.PRO_MONTHLY || priceId === PRICE_IDS.PRO_YEARLY) {
    return "PRO";
  }
  if (priceId === PRICE_IDS.ENTERPRISE_MONTHLY || priceId === PRICE_IDS.ENTERPRISE_YEARLY) {
    return "ENTERPRISE";
  }
  return "FREE";
}

// Re-export sync and intelligence functions
export { syncUserFromStripe, getExistingActiveSubscription, upgradeSubscription, cancelSubscription, getCustomerSubscriptions } from "./sync";
export { validateAndSyncSubscription, verifyPlanAccess, cleanupDuplicateSubscriptions, batchSyncAllSubscriptions, getStripeSubscriptionState } from "./subscription-intelligence";
export { getValidatedUser, forceSyncUserSubscription, requirePlan, clearSyncCache } from "./use-subscription-sync";
