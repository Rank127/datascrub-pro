import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from MyLife (2026 Guide) | GhostMyData",
  description:
    "Complete guide to remove your personal information and reputation score from MyLife. Learn the complex opt-out process.",
  keywords: [
    "remove from mylife",
    "mylife opt out",
    "mylife removal",
    "delete mylife profile",
    "mylife reputation score removal",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/mylife",
  },
};

const mylifeInfo: BrokerInfo = {
  name: "MyLife",
  slug: "mylife",
  description:
    "MyLife is a controversial people search and reputation management site that assigns 'reputation scores' to individuals based on public data, which has been criticized for inaccuracy.",
  dataCollected: [
    "Full name and aliases",
    "Current and past addresses",
    "Phone numbers",
    "Email addresses",
    "Criminal records",
    "Court records",
    "Property records",
    "Reputation score",
    "Work history",
    "Education",
    "Social media",
  ],
  risks: [
    "Reputation scores can damage personal and professional life",
    "Scores are often inaccurate and misleading",
    "Criminal records prominently featured",
    "Difficult removal process",
    "Site encourages paid 'monitoring' services",
  ],
  optOutUrl: "https://www.mylife.com/privacy-policy#opt-out",
  optOutTime: "P14D",
  difficulty: "Hard",
  steps: [
    {
      name: "Find Your MyLife Profile",
      text: "Search for your name on MyLife to locate your profile and see what information they have.",
      url: "https://www.mylife.com",
    },
    {
      name: "Review the Privacy Policy",
      text: "Navigate to MyLife's privacy policy to find their opt-out instructions.",
      url: "https://www.mylife.com/privacy-policy",
    },
    {
      name: "Contact Customer Support",
      text: "MyLife requires you to contact customer support directly for removal. Email privacy@mylife.com with your removal request.",
    },
    {
      name: "Provide Verification",
      text: "MyLife will likely request identity verification. Be prepared to provide information to prove your identity.",
    },
    {
      name: "Follow Up",
      text: "MyLife is known for slow responses. Follow up multiple times if needed.",
    },
    {
      name: "Verify Removal",
      text: "After 7-14 days, check to confirm your profile and reputation score have been removed.",
    },
  ],
  faqs: [
    {
      question: "Why is MyLife removal so difficult?",
      answer: "MyLife's business model relies on keeping profiles active to sell reputation monitoring services. They don't make removal easy.",
    },
    {
      question: "Can I remove my MyLife reputation score?",
      answer: "Yes, when your profile is removed, the reputation score goes with it. You cannot remove just the score.",
    },
    {
      question: "Has MyLife been sued for their practices?",
      answer: "Yes, MyLife has faced multiple lawsuits regarding their reputation scores and data practices.",
    },
    {
      question: "Will MyLife try to upsell me during removal?",
      answer: "Possibly. MyLife may offer paid services during the removal process. You don't need to pay to remove your data.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function MyLifeRemovalPage() {
  return <BrokerRemovalTemplate broker={mylifeInfo} />;
}
