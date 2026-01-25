import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Spokeo (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Spokeo. Learn the opt-out process, what data Spokeo collects, and how to permanently delete your listing.",
  keywords: [
    "remove from spokeo",
    "spokeo opt out",
    "spokeo removal",
    "delete spokeo listing",
    "spokeo privacy",
    "remove spokeo profile",
    "how to remove yourself from spokeo",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/spokeo",
  },
  openGraph: {
    title: "How to Remove Yourself from Spokeo (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Spokeo.",
    url: "https://ghostmydata.com/remove-from/spokeo",
    type: "article",
  },
};

const spokeoInfo: BrokerInfo = {
  name: "Spokeo",
  slug: "spokeo",
  description:
    "Spokeo is one of the largest people-search websites, aggregating personal information from public records, social media, and other sources. With over 12 billion records, Spokeo can reveal sensitive details about you.",
  dataCollected: [
    "Full name and aliases",
    "Current and past addresses",
    "Phone numbers (including cell)",
    "Email addresses",
    "Family members and associates",
    "Social media profiles",
    "Property records",
    "Court records",
    "Employment history",
    "Education background",
  ],
  risks: [
    "Identity theft - criminals can use this information to impersonate you",
    "Stalking and harassment - abusers can easily find your address",
    "Spam and scams - your contact info can be harvested for fraud",
    "Employment issues - employers may find outdated or misleading info",
    "Personal safety - your location history is publicly accessible",
  ],
  optOutUrl: "https://www.spokeo.com/optout",
  optOutTime: "PT72H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your Spokeo Listing",
      text: "Go to spokeo.com and search for your name and location. Click on your profile to view what information they have. Copy the URL of your profile page - you'll need this for the opt-out.",
      url: "https://www.spokeo.com",
    },
    {
      name: "Go to the Opt-Out Page",
      text: "Navigate to Spokeo's official opt-out page. This is the only legitimate way to remove your listing.",
      url: "https://www.spokeo.com/optout",
    },
    {
      name: "Submit Your Profile URL",
      text: "Paste your profile URL into the opt-out form. Enter a valid email address where you can receive the confirmation link.",
    },
    {
      name: "Complete the CAPTCHA",
      text: "Verify you're human by completing the CAPTCHA challenge, then click 'Remove This Listing'.",
    },
    {
      name: "Verify via Email",
      text: "Check your inbox for an email from Spokeo. Click the verification link within 72 hours to complete your removal request.",
    },
    {
      name: "Confirm Removal",
      text: "After 3-5 business days, search for yourself on Spokeo again to confirm your listing has been removed. You may need to repeat this process for multiple listings.",
    },
  ],
  faqs: [
    {
      question: "How long does Spokeo removal take?",
      answer: "Spokeo typically processes removal requests within 3-5 business days. However, it can take up to 2 weeks in some cases. The verification email must be clicked within 72 hours.",
    },
    {
      question: "Will my information stay removed from Spokeo?",
      answer: "Your removal is permanent for that specific listing, but Spokeo may create a new listing if they obtain your information from a new source. Ongoing monitoring is recommended.",
    },
    {
      question: "Do I need to remove multiple Spokeo listings?",
      answer: "Yes, you may have multiple profiles on Spokeo (variations of your name, different addresses). Each listing requires a separate opt-out request.",
    },
    {
      question: "Is the Spokeo opt-out free?",
      answer: "Yes, Spokeo's opt-out process is completely free. Be wary of any service charging to remove you from Spokeo specifically.",
    },
    {
      question: "Can I remove someone else from Spokeo?",
      answer: "Spokeo requires verification via email, so you can only remove listings that you have email access to verify. For others, they need to submit their own opt-out.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function SpokeoRemovalPage() {
  return <BrokerRemovalTemplate broker={spokeoInfo} />;
}
