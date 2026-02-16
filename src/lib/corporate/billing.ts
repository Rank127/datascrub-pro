// Corporate Billing — Stripe Invoice with Net 30 terms

import { getStripe } from "@/lib/stripe";
import { PRICE_IDS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { CORPORATE_TIERS, FAMILY_ADDON_PRICE, type CorporateTier } from "./types";

const NET_30_DAYS = 30;

type CorporateTierId = CorporateTier["id"];

const TIER_TO_PRICE_ID: Record<CorporateTierId, string> = {
  CORP_10: PRICE_IDS.CORPORATE_10_YEARLY,
  CORP_25: PRICE_IDS.CORPORATE_25_YEARLY,
  CORP_50: PRICE_IDS.CORPORATE_50_YEARLY,
  CORP_100: PRICE_IDS.CORPORATE_100_YEARLY,
};

function getTier(tierId: string): CorporateTier | undefined {
  return CORPORATE_TIERS.find((t) => t.id === tierId);
}

/**
 * Create or retrieve a Stripe customer for a corporate account.
 */
export async function getOrCreateCorporateCustomer(params: {
  corporateAccountId: string;
  companyName: string;
  adminEmail: string;
}): Promise<string> {
  const account = await prisma.corporateAccount.findUnique({
    where: { id: params.corporateAccountId },
    select: { stripeCustomerId: true },
  });

  if (account?.stripeCustomerId) {
    return account.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    name: params.companyName,
    email: params.adminEmail,
    metadata: {
      corporateAccountId: params.corporateAccountId,
      type: "corporate",
    },
  });

  await prisma.corporateAccount.update({
    where: { id: params.corporateAccountId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a Net 30 invoice for a corporate account's annual subscription.
 * Uses `send_invoice` collection method with 30-day payment terms.
 */
export async function createCorporateInvoice(params: {
  corporateAccountId: string;
  companyName: string;
  adminEmail: string;
  tier: CorporateTierId;
  familyAddons?: number; // number of family add-on seats
}): Promise<{ invoiceId: string; invoiceUrl: string | null; amountDue: number }> {
  const stripe = getStripe();
  const tierData = getTier(params.tier);
  if (!tierData) throw new Error(`Unknown corporate tier: ${params.tier}`);

  const customerId = await getOrCreateCorporateCustomer({
    corporateAccountId: params.corporateAccountId,
    companyName: params.companyName,
    adminEmail: params.adminEmail,
  });

  // Create the invoice with Net 30 terms
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: NET_30_DAYS,
    auto_advance: true, // auto-finalize and send
    metadata: {
      corporateAccountId: params.corporateAccountId,
      tier: params.tier,
      type: "corporate_annual",
    },
  });

  // Add the corporate plan line item using amount (price IDs created later in Stripe)
  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoice.id,
    amount: tierData.annualPrice,
    currency: "usd",
    description: `GhostMyData Corporate ${tierData.name} Plan — ${tierData.maxSeats} seats (Annual)`,
  });

  // Add family add-on line items if any
  if (params.familyAddons && params.familyAddons > 0) {
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: FAMILY_ADDON_PRICE * params.familyAddons,
      currency: "usd",
      description: `Family Add-on Seats (${params.familyAddons}) — $120/yr each`,
    });
  }

  // Finalize the invoice (makes it ready to send)
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  return {
    invoiceId: finalizedInvoice.id,
    invoiceUrl: finalizedInvoice.hosted_invoice_url ?? null,
    amountDue: finalizedInvoice.amount_due,
  };
}

/**
 * Send a finalized invoice to the customer via Stripe.
 */
export async function sendCorporateInvoice(invoiceId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.invoices.sendInvoice(invoiceId);
}

/**
 * Get invoice status and details for a corporate account.
 */
export async function getCorporateInvoices(corporateAccountId: string): Promise<Array<{
  id: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  dueDate: number | null;
  createdAt: number;
  hostedUrl: string | null;
  pdfUrl: string | null;
  tier: string;
}>> {
  const account = await prisma.corporateAccount.findUnique({
    where: { id: corporateAccountId },
    select: { stripeCustomerId: true },
  });

  if (!account?.stripeCustomerId) return [];

  const stripe = getStripe();
  const invoices = await stripe.invoices.list({
    customer: account.stripeCustomerId,
    limit: 20,
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    status: inv.status || "unknown",
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    dueDate: inv.due_date,
    createdAt: inv.created,
    hostedUrl: inv.hosted_invoice_url ?? null,
    pdfUrl: inv.invoice_pdf ?? null,
    tier: (inv.metadata?.tier as string) || "",
  }));
}

/**
 * Mark a corporate account as active after invoice payment.
 * Called from Stripe webhook when invoice.paid event fires.
 */
export async function activateCorporateAccount(invoiceId: string): Promise<void> {
  const stripe = getStripe();
  const invoice = await stripe.invoices.retrieve(invoiceId);

  const corporateAccountId = invoice.metadata?.corporateAccountId;
  if (!corporateAccountId) return;

  await prisma.corporateAccount.update({
    where: { id: corporateAccountId },
    data: { status: "ACTIVE" },
  });
}

/**
 * Handle overdue invoices — suspend corporate account.
 * Called from Stripe webhook when invoice.overdue or invoice.marked_uncollectible fires.
 */
export async function handleOverdueInvoice(invoiceId: string): Promise<void> {
  const stripe = getStripe();
  const invoice = await stripe.invoices.retrieve(invoiceId);

  const corporateAccountId = invoice.metadata?.corporateAccountId;
  if (!corporateAccountId) return;

  await prisma.corporateAccount.update({
    where: { id: corporateAccountId },
    data: { status: "SUSPENDED" },
  });
}

/**
 * Void an unpaid invoice.
 */
export async function voidCorporateInvoice(invoiceId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.invoices.voidInvoice(invoiceId);
}

/**
 * Calculate total amount for a corporate deal including add-ons.
 */
export function calculateDealTotal(tier: CorporateTierId, familyAddons: number = 0): {
  basePrice: number;
  addonTotal: number;
  grandTotal: number;
  perSeatEffective: number;
} {
  const tierData = getTier(tier);
  if (!tierData) throw new Error(`Unknown tier: ${tier}`);

  const basePrice = tierData.annualPrice;
  const addonTotal = familyAddons * FAMILY_ADDON_PRICE;
  const grandTotal = basePrice + addonTotal;
  const totalSeats = tierData.maxSeats + familyAddons;
  const perSeatEffective = Math.round(grandTotal / totalSeats / 12);

  return { basePrice, addonTotal, grandTotal, perSeatEffective };
}
