"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { trackEvents } from "@/components/analytics/retargeting-pixels";

interface Question {
  id: string;
  question: string;
  description: string;
  options: {
    label: string;
    value: number; // Risk score contribution
  }[];
}

const questions: Question[] = [
  {
    id: "data_brokers",
    question: "Have you ever searched for yourself on data broker sites?",
    description: "Sites like Spokeo, WhitePages, or BeenVerified",
    options: [
      { label: "Yes, and found my info", value: 30 },
      { label: "Yes, but didn't find anything", value: 10 },
      { label: "No, never checked", value: 20 },
      { label: "I don't know what those are", value: 25 },
    ],
  },
  {
    id: "data_breaches",
    question: "Have you been notified of any data breaches?",
    description: "Emails from companies saying your data was exposed",
    options: [
      { label: "Yes, multiple times", value: 35 },
      { label: "Yes, once or twice", value: 25 },
      { label: "No, never", value: 10 },
      { label: "I'm not sure", value: 20 },
    ],
  },
  {
    id: "spam_calls",
    question: "How often do you receive spam calls or texts?",
    description: "Unwanted calls from unknown numbers, robocalls, etc.",
    options: [
      { label: "Daily", value: 30 },
      { label: "Several times a week", value: 25 },
      { label: "A few times a month", value: 15 },
      { label: "Rarely or never", value: 5 },
    ],
  },
  {
    id: "social_media",
    question: "How are your social media privacy settings?",
    description: "Facebook, LinkedIn, Instagram, etc.",
    options: [
      { label: "Public - anyone can see my posts", value: 25 },
      { label: "Mixed - some public, some private", value: 15 },
      { label: "Private - only friends can see", value: 5 },
      { label: "I don't use social media", value: 0 },
    ],
  },
  {
    id: "password_reuse",
    question: "Do you reuse passwords across different sites?",
    description: "Using the same password for multiple accounts",
    options: [
      { label: "Yes, I use the same password everywhere", value: 30 },
      { label: "I have a few passwords I rotate", value: 20 },
      { label: "Each account has a unique password", value: 5 },
      { label: "I use a password manager", value: 0 },
    ],
  },
];

function getScoreLevel(score: number): {
  level: "low" | "medium" | "high" | "critical";
  color: string;
  bgColor: string;
  label: string;
  description: string;
} {
  if (score <= 30) {
    return {
      level: "low",
      color: "text-green-400",
      bgColor: "bg-green-500",
      label: "Low Risk",
      description: "Your privacy practices are good, but there's always room for improvement.",
    };
  } else if (score <= 60) {
    return {
      level: "medium",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500",
      label: "Medium Risk",
      description: "Your personal data has moderate exposure. Taking action now can prevent issues.",
    };
  } else if (score <= 85) {
    return {
      level: "high",
      color: "text-orange-400",
      bgColor: "bg-orange-500",
      label: "High Risk",
      description: "Your personal data is significantly exposed. Immediate action is recommended.",
    };
  } else {
    return {
      level: "critical",
      color: "text-red-400",
      bgColor: "bg-red-500",
      label: "Critical Risk",
      description: "Your privacy is severely compromised. You need to take action immediately.",
    };
  }
}

export function PrivacyScoreQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const scoreInfo = getScoreLevel(totalScore);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    } else {
      setShowResults(true);
      // Track that they completed the quiz
      trackEvents.lead();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In production, this would save to a leads table
      // For now, we'll redirect to registration
      trackEvents.lead();
      setEmailSubmitted(true);
    } catch (error) {
      console.error("Failed to submit email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults && showEmailCapture && !emailSubmitted) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${scoreInfo.bgColor}/20 mb-4`}>
            <Shield className={`h-8 w-8 ${scoreInfo.color}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Privacy Score: <span className={scoreInfo.color}>{100 - totalScore}/100</span>
          </h2>
          <p className="text-slate-400">{scoreInfo.description}</p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
          <h3 className="text-white font-medium mb-2">Get Your Full Report</h3>
          <p className="text-sm text-slate-400 mb-4">
            Enter your email to receive personalized recommendations and see exactly where your data is exposed.
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Get My Free Report"}
            </Button>
          </form>
          <p className="text-xs text-slate-500 text-center mt-2">
            <Lock className="inline h-3 w-3 mr-1" />
            We never share your email. Unsubscribe anytime.
          </p>
        </div>
      </div>
    );
  }

  if (showResults && emailSubmitted) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email!</h2>
        <p className="text-slate-400 mb-6">
          We've sent your personalized privacy report to <strong>{email}</strong>
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Want to take action now? Start a free scan to see all your exposed data.
        </p>
        <Link href={`/register?utm_source=quiz&email=${encodeURIComponent(email)}`}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Start Free Scan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${scoreInfo.bgColor}/20 mb-4`}>
            {scoreInfo.level === "critical" || scoreInfo.level === "high" ? (
              <AlertTriangle className={`h-10 w-10 ${scoreInfo.color}`} />
            ) : (
              <Shield className={`h-10 w-10 ${scoreInfo.color}`} />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Privacy Score: <span className={scoreInfo.color}>{100 - totalScore}</span>
          </h2>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${scoreInfo.bgColor}/20 ${scoreInfo.color}`}>
            {scoreInfo.label}
          </div>
        </div>

        {/* Score Bar */}
        <div className="mb-6">
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${scoreInfo.bgColor} transition-all duration-1000`}
              style={{ width: `${100 - totalScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Critical</span>
            <span>Safe</span>
          </div>
        </div>

        <p className="text-slate-400 text-center mb-6">{scoreInfo.description}</p>

        <div className="space-y-3">
          <Button
            onClick={() => setShowEmailCapture(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Get My Full Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Link href="/register" className="block">
            <Button variant="outline" className="w-full border-slate-600">
              Start Free Data Scan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-lg mx-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          {question.question}
        </h2>
        <p className="text-sm text-slate-400">{question.description}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(question.id, option.value)}
            className={`w-full p-4 text-left rounded-lg border transition-all ${
              answers[question.id] === option.value
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700"
            }`}
          >
            <span className="text-white">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Navigation */}
      {currentQuestion > 0 && (
        <Button
          variant="ghost"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          className="text-slate-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}
    </div>
  );
}
