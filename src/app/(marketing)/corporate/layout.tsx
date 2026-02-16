import Link from "next/link";
import { Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Corporate-specific navigation — overrides the parent marketing nav */}
      <div className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">GhostMyData</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/corporate#pricing"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/corporate#how-it-works"
                className="text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/corporate#features"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/corporate#faq"
                className="text-slate-300 hover:text-white transition-colors"
              >
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <a href="mailto:sales@ghostmydata.com">
                <Button className="bg-violet-600 hover:bg-violet-700 gap-2">
                  <Mail className="h-4 w-4" />
                  Talk to Sales
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
