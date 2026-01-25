import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from WhitePages (2026 Guide) | GhostMyData",
  description:
    "Complete guide to remove your personal information from WhitePages. Step-by-step opt-out instructions for WhitePages and WhitePages Premium.",
  keywords: [
    "remove from whitepages",
    "whitepages opt out",
    "whitepages removal",
    "delete whitepages listing",
    "whitepages privacy",
    "whitepages premium removal",
    "how to remove yourself from whitepages",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/whitepages",
  },
  openGraph: {
    title: "How to Remove Yourself from WhitePages (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from WhitePages.",
    url: "https://ghostmydata.com/remove-from/whitepages",
    type: "article",
  },
};

const whitepagesInfo: BrokerInfo = {
  name: "WhitePages",
  slug: "whitepages",
  description:
    "WhitePages is one of the oldest and largest people search directories in the US, containing contact information, addresses, and background data for millions of Americans.",
  dataCollected: [
    "Full legal name",
    "Current and previous addresses",
    "Phone numbers",
    "Age and birthdate",
    "Associated people (family, roommates)",
    "Property ownership records",
    "Criminal records (Premium)",
    "Bankruptcy records",
    "Liens and judgments",
    "Professional licenses",
  ],
  risks: [
    "Your home address is visible to anyone searching your name",
    "Phone numbers exposed to robocallers and scammers",
    "Criminal record searches can affect employment",
    "Family connections reveal private relationships",
    "Historical addresses show your movement patterns",
  ],
  optOutUrl: "https://www.whitepages.com/suppression-requests",
  optOutTime: "PT48H",
  difficulty: "Medium",
  steps: [
    {
      name: "Find Your WhitePages Profile",
      text: "Go to whitepages.com and search for your name. Find your listing and copy the full URL of your profile page.",
      url: "https://www.whitepages.com",
    },
    {
      name: "Navigate to Opt-Out Page",
      text: "Go to the WhitePages suppression request page to begin the removal process.",
      url: "https://www.whitepages.com/suppression-requests",
    },
    {
      name: "Paste Your Profile URL",
      text: "Enter the URL of your WhitePages profile that you want to remove. You'll need to do this for each listing.",
    },
    {
      name: "Verify Your Identity",
      text: "WhitePages requires phone verification. Enter your phone number and you'll receive an automated call with a verification code.",
    },
    {
      name: "Enter Verification Code",
      text: "Answer the call and note the verification code. Enter it on the website to confirm your identity.",
    },
    {
      name: "Confirm Removal",
      text: "Your listing should be removed within 24-48 hours. Check back to verify the removal was successful.",
    },
  ],
  faqs: [
    {
      question: "Why does WhitePages require phone verification?",
      answer: "WhitePages uses phone verification to confirm you're removing your own listing and not someone else's. This is a security measure but can be inconvenient.",
    },
    {
      question: "What if I don't want to give WhitePages my phone number?",
      answer: "Unfortunately, phone verification is required for WhitePages removal. Using GhostMyData can help automate this process without giving your number directly.",
    },
    {
      question: "Does WhitePages removal also remove WhitePages Premium?",
      answer: "No, WhitePages and WhitePages Premium are separate databases. You may need to submit separate removal requests for each.",
    },
    {
      question: "How long does WhitePages removal take?",
      answer: "WhitePages typically processes removals within 24-48 hours, making it one of the faster data brokers to remove from.",
    },
    {
      question: "Will my information reappear on WhitePages?",
      answer: "Yes, WhitePages continuously updates from public records. Your information may reappear if they obtain it from a new source.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function WhitepagesRemovalPage() {
  return <BrokerRemovalTemplate broker={whitepagesInfo} />;
}
