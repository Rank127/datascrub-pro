# Response to ZipRecruiter Cease & Desist Letter

**Date:** February 6, 2026
**To:** Crystal Skelton, VP Corporate Counsel, ZipRecruiter, Inc.
**From:** GhostMyData Legal
**Re:** Response to Cease and Desist Letter dated February 6, 2026
**Mastermind Review:** February 13, 2026 (Voss, Clooney, Buffett — see advisory)

---

## ORIGINAL DRAFT (Sent February 6, 2026)

---

February 6, 2026

Crystal Skelton
VP, Corporate Counsel
ZipRecruiter, Inc.
3000 Ocean Park Blvd., #3000
Santa Monica, California 90405

Via Email: crystal.skelton@ziprecruiter.com

**RE: Response to Cease and Desist - Confirmation of Compliance**

Dear Ms. Skelton,

Thank you for bringing this matter to our attention. We have reviewed your letter dated February 6, 2026, and appreciate you reaching out to resolve this issue amicably.

**We acknowledge that ZipRecruiter is not a data broker** under the statutory definitions set forth in California Civil Code § 1798.99.80(d) and similar state privacy laws. We understand that ZipRecruiter maintains direct relationships with its users who voluntarily create accounts and provide their personal information to use your job search services.

**We have taken the following immediate actions to comply with your demands:**

1. **Removed ZipRecruiter from our data broker directory.** All references to "ZipRecruiter" have been removed from our database of data brokers as of February 6, 2026.

2. **Ceased automated removal requests.** We have added ZipRecruiter to our internal blocklist to ensure no automated data broker removal or deletion requests are sent to your email addresses going forward.

3. **Updated our records.** Our systems have been updated to reflect that ZipRecruiter is not a data broker but rather a service provider with direct user relationships.

4. **Conducted an internal audit.** We have also reviewed our directory for other similarly situated companies (job platforms, HR/ATS systems) and have proactively removed them as well to prevent similar issues.

**This letter serves as written assurance that the above actions have been completed.**

We sincerely apologize for any inconvenience or disruption this may have caused to your operations. Our intent is to help consumers protect their privacy from actual data brokers who collect and sell personal information without direct consumer relationships. We recognize that ZipRecruiter does not fall into this category.

We consider this matter resolved and appreciate your professional approach in addressing this issue directly. If you have any questions or require additional confirmation, please do not hesitate to contact us.

Sincerely,

[Signature]

**GhostMyData Legal Team**
legal@ghostmydata.com
GhostMyData.com

---

## MASTERMIND-REVISED DRAFT (Recommended — reviewed Feb 13, 2026)

**Changes from original:** Voss tactical empathy language, Clooney strategic framing (protect position while complying), removed over-apologetic tone, added collaborative reframe, no engagement with "deceptive trade practices" argument.

---

February 6, 2026

Crystal Skelton
VP, Corporate Counsel
ZipRecruiter, Inc.
3000 Ocean Park Blvd., #3000
Santa Monica, California 90405

Via Email: crystal.skelton@ziprecruiter.com

**RE: Response to Cease and Desist — Confirmation of Compliance**

Dear Ms. Skelton,

Thank you for your letter dated February 6, 2026. We understand how frustrating it must have been to receive automated requests that were inapplicable to ZipRecruiter's operations, and we appreciate you bringing this directly to our attention.

We agree that ZipRecruiter maintains direct relationships with its users under California Civil Code § 1798.99.80(d) and equivalent state statutes, and therefore does not meet the statutory definition of a "data broker." Our mission is to protect consumers from entities that collect and sell personal information *without* direct consumer relationships — and we recognize that ZipRecruiter does not fall into that category.

**We have taken the following actions, effective immediately:**

1. **Removed ZipRecruiter** from our data source directory as of February 6, 2026.

2. **Ceased all automated requests.** ZipRecruiter has been added to our permanent internal blocklist. No further data removal or deletion requests will be sent to your email addresses.

3. **Updated our classification records** to reflect that ZipRecruiter is a service provider with direct user relationships.

