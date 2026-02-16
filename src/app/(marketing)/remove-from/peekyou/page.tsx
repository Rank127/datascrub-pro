import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from PeekYou (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from PeekYou. Learn the opt-out process, what data PeekYou collects, and how to permanently delete your listing.",
  keywords: [
    "remove from peekyou",
    "peekyou opt out",
    "peekyou removal",
    "delete peekyou listing",
    "peekyou privacy",
    "remove peekyou profile",
    "how to remove yourself from peekyou",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/peekyou",
  },
  openGraph: {
    title: "How to Remove Yourself from PeekYou (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from PeekYou.",
    url: "https://ghostmydata.com/remove-from/peekyou",
    type: "article",
  },
};

const peekYouInfo: BrokerInfo = {
  name: "PeekYou",
  slug: "peekyou",
  description:
    "PeekYou is a people search engine that indexes social media profiles, news mentions, and web pages to build public profiles.",
  dataCollected: [
    "Full name",
    "Social media profiles",
    "Web mentions",
    "Photos",
    "Email addresses",
    "Age",
    "Location",
  ],
  risks: [
    "Social engineering attacks",
    "Privacy invasion",
    "Unwanted contact",
    "Profile aggregation",
    "Reputation issues",
  ],
  optOutUrl: "https://www.peekyou.com/about/contact/",
  optOutTime: "PT48H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your Profile",
      text: "Go to peekyou.com and search for your name. Find your profile and copy the URL.",
      url: "https://www.peekyou.com",
    },
    {
      name: "Visit the Contact Page",
      text: "Go to PeekYou&apos;s contact page to submit your removal request.",
      url: "https://www.peekyou.com/about/contact/",
    },
    {
      name: "Submit Removal Request",
      text: "Fill out the contact form requesting removal of your profile. Include your profile URL and full name.",
    },
    {
      name: "Provide Verification",
      text: "If PeekYou responds requesting verification, provide the requested information to confirm your identity.",
    },
    {
      name: "Confirm Removal",
      text: "Wait 24-48 hours, then search for yourself again on PeekYou to verify your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does PeekYou removal take?",
      answer: "PeekYou removals are typically processed within 24-48 hours. This is one of the faster removal processes among people search sites.",
    },
    {
      question: "Is PeekYou opt-out free?",
      answer: "Yes. PeekYou does not charge for removing your profile. The process is free and handled through their contact form.",
    },
    {
      question: "Will my profile come back on PeekYou?",
      answer: "It can. PeekYou indexes public web content continuously. If your social media profiles or web mentions are still public, a new profile may be created over time.",
    },
    {
      question: "Does PeekYou collect social media data?",
      answer: "Yes. PeekYou specializes in aggregating social media profiles, linking them together with public records to create a unified profile for each person.",
    },
    {
      question: "Can GhostMyData handle this for me?",
      answer: "Yes. We remove you from PeekYou and 2,100+ other data broker sites. We also monitor for new listings and remove them automatically.",
    },
  ],
  lastUpdated: "February 15, 2026",
};

export default function PeekYouRemovalPage() {
  return <BrokerRemovalTemplate broker={peekYouInfo} />;
}
