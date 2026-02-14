"use client";

import Link from "next/link";
import { Star, BadgeCheck, Shield } from "lucide-react";

const testimonials = [
  {
    author: "Sarah M.",
    role: "Verified Customer",
    location: "Los Angeles, CA",
    text: "GhostMyData removed my information from over 150 sites in just a few weeks. The peace of mind is priceless.",
    rating: 5,
  },
  {
    author: "Michael R.",
    role: "Law Enforcement Professional",
    location: "Phoenix, AZ",
    text: "The dark web monitoring caught my data being sold and alerted me immediately. Critical for my family's safety.",
    rating: 5,
  },
  {
    author: "Jennifer L.",
    role: "Verified Customer",
    location: "Austin, TX",
    text: "I tried removing myself manually - it took hours and kept coming back. GhostMyData handles everything automatically.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-slate-900/50 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real customers who took back control of their privacy
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-slate-400">2,100+ data sources scanned</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= testimonial.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-300 mb-4 italic">&quot;{testimonial.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-semibold">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    {testimonial.author}
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-sm text-slate-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/testimonials" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Read more reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}
