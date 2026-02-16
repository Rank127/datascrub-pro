import type { Metadata } from "next";
import { BrokerRemovalTemplate, BrokerInfo } from "@/components/broker-removal-template";

export const metadata: Metadata = {
  title: "How to Remove Yourself from Pipl (2026 Guide) | GhostMyData",
  description:
    "Complete step-by-step guide to remove your personal information from Pipl. Learn the removal process, what data Pipl collects, and how to get your profile deleted.",
  keywords: [
    "remove from pipl",
    "pipl opt out",
    "pipl removal",
    "delete pipl listing",
    "pipl privacy",
    "remove pipl profile",
    "how to remove yourself from pipl",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/remove-from/pipl",
  },
  openGraph: {
    title: "How to Remove Yourself from Pipl (2026 Guide)",
    description: "Step-by-step instructions to remove your personal information from Pipl.",
    url: "https://ghostmydata.com/remove-from/pipl",
    type: "article",
  },
};

const piplInfo: BrokerInfo = {
  name: "Pipl",
  slug: "pipl",
  description:
    "Pipl is one of the largest people search engines, used by businesses and investigators to find detailed personal information.",
  dataCollected: [
    "Full name",
    "Email addresses",
    "Phone numbers",
    "Social media profiles",
    "Professional information",
    "Addresses",
    "Online identities",
  ],
  risks: [
    "Professional exposure",
    "Identity theft",
    "Corporate espionage",
    "Unwanted investigations",
    "Privacy violations",
  ],
  optOutUrl: "https://pipl.com/personal-information-removal-request",
  optOutTime: "PT336H",
  difficulty: "Hard",
  steps: [
    {
      name: "Search for Your Profile",
      text: "Go to pipl.com and search for your name or email address to find your profile.",
      url: "https://pipl.com",
    },
    {
      name: "Visit the Removal Page",
      text: "Go to Pipl&apos;s personal information removal request page.",
      url: "https://pipl.com/personal-information-removal-request",
    },
    {
      name: "Fill Out the Removal Form",
      text: "Complete the removal request form with your full name, email address, and any other identifying information Pipl has on file.",
    },
    {
      name: "Verify Your Identity",
      text: "Pipl may require you to verify your identity. Respond to any verification emails or provide requested documentation.",
    },
    {
      name: "Follow Up if Needed",
      text: "If you don&apos;t receive confirmation within 7 days, follow up by resubmitting the form or contacting Pipl support directly.",
    },
    {
      name: "Confirm Removal",
      text: "Wait 10-14 days, then search for yourself again on Pipl to verify your profile has been removed.",
    },
  ],
  faqs: [
    {
      question: "Why is Pipl removal difficult?",
      answer: "Pipl primarily serves business and investigative clients and treats its data as a commercial product. Their removal process can be slow and may require persistence.",
    },
    {
      question: "Does Pipl removal cost anything?",
      answer: "No. Pipl is required to process removal requests at no charge. Do not pay any third party that claims to charge for Pipl removal.",
    },
    {
      question: "How long does Pipl removal take?",
      answer: "Pipl removals typically take 10-14 days but can take longer. The process involves manual review, which adds to the timeline.",
    },
    {
      question: "Will my data reappear on Pipl?",
      answer: "It&apos;s possible. Pipl aggregates data from many sources. If your information is still publicly available elsewhere, Pipl may rebuild your profile over time.",
    },
    {
      question: "Is Pipl used by employers and investigators?",
      answer: "Yes. Pipl is widely used for background checks, fraud investigations, and people searches by businesses. Removing your profile helps protect your privacy from these lookups.",
    },
    {
      question: "Can GhostMyData handle this for me?",
      answer: "Yes. We handle Pipl removal and 2,100+ other data broker sites. We also monitor for re-listings and remove them automatically.",
    },
  ],
  relatedBrokers: [
    { name: "ZoomInfo", slug: "zoominfo" },
    { name: "PeekYou", slug: "peekyou" },
    { name: "Spokeo", slug: "spokeo" },
    { name: "Radaris", slug: "radaris" },
  ],
  lastUpdated: "February 15, 2026",
};

export default function PiplRemovalPage() {
  return <BrokerRemovalTemplate broker={piplInfo} />;
}
