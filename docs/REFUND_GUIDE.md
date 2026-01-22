# GhostMyData - Refund Processing Guide

## Refund Policy Overview

- **30-Day Money-Back Guarantee**: Full refund available within 30 days of initial subscription purchase
- **After 30 Days**: No refunds for cancellations outside the guarantee window
- **Processing Time**: 5-10 business days for refund to appear on customer's statement

---

## Processing Refund Requests

### Step 1: Verify Eligibility

When you receive a refund request at support@ghostmydata.com:

1. **Find the customer in Stripe**
   - Go to https://dashboard.stripe.com/customers
   - Search by email address from the refund request

2. **Check subscription start date**
   - Click on the customer
   - Look at their subscription under "Subscriptions"
   - Note the "Created" date

3. **Verify 30-day window**
   - If the subscription was created within the last 30 days → **Eligible for refund**
   - If more than 30 days ago → **Not eligible** (reply with policy explanation)

---

### Step 2: Process the Refund in Stripe

1. **Go to the customer's payments**
   - In the customer view, click "Payments" tab
   - Find the most recent successful payment

2. **Issue the refund**
   - Click on the payment
   - Click "Refund" button (top right)
   - Select "Full refund"
   - Add a reason: "Customer requested refund within 30-day guarantee"
   - Click "Refund"

3. **Cancel the subscription**
   - Go back to the customer view
   - Under "Subscriptions", click the active subscription
   - Click "Cancel subscription"
   - Select "Cancel immediately"
   - Click "Cancel subscription"

---

### Step 3: Send Confirmation Email

Reply to the customer's refund request:

```
Subject: Re: Refund Request - [PLAN] Plan

Hi [Customer Name],

Your refund has been processed successfully.

Details:
- Refund Amount: $[AMOUNT]
- Original Payment Date: [DATE]
- Subscription: Cancelled

The refund will appear on your statement within 5-10 business days, depending on your bank.

Your GhostMyData account has been downgraded to the Free plan. You can continue using basic features or delete your account at any time in Settings.

If you have any feedback about why you decided to cancel, we'd love to hear it - it helps us improve our service.

Thank you for trying GhostMyData.

Best regards,
GhostMyData Support
```

---

## Handling Non-Eligible Refund Requests

If the request is outside the 30-day window:

```
Subject: Re: Refund Request - [PLAN] Plan

Hi [Customer Name],

Thank you for contacting us about a refund.

After reviewing your account, we found that your subscription began on [DATE], which is outside our 30-day money-back guarantee window.

Per our Terms of Service, refunds are available within 30 days of the initial subscription purchase. Unfortunately, we're unable to process a refund at this time.

However, you can cancel your subscription at any time to prevent future charges:
1. Go to Dashboard → Settings
2. Click "Manage Billing"
3. Select "Cancel subscription"

You'll retain access to your paid features until the end of your current billing period.

If you have any questions or concerns, please let us know.

Best regards,
GhostMyData Support
```

---

## Special Cases

### Billing Errors
If a customer was charged incorrectly (duplicate charge, wrong amount, etc.):
- Process refund regardless of 30-day window
- Document the error in Stripe notes

### Chargebacks
If a customer initiates a chargeback through their bank:
- Stripe will notify you automatically
- Review the case in Stripe Dashboard → Disputes
- Submit evidence if you believe the charge was valid
- Consider issuing a refund to avoid chargeback fees

### Partial Refunds
Generally not offered, but if needed:
- In Stripe, select "Partial refund" instead of "Full refund"
- Enter the specific amount
- Document the reason

---

## Stripe Dashboard Quick Links

- Customers: https://dashboard.stripe.com/customers
- Payments: https://dashboard.stripe.com/payments
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Disputes: https://dashboard.stripe.com/disputes

---

## Refund Tracking

The Stripe webhook automatically handles:
- Updating the user's plan to FREE when subscription is cancelled
- Creating an alert in the user's account about the refund
- Sending an automated email notification (if configured)

No manual database updates are required.

---

## Contact

For questions about this process, contact the development team.

Last Updated: January 2026
