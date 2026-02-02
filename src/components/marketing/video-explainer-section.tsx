"use client";

import { useState } from "react";
import { Play, Shield, CheckCircle, Clock } from "lucide-react";

export function VideoExplainerSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  // YouTube video ID - replace with actual demo video
  const videoId = process.env.NEXT_PUBLIC_DEMO_VIDEO_ID || "";

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          See How It Works
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Watch how GhostMyData finds and removes your exposed personal data in minutes
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Video Player */}
        <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
          {!isPlaying ? (
            <>
              {/* Thumbnail/Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900/20">
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Animated rings */}
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="absolute inset-2 w-28 h-28 rounded-full bg-emerald-500/30 animate-pulse" />

                    {/* Play button */}
                    <button
                      onClick={handlePlay}
                      className="relative w-20 h-20 mx-6 my-6 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center shadow-lg hover:scale-105 transform duration-200"
                    >
                      <Play className="h-8 w-8 text-white ml-1" fill="white" />
                    </button>
                  </div>
                </div>

                {/* Corner badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-white">2 min demo</span>
                </div>
              </div>
            </>
          ) : videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="GhostMyData Demo"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <Shield className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-white text-lg font-medium mb-2">Demo Video Coming Soon</p>
                <p className="text-slate-400 text-sm">
                  In the meantime, start your free scan to see it in action!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">
            What you&apos;ll see in the demo:
          </h3>

          {[
            {
              title: "Instant Data Scan",
              description: "Watch as we scan 2,100+ data sources for your exposed personal information",
            },
            {
              title: "Exposure Report",
              description: "See exactly where your data appears - names, addresses, phone numbers, and more",
            },
            {
              title: "Automated Removal",
              description: "Watch removal requests get sent automatically to data brokers on your behalf",
            },
            {
              title: "Ongoing Protection",
              description: "See how continuous monitoring catches new exposures before they become problems",
            },
          ].map((feature, index) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
