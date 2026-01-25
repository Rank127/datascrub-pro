import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, BookOpen, FileText, Video, Download, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Resources & Data Removal Guides | GhostMyData",
  description:
    "Free privacy resources, data removal guides, and tools to protect your personal information online. Learn how to opt out of data brokers and secure your digital footprint.",
  keywords: [
    "privacy resources",
    "data removal guides",
    "opt out guides",
    "data broker removal",
    "privacy tools",
    "personal information protection",
    "online privacy guide",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/resources",
  },
  openGraph: {
    title: "Privacy Resources & Data Removal Guides | GhostMyData",
    description:
      "Free privacy resources and guides to protect your personal information online.",
    url: "https://ghostmydata.com/resources",
    type: "website",
  },
};

const resourceCategories = [
  {
    title: "Data Broker Removal Guides",
    description: "Step-by-step instructions to remove yourself from major data brokers",
    icon: Shield,
    href: "/remove-from",
    items: [
      { name: "Spokeo Removal", href: "/remove-from/spokeo" },
      { name: "WhitePages Removal", href: "/remove-from/whitepages" },
      { name: "BeenVerified Removal", href: "/remove-from/beenverified" },
      { name: "Radaris Removal", href: "/remove-from/radaris" },
      { name: "View All 10+ Guides", href: "/remove-from" },
    ],
  },
  {
    title: "Privacy Blog",
    description: "In-depth articles on data privacy, security tips, and industry news",
    icon: BookOpen,
    href: "/blog",
    items: [
      { name: "How to Remove Yourself from Spokeo", href: "/blog/how-to-remove-yourself-from-spokeo" },
      { name: "Data Broker Industry Exposed", href: "/blog/data-broker-industry-exposed" },
      { name: "Digital Privacy Best Practices", href: "/blog/digital-privacy-best-practices" },
      { name: "View All Articles", href: "/blog" },
    ],
  },
  {
    title: "Service Comparisons",
    description: "Compare GhostMyData with other data removal services",
    icon: FileText,
    href: "/compare",
    items: [
      { name: "vs DeleteMe", href: "/compare/deleteme" },
      { name: "vs Incogni", href: "/compare/incogni" },
      { name: "vs Optery", href: "/compare/optery" },
      { name: "vs Kanary", href: "/compare/kanary" },
      { name: "vs Privacy Bee", href: "/compare/privacy-bee" },
    ],
  },
];

const quickLinks = [
  {
    title: "How It Works",
    description: "Learn how GhostMyData protects your privacy",
    href: "/how-it-works",
    icon: Video,
  },
  {
    title: "Pricing Plans",
    description: "Choose the right plan for your privacy needs",
    href: "/pricing",
    icon: CheckCircle,
  },
  {
    title: "Privacy Policy",
    description: "How we handle and protect your data",
    href: "/privacy",
    icon: FileText,
  },
];

const faqs = [
  {
    question: "What is a data broker?",
    answer:
      "Data brokers are companies that collect personal information from various sources (public records, social media, purchase history) and sell it to third parties. This information can include your name, address, phone number, email, family members, and more.",
  },
  {
    question: "How do data brokers get my information?",
    answer:
      "Data brokers collect information from public records, social media profiles, online purchases, loyalty programs, surveys, and by purchasing data from other companies. They aggregate this data to create detailed profiles.",
  },
  {
    question: "Is it legal for data brokers to sell my information?",
    answer:
      "In most cases, yes. Data brokers primarily collect publicly available information, which is legal. However, laws like CCPA in California and GDPR in Europe give consumers more rights to request removal of their data.",
  },
  {
    question: "How long does it take to remove my data?",
    answer:
      "Removal times vary by data broker. Some process requests within 24-48 hours, while others can take up to 30 days. GhostMyData monitors removals and follows up to ensure completion.",
  },
  {
    question: "Will my data stay removed permanently?",
    answer:
      "Data brokers continuously collect new data, so your information may reappear. That's why ongoing monitoring is important. GhostMyData provides continuous monitoring and re-removal as part of our service.",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Resources", url: "https://ghostmydata.com/resources" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Privacy Resources & Guides
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to protect your personal information online.
                Free guides, tools, and expert advice on data privacy.
              </p>
            </div>

            {/* Alert Banner */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-12 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">
                    Your Data is Being Sold Right Now
                  </h3>
                  <p className="text-gray-300">
                    The average American has their personal information listed on{" "}
                    <strong className="text-white">200+ data broker sites</strong>.
                    This includes your name, address, phone number, email, family members,
                    and even your estimated income.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Categories */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Browse Resources by Category
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {resourceCategories.map((category) => (
                <div
                  key={category.title}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <category.icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Quick Links
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <link.icon className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                      {link.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Protect Your Privacy?
            </h2>
            <p className="text-gray-300 mb-8">
              Let GhostMyData automatically remove your information from 200+ data
              broker sites while you focus on what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
              >
                Start Free Scan
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
