"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight } from "lucide-react";

export function LeadMagnetSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Free Privacy Checklist
            </h2>
            <p className="text-slate-400 mb-6">
              Download our comprehensive guide to protecting your personal data online.
              Includes step-by-step instructions for removing yourself from major data brokers.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "15 immediate actions to protect your privacy",
                "Data broker opt-out links and instructions",
                "Security settings checklist for all devices",
                "Identity theft prevention tips",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center">
            <div className="inline-block p-8 bg-slate-800/80 rounded-xl border border-slate-600">
              <Download className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Privacy Checklist PDF</h3>
              <p className="text-sm text-slate-400 mb-4">Free instant download</p>
              <Link href="/register?utm_source=checklist">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Get Free Checklist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500 mt-3">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
