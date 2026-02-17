/**
 * Content Optimizer Cron
 *
 * Daily automated content optimization for SEO improvements.
 * Target: 100% SEO score within a week through incremental improvements.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { logCronExecution } from "@/lib/cron-logger";
import { getAdminFromEmail } from "@/lib/email";
import { runFullSEOReport } from "@/lib/agents/seo-agent";
import {
  calculateReadability,
  countWords,
  urlToFilePath,
  OptimizationConfig,
} from "@/lib/agents/content-agent/page-optimizer";
import {
  getOptimizationKeywords,
  getKeywordStats,
} from "@/lib/agents/shared/keyword-intelligence";
import { getDirective } from "@/lib/mastermind/directives";
import { verifyCronAuth } from "@/lib/cron-auth";
import * as fs from "fs/promises";
import * as path from "path";

export const maxDuration = 300;

// ============================================================================
// CONFIGURATION
// ============================================================================

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@ghostmydata.com";

// Default keywords (used if keyword intelligence not available)
const DEFAULT_KEYWORDS = [
  "data removal service",
  "remove personal information",
  "data broker removal",
  "privacy protection",
  "delete my data online",
];

// Target configuration - aiming for 100% over a week
// Keywords are loaded dynamically from the shared intelligence store
// Thresholds are overridable via strategic directives
async function getTargetConfig(): Promise<OptimizationConfig> {
  // Try to get keywords from the shared intelligence store
  let targetKeywords = DEFAULT_KEYWORDS;
  try {
    targetKeywords = await getOptimizationKeywords(10);
    console.log(`[Content Optimizer] Using ${targetKeywords.length} keywords from intelligence store`);
  } catch {
    console.log("[Content Optimizer] Using default keywords (intelligence store not available)");
  }

  // Read targets from strategic directives (falls back to hardcoded defaults)
  const targetWordCount = await getDirective("content_target_wordcount", 1000);
  const targetReadability = await getDirective("content_target_readability", 65);
  const focusTopics = await getDirective<string[]>("content_focus_topics", []);

  if (focusTopics.length > 0) {
    console.log(`[Content Optimizer] Focus topics from directives: ${focusTopics.join(", ")}`);
    // Prepend focus topics to keywords so they take priority
    targetKeywords = [...focusTopics, ...targetKeywords.filter(kw => !focusTopics.includes(kw))];
  }

  return {
    targetWordCount, // Minimum words for comprehensive content
    targetReadability, // Good readability (60-70 is ideal)
    targetKeywords,
  };
}

// Pages to optimize (in priority order)
const PAGES_TO_OPTIMIZE = [
  { url: "https://ghostmydata.com/compare", priority: 1, pageType: "compare" },
  { url: "https://ghostmydata.com/remove-from", priority: 1, pageType: "remove-from" },
  { url: "https://ghostmydata.com/security", priority: 2, pageType: "security" },
  { url: "https://ghostmydata.com/privacy", priority: 2, pageType: "privacy" },
  { url: "https://ghostmydata.com/terms", priority: 3, pageType: "terms" },
];

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

interface OptimizationProgress {
  date: string;
  seoScore: number;
  technicalScore: number;
  contentScore: number;
  pageStats: Record<string, {
    wordCount: number;
    readability: number;
    keywordsFound: number;
    lastOptimized: string | null;
  }>;
  targetProgress: number; // Percentage toward 100% goal
}

const PROGRESS_FILE = path.join("/tmp", "content-optimization-progress.json");

async function loadProgress(): Promise<OptimizationProgress[]> {
  try {
    const data = await fs.readFile(PROGRESS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProgress(progress: OptimizationProgress): Promise<void> {
  const history = await loadProgress();
  history.push(progress);
  // Keep last 30 days
  const recent = history.slice(-30);
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(recent, null, 2));
}

// ============================================================================
// CONTENT GENERATION
// ============================================================================

async function generateOptimizedContent(
  pageType: string
): Promise<string> {
  // Generate content based on page type with SEO best practices
  const contents: Record<string, string> = {
    compare: `
## Compare Data Removal Services - Find Your Best Option

Looking for the best data removal service? You're in the right place. We help you understand your options. Making the right choice protects your privacy. Let's explore what matters most.

### Why Data Removal Services Matter

Your personal information is everywhere online. Data brokers collect and sell it daily. This creates real risks for you and your family. Identity theft is a growing concern. Unwanted contact disrupts your life. A good data removal service solves these problems.

Data removal services scan the internet for your information. They find where your data appears. Then they request removal on your behalf. The best services monitor continuously. They catch new exposures quickly. This ongoing protection is essential.

### What to Look For

Not all data removal services are equal. Coverage matters most. How many data broker sites do they check? The best services cover 200+ sites. Speed is also important. Fast removal reduces your exposure time.

Look for automated processes. Manual removal takes too long. Automation ensures consistent results. Check for monitoring features too. One-time removal isn't enough. Your data reappears over time. Continuous monitoring catches this.

Consider the support options available. Can you reach someone when needed? Good support makes a difference. Look at pricing too. Monthly and annual plans vary. Annual plans often save money.

### How GhostMyData Compares

GhostMyData offers comprehensive privacy protection. We cover 200+ data broker sites. We submit removal requests on your behalf and verify each removal completes.

Our continuous monitoring catches new exposures. When your data reappears, we remove it again. This is included in your subscription. No extra charges for re-removal.

We provide detailed progress reports. You see exactly what we're doing. Our dashboard shows all your exposures. Track removals in real-time.

### Making Your Decision

Choose based on your specific needs. Consider your risk level. Think about your budget. Look at the features offered. Read reviews from real users.

A data removal service is an investment in privacy. The right choice protects you for years. Take time to compare your options. We're confident GhostMyData is the best choice.

### Frequently Asked Questions

**How long does removal take?**
Most removals complete within 2-4 weeks. Some sites take longer due to their processes. We keep you updated throughout.

**What information do you need?**
We need your name and contact details. This helps us find your data online. We protect this information with strong encryption.

**Can I cancel anytime?**
Yes, cancel your subscription whenever you want. No long-term contracts. No cancellation fees.

**Do you offer a guarantee?**
Yes, we offer a satisfaction guarantee. If you're not happy, let us know. We'll make it right.
    `.trim(),

    "remove-from": `
## Remove Your Personal Information from Data Brokers

Your personal data is being sold right now. Data brokers collect information about millions of people. They sell it to anyone willing to pay. This includes your name, address, phone number, and more.

Removing your information protects your privacy. It reduces unwanted contact. It helps prevent identity theft. Our data removal service makes this easy.

### How Data Brokers Get Your Information

Data brokers gather information from many sources. Public records are a major source. This includes property records and court documents. Voter registrations contain valuable data too.

They also scrape social media profiles. Your posts reveal a lot about you. Online purchases provide more details. All this builds a comprehensive profile.

This profile appears on people-search sites. Anyone can find your information there. A simple search reveals your address. Your phone number is exposed. Even your relatives may be listed.

### The Risks of Exposed Data

Exposed personal data creates serious risks. Identity thieves use this information. They open accounts in your name. They make purchases you'll be billed for.

Stalkers and harassers find targets easily. Your home address shouldn't be public. Neither should your phone number. Exposed data makes you vulnerable.

Scammers use this data for targeted attacks. They know details about your life. This makes their scams more convincing. Protecting your data protects you from fraud.

### Our Data Removal Process

We make removing your information simple. Here's how our process works:

**Step 1: Comprehensive Scan**
We scan 200+ data broker sites. We search for your personal information. We identify everywhere you appear.

**Step 2: Removal Requests**
We submit removal requests to each site. Every site has different requirements. We handle all the paperwork for you.

**Step 3: Verification**
We verify each removal completes. This ensures your data is actually gone. We follow up on pending requests.

**Step 4: Continuous Monitoring**
We keep monitoring for new exposures. Data brokers re-add information over time. We catch and remove new appearances.

### Why Choose GhostMyData

We're experts in data broker removal. Our service is fully automated. Set it up once and we handle everything. Our team monitors results continuously.

We cover more sites than most competitors. Our removal rate is among the highest. We provide detailed progress reports. You always know where things stand.

Our pricing is transparent. No hidden fees or surprises. Monthly and annual plans available. Cancel anytime without penalty.

### Take Action Today

Every day you wait, your data spreads further. More sites copy your information. More people can find you. Take control of your privacy now.

Start with a free privacy scan. See where your data appears. Understand your exposure level. Then decide on the best protection plan for you.
    `.trim(),

    security: `
## Security at GhostMyData - Protecting Your Privacy

Security is fundamental to everything we do. As a data removal service, we handle sensitive personal information. We protect it with the highest security standards. Your trust depends on our security practices.

### Our Security Philosophy

We believe privacy requires security. You can't have one without the other. That's why we invest heavily in security. We follow industry best practices. We go beyond minimum requirements.

Our security team monitors threats constantly. We update our defenses regularly. We learn from security incidents globally. This proactive approach keeps you safe.

### Data Encryption Standards

We encrypt all data in transit and at rest. No exceptions. Your personal information is always protected.

**In Transit Encryption**
We use TLS 1.3 for all connections. This is the latest encryption standard. Your data cannot be intercepted during transmission. Man-in-the-middle attacks are prevented.

**At Rest Encryption**
Stored data uses AES-256 encryption. This is military-grade protection. Even if systems were compromised, data remains unreadable. We rotate encryption keys regularly.

### Infrastructure Security

Our infrastructure is designed for security. We use leading cloud providers. All servers run in secure data centers. Physical access is strictly controlled.

We employ multiple security layers. Firewalls block unauthorized access. Intrusion detection monitors for threats. Anti-malware protection runs continuously.

All systems receive regular updates. Security patches are applied promptly. We don't wait for problems to arise. Proactive maintenance prevents issues.

### Access Control

We strictly limit data access. Only authorized personnel can view customer data. Each access is logged and monitored. We review logs regularly for anomalies.

Our team undergoes background checks. They receive security training regularly. They understand their responsibility. Protecting your data is their priority.

Role-based permissions limit access further. Employees only see what they need. This minimizes exposure risk. It's a core security principle.

### Compliance and Audits

We comply with major privacy regulations. GDPR requirements are met fully. CCPA compliance is maintained. We support your privacy rights.

Regular security audits verify our practices. Third-party experts examine our systems. They identify any weaknesses. We address findings promptly.

We maintain SOC 2 compliance standards. This covers security and availability. It demonstrates our commitment. Your data is in safe hands.

### Incident Response

Despite all precautions, incidents can occur. We're prepared for this possibility. Our incident response plan is tested regularly. We know exactly how to respond.

If an incident affects your data, we notify you promptly. Transparency is essential. You deserve to know what happened. We explain our response actions clearly.

### Responsible Disclosure

Security researchers help improve security. We welcome their contributions. Our responsible disclosure program provides a safe channel. Researchers can report vulnerabilities without fear.

We respond to reports quickly. Valid findings receive recognition. We fix issues promptly. This collaboration makes everyone safer.

### Your Role in Security

Security is a partnership. We protect our systems. You protect your account. Use strong, unique passwords. Enable two-factor authentication when available.

Keep your contact information current. This ensures you receive important notifications. Report any suspicious activity promptly. Together we maintain strong security.
    `.trim(),

    privacy: `
## Privacy Policy - How We Protect Your Information

At GhostMyData, privacy is our mission. We help you remove personal information from the internet. We take your privacy seriously in everything we do. This policy explains our practices clearly.

### Our Commitment to Privacy

We are a data removal service dedicated to your privacy. We understand the value of personal information. We know the risks of exposure. That's why we handle your data with extreme care.

We collect only what we need. We use it only for stated purposes. We never sell your information. We protect it with strong security. These principles guide all our decisions.

### Information We Collect

To remove your data from the internet, we need some information. Here's what we collect and why:

**Personal Information**
We collect your name and contact details. This includes your email address and phone number. We need this to find your data online. We also use it to communicate with you.

**Address Information**
Current and past addresses help us locate your records. Data brokers often list multiple addresses. We need to find and remove them all.

**Payment Information**
We collect payment details for subscriptions. Credit card numbers are processed securely. We use trusted payment processors. We never store full card numbers.

**Usage Data**
We collect information about how you use our service. This includes pages visited and features used. We use this to improve our service. We don't track you across other websites.

### How We Use Your Information

We use your information for these specific purposes:

**Data Removal**
This is our primary purpose. We search for your information online. We submit removal requests to data brokers. We verify removals complete successfully.

**Service Communication**
We send updates about your removal progress. We notify you of new exposures found. We communicate important service changes.

**Service Improvement**
We analyze usage patterns to improve features. We identify problems and fix them. We develop new capabilities based on needs.

**Support**
We use your information to provide support. This helps us resolve issues quickly. We maintain records of support interactions.

### Information We Never Sell

We want to be absolutely clear. We never sell your personal information. We never share it with marketers. We never provide it to advertisers. Your data is not a product we sell.

### Data Security

We protect your information with strong security. Encryption protects data in transit. Encryption protects data at rest. Access controls limit who can see data. Regular audits verify our practices.

### Your Rights

You have important rights regarding your data:

**Access**
You can request a copy of your information. We'll provide it within 30 days.

**Correction**
You can request corrections to inaccurate data. We'll update our records promptly.

**Deletion**
You can request deletion of your account. We'll remove your information from our systems.

**Portability**
You can request your data in a portable format. This helps if you switch services.

### Contact Us

Questions about this privacy policy? Contact us at privacy@ghostmydata.com. We're happy to explain our practices. Your understanding matters to us.
    `.trim(),

    terms: `
## Terms of Service - Using GhostMyData

Welcome to GhostMyData. These terms govern your use of our data removal service. Please read them carefully before using our service. By using GhostMyData, you agree to these terms.

### About Our Service

GhostMyData is a data removal service. We help remove personal information from the internet. We scan data broker websites for your data. We submit removal requests on your behalf. We monitor for new exposures continuously.

Our service requires accurate information from you. This helps us find and remove your data effectively. We work hard to protect your privacy. Results may vary based on data broker policies.

### Account Registration

To use our service, you must create an account. You agree to provide accurate information. You agree to keep your information current. You're responsible for your account security.

Keep your password confidential. Don't share your account with others. Notify us immediately of unauthorized access. You're responsible for all activity under your account.

### Your Authorization

You authorize us to act on your behalf. This authorization lets us submit removal requests. It lets us communicate with data brokers. It lets us take necessary actions for removal.

This authorization is limited to data removal activities. We won't use it for other purposes. You can revoke this authorization anytime. Revocation ends our ability to submit new requests.

### Your Responsibilities

You agree to these responsibilities:

**Accurate Information**
Provide accurate personal information. Inaccurate information makes removal difficult. Update your information if it changes.

**Lawful Use**
Use our service only for lawful purposes. Don't use it to harm others. Don't use it for illegal activities.

**Account Security**
Maintain your account security. Use strong passwords. Report unauthorized access promptly.

**Compliance**
Comply with these terms. Comply with applicable laws. Respect others' rights.

### Subscription and Payment

Our service requires a paid subscription. You agree to pay all applicable fees. Fees are billed in advance. Monthly or annual billing options available.

You authorize us to charge your payment method. Charges recur until you cancel. Failed payments may suspend your service. We may change pricing with notice.

### Cancellation

You may cancel your subscription anytime. Cancellation takes effect at period end. No refunds for partial periods used. You retain access until the period ends.

To cancel, visit your account settings. Or contact our support team. We'll confirm your cancellation in writing.

### Service Limitations

We strive for complete removal but cannot guarantee it. Data brokers control their own sites. Some may refuse removal requests. Some may re-add your data later.

We cannot guarantee specific timeframes. Removal times vary by site. We cannot control data broker policies. We work within their systems and requirements.

### Limitation of Liability

Our liability is limited to fees you've paid. We're not liable for indirect damages. We're not liable for lost profits. These limitations apply to the fullest extent permitted.

### Changes to Terms

We may update these terms occasionally. We'll notify you of significant changes. Continued use means acceptance of changes. Review the terms periodically.

### Contact Us

Questions about these terms? Contact us at legal@ghostmydata.com. We're happy to clarify any provisions. Your understanding is important to us.
    `.trim(),
  };

  return contents[pageType] || contents.compare;
}

// ============================================================================
// MAIN OPTIMIZATION LOGIC
// ============================================================================

async function runOptimization(): Promise<{
  seoScore: number;
  pagesOptimized: number;
  improvements: string[];
  progress: OptimizationProgress;
  keywordStats?: {
    totalDiscovered: number;
    highRelevance: number;
    gaps: number;
    lastUpdated: string;
  };
}> {
  const improvements: string[] = [];

  // Step 0: Get dynamic keyword configuration
  const TARGET_CONFIG = await getTargetConfig();
  console.log(`[Content Optimizer] Target keywords: ${TARGET_CONFIG.targetKeywords.slice(0, 5).join(", ")}...`);

  // Step 1: Run SEO analysis to get current state (this also runs keyword research)
  console.log("[Content Optimizer] Running SEO analysis with keyword research...");
  const seoResult = await runFullSEOReport();

  const currentScore = seoResult.report.overallScore;
  const technicalScore = seoResult.report.technicalScore;
  const contentScore = seoResult.report.contentScore;

  console.log(`[Content Optimizer] Current SEO Score: ${currentScore}/100`);

  // Step 2: Analyze each page and optimize if needed
  const pageStats: OptimizationProgress["pageStats"] = {};
  let pagesOptimized = 0;

  for (const page of PAGES_TO_OPTIMIZE) {
    const filePath = urlToFilePath(page.url);
    if (!filePath) continue;

    try {
      // Read current file
      const content = await fs.readFile(filePath, "utf-8");

      // Extract text for analysis
      const textContent = content
        .replace(/<[^>]+>/g, " ")
        .replace(/\{[^}]+\}/g, " ")
        .replace(/className="[^"]*"/g, "")
        .replace(/\s+/g, " ");

      const wordCount = countWords(textContent);
      const readability = calculateReadability(textContent);
      const keywordsFound = TARGET_CONFIG.targetKeywords.filter(
        kw => textContent.toLowerCase().includes(kw.toLowerCase())
      ).length;

      pageStats[page.url] = {
        wordCount,
        readability,
        keywordsFound,
        lastOptimized: null,
      };

      // Check if optimization needed
      const needsOptimization =
        wordCount < TARGET_CONFIG.targetWordCount ||
        readability < TARGET_CONFIG.targetReadability ||
        keywordsFound < 3;

      if (needsOptimization) {
        console.log(`[Content Optimizer] Optimizing: ${page.url}`);

        // Generate optimized content
        const optimizedContent = await generateOptimizedContent(
          page.pageType
        );

        // Save as draft for review/application
        const draftPath = filePath.replace(".tsx", ".optimized.md");
        await fs.writeFile(
          draftPath,
          `# Optimized Content for ${page.url}\n\n` +
          `Generated: ${new Date().toISOString()}\n\n` +
          `Original Word Count: ${wordCount}\n` +
          `Target Word Count: ${TARGET_CONFIG.targetWordCount}\n\n` +
          `Original Readability: ${readability}\n` +
          `Target Readability: ${TARGET_CONFIG.targetReadability}\n\n` +
          `---\n\n${optimizedContent}`
        );

        const newWordCount = countWords(optimizedContent);
        const newReadability = calculateReadability(optimizedContent);

        pageStats[page.url].lastOptimized = new Date().toISOString();
        pagesOptimized++;

        improvements.push(
          `${page.url}: Words ${wordCount}→${newWordCount}, Readability ${readability}→${newReadability}`
        );
      }
    } catch (error) {
      console.error(`[Content Optimizer] Error processing ${page.url}:`, error);
    }
  }

  // Step 3: Calculate progress toward 100%
  const targetProgress = Math.round((currentScore / 100) * 100);

  // Step 4: Create progress record
  const progress: OptimizationProgress = {
    date: new Date().toISOString(),
    seoScore: currentScore,
    technicalScore,
    contentScore,
    pageStats,
    targetProgress,
  };

  // Save progress
  await saveProgress(progress);

  // Get keyword intelligence stats
  let kwStats;
  try {
    kwStats = await getKeywordStats();
  } catch {
    kwStats = undefined;
  }

  return {
    seoScore: currentScore,
    pagesOptimized,
    improvements,
    progress,
    keywordStats: kwStats,
  };
}

// ============================================================================
// EMAIL NOTIFICATION
// ============================================================================

async function sendOptimizationReport(result: {
  seoScore: number;
  pagesOptimized: number;
  improvements: string[];
  progress: OptimizationProgress;
  keywordStats?: {
    totalDiscovered: number;
    highRelevance: number;
    gaps: number;
    lastUpdated: string;
  };
}): Promise<void> {
  if (!resend) {
    console.log("[Content Optimizer] Email not configured, skipping report");
    return;
  }

  const history = await loadProgress();
  const previousScore = history.length > 1 ? history[history.length - 2]?.seoScore : result.seoScore;
  const scoreChange = result.seoScore - previousScore;
  const daysToTarget = Math.ceil((100 - result.seoScore) / Math.max(1, scoreChange));

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; }
    h1 { color: #22d3ee; margin-top: 0; }
    h2 { color: #94a3b8; font-size: 16px; margin-top: 24px; }
    .score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
    .score-value { color: ${result.seoScore >= 90 ? '#22c55e' : result.seoScore >= 70 ? '#eab308' : '#ef4444'}; }
    .change { font-size: 18px; color: ${scoreChange >= 0 ? '#22c55e' : '#ef4444'}; }
    .progress-bar { background: #334155; border-radius: 8px; height: 20px; overflow: hidden; margin: 16px 0; }
    .progress-fill { background: linear-gradient(90deg, #22d3ee, #22c55e); height: 100%; transition: width 0.5s; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .stat-box { background: #334155; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-value { font-size: 20px; font-weight: bold; color: #22d3ee; }
    .stat-label { font-size: 12px; color: #94a3b8; }
    .improvement { background: #334155; border-radius: 8px; padding: 12px; margin: 8px 0; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Daily Content Optimization Report</h1>

    <div class="score">
      <span class="score-value">${result.seoScore}</span>/100
      <div class="change">${scoreChange >= 0 ? '+' : ''}${scoreChange} from yesterday</div>
    </div>

    <h2>Progress to 100% Target</h2>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${result.seoScore}%"></div>
    </div>
    <p style="text-align: center; color: #94a3b8;">
      ${result.seoScore >= 100 ? '🎉 Target achieved!' : `Estimated ${daysToTarget > 7 ? '7+' : daysToTarget} days to reach 100%`}
    </p>

    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value">${result.progress.technicalScore}</div>
        <div class="stat-label">Technical Score</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${result.progress.contentScore}</div>
        <div class="stat-label">Content Score</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${result.pagesOptimized}</div>
        <div class="stat-label">Pages Optimized</div>
      </div>
    </div>

    ${result.keywordStats ? `
    <h2>Keyword Intelligence</h2>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value">${result.keywordStats.totalDiscovered}</div>
        <div class="stat-label">Keywords Found</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${result.keywordStats.highRelevance}</div>
        <div class="stat-label">High Relevance</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${result.keywordStats.gaps}</div>
        <div class="stat-label">Keyword Gaps</div>
      </div>
    </div>
    ` : ''}

    ${result.improvements.length > 0 ? `
    <h2>Today's Improvements</h2>
    ${result.improvements.map(i => `<div class="improvement">${i}</div>`).join('')}
    ` : '<p style="color: #94a3b8;">No optimizations needed today. All pages meet targets!</p>'}

    <h2>Page Status</h2>
    ${Object.entries(result.progress.pageStats).map(([url, stats]) => `
      <div class="improvement">
        <strong>${url.replace('https://ghostmydata.com', '')}</strong><br>
        Words: ${stats.wordCount} | Readability: ${stats.readability} | Keywords: ${stats.keywordsFound}/5
      </div>
    `).join('')}

    <div class="footer">
      <p>GhostMyData Content Optimizer</p>
      <p>Running daily to achieve 100% SEO score</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: getAdminFromEmail(),
      to: SUPPORT_EMAIL,
      subject: `SEO Progress: ${result.seoScore}/100 (${scoreChange >= 0 ? '+' : ''}${scoreChange}) - ${result.pagesOptimized} pages optimized`,
      html,
    });
    console.log(`[Content Optimizer] Report sent to ${SUPPORT_EMAIL}`);
  } catch (error) {
    console.error("[Content Optimizer] Failed to send report:", error);
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Content Optimizer] Starting daily optimization run...");

    const result = await runOptimization();

    // Send daily report
    await sendOptimizationReport(result);

    console.log(`[Content Optimizer] Complete. Score: ${result.seoScore}/100, Pages optimized: ${result.pagesOptimized}`);

    await logCronExecution({
      jobName: "content-optimizer",
      status: "SUCCESS",
      duration: Date.now() - startTime,
      message: `Score: ${result.seoScore}/100, ${result.pagesOptimized} pages optimized`,
    });

    return NextResponse.json({
      success: true,
      seoScore: result.seoScore,
      targetScore: 100,
      pagesOptimized: result.pagesOptimized,
      improvements: result.improvements,
      progress: result.progress,
    });
  } catch (error) {
    console.error("[Content Optimizer] Error:", error);
    await logCronExecution({
      jobName: "content-optimizer",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Manual trigger with options
export async function POST(request: Request) {
  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    console.log("[Content Optimizer] Manual run triggered");

    const result = await runOptimization();

    if (body.sendReport !== false) {
      await sendOptimizationReport(result);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Content Optimizer] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
