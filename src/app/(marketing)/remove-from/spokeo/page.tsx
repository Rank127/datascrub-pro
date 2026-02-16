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
    "Spokeo is a large people-search site. It has over 12 billion records. It pulls data from public records and social media.",
  dataCollected: [
    "Your full name",
    "Where you live now and before",
    "Phone numbers",
    "Email addresses",
    "Family and friends",
    "Social media links",
    "Property you own",
    "Court records",
    "Jobs you've had",
    "Schools you went to",
  ],
  risks: [
    "Thieves can steal your identity",
    "Stalkers can find your address",
    "Scammers can spam you",
    "Employers may see old info",
    "Your location is public",
  ],
  optOutUrl: "https://www.spokeo.com/optout",
  optOutTime: "PT72H",
  difficulty: "Easy",
  steps: [
    {
      name: "Find Your Listing",
      text: "Go to spokeo.com. Search your name. Find your profile. Copy the URL.",
      url: "https://www.spokeo.com",
    },
    {
      name: "Go to Opt-Out",
      text: "Visit the Spokeo opt-out page. This is the only way to remove your data.",
      url: "https://www.spokeo.com/optout",
    },
    {
      name: "Submit Your URL",
      text: "Paste your profile URL. Enter your email to get a confirmation link.",
    },
    {
      name: "Do the CAPTCHA",
      text: "Prove you're human. Click 'Remove This Listing'.",
    },
    {
      name: "Check Your Email",
      text: "Look for Spokeo's email. Click the link within 72 hours.",
    },
    {
      name: "Check It Worked",
      text: "Wait 3-5 days. Search yourself again. Your listing should be gone.",
    },
  ],
  faqs: [
    {
      question: "How long does removal take?",
      answer: "Most removals take 3-5 days. Some take up to 2 weeks. Click the email link within 72 hours.",
    },
    {
      question: "Will my data stay gone?",
      answer: "That listing stays gone. But Spokeo may make a new one if they get your data again. Ongoing checks help.",
    },
    {
      question: "Do I have multiple listings?",
      answer: "Maybe. You might have profiles for name variants or old addresses. Remove each one.",
    },
    {
      question: "Is opt-out free?",
      answer: "Yes. Spokeo opt-out costs nothing. Watch out for scams that charge fees.",
    },
    {
      question: "Can I remove someone else?",
      answer: "No. Spokeo needs email proof. The owner of the data must do it.",
    },
    {
      question: "What if I don't get the email?",
      answer: "Check your spam folder. The email comes from Spokeo. If nothing shows up, try again.",
    },
    {
      question: "Why does Spokeo have my data?",
      answer: "Spokeo pulls data from public records, social media, and other sources. They build profiles on millions of people.",
    },
    {
      question: "Can GhostMyData do this for me?",
      answer: "Yes. We remove you from Spokeo and 2,100+ other sites. We also monitor for new data and remove it again.",
    },
  ],
  relatedBrokers: [
    { name: "WhitePages", slug: "whitepages" },
    { name: "TruePeopleSearch", slug: "truepeoplesearch" },
    { name: "FastPeopleSearch", slug: "fastpeoplesearch" },
    { name: "BeenVerified", slug: "beenverified" },
  ],
  lastUpdated: "January 24, 2026",
};

export default function SpokeoRemovalPage() {
  return <BrokerRemovalTemplate broker={spokeoInfo} />;
}