4. **Conducted a proactive audit.** Beyond your specific request, we reviewed our directory for other similarly situated companies — job platforms, HR systems, and applicant tracking systems — and have removed them as well to ensure this category of issue does not recur.

**This letter serves as written assurance that all four actions have been completed.**

We appreciate your professional approach in resolving this matter directly. Accurate classification of data sources is important to us, and your correspondence has helped us strengthen that process. Should you have any questions or require additional confirmation, please do not hesitate to contact us at legal@ghostmydata.com.

Sincerely,

[Signature]

**GhostMyData Legal Team**
legal@ghostmydata.com
GhostMyData.com

---

## INTERNAL NOTES (Do not include in letter)

### Actions Taken:
- [x] Removed ZIPRECRUITER from `src/lib/removers/data-broker-directory.ts`
- [x] Removed INDEED from data broker directory (similar issue)
- [x] Removed LADDERS (TheLadders) from data broker directory (similar issue)
- [x] Removed GREENHOUSE_DATA, LEVER_DATA, SMARTRECRUITERS, JOBVITE_DATA, WORKDAY_DATA
- [x] Removed ANGELLIST, WELLFOUND from data broker directory
- [x] Added all above to `src/lib/removers/blocklist.ts` with legal reasoning
- [x] Updated BLOCKLISTED_EMAIL_DOMAINS to prevent automated emails

### Legal Basis for Removal:
Per California Civil Code § 1798.99.80(d), a "data broker" is defined as:
> "a business that knowingly collects and sells to third parties the personal information of a consumer **with whom the business does not have a direct relationship**"

Job platforms like ZipRecruiter, Indeed, LinkedIn, etc. have **direct relationships** with users who:
- Create accounts voluntarily
- Provide their own personal information
- Use the service directly

This is fundamentally different from data brokers like Spokeo, BeenVerified, etc. who:
- Scrape/aggregate data from public records and other sources
- Collect information about people who never interacted with them
- Have NO direct relationship with the data subjects

### Companies Removed (February 6, 2026):
| Company | Type | Reason |
|---------|------|--------|
| ZipRecruiter | Job Platform | Direct user relationship |
| Indeed | Job Platform | Direct user relationship |
| TheLadders | Job Platform | Direct user relationship |
| LinkedIn | Professional Network | Direct user relationship |
| Glassdoor | Job Platform | Direct user relationship |
| AngelList/Wellfound | Startup Jobs | Direct user relationship |
| Greenhouse | ATS | Users apply directly |
| Lever | ATS | Users apply directly |
| SmartRecruiters | ATS | Users apply directly |
| Jobvite | ATS | Users apply directly |
| Workday | HR/ATS | Users apply directly |

### Deadline:
- Response due: February 23, 2026 (10 business days)
- Response sent: February 6, 2026 (same day - proactive compliance)

### Follow-up:
- Monitor for confirmation from ZipRecruiter that matter is resolved
- If no acknowledgment by Feb 20, send brief follow-up email
- Consider proactive outreach to similar companies that may have same concern

### Mastermind Follow-Up Recommendations (Feb 13, 2026):
- [ ] **Full source classification audit**: Review all 2,100+ sources against "direct relationship" test (HIGH priority, 2 weeks)
- [ ] **Add sourceType taxonomy**: DATA_BROKER / SERVICE_PROVIDER / SOCIAL_PLATFORM / GOVERNMENT_RECORD
- [ ] **Pre-send validation**: Verify target is classified DATA_BROKER before sending any automated removal email
- [ ] **Transparency page**: Create `/data-sources` showing methodology and categories
- [ ] **Check competitors**: Do DeleteMe, Incogni, Optery list ZipRecruiter? (competitive intel)
- [ ] **30-day follow-up**: Consider brief professional outreach exploring whether ZipRecruiter would link to GhostMyData as a privacy resource for their users (Hormozi: warm lead for partnership)

### Mastermind Advisory Reference:
See `Emails-Returns/Mastermind-Advisory-ZipRecruiter-CeaseDesist.md` for full 7-step protocol analysis.
