import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from BeenVerified (2026 Guide) | GhostMyData",
  description:
    "Step-by-step guide to remove your personal information from BeenVerified. Learn the opt-out process and protect your privacy from background checks.",
  keywords: [
    "remove from beenverified",
    "beenverified opt out",
    "beenverified removal",
    "delete beenverified listing",
    "beenverified background check removal",
    "beenverified privacy",
    "how to remove yourself from beenverified",
    "beenverified opt-out guide",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/beenverified",
  },
};

const beenverifiedInfo: BrokerInfo = {
  name: "BeenVerified",
  slug: "beenverified",
  description:
    "BeenVerified is a site that runs background checks. It gathers public records and social media info. It puts all this into profiles anyone can search.",
  dataCollected: [
    "Your full name and other names",
    "Where you live now and lived before",
    "Phone numbers and emails",
    "Criminal records",
    "Court records",
    "Property records",
    "Social media profiles",
    "Family and friends",
    "Job history",
    "School records",
  ],
  risks: [
    "Employers may find old or wrong info about you",
    "Criminal data may be wrong or belong to someone else",
    "Landlords use this to check tenants",
    "Your family ties show up in reports",
    "Anyone who pays can see your financial info",
  ],
  optOutUrl: "https://www.beenverified.com/app/optout/search",
  optOutTime: "PT24H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your Profile",
      text: "Go to the opt-out page. Type your name and state. Find your listing in the results.",
      url: "https://www.beenverified.com/app/optout/search",
    },
    {
      name: "Pick Your Record",
      text: "Look at the results. Click the one that matches your info.",
    },
    {
      name: "Add Your Email",
      text: "Type in an email address you can check. This is where they send the link.",
    },
    {
      name: "Check Your Email",
      text: "Look for an email from BeenVerified. Click the link inside to confirm your request.",
    },
    {
      name: "Check It Worked",
      text: "Your record should be gone in 24 hours. Search for yourself again to make sure.",
    },
  ],
  faqs: [
    {
      question: "How long does removal take?",
      answer: "BeenVerified is fast. Most removals are done in 24 hours after you click the email link.",
    },
    {
      question: "Will this remove me from other sites?",
      answer: "No. BeenVerified shares data with other sites. You may need to opt out of those too.",
    },
    {
      question: "Is the opt-out for good?",
      answer: "Yes, for that record. But new records may show up later from new data sources.",
    },
    {
      question: "Can bosses still check my background?",
      answer: "Yes. Employers use other databases. This only removes you from BeenVerified's search tool.",
    },
    {
      question: "Is removal free?",
      answer: "Yes. BeenVerified opt-out is free. No payment needed to remove your data.",
    },
    {
      question: "What if I have multiple records?",
      answer: "Remove each one. You may have records for old names or addresses. Check for all versions.",
    },
    {
      question: "Why does BeenVerified have my info?",
      answer: "They gather data from public records, court files, and other sources. They put it all in one profile.",
    },
    {
      question: "Can GhostMyData help?",
      answer: "Yes. We remove you from BeenVerified and 2,100+ other sites. We watch for new data too.",
    },
  ],
  relatedBrokers: [
    { name: "Intelius", slug: "intelius" },
    { name: "TruthFinder", slug: "truthfinder" },
    { name: "Instant Checkmate", slug: "instant-checkmate" },
    { name: "Spokeo", slug: "spokeo" },
  ],
  lastUpdated: "January 24, 2026",
};

export default function BeenVerifiedRemovalPage() {
  return <BrokerRemovalTemplate broker={beenverifiedInfo} />;
}
