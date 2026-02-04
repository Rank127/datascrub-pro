/**
 * Test script for the Confidence Scoring System
 * Run with: npx tsx scripts/test-confidence-scoring.ts
 */

import { ProfileValidator } from "../src/lib/scanners/validation/profile-validator";
import { CONFIDENCE_THRESHOLDS, classifyConfidence } from "../src/lib/scanners/base-scanner";

const validator = new ProfileValidator();

console.log("=".repeat(70));
console.log("CONFIDENCE SCORING SYSTEM - TEST SUITE");
console.log("=".repeat(70));
console.log();

// Test 1: High confidence - exact match
console.log("TEST 1: High Confidence - Exact Match");
console.log("-".repeat(50));
const test1 = validator.validate({
  profile: {
    fullName: "John Smith",
    addresses: [{ street: "123 Main St", city: "Chicago", state: "IL", zipCode: "60601", country: "USA" }],
    dateOfBirth: "1980-05-15",
    phones: ["312-555-1234"],
    emails: ["john.smith@email.com"],
  },
  extracted: {
    name: "John Smith",
    city: "Chicago",
    state: "IL",
    age: "44", // Born 1980, so age ~44 in 2024
    phones: ["312-555-1234"],
  },
  source: "SPOKEO",
});
console.log(`Score: ${test1.score}/100 (${test1.classification})`);
console.log(`Factors: name=${test1.factors.nameMatch}, location=${test1.factors.locationMatch}, age=${test1.factors.ageMatch}, correlation=${test1.factors.dataCorrelation}, source=${test1.factors.sourceReliability}`);
console.log(`Reasoning: ${test1.reasoning.join("; ")}`);
console.log(`Should auto-proceed: ${test1.score >= CONFIDENCE_THRESHOLDS.AUTO_PROCEED ? "YES" : "NO"}`);
console.log();

// Test 2: Low confidence - location/age mismatch (FALSE POSITIVE)
console.log("TEST 2: Low Confidence - Location/Age Mismatch (False Positive)");
console.log("-".repeat(50));
const test2 = validator.validate({
  profile: {
    fullName: "John Smith",
    addresses: [{ street: "123 Main St", city: "Chicago", state: "IL", zipCode: "60601", country: "USA" }],
    dateOfBirth: "1980-05-15",
  },
  extracted: {
    name: "John Smith",
    city: "New York",
    state: "NY",
    age: "25", // Way off from expected ~44
  },
  source: "WHITEPAGES",
});
console.log(`Score: ${test2.score}/100 (${test2.classification})`);
console.log(`Factors: name=${test2.factors.nameMatch}, location=${test2.factors.locationMatch}, age=${test2.factors.ageMatch}, correlation=${test2.factors.dataCorrelation}, source=${test2.factors.sourceReliability}`);
console.log(`Reasoning: ${test2.reasoning.join("; ")}`);
console.log(`Should create exposure: ${test2.score >= CONFIDENCE_THRESHOLDS.REJECT ? "YES" : "NO (REJECTED)"}`);
console.log(`Requires manual review: ${test2.score < CONFIDENCE_THRESHOLDS.AUTO_PROCEED ? "YES" : "NO"}`);
console.log();

// Test 3: Very low confidence - name only, wrong location/age (should REJECT)
console.log("TEST 3: Very Low Confidence - Should REJECT");
console.log("-".repeat(50));
const test3 = validator.validate({
  profile: {
    fullName: "John Michael Smith",
    addresses: [{ street: "123 Main St", city: "Chicago", state: "IL", zipCode: "60601", country: "USA" }],
    dateOfBirth: "1980-05-15",
  },
  extracted: {
    name: "John A. Smith", // Different middle name
    city: "Los Angeles",
    state: "CA",
    age: "65", // Very different age
  },
  source: "UNKNOWN_SOURCE",
});
console.log(`Score: ${test3.score}/100 (${test3.classification})`);
console.log(`Factors: name=${test3.factors.nameMatch}, location=${test3.factors.locationMatch}, age=${test3.factors.ageMatch}, correlation=${test3.factors.dataCorrelation}, source=${test3.factors.sourceReliability}`);
console.log(`Reasoning: ${test3.reasoning.join("; ")}`);
console.log(`Should create exposure: ${test3.score >= CONFIDENCE_THRESHOLDS.REJECT ? "YES" : "NO (REJECTED)"}`);
console.log();

