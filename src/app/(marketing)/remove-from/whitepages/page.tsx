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
    "WhitePages is a large people search site. It has contact info and addresses for millions of people. It's one of the oldest data brokers in the US.",
  dataCollected: [
    "Your full name",
    "Where you live now and before",
    "Phone numbers",
    "Age and birthday",
    "Family and roommates",
    "Property you own",
    "Criminal records (paid)",
    "Bankruptcy info",
    "Liens and judgments",
    "Job licenses",
  ],
  risks: [
    "Anyone can find your home address",
    "Scammers get your phone number",
    "Criminal data can hurt job searches",
    "Family ties are exposed",
    "Past addresses show where you've lived",
  ],
  optOutUrl: "https://www.whitepages.com/suppression-requests",
  optOutTime: "PT48H",
  difficulty: "Medium",
  steps: [
    {
      name: "Find Your Profile",
      text: "Go to whitepages.com. Search for your name. Find your listing. Copy the URL.",
      url: "https://www.whitepages.com",
    },
    {
      name: "Go to Opt-Out Page",
      text: "Visit the opt-out page to start removal.",
      url: "https://www.whitepages.com/suppression-requests",
    },
    {
      name: "Add Your Profile URL",
      text: "Paste your profile URL. Do this for each listing you have.",
    },
    {
      name: "Verify by Phone",
      text: "Enter your phone number. You'll get a call with a code.",
    },
    {
      name: "Enter the Code",
      text: "Answer the call. Write down the code. Type it on the site.",
    },
    {
      name: "Check It Worked",
      text: "Your listing should be gone in 24-48 hours. Search again to be sure.",
    },
  ],
  faqs: [
    {
      question: "Why do they need my phone?",
      answer: "They want to make sure you own the listing. It stops others from removing your data. It's a safety check.",
    },
    {
      question: "Can I skip the phone step?",
      answer: "No, you must verify by phone. GhostMyData can handle this for you without sharing your number directly.",
    },
    {
      question: "Does this remove WhitePages Premium too?",
      answer: "No. WhitePages and WhitePages Premium are different. You may need to remove from both.",
    },
    {
      question: "How fast is removal?",
      answer: "Most removals take 24-48 hours. WhitePages is one of the faster sites.",
    },
    {
      question: "Will my data come back?",
      answer: "It can. WhitePages gets new data from public records. Your info may show up again later.",
    },
  ],
  lastUpdated: "January 24, 2026",
};

export default function WhitepagesRemovalPage() {
  return <BrokerRemovalTemplate broker={whitepagesInfo} />;
}
