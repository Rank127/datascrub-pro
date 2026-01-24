// Data broker contact information for removal requests
// This directory contains opt-out URLs and contact emails for major data brokers

export interface DataBrokerInfo {
  name: string;
  optOutUrl?: string;
  optOutEmail?: string;
  privacyEmail?: string;
  removalMethod: "FORM" | "EMAIL" | "BOTH";
  estimatedDays: number; // Estimated time to process removal
  notes?: string;
}

export const DATA_BROKER_DIRECTORY: Record<string, DataBrokerInfo> = {
  // ==========================================
  // MAJOR PEOPLE SEARCH SITES (Tier 1)
  // ==========================================
  SPOKEO: {
    name: "Spokeo",
    optOutUrl: "https://www.spokeo.com/optout",
    optOutEmail: "customercare@spokeo.com",
    privacyEmail: "privacy@spokeo.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
    notes: "Requires verification via email link",
  },
  WHITEPAGES: {
    name: "WhitePages",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    optOutEmail: "support@whitepages.com",
    privacyEmail: "privacy@whitepages.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
    notes: "May require phone verification",
  },
  BEENVERIFIED: {
    name: "BeenVerified",
    optOutUrl: "https://www.beenverified.com/opt-out/",
    optOutEmail: "privacy@beenverified.com",
    privacyEmail: "privacy@beenverified.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  INTELIUS: {
    name: "Intelius",
    optOutUrl: "https://www.intelius.com/optout",
    optOutEmail: "privacy@intelius.com",
    privacyEmail: "privacy@intelius.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEFINDER: {
    name: "PeopleFinder",
    optOutUrl: "https://www.peoplefinder.com/optout",
    privacyEmail: "privacy@peoplefinder.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  TRUEPEOPLESEARCH: {
    name: "TruePeopleSearch",
    optOutUrl: "https://www.truepeoplesearch.com/removal",
    privacyEmail: "privacy@truepeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 1,
    notes: "Usually processes within 24 hours",
  },
  RADARIS: {
    name: "Radaris",
    optOutUrl: "https://radaris.com/control/privacy",
    optOutEmail: "privacy@radaris.com",
    privacyEmail: "privacy@radaris.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "May require multiple follow-ups",
  },
  FASTPEOPLESEARCH: {
    name: "FastPeopleSearch",
    optOutUrl: "https://www.fastpeoplesearch.com/removal",
    privacyEmail: "privacy@fastpeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 1,
    notes: "Automated removal usually quick",
  },
  USSEARCH: {
    name: "USSearch",
    optOutUrl: "https://www.ussearch.com/opt-out/",
    privacyEmail: "privacy@ussearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PIPL: {
    name: "Pipl",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "May require extensive verification",
  },

  // ==========================================
  // PEOPLE SEARCH SITES (Tier 2)
  // ==========================================
  INSTANTCHECKMATE: {
    name: "Instant Checkmate",
    optOutUrl: "https://www.instantcheckmate.com/opt-out/",
    privacyEmail: "privacy@instantcheckmate.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Part of the same network as BeenVerified",
  },
  PEOPLELOOKER: {
    name: "PeopleLooker",
    optOutUrl: "https://www.peoplelooker.com/opt-out",
    privacyEmail: "privacy@peoplelooker.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEFINDERS: {
    name: "PeopleFinders",
    optOutUrl: "https://www.peoplefinders.com/opt-out",
    privacyEmail: "privacy@peoplefinders.com",
    removalMethod: "FORM",
    estimatedDays: 10,
  },
  THATSTHEM: {
    name: "ThatsThem",
    optOutUrl: "https://thatsthem.com/optout",
    privacyEmail: "privacy@thatsthem.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  PUBLICRECORDSNOW: {
    name: "PublicRecordsNow",
    optOutUrl: "https://www.publicrecordsnow.com/optout",
    privacyEmail: "privacy@publicrecordsnow.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FAMILYTREENOW: {
    name: "FamilyTreeNow",
    optOutUrl: "https://www.familytreenow.com/optout",
    privacyEmail: "privacy@familytreenow.com",
    removalMethod: "FORM",
    estimatedDays: 2,
    notes: "Relatively quick removal process",
  },
  MYLIFE: {
    name: "MyLife",
    optOutUrl: "https://www.mylife.com/ccpa/index.pubview",
    optOutEmail: "privacy@mylife.com",
    privacyEmail: "privacy@mylife.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use the CCPA data request form - may require identity verification",
  },
  CLUSTRMAPS: {
    name: "ClustrMaps",
    optOutUrl: "https://clustrmaps.com/bl/opt-out",
    privacyEmail: "privacy@clustrmaps.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  ADDRESSES: {
    name: "Addresses.com",
    optOutUrl: "https://www.addresses.com/optout",
    privacyEmail: "privacy@addresses.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  ADVANCED_PEOPLE_SEARCH: {
    name: "Advanced People Search",
    optOutUrl: "https://www.advancedpeoplesearch.com/optout",
    privacyEmail: "privacy@advancedpeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },

  // ==========================================
  // BACKGROUND CHECK SITES
  // ==========================================
  TRUTHFINDER: {
    name: "TruthFinder",
    optOutUrl: "https://www.truthfinder.com/opt-out/",
    privacyEmail: "privacy@truthfinder.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Requires email confirmation",
  },
  CHECKPEOPLE: {
    name: "CheckPeople",
    optOutUrl: "https://www.checkpeople.com/opt-out",
    privacyEmail: "privacy@checkpeople.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CYBERBACKGROUNDCHECKS: {
    name: "CyberBackgroundChecks",
    optOutUrl: "https://www.cyberbackgroundchecks.com/removal",
    privacyEmail: "support@cyberbackgroundchecks.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  PUBLICDATACHECK: {
    name: "PublicDataCheck",
    optOutUrl: "https://members.publicdatacheck.com/optout",
    privacyEmail: "privacy@publicdatacheck.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SEARCHPEOPLEFREE: {
    name: "SearchPeopleFree",
    optOutUrl: "https://www.searchpeoplefree.com/opt-out",
    privacyEmail: "privacy@searchpeoplefree.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  FREEPEOPLESEARCH: {
    name: "FreePeopleSearch",
    optOutUrl: "https://freepeoplesearch.com/optout",
    privacyEmail: "privacy@freepeoplesearch.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  SEARCHQUARRY: {
    name: "SearchQuarry",
    optOutUrl: "https://www.searchquarry.com/opt-out",
    privacyEmail: "privacy@searchquarry.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // ADDRESS/PHONE LOOKUP SITES
  // ==========================================
  ANYWHO: {
    name: "AnyWho",
    optOutUrl: "https://www.anywho.com/opt-out",
    privacyEmail: "privacy@anywho.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  YELLOWPAGES: {
    name: "YellowPages",
    optOutUrl: "https://www.yellowpages.com/members/suppression",
    privacyEmail: "privacy@yellowpages.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use the suppression request form to remove personal listings",
  },
  INFOSPACE: {
    name: "InfoSpace",
    privacyEmail: "privacy@infospace.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NUWBER: {
    name: "Nuwber",
    optOutUrl: "https://nuwber.com/removal/link",
    privacyEmail: "privacy@nuwber.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  REVERSEPHONELOOKUP: {
    name: "ReversePhoneLookup",
    optOutUrl: "https://www.reversephonelookup.com/remove-listing/",
    privacyEmail: "privacy@reversephonelookup.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  SPYDIALER: {
    name: "SpyDialer",
    optOutUrl: "https://www.spydialer.com/optout.aspx",
    privacyEmail: "privacy@spydialer.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  CALLTRUTH: {
    name: "CallTruth",
    optOutUrl: "https://www.calltruth.com/opt-out",
    privacyEmail: "privacy@calltruth.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  USPHONEBOOK: {
    name: "USPhonebook",
    optOutUrl: "https://www.usphonebook.com/opt-out",
    privacyEmail: "privacy@usphonebook.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },

  // ==========================================
  // PROPERTY/PUBLIC RECORDS SITES
  // ==========================================
  NEIGHBOR_WHO: {
    name: "Neighbor.Who",
    optOutUrl: "https://www.neighborwho.com/removal",
    privacyEmail: "privacy@neighborwho.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  HOMEMETRY: {
    name: "Homemetry",
    optOutUrl: "https://homemetry.com/control/privacy",
    privacyEmail: "privacy@homemetry.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  BLOCKSHOPPER: {
    name: "BlockShopper",
    optOutUrl: "https://blockshopper.com/optout",
    privacyEmail: "privacy@blockshopper.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  OWNERLY: {
    name: "Ownerly",
    optOutUrl: "https://www.ownerly.com/opt-out/",
    privacyEmail: "privacy@ownerly.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  REHOLD: {
    name: "Rehold",
    optOutUrl: "https://rehold.com/optout",
    privacyEmail: "privacy@rehold.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // EMAIL/IDENTITY SEARCH
  // ==========================================
  VOTERRECORDS: {
    name: "VoterRecords",
    optOutUrl: "https://voterrecords.com/opt-out",
    privacyEmail: "privacy@voterrecords.com",
    removalMethod: "FORM",
    estimatedDays: 10,
    notes: "Voter registration records may be public by law in some states",
  },
  EMAILSHERLOCK: {
    name: "EmailSherlock",
    optOutUrl: "https://www.emailsherlock.com/opt-out",
    privacyEmail: "privacy@emailsherlock.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  EMAILFINDER: {
    name: "EmailFinder",
    optOutUrl: "https://www.emailfinder.com/opt-out",
    privacyEmail: "privacy@emailfinder.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  HUNTER_IO: {
    name: "Hunter.io",
    optOutUrl: "https://hunter.io/opt-out",
    privacyEmail: "privacy@hunter.io",
    removalMethod: "FORM",
    estimatedDays: 5,
    notes: "Business email finder - opt out for personal emails",
  },

  // ==========================================
  // PROFESSIONAL/BUSINESS BROKERS
  // ==========================================
  ZOOMINFO: {
    name: "ZoomInfo",
    optOutUrl: "https://www.zoominfo.com/update/remove",
    privacyEmail: "privacy@zoominfo.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "B2B data broker - submit removal request with your email to opt out",
  },
  LUSHA: {
    name: "Lusha",
    optOutUrl: "https://privacy.lusha.com/hc/en-us/requests/new",
    privacyEmail: "privacy@lusha.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Submit a privacy request to remove your data from Lusha",
  },
  APOLLO: {
    name: "Apollo.io",
    optOutUrl: "https://www.apollo.io/privacy-policy/remove-my-information",
    privacyEmail: "privacy@apollo.io",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  ROCKETREACH: {
    name: "RocketReach",
    optOutUrl: "https://rocketreach.co/opt-out",
    privacyEmail: "privacy@rocketreach.co",
    removalMethod: "FORM",
    estimatedDays: 10,
  },
  LEADIQ: {
    name: "LeadIQ",
    optOutUrl: "https://leadiq.com/privacy-center",
    privacyEmail: "privacy@leadiq.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use Privacy Center to submit a data deletion request",
  },
  COGNISM: {
    name: "Cognism",
    optOutUrl: "https://www.cognism.com/do-not-sell-my-data",
    privacyEmail: "privacy@cognism.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CLEARBIT: {
    name: "Clearbit",
    optOutUrl: "https://claim.clearbit.com/claim",
    privacyEmail: "privacy@clearbit.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
    notes: "Use the Clearbit claim form to request data removal",
  },
  FULLCONTACT: {
    name: "FullContact",
    optOutUrl: "https://platform.fullcontact.com/your-privacy-choices",
    privacyEmail: "privacy@fullcontact.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Use 'Your Privacy Choices' form to opt out of data collection",
  },

  // ==========================================
  // MARKETING DATA BROKERS
  // ==========================================
  ACXIOM: {
    name: "Acxiom",
    optOutUrl: "https://isapps.acxiom.com/optout/optout.aspx",
    privacyEmail: "privacy@acxiom.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "One of the largest data brokers",
  },
  ORACLE_DATACLOUD: {
    name: "Oracle Data Cloud",
    optOutUrl: "https://www.oracle.com/marketingcloud/opt-status.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Use the Oracle Marketing Cloud opt-out status page to submit removal request",
  },
  EPSILON: {
    name: "Epsilon",
    optOutUrl: "https://www.epsilon.com/us/consumer-preference-center",
    privacyEmail: "privacy@epsilon.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Use the Consumer Preference Center to opt out of marketing data",
  },
  EXPERIAN_MARKETING: {
    name: "Experian Marketing",
    optOutUrl: "https://www.experian.com/privacy/opt-out-form",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EQUIFAX_MARKETING: {
    name: "Equifax Marketing",
    optOutUrl: "https://myprivacy.equifax.com/personal-info",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Use MyPrivacy portal to opt out of Equifax marketing",
  },
  LEXISNEXIS: {
    name: "LexisNexis",
    optOutUrl: "https://optout.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Large data aggregator - comprehensive removal available",
  },

  // ==========================================
  // BREACH DATABASES
  // ==========================================
  HAVEIBEENPWNED: {
    name: "Have I Been Pwned",
    privacyEmail: "support@haveibeenpwned.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "HIBP does not remove data - they document breaches. The breach data exists at the original source.",
  },
  DEHASHED: {
    name: "DeHashed",
    optOutUrl: "https://www.dehashed.com/remove",
    privacyEmail: "support@dehashed.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  LEAKCHECK: {
    name: "LeakCheck",
    optOutUrl: "https://leakcheck.io/removal",
    privacyEmail: "support@leakcheck.io",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SNUSBASE: {
    name: "Snusbase",
    privacyEmail: "support@snusbase.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // ==========================================
  // SOCIAL MEDIA (Mostly Manual)
  // ==========================================
  LINKEDIN: {
    name: "LinkedIn",
    optOutUrl: "https://www.linkedin.com/help/linkedin/answer/63",
    privacyEmail: "privacy@linkedin.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Account must be deleted manually through settings",
  },
  FACEBOOK: {
    name: "Facebook",
    optOutUrl: "https://www.facebook.com/help/delete_account",
    privacyEmail: "privacy@fb.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Account deletion requires 30-day waiting period",
  },
  TWITTER: {
    name: "Twitter/X",
    optOutUrl: "https://twitter.com/settings/deactivate",
    privacyEmail: "privacy@twitter.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Deactivation required before permanent deletion",
  },
  INSTAGRAM: {
    name: "Instagram",
    optOutUrl: "https://www.instagram.com/accounts/remove/request/permanent/",
    privacyEmail: "privacy@instagram.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TIKTOK: {
    name: "TikTok",
    optOutUrl: "https://www.tiktok.com/setting/account",
    privacyEmail: "privacy@tiktok.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  REDDIT: {
    name: "Reddit",
    optOutUrl: "https://www.reddit.com/settings/account",
    privacyEmail: "privacy@reddit.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PINTEREST: {
    name: "Pinterest",
    optOutUrl: "https://www.pinterest.com/settings/privacy/",
    privacyEmail: "privacy@pinterest.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  YOUTUBE: {
    name: "YouTube",
    optOutUrl: "https://support.google.com/accounts/answer/32046",
    privacyEmail: "privacy@google.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Requires deleting Google account or removing YouTube data specifically",
  },
  SNAPCHAT: {
    name: "Snapchat",
    optOutUrl: "https://accounts.snapchat.com/accounts/delete_account",
    privacyEmail: "privacy@snap.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DISCORD: {
    name: "Discord",
    optOutUrl: "https://support.discord.com/hc/en-us/articles/212500837",
    privacyEmail: "privacy@discord.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // AI TRAINING & DEEPFAKE PROTECTION
  // ==========================================
  LAION_AI: {
    name: "LAION AI Dataset",
    optOutUrl: "https://haveibeentrained.com/",
    privacyEmail: "contact@laion.ai",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Check if your images are in LAION-5B dataset used to train Stable Diffusion and other AI models",
  },
  STABILITY_AI: {
    name: "Stability AI",
    optOutUrl: "https://stability.ai/opt-out",
    privacyEmail: "legal@stability.ai",
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Opt out of Stable Diffusion training - honors Spawning Do Not Train registry",
  },
  OPENAI: {
    name: "OpenAI",
    optOutUrl: "https://privacy.openai.com/policies",
    privacyEmail: "privacy@openai.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Request data deletion and opt out of training via privacy portal",
  },
  MIDJOURNEY: {
    name: "Midjourney",
    optOutUrl: "https://docs.midjourney.com/docs/terms-of-service",
    privacyEmail: "privacy@midjourney.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Contact support to opt out of image training",
  },
  META_AI: {
    name: "Meta AI",
    optOutUrl: "https://www.facebook.com/help/contact/540404257914453",
    privacyEmail: "privacy@fb.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Opt out of Meta AI training for Facebook and Instagram data",
  },
  GOOGLE_AI: {
    name: "Google AI Training",
    optOutUrl: "https://myaccount.google.com/data-and-privacy",
    privacyEmail: "privacy@google.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Manage AI training settings in Google account privacy settings",
  },
  LINKEDIN_AI: {
    name: "LinkedIn AI Training",
    optOutUrl: "https://www.linkedin.com/mypreferences/d/settings/data-for-generative-ai-improvement",
    privacyEmail: "privacy@linkedin.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Opt out of LinkedIn using your data for AI training",
  },
  ADOBE_AI: {
    name: "Adobe Firefly/AI",
    optOutUrl: "https://www.adobe.com/go/privacy_your_choices",
    privacyEmail: "privacy@adobe.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Only analyzes content submitted to Adobe Stock - opt out via privacy page",
  },
  AMAZON_AI: {
    name: "Amazon AI Training",
    optOutUrl: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GXPU3YPMBZQRWZK2",
    privacyEmail: "privacy@amazon.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Opt out of Amazon using your data for AI improvements",
  },

  // ==========================================
  // FACIAL RECOGNITION DATABASES
  // ==========================================
  CLEARVIEW_AI: {
    name: "Clearview AI",
    optOutUrl: "https://clearview.ai/privacy/requests",
    privacyEmail: "privacy@clearview.ai",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Large facial recognition database used by law enforcement - opt out removes your face from searches",
  },
  PIMEYES: {
    name: "PimEyes",
    optOutUrl: "https://pimeyes.com/en/opt-out-request",
    privacyEmail: "privacy@pimeyes.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Face search engine - submit opt-out to remove your face from search results",
  },
  FACECHECK_ID: {
    name: "FaceCheck.ID",
    optOutUrl: "https://facecheck.id/fc/optout",
    privacyEmail: "support@facecheck.id",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Facial recognition search engine - opt out to prevent face matching",
  },
  SOCIAL_CATFISH: {
    name: "Social Catfish",
    optOutUrl: "https://socialcatfish.com/opt-out/",
    privacyEmail: "privacy@socialcatfish.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Reverse image and identity search - includes facial recognition",
  },
  TINEYE: {
    name: "TinEye",
    optOutUrl: "https://tineye.com/removal",
    privacyEmail: "support@tineye.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Reverse image search engine - can request image removal",
  },
  YANDEX_IMAGES: {
    name: "Yandex Images",
    optOutUrl: "https://yandex.com/support/images/troubleshooting.html",
    privacyEmail: "privacy@support.yandex.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Yandex reverse image search - request removal via support",
  },

  // ==========================================
  // AI VOICE CLONING PROTECTION
  // ==========================================
  ELEVENLABS: {
    name: "ElevenLabs",
    optOutUrl: "https://elevenlabs.io/privacy",
    privacyEmail: "privacy@elevenlabs.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "AI voice cloning service - request voice sample removal",
  },
  RESEMBLE_AI: {
    name: "Resemble AI",
    optOutUrl: "https://www.resemble.ai/privacy",
    privacyEmail: "privacy@resemble.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Voice cloning platform - contact for voice data removal",
  },
  MURF_AI: {
    name: "Murf AI",
    optOutUrl: "https://murf.ai/privacy",
    privacyEmail: "privacy@murf.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "AI voice generator - opt out of voice training",
  },
};

// Broker categories for organization
export const BROKER_CATEGORIES = {
  PEOPLE_SEARCH: [
    "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "PEOPLEFINDER",
    "TRUEPEOPLESEARCH", "RADARIS", "FASTPEOPLESEARCH", "USSEARCH", "PIPL",
    "INSTANTCHECKMATE", "PEOPLELOOKER", "PEOPLEFINDERS", "THATSTHEM",
    "PUBLICRECORDSNOW", "FAMILYTREENOW", "MYLIFE", "CLUSTRMAPS", "ADDRESSES",
    "ADVANCED_PEOPLE_SEARCH"
  ],
  BACKGROUND_CHECK: [
    "TRUTHFINDER", "CHECKPEOPLE", "CYBERBACKGROUNDCHECKS", "PUBLICDATACHECK",
    "SEARCHPEOPLEFREE", "FREEPEOPLESEARCH", "SEARCHQUARRY"
  ],
  PHONE_LOOKUP: [
    "ANYWHO", "YELLOWPAGES", "INFOSPACE", "NUWBER", "REVERSEPHONELOOKUP",
    "SPYDIALER", "CALLTRUTH", "USPHONEBOOK"
  ],
  PROPERTY_RECORDS: [
    "NEIGHBOR_WHO", "HOMEMETRY", "BLOCKSHOPPER", "OWNERLY", "REHOLD"
  ],
  EMAIL_IDENTITY: [
    "VOTERRECORDS", "EMAILSHERLOCK", "EMAILFINDER", "HUNTER_IO"
  ],
  PROFESSIONAL_B2B: [
    "ZOOMINFO", "LUSHA", "APOLLO", "ROCKETREACH", "LEADIQ", "COGNISM",
    "CLEARBIT", "FULLCONTACT"
  ],
  MARKETING: [
    "ACXIOM", "ORACLE_DATACLOUD", "EPSILON", "EXPERIAN_MARKETING",
    "EQUIFAX_MARKETING", "LEXISNEXIS"
  ],
  BREACH_DATABASE: [
    "HAVEIBEENPWNED", "DEHASHED", "LEAKCHECK", "SNUSBASE"
  ],
  SOCIAL_MEDIA: [
    "LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK", "REDDIT",
    "PINTEREST", "YOUTUBE", "SNAPCHAT", "DISCORD"
  ],
  AI_TRAINING: [
    "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
    "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI"
  ],
  FACIAL_RECOGNITION: [
    "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH",
    "TINEYE", "YANDEX_IMAGES"
  ],
  VOICE_CLONING: [
    "ELEVENLABS", "RESEMBLE_AI", "MURF_AI"
  ],
} as const;

// Get data broker info by source
export function getDataBrokerInfo(source: string): DataBrokerInfo | null {
  return DATA_BROKER_DIRECTORY[source] || null;
}

// Get all broker keys
export function getAllBrokerKeys(): string[] {
  return Object.keys(DATA_BROKER_DIRECTORY);
}

// Get broker count
export function getBrokerCount(): number {
  return Object.keys(DATA_BROKER_DIRECTORY).length;
}

// Get brokers by category
export function getBrokersByCategory(category: keyof typeof BROKER_CATEGORIES): DataBrokerInfo[] {
  return BROKER_CATEGORIES[category]
    .map(key => DATA_BROKER_DIRECTORY[key])
    .filter(Boolean);
}

// Get all data brokers (excluding social media and breach databases)
export function getDataBrokersOnly(): Record<string, DataBrokerInfo> {
  const excludeCategories = ["SOCIAL_MEDIA", "BREACH_DATABASE"] as const;
  const excludeKeys = new Set<string>(
    excludeCategories.flatMap(cat => BROKER_CATEGORIES[cat])
  );

  return Object.fromEntries(
    Object.entries(DATA_BROKER_DIRECTORY).filter(([key]) => !excludeKeys.has(key))
  );
}

// Get opt-out instructions for a source
export function getOptOutInstructions(source: string): string {
  const broker = DATA_BROKER_DIRECTORY[source];

  if (!broker) {
    return "Contact the source directly to request removal of your data.";
  }

  let instructions = `To remove your data from ${broker.name}:\n\n`;

  if (broker.optOutUrl) {
    instructions += `1. Visit their opt-out page: ${broker.optOutUrl}\n`;
  }

  if (broker.privacyEmail) {
    instructions += `2. Or email their privacy team: ${broker.privacyEmail}\n`;
  }

  instructions += `\nEstimated processing time: ${broker.estimatedDays} days`;

  if (broker.notes) {
    instructions += `\n\nNote: ${broker.notes}`;
  }

  return instructions;
}

// Get brokers that support automated email removal
export function getEmailRemovalBrokers(): Record<string, DataBrokerInfo> {
  return Object.fromEntries(
    Object.entries(DATA_BROKER_DIRECTORY).filter(
      ([, broker]) => broker.removalMethod === "EMAIL" || broker.removalMethod === "BOTH"
    )
  );
}

// Get brokers that require form submission
export function getFormRemovalBrokers(): Record<string, DataBrokerInfo> {
  return Object.fromEntries(
    Object.entries(DATA_BROKER_DIRECTORY).filter(
      ([, broker]) => broker.removalMethod === "FORM" || broker.removalMethod === "BOTH"
    )
  );
}
