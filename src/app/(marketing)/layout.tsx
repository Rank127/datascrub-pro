import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingWidgets } from "@/components/marketing/marketing-widgets";
import { CookieSettingsButton } from "@/components/consent/cookie-settings-button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Skip to content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>
      {/* Marketing Widgets */}
      <MarketingWidgets />
      {/* Navigation */}
      <nav aria-label="Main navigation" className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">GhostMyData</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/how-it-works"
                className="text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/remove-from"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Removal Guides
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 glow-emerald-sm hover:glow-emerald transition-shadow">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" className="pt-16">{children}</main>

      {/* Footer */}
      <footer aria-label="Site footer" className="border-t border-slate-800 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-5">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-emerald-500" />
                <span className="font-bold text-white">GhostMyData</span>
              </div>
              <p className="text-sm text-slate-400">
                Take control of your personal data. Find it, remove it, protect
                it.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/how-it-works" className="hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-white">
                    Compare
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Removal Guides</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/remove-from/spokeo" className="hover:text-white">
                    Remove from Spokeo
                  </Link>
                </li>
                <li>
                  <Link href="/remove-from/whitepages" className="hover:text-white">
                    Remove from Whitepages
                  </Link>
                </li>
                <li>
                  <Link href="/remove-from/beenverified" className="hover:text-white">
                    Remove from BeenVerified
                  </Link>
                </li>
                <li>
                  <Link href="/remove-from/truthfinder" className="hover:text-white">
                    Remove from TruthFinder
                  </Link>
                </li>
                <li>
                  <Link href="/remove-from/fastpeoplesearch" className="hover:text-white">
                    Remove from FastPeopleSearch
                  </Link>
                </li>
                <li>
                  <Link href="/remove-from" className="hover:text-white text-emerald-400">
                    View All Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="mailto:support@ghostmydata.com" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-white">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/vulnerability-disclosure" className="hover:text-white">
                    Vulnerability Disclosure
                  </Link>
                </li>
                <li>
                  <CookieSettingsButton />
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-slate-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <span>&copy; {new Date().getFullYear()} GhostMyData. All rights reserved.</span>
              <span>
                Breach monitoring powered by{" "}
                <a
                  href="https://leakcheck.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white underline"
                >
                  LeakCheck
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
