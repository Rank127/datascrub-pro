import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Nuwber (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Nuwber. Learn the opt-out process, what data Nuwber collects, and how to permanently delete your listing.",
  keywords: [
    "remove from nuwber",
    "nuwber opt out",
    "nuwber removal",
    "delete nuwber listing",
    "nuwber privacy",
    "remove nuwber profile",
    "how to remove yourself from nuwber",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/nuwber",
  },
  openGraph: {
    title: "How to Remove Yourself from Nuwber (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Nuwber.",
    url: "https://ghostmydata.com/remove-from/nuwber",
    type: "article",
  },
};

const nuwberInfo: BrokerInfo = {
  name: "Nuwber",
  slug: "nuwber",
  description:
    "Nuwber is a people-search site that collects public records and creates detailed profiles with contact info, addresses, and more.",
  dataCollected: [
    "Full name",
    "Addresses",
    "Phone numbers",
    "Email addresses",
    "Age",
    "Relatives",
    "Social media",
    "Employment",
  ],
  risks: [
    "Identity theft",
    "Unwanted contact",
    "Stalking",
    "Spam",
    "Privacy invasion",
  ],
  optOutUrl: "https://nuwber.com/removal/link",
  optOutTime: "PT168H",
  difficulty: "Medium",
  steps: [
    {
      name: "Find Your Profile",
      text: "Go to nuwber.com and search for your name. Locate your profile and copy the URL.",
      url: "https://nuwber.com",
    },
    {
      name: "Go to the Removal Page",
      text: "Visit the Nuwber removal page to begin the opt-out process.",
      url: "https://nuwber.com/removal/link",
    },
    {
      name: "Submit Your Profile URL",
      text: "Paste the URL of your Nuwber profile into the removal form.",
    },
    {
      name: "Verify Your Identity",
      text: "Enter your email address. Nuwber will send a verification link to confirm your identity.",
    },
    {
      name: "Confirm via Email",
      text: "Check your inbox for the verification email from Nuwber. Click the confirmation link to finalize your removal.",
    },
    {
      name: "Verify Removal",
      text: "Wait 5-7 days, then search for yourself again on Nuwber to confirm your listing has been removed.",
    },
  ],
  faqs: [
    {
      question: "How long does Nuwber removal take?",
      answer: "Most removals are processed within 5-7 days. In some cases it may take up to 2 weeks. Make sure to click the verification email link promptly.",
    },
    {
      question: "Is Nuwber opt-out free?",
      answer: "Yes. Nuwber&apos;s removal process is completely free. Do not pay any third-party site that claims to charge for Nuwber removal.",
    },
    {
      question: "Will my data come back on Nuwber?",
      answer: "It&apos;s possible. Nuwber continuously collects public records data. Your profile may reappear if new data sources are indexed. Regular monitoring helps.",
    },
    {
      question: "Can I remove multiple listings?",
      answer: "Yes. If you have multiple profiles on Nuwber under different name variations or addresses, you need to submit a separate removal request for each one.",
    },
    {
      question: "Can GhostMyData handle this for me?",
      answer: "Yes. We remove you from Nuwber and 2,100+ other data broker sites. We also monitor for new listings and remove them automatically.",
    },
  ],
  relatedBrokers: [
    { name: "Spokeo", slug: "spokeo" },
    { name: "WhitePages", slug: "whitepages" },
    { name: "PeopleFinder", slug: "peoplefinder" },
    { name: "Cocofinder", slug: "cocofinder" },
    { name: "BeenVerified", slug: "beenverified" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function NuwberRemovalPage() {
  return <BrokerRemovalTemplate broker={nuwberInfo} />;
}