// Test 4: Medium confidence - partial match
console.log("TEST 4: Medium Confidence - Partial Match");
console.log("-".repeat(50));
const test4 = validator.validate({
  profile: {
    fullName: "John Smith",
    addresses: [{ street: "123 Main St", city: "Chicago", state: "IL", zipCode: "60601", country: "USA" }],
    dateOfBirth: "1980-05-15",
  },
  extracted: {
    name: "John Smith",
    state: "IL", // State only, no city
    age: "46", // Close but not exact
  },
  source: "BEENVERIFIED",
});
console.log(`Score: ${test4.score}/100 (${test4.classification})`);
console.log(`Factors: name=${test4.factors.nameMatch}, location=${test4.factors.locationMatch}, age=${test4.factors.ageMatch}, correlation=${test4.factors.dataCorrelation}, source=${test4.factors.sourceReliability}`);
console.log(`Reasoning: ${test4.reasoning.join("; ")}`);
console.log(`Requires manual review: ${test4.score < CONFIDENCE_THRESHOLDS.AUTO_PROCEED ? "YES" : "NO"}`);
console.log();

// Test 5: Phone/email correlation boost
console.log("TEST 5: Data Correlation Boost");
console.log("-".repeat(50));
const test5 = validator.validate({
  profile: {
    fullName: "Jane Doe",
    emails: ["jane.doe@gmail.com"],
    phones: ["555-123-4567"],
    addresses: [],
  },
  extracted: {
    name: "Jane Doe",
    emails: ["jane.doe@gmail.com"],
    phones: ["555-123-4567"],
  },
  source: "TRUEPEOPLESEARCH",
});
console.log(`Score: ${test5.score}/100 (${test5.classification})`);
console.log(`Factors: name=${test5.factors.nameMatch}, location=${test5.factors.locationMatch}, age=${test5.factors.ageMatch}, correlation=${test5.factors.dataCorrelation}, source=${test5.factors.sourceReliability}`);
console.log(`Reasoning: ${test5.reasoning.join("; ")}`);
console.log();

// Test 6: Alias match
console.log("TEST 6: Alias Match");
console.log("-".repeat(50));
const test6 = validator.validate({
  profile: {
    fullName: "Robert Johnson",
    aliases: ["Bob Johnson", "Bobby Johnson"],
    addresses: [{ street: "456 Oak Ave", city: "Austin", state: "TX", zipCode: "78701", country: "USA" }],
  },
  extracted: {
    name: "Bob Johnson",
    city: "Austin",
    state: "TX",
  },
  source: "RADARIS",
});
console.log(`Score: ${test6.score}/100 (${test6.classification})`);
console.log(`Factors: name=${test6.factors.nameMatch}, location=${test6.factors.locationMatch}, age=${test6.factors.ageMatch}, correlation=${test6.factors.dataCorrelation}, source=${test6.factors.sourceReliability}`);
console.log(`Reasoning: ${test6.reasoning.join("; ")}`);
console.log();

// Summary
console.log("=".repeat(70));
console.log("THRESHOLD REFERENCE");
console.log("=".repeat(70));
console.log(`AUTO_PROCEED (auto-removal OK): >= ${CONFIDENCE_THRESHOLDS.AUTO_PROCEED}`);
console.log(`MANUAL_REVIEW (requires confirmation): < ${CONFIDENCE_THRESHOLDS.AUTO_PROCEED}`);
console.log(`REJECT (don't create exposure): < ${CONFIDENCE_THRESHOLDS.REJECT}`);
console.log();
console.log("CLASSIFICATION RANGES:");
console.log(`  CONFIRMED: 80-100 (${classifyConfidence(80)})`);
console.log(`  LIKELY: 60-79 (${classifyConfidence(60)})`);
console.log(`  POSSIBLE: 40-59 (${classifyConfidence(40)})`);
console.log(`  UNLIKELY: 20-39 (${classifyConfidence(20)})`);
console.log(`  REJECTED: 0-19 (${classifyConfidence(10)})`);
console.log();

// Verify test results
console.log("=".repeat(70));
console.log("TEST RESULTS VERIFICATION");
console.log("=".repeat(70));
let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, expected: string) {
  if (condition) {
    console.log(`✓ ${name}: ${expected}`);
    passed++;
  } else {
    console.log(`✗ ${name}: FAILED - expected ${expected}`);
    failed++;
  }
}

check("Test 1 (exact match)", test1.score >= 80, "score >= 80 (CONFIRMED)");
check("Test 2 (false positive)", test2.score < 80 && test2.score >= 20, "20 <= score < 80 (needs review)");
check("Test 3 (reject)", test3.score < 40, "score < 40 (UNLIKELY/REJECTED)");
check("Test 4 (partial)", test4.score >= 40 && test4.score < 80, "40 <= score < 80 (POSSIBLE/LIKELY)");
check("Test 5 (correlation)", test5.factors.dataCorrelation >= 10, "correlation >= 10 (phone+email match)");
check("Test 6 (alias)", test6.factors.nameMatch >= 20, "nameMatch >= 20 (alias matched)");

console.log();
console.log(`Total: ${passed}/${passed + failed} tests passed`);
console.log("=".repeat(70));

if (failed > 0) {
  process.exit(1);
}
