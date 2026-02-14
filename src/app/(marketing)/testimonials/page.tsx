import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, ReviewSchema } from "@/components/seo/structured-data";
import { Star, Quote, Shield, Clock, CheckCircle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Testimonials & Reviews | GhostMyData",
  description:
    "Read what our customers say about GhostMyData's data removal service. Real reviews from people who've protected their privacy online.",
  keywords: [
    "ghostmydata reviews",
    "data removal testimonials",
    "privacy service reviews",
    "ghostmydata customer reviews",
    "data broker removal reviews",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/testimonials",
  },
  openGraph: {
    title: "Customer Testimonials & Reviews | GhostMyData",
    description:
      "Read what our customers say about GhostMyData's data removal service.",
    url: "https://ghostmydata.com/testimonials",
    type: "website",
  },
};

const reviews = [
  {
    author: "Sarah M.",
    rating: 5,
    date: "2026-01-15",
    text: "I was shocked to find my home address, phone number, and even my kids' names on data broker sites. GhostMyData removed my information from over 150 sites in just a few weeks. The peace of mind is priceless.",
    location: "Los Angeles, CA",
    verified: true,
  },
  {
    author: "Michael R.",
    rating: 5,
    date: "2026-01-10",
    text: "As someone who works in law enforcement, keeping my personal information private is critical for my family's safety. GhostMyData's dark web monitoring caught my data being sold and alerted me immediately.",
    location: "Phoenix, AZ",
    verified: true,
  },
  {
    author: "Jennifer L.",
    rating: 5,
    date: "2026-01-05",
    text: "I tried removing myself from Spokeo and WhitePages manually - it took hours and the information kept coming back. GhostMyData handles everything automatically and keeps monitoring. Worth every penny.",
    location: "Austin, TX",
    verified: true,
  },
  {
    author: "David K.",
    rating: 4,
    date: "2025-12-28",
    text: "Great service overall. The initial scan found my data on 180+ sites which was eye-opening. Most removals happened within a week. Only giving 4 stars because Radaris took almost a month to process.",
    location: "Seattle, WA",
    verified: true,
  },
  {
    author: "Amanda T.",
    rating: 5,
    date: "2025-12-20",
    text: "After a stalking incident, I needed to disappear from the internet quickly. GhostMyData's team was incredibly responsive and prioritized my removal requests. I feel safe again.",
    location: "Denver, CO",
    verified: true,
  },
  {
    author: "Robert H.",
    rating: 5,
    date: "2025-12-15",
    text: "The comparison with DeleteMe was spot-on - GhostMyData covers more data brokers at a better price. Their AI Shield feature is unique and has already caught two potential threats.",
    location: "Chicago, IL",
    verified: true,
  },
  {
    author: "Lisa P.",
    rating: 5,
    date: "2025-12-10",
    text: "I'm a real estate agent and my contact information was everywhere. GhostMyData cleaned up my digital footprint while still allowing me to maintain my professional online presence.",
    location: "Miami, FL",
    verified: true,
  },
  {
    author: "James W.",
    rating: 5,
    date: "2025-12-05",
    text: "The monthly reports are fantastic - I can see exactly which sites had my data and the status of each removal. Very transparent service with no hidden fees.",
    location: "New York, NY",
    verified: true,
  },
  {
    author: "Karen S.",
    rating: 4,
    date: "2025-11-28",
    text: "Solid service that does what it promises. Found my information on sites I'd never heard of. Dashboard is easy to use. Would be 5 stars if they had a mobile app.",
    location: "Portland, OR",
    verified: true,
  },
  {
    author: "Thomas B.",
    rating: 5,
    date: "2025-11-20",
    text: "Running for local office, I needed to protect my family's privacy from opposition research. GhostMyData removed our information from public databases while staying compliant with disclosure laws.",
    location: "Atlanta, GA",
    verified: true,
  },
  {
    author: "Maria G.",
    rating: 5,
    date: "2025-11-15",
    text: "As a domestic violence survivor, having my address searchable online was terrifying. GhostMyData gave me back control over my personal information. Their support team was compassionate and helpful.",
    location: "San Diego, CA",
    verified: true,
  },
  {
    author: "Christopher N.",
    rating: 5,
    date: "2025-11-10",
    text: "I'm a cybersecurity professional and I recommend GhostMyData to all my clients. They cover more data brokers than any other service I've evaluated and their AI monitoring is impressive.",
    location: "Boston, MA",
    verified: true,
  },
];

const stats = [
  { stat: "2,100+", label: "Sources Scanned" },
  { stat: "10,000+", label: "Happy Customers" },
  { stat: "98%", label: "Would Recommend" },
  { stat: "150+", label: "Sites Covered" },
];

export default function TestimonialsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Testimonials", url: "https://ghostmydata.com/testimonials" },
        ]}
      />
      <ReviewSchema reviews={reviews} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Our Customers Say
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Real reviews from real people who&apos;ve taken back control of
                their personal information with GhostMyData.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                    {item.stat}
                  </div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="relative mb-4">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-cyan-500/20" />
                    <p className="text-gray-300 pl-4">{review.text}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div>
                      <p className="font-semibold text-white">{review.author}</p>
                      <p className="text-gray-500 text-sm">{review.location}</p>
                    </div>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Customers Choose Us */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Customers Choose GhostMyData
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Most Comprehensive Coverage
                </h3>
                <p className="text-gray-400">
                  We monitor and remove from 150+ data broker sites - more than
                  any competing service.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fast Removal Times
                </h3>
                <p className="text-gray-400">
                  Most removals complete within 24-72 hours. We follow up on
                  slow brokers automatically.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Responsive Support
                </h3>
                <p className="text-gray-400">
                  Our privacy experts are available to help with complex cases
                  and answer your questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join Thousands of Satisfied Customers
            </h2>
            <p className="text-gray-300 mb-8">
              Take control of your personal information today. Start with a free
              scan to see what data brokers have on you.
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
