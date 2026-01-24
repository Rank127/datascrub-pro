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

  // ==========================================
  // ADDITIONAL PEOPLE SEARCH SITES
  // ==========================================
  ZABASEARCH: {
    name: "ZabaSearch",
    optOutUrl: "https://www.zabasearch.com/block_records/",
    privacyEmail: "privacy@zabasearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Free people search - requires verification",
  },
  PEEKYOU: {
    name: "PeekYou",
    optOutUrl: "https://www.peekyou.com/about/contact/optout/",
    privacyEmail: "privacy@peekyou.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  BEEN_VERIFIED_PEOPLE: {
    name: "Been Verified People Search",
    optOutUrl: "https://www.beenverifiedpeople.com/optout",
    privacyEmail: "privacy@beenverifiedpeople.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PUBLICRECORDS360: {
    name: "PublicRecords360",
    optOutUrl: "https://www.publicrecords360.com/optout.html",
    privacyEmail: "privacy@publicrecords360.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PERSOPO: {
    name: "Persopo",
    optOutUrl: "https://www.persopo.com/opt-out",
    privacyEmail: "privacy@persopo.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SMARTBACKGROUNDCHECKS: {
    name: "Smart Background Checks",
    optOutUrl: "https://www.smartbackgroundchecks.com/optout",
    privacyEmail: "privacy@smartbackgroundchecks.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  LOCATEFAMILY: {
    name: "LocateFamily",
    optOutUrl: "https://www.locatefamily.com/removal.html",
    privacyEmail: "privacy@locatefamily.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEWISE: {
    name: "PeopleWise",
    optOutUrl: "https://www.peoplewise.com/optout",
    privacyEmail: "privacy@peoplewise.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLESEARCHNOW: {
    name: "PeopleSearchNow",
    optOutUrl: "https://www.peoplesearchnow.com/opt-out",
    privacyEmail: "privacy@peoplesearchnow.com",
    removalMethod: "FORM",
    estimatedDays: 3,
  },
  PEOPLEBYNAME: {
    name: "PeopleByName",
    optOutUrl: "https://www.peoplebyname.com/remove.php",
    privacyEmail: "privacy@peoplebyname.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  VIRTORY: {
    name: "Virtory",
    optOutUrl: "https://www.virtory.com/opt-out",
    privacyEmail: "privacy@virtory.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  VERICORA: {
    name: "Vericora",
    optOutUrl: "https://vericora.com/ng/optout",
    privacyEmail: "privacy@vericora.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  GLADIKNOW: {
    name: "GladIKnow",
    optOutUrl: "https://gladiknow.com/opt-out",
    privacyEmail: "privacy@gladiknow.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  IDENTITYPI: {
    name: "IdentityPI",
    optOutUrl: "https://www.identitypi.com/optout",
    privacyEmail: "privacy@identitypi.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  QUICKPEOPLETRACE: {
    name: "QuickPeopleTrace",
    optOutUrl: "https://www.quickpeopletrace.com/optout",
    privacyEmail: "privacy@quickpeopletrace.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // COURT RECORDS & LEGAL
  // ==========================================
  JUDYRECORDS: {
    name: "JudyRecords",
    optOutUrl: "https://www.judyrecords.com/record-removal",
    privacyEmail: "privacy@judyrecords.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Court records search - removal may be limited by public records laws",
  },
  UNICOURT: {
    name: "UniCourt",
    optOutUrl: "https://unicourt.com/removal-request",
    privacyEmail: "privacy@unicourt.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Legal data platform - requires identity verification",
  },
  COURTRECORDS_ORG: {
    name: "CourtRecords.org",
    optOutUrl: "https://courtrecords.org/optout",
    privacyEmail: "privacy@courtrecords.org",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  ARRESTFACTS: {
    name: "ArrestFacts",
    optOutUrl: "https://arrestfacts.com/ng/control/privacy",
    privacyEmail: "privacy@arrestfacts.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CRIMINALSEARCHES: {
    name: "CriminalSearches",
    optOutUrl: "https://www.criminalsearches.com/optout",
    privacyEmail: "privacy@criminalsearches.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  MUGSHOTS_COM: {
    name: "Mugshots.com",
    optOutUrl: "https://www.mugshots.com/removal.html",
    privacyEmail: "removal@mugshots.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "May require payment for expedited removal",
  },
  INSTANTARREST: {
    name: "InstantArrest",
    optOutUrl: "https://www.instantarrest.com/optout",
    privacyEmail: "privacy@instantarrest.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PUBLICPOLICERECORD: {
    name: "PublicPoliceRecord",
    optOutUrl: "https://publicpolicerecord.com/optout",
    privacyEmail: "privacy@publicpolicerecord.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // REAL ESTATE & PROPERTY RECORDS
  // ==========================================
  PROPERTYSHARK: {
    name: "PropertyShark",
    optOutUrl: "https://www.propertyshark.com/mason/info/Opt-Out",
    privacyEmail: "privacy@propertyshark.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ZILLOW: {
    name: "Zillow",
    optOutUrl: "https://www.zillow.com/z/data-privacy/",
    privacyEmail: "privacy@zillow.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Remove owner info from property listings",
  },
  REDFIN: {
    name: "Redfin",
    optOutUrl: "https://www.redfin.com/about/privacy-policy",
    privacyEmail: "privacy@redfin.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALTOR_COM: {
    name: "Realtor.com",
    optOutUrl: "https://www.realtor.com/privacy-notice/",
    privacyEmail: "privacy@realtor.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRULIA: {
    name: "Trulia",
    optOutUrl: "https://www.trulia.com/privacy",
    privacyEmail: "privacy@trulia.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOUSEVALUES: {
    name: "HouseValues",
    optOutUrl: "https://www.housevalues.com/optout",
    privacyEmail: "privacy@housevalues.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  ADDRESSREPORT: {
    name: "AddressReport",
    optOutUrl: "https://www.addressreport.com/removal",
    privacyEmail: "privacy@addressreport.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  LANDWATCH: {
    name: "LandWatch",
    optOutUrl: "https://www.landwatch.com/privacy",
    privacyEmail: "privacy@landwatch.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // BUSINESS & PROFESSIONAL DATA
  // ==========================================
  SEAMLESS_AI: {
    name: "Seamless.AI",
    optOutUrl: "https://www.seamless.ai/privacy-policy",
    privacyEmail: "privacy@seamless.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DATANYZE: {
    name: "Datanyze",
    optOutUrl: "https://www.datanyze.com/privacy-policy",
    privacyEmail: "privacy@datanyze.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UPLEAD: {
    name: "UpLead",
    optOutUrl: "https://www.uplead.com/privacy-policy/",
    privacyEmail: "privacy@uplead.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SNOV_IO: {
    name: "Snov.io",
    optOutUrl: "https://snov.io/privacy-policy",
    privacyEmail: "gdpr@snov.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FINDTHATLEADS: {
    name: "FindThatLead",
    optOutUrl: "https://findthatlead.com/en/privacy",
    privacyEmail: "privacy@findthatlead.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  VOILANORBERT: {
    name: "VoilaNorbert",
    optOutUrl: "https://www.voilanorbert.com/privacy",
    privacyEmail: "privacy@voilanorbert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ADAPT_IO: {
    name: "Adapt.io",
    optOutUrl: "https://adapt.io/privacy-policy",
    privacyEmail: "privacy@adapt.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CONTACTOUT: {
    name: "ContactOut",
    optOutUrl: "https://contactout.com/optout",
    privacyEmail: "privacy@contactout.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SIGNALHIRE: {
    name: "SignalHire",
    optOutUrl: "https://www.signalhire.com/privacy-policy",
    privacyEmail: "privacy@signalhire.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WIZA: {
    name: "Wiza",
    optOutUrl: "https://wiza.co/privacy-policy",
    privacyEmail: "privacy@wiza.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  OVERLOOP: {
    name: "Overloop",
    optOutUrl: "https://overloop.com/privacy-policy",
    privacyEmail: "privacy@overloop.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SALESLOFT: {
    name: "SalesLoft",
    optOutUrl: "https://salesloft.com/privacy-notice/",
    privacyEmail: "privacy@salesloft.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  AEROLEADS: {
    name: "AeroLeads",
    optOutUrl: "https://aeroleads.com/privacy-policy",
    privacyEmail: "privacy@aeroleads.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GETPROSPECT: {
    name: "GetProspect",
    optOutUrl: "https://getprospect.com/privacy-policy",
    privacyEmail: "privacy@getprospect.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // PHONE & ADDRESS LOOKUP
  // ==========================================
  WHITEPAGES_PREMIUM: {
    name: "WhitePages Premium",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    privacyEmail: "privacy@whitepages.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PHONEBOOKS_COM: {
    name: "PhoneBooks.com",
    optOutUrl: "https://www.phonebooks.com/optout",
    privacyEmail: "privacy@phonebooks.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  ADDRESSES_COM: {
    name: "Addresses.com",
    optOutUrl: "https://www.addresses.com/optout.php",
    privacyEmail: "privacy@addresses.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  PHONELOOKUP: {
    name: "PhoneLookup",
    optOutUrl: "https://www.phonelookup.com/opt-out",
    privacyEmail: "privacy@phonelookup.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  PHONEOWNER: {
    name: "PhoneOwner",
    optOutUrl: "https://phoneowner.com/page/optout",
    privacyEmail: "privacy@phoneowner.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  SYNC_ME: {
    name: "Sync.ME",
    optOutUrl: "https://sync.me/optout/",
    privacyEmail: "privacy@sync.me",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Caller ID and spam blocking app - remove your info",
  },
  HIYA: {
    name: "Hiya",
    optOutUrl: "https://hiya.com/optout",
    privacyEmail: "privacy@hiya.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  TRUECALLER: {
    name: "Truecaller",
    optOutUrl: "https://www.truecaller.com/unlisting",
    privacyEmail: "privacy@truecaller.com",
    removalMethod: "FORM",
    estimatedDays: 1,
    notes: "Unlist from Truecaller directory - usually instant",
  },
  MR_NUMBER: {
    name: "Mr. Number",
    optOutUrl: "https://mrnumber.com/remove",
    privacyEmail: "privacy@mrnumber.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLERIDTEST: {
    name: "CallerIDTest",
    optOutUrl: "https://calleridtest.com/opt-out",
    privacyEmail: "privacy@calleridtest.com",
    removalMethod: "FORM",
    estimatedDays: 5,
  },
  OLDPHONEBOOK: {
    name: "OldPhoneBook",
    optOutUrl: "https://www.oldphonebook.com/opt-out",
    privacyEmail: "privacy@oldphonebook.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MARKETING & ADVERTISING DATA
  // ==========================================
  LIVERAMP: {
    name: "LiveRamp",
    optOutUrl: "https://liveramp.com/opt_out/",
    privacyEmail: "privacy@liveramp.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Major data broker for advertising - opt out of identity graph",
  },
  TAPAD: {
    name: "Tapad",
    optOutUrl: "https://www.tapad.com/privacy-policy",
    privacyEmail: "privacy@tapad.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  NEUSTAR: {
    name: "Neustar",
    optOutUrl: "https://www.home.neustar/privacy/opt-out",
    privacyEmail: "privacy@team.neustar",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  NIELSEN: {
    name: "Nielsen",
    optOutUrl: "https://www.nielsen.com/us/en/legal/privacy-statement/digital-measurement-privacy-statement/",
    privacyEmail: "privacy.department@nielsen.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
  },
  LOTAME: {
    name: "Lotame",
    optOutUrl: "https://www.lotame.com/about-lotame/privacy/opt-out/",
    privacyEmail: "privacy@lotame.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DATALOGIX: {
    name: "Datalogix (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  BLUEKAI: {
    name: "BlueKai (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy@oracle.com",
    removalMethod: "FORM",
    estimatedDays: 45,
  },
  INFOGROUP: {
    name: "Infogroup (Data.com)",
    optOutUrl: "https://www.infogroup.com/privacy-policy",
    privacyEmail: "privacy@infogroup.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRANSUNION: {
    name: "TransUnion Marketing",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  COMSCORE: {
    name: "comScore",
    optOutUrl: "https://www.comscore.com/About/Privacy-Policy",
    privacyEmail: "privacy@comscore.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // DATING & RELATIONSHIP SEARCH
  // ==========================================
  DATING_BACKGROUND: {
    name: "DatingBackground",
    optOutUrl: "https://www.datingbackground.com/opt-out",
    privacyEmail: "privacy@datingbackground.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  MATCHDOTCOM_LOOKUP: {
    name: "Match.com Background Check",
    optOutUrl: "https://www.match.com/help/privacy.aspx",
    privacyEmail: "privacy@match.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DATESEARCHSITE: {
    name: "DateSearchSite",
    optOutUrl: "https://www.datesearchsite.com/optout",
    privacyEmail: "privacy@datesearchsite.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  ROMANCESCAMS: {
    name: "RomanceScams",
    optOutUrl: "https://romancescams.org/removal",
    privacyEmail: "privacy@romancescams.org",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // FINANCIAL & INSURANCE DATA
  // ==========================================
  EXPERIAN_CONSUMER: {
    name: "Experian Consumer",
    optOutUrl: "https://www.experian.com/privacy/opt-out-form",
    privacyEmail: "privacy@experian.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EQUIFAX_CONSUMER: {
    name: "Equifax Consumer",
    optOutUrl: "https://myprivacy.equifax.com/personal-info",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  TRANSUNION_CONSUMER: {
    name: "TransUnion Consumer",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CHEXSYSTEMS: {
    name: "ChexSystems",
    optOutUrl: "https://www.chexsystems.com/security-freeze",
    privacyEmail: "privacy@fnis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  INNOVIS: {
    name: "Innovis",
    optOutUrl: "https://www.innovis.com/securityFreeze/index",
    privacyEmail: "privacy@innovis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  NCTUE: {
    name: "NCTUE",
    optOutUrl: "https://www.nctue.com/Consumers",
    privacyEmail: "privacy@nctue.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "National Consumer Telecom & Utilities Exchange",
  },
  SAGESTREAM: {
    name: "SageStream",
    optOutUrl: "https://www.sagestreamllc.com/",
    privacyEmail: "privacy@sagestreamllc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // VEHICLE & DRIVING RECORDS
  // ==========================================
  VEHICLEHISTORY: {
    name: "VehicleHistory.com",
    optOutUrl: "https://www.vehiclehistory.com/privacy-policy",
    privacyEmail: "privacy@vehiclehistory.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CARFAX: {
    name: "CARFAX",
    optOutUrl: "https://www.carfax.com/company/privacy-policy",
    privacyEmail: "privacy@carfax.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  AUTOCHECK: {
    name: "AutoCheck",
    optOutUrl: "https://www.autocheck.com/consumers/privacy",
    privacyEmail: "privacy@experian.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DRIVINGRECORDS: {
    name: "DrivingRecords",
    optOutUrl: "https://www.drivingrecords.com/optout",
    privacyEmail: "privacy@drivingrecords.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // GENEALOGY & FAMILY HISTORY
  // ==========================================
  ANCESTRY: {
    name: "Ancestry",
    optOutUrl: "https://support.ancestry.com/s/article/Removing-Public-Records-from-Ancestry",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Request removal of public records from Ancestry.com",
  },
  MYHERITAGE: {
    name: "MyHeritage",
    optOutUrl: "https://www.myheritage.com/privacy-policy",
    privacyEmail: "privacy@myheritage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  FINDAGRAVE: {
    name: "FindAGrave",
    optOutUrl: "https://www.findagrave.com/cgi-bin/fg.cgi?page=privacyPolicy",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BILLIONGRAVES: {
    name: "BillionGraves",
    optOutUrl: "https://billiongraves.com/privacy",
    privacyEmail: "privacy@billiongraves.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ARCHIVES_COM: {
    name: "Archives.com",
    optOutUrl: "https://www.archives.com/privacy",
    privacyEmail: "privacy@archives.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GENEALOGYBANK: {
    name: "GenealogyBank",
    optOutUrl: "https://www.genealogybank.com/privacy",
    privacyEmail: "privacy@genealogybank.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEWSPAPERS_COM: {
    name: "Newspapers.com",
    optOutUrl: "https://www.newspapers.com/privacy",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // INTERNATIONAL DATA BROKERS
  // ==========================================
  CANADA411: {
    name: "Canada411",
    optOutUrl: "https://www.canada411.ca/privacy/",
    privacyEmail: "privacy@yp.ca",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Canadian phone directory",
  },
  UK_192: {
    name: "192.com (UK)",
    optOutUrl: "https://www.192.com/optout/",
    privacyEmail: "dataprotection@192.com",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "UK people search and electoral roll",
  },
  INFOBEL: {
    name: "Infobel (International)",
    optOutUrl: "https://www.infobel.com/en/privacy",
    privacyEmail: "privacy@infobel.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "International phone directory",
  },
  YASNI: {
    name: "Yasni (Germany)",
    optOutUrl: "https://www.yasni.de/opt-out",
    privacyEmail: "privacy@yasni.de",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "German people search engine",
  },
  WEBMII: {
    name: "WebMii",
    optOutUrl: "https://webmii.com/privacy",
    privacyEmail: "privacy@webmii.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PIPL_UK: {
    name: "Pipl UK",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  FOREBEARS: {
    name: "Forebears",
    optOutUrl: "https://forebears.io/privacy",
    privacyEmail: "privacy@forebears.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Surname and genealogy database",
  },

  // ==========================================
  // EDUCATIONAL & PROFESSIONAL LICENSES
  // ==========================================
  NATIONAL_STUDENT_CLEARINGHOUSE: {
    name: "National Student Clearinghouse",
    optOutUrl: "https://www.studentclearinghouse.org/students/optional-block-request/",
    privacyEmail: "privacy@studentclearinghouse.org",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Educational record database",
  },
  VERIFYED: {
    name: "VerifyEd",
    optOutUrl: "https://www.verifyed.io/privacy",
    privacyEmail: "privacy@verifyed.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LICENSE_LOOKUP: {
    name: "LicenseLookup",
    optOutUrl: "https://www.licenselookup.com/optout",
    privacyEmail: "privacy@licenselookup.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },

  // ==========================================
  // HEALTHCARE DATA
  // ==========================================
  HEALTHGRADES: {
    name: "Healthgrades",
    optOutUrl: "https://www.healthgrades.com/content/patient-rights",
    privacyEmail: "privacy@healthgrades.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Doctor reviews and healthcare provider info",
  },
  VITALS: {
    name: "Vitals",
    optOutUrl: "https://www.vitals.com/privacy",
    privacyEmail: "privacy@vitals.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ZOCDOC: {
    name: "Zocdoc",
    optOutUrl: "https://www.zocdoc.com/about/privacypolicy",
    privacyEmail: "privacy@zocdoc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DOXIMITY: {
    name: "Doximity",
    optOutUrl: "https://www.doximity.com/privacy",
    privacyEmail: "privacy@doximity.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Physician network",
  },
  NPPES: {
    name: "NPPES (NPI Registry)",
    optOutUrl: "https://nppes.cms.hhs.gov/",
    privacyEmail: "customerservice@nppes.cms.hhs.gov",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "National Provider Identifier - medical provider registry",
  },

  // ==========================================
  // LOCATION & TRACKING
  // ==========================================
  FOURSQUARE: {
    name: "Foursquare",
    optOutUrl: "https://foursquare.com/legal/privacy",
    privacyEmail: "privacy@foursquare.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SAFEGRAPH: {
    name: "SafeGraph",
    optOutUrl: "https://www.safegraph.com/privacy-policy",
    privacyEmail: "privacy@safegraph.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Location data broker",
  },
  MOBILEWALLA: {
    name: "Mobilewalla",
    optOutUrl: "https://www.mobilewalla.com/privacy-policy",
    privacyEmail: "privacy@mobilewalla.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Mobile device and location data",
  },
  XMODE: {
    name: "X-Mode (Outlogic)",
    optOutUrl: "https://www.outlogic.io/privacy-policy",
    privacyEmail: "privacy@outlogic.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  GRAVY_ANALYTICS: {
    name: "Gravy Analytics",
    optOutUrl: "https://gravyanalytics.com/privacy/",
    privacyEmail: "privacy@gravyanalytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PLACER_AI: {
    name: "Placer.ai",
    optOutUrl: "https://www.placer.ai/privacy-policy",
    privacyEmail: "privacy@placer.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // ADDITIONAL REQUESTED BROKERS
  // ==========================================
  OURSTATES: {
    name: "OurStates.org",
    optOutUrl: "https://ourstates.org/optout",
    privacyEmail: "privacy@ourstates.org",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "State records aggregator - opt out to remove your listing",
  },
  IDCRAWL: {
    name: "IDCrawl",
    optOutUrl: "https://www.idcrawl.com/opt-out",
    privacyEmail: "privacy@idcrawl.com",
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Free people search engine - request removal via opt-out form",
  },
  REALTYHOP: {
    name: "RealtyHop",
    optOutUrl: "https://www.realtyhop.com/privacy",
    privacyEmail: "privacy@realtyhop.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Real estate platform - request removal of owner information",
  },
  SHOWCASE: {
    name: "Showcase.com",
    optOutUrl: "https://www.showcase.com/privacy",
    privacyEmail: "privacy@showcase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Real estate listings - request owner info removal",
  },

  // ==========================================
  // MORE PEOPLE SEARCH SITES
  // ==========================================
  INFOFREE: {
    name: "InfoFree",
    optOutUrl: "https://www.infofree.com/opt-out",
    privacyEmail: "privacy@infofree.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CENTEDA: {
    name: "Centeda",
    optOutUrl: "https://centeda.com/ng/control/privacy",
    privacyEmail: "privacy@centeda.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CUBIB: {
    name: "Cubib",
    optOutUrl: "https://cubib.com/optout.php",
    privacyEmail: "privacy@cubib.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  KWOLD: {
    name: "Kwold",
    optOutUrl: "https://www.kwold.com/optout",
    privacyEmail: "privacy@kwold.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NEWENGLANDFACTS: {
    name: "NewEnglandFacts",
    optOutUrl: "https://newenglandfacts.com/ng/control/privacy",
    privacyEmail: "privacy@newenglandfacts.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  OFFICIALUSA: {
    name: "OfficialUSA",
    optOutUrl: "https://www.officialusa.com/opt-out/",
    privacyEmail: "privacy@officialusa.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PUB360: {
    name: "Pub360",
    optOutUrl: "https://www.pub360.com/optout",
    privacyEmail: "privacy@pub360.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PROFILEENGINE: {
    name: "ProfileEngine",
    optOutUrl: "https://profileengine.com/optout",
    privacyEmail: "privacy@profileengine.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PUBLICINFOSERVICES: {
    name: "PublicInfoServices",
    optOutUrl: "https://www.publicinfoservices.com/opt-out/",
    privacyEmail: "privacy@publicinfoservices.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEBACKGROUNDCHECK: {
    name: "PeopleBackgroundCheck",
    optOutUrl: "https://www.peoplebackgroundcheck.com/optout",
    privacyEmail: "privacy@peoplebackgroundcheck.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PRIVATERECORDS: {
    name: "PrivateRecords",
    optOutUrl: "https://www.privaterecords.net/optout",
    privacyEmail: "privacy@privaterecords.net",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PEOPLEWHIZ: {
    name: "PeopleWhiz",
    optOutUrl: "https://www.peoplewhiz.com/optout",
    privacyEmail: "privacy@peoplewhiz.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SEARCHBUG: {
    name: "SearchBug",
    optOutUrl: "https://www.searchbug.com/peoplefinder/optout.aspx",
    privacyEmail: "privacy@searchbug.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  SPYTOX: {
    name: "Spytox",
    optOutUrl: "https://www.spytox.com/opt-out",
    privacyEmail: "privacy@spytox.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  STATERECORDS: {
    name: "StateRecords.org",
    optOutUrl: "https://staterecords.org/optout",
    privacyEmail: "privacy@staterecords.org",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  UNITEDSTATESPHONEBOOK: {
    name: "UnitedStatesPhoneBook",
    optOutUrl: "https://www.unitedstatesphonebook.com/contact.php",
    privacyEmail: "privacy@unitedstatesphonebook.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  USA_PEOPLE_SEARCH: {
    name: "USA-People-Search",
    optOutUrl: "https://www.usa-people-search.com/manage",
    privacyEmail: "privacy@usa-people-search.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  USATRACE: {
    name: "USATrace",
    optOutUrl: "https://www.usatrace.com/optout",
    privacyEmail: "privacy@usatrace.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  VERIPAGES: {
    name: "VeriPages",
    optOutUrl: "https://veripages.com/page/optout",
    privacyEmail: "privacy@veripages.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WELLNUT: {
    name: "Wellnut",
    optOutUrl: "https://www.wellnut.com/optout.html",
    privacyEmail: "privacy@wellnut.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE PHONE & CALLER ID
  // ==========================================
  CALLERSMART: {
    name: "CallerSmart",
    optOutUrl: "https://www.callersmart.com/opt-out",
    privacyEmail: "privacy@callersmart.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLERCENTER: {
    name: "CallerCenter",
    optOutUrl: "https://callercenter.com/optout",
    privacyEmail: "privacy@callercenter.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NUMBERGURU: {
    name: "NumberGuru",
    optOutUrl: "https://www.numberguru.com/optout",
    privacyEmail: "privacy@numberguru.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  NUMBERVILLE: {
    name: "NumberVille",
    optOutUrl: "https://www.numberville.com/opt-out",
    privacyEmail: "privacy@numberville.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  PHONEVALIDATOR: {
    name: "PhoneValidator",
    optOutUrl: "https://www.phonevalidator.com/optout",
    privacyEmail: "privacy@phonevalidator.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WHOCALLEDME: {
    name: "WhoCalledMe",
    optOutUrl: "https://whocalledme.com/optout",
    privacyEmail: "privacy@whocalledme.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WHOCALLSME: {
    name: "WhoCallsMe",
    optOutUrl: "https://whocallsme.com/optout",
    privacyEmail: "privacy@whocallsme.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  WHYCALL: {
    name: "WhyCall",
    optOutUrl: "https://www.whycall.com/opt-out",
    privacyEmail: "privacy@whycall.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  CALLERID411: {
    name: "CallerID411",
    optOutUrl: "https://callerid411.com/optout",
    privacyEmail: "privacy@callerid411.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },
  FREECALLERIDSEARCH: {
    name: "FreeCallerIDSearch",
    optOutUrl: "https://freecalleridsearch.com/optout",
    privacyEmail: "privacy@freecalleridsearch.com",
    removalMethod: "FORM",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE PROPERTY & REAL ESTATE
  // ==========================================
  HOMES_COM: {
    name: "Homes.com",
    optOutUrl: "https://www.homes.com/privacy-policy/",
    privacyEmail: "privacy@homes.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  HOMESNAP: {
    name: "Homeснap",
    optOutUrl: "https://www.homesnap.com/privacy",
    privacyEmail: "privacy@homesnap.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  MOVOTO: {
    name: "Movoto",
    optOutUrl: "https://www.movoto.com/privacy/",
    privacyEmail: "privacy@movoto.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  OPENDOOR: {
    name: "Opendoor",
    optOutUrl: "https://www.opendoor.com/privacy",
    privacyEmail: "privacy@opendoor.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ESTATELY: {
    name: "Estately",
    optOutUrl: "https://www.estately.com/privacy",
    privacyEmail: "privacy@estately.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  XOME: {
    name: "Xome",
    optOutUrl: "https://www.xome.com/privacy",
    privacyEmail: "privacy@xome.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FORECLOSURE_COM: {
    name: "Foreclosure.com",
    optOutUrl: "https://www.foreclosure.com/privacy/",
    privacyEmail: "privacy@foreclosure.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LOOPNET: {
    name: "LoopNet",
    optOutUrl: "https://www.loopnet.com/privacy-policy/",
    privacyEmail: "privacy@loopnet.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE PROFESSIONAL DATA
  // ==========================================
  KASPR: {
    name: "Kaspr",
    optOutUrl: "https://www.kaspr.io/privacy-policy",
    privacyEmail: "privacy@kaspr.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DROPCONTACT: {
    name: "Dropcontact",
    optOutUrl: "https://www.dropcontact.com/privacy",
    privacyEmail: "gdpr@dropcontact.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ANYMAILFINDER: {
    name: "AnyMailFinder",
    optOutUrl: "https://anymailfinder.com/privacy",
    privacyEmail: "privacy@anymailfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILHUNTER: {
    name: "EmailHunter",
    optOutUrl: "https://emailhunter.co/privacy",
    privacyEmail: "privacy@emailhunter.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FINDYMAIL: {
    name: "Findymail",
    optOutUrl: "https://findymail.com/privacy",
    privacyEmail: "privacy@findymail.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SKRAPP: {
    name: "Skrapp",
    optOutUrl: "https://skrapp.io/privacy",
    privacyEmail: "privacy@skrapp.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TOMBA: {
    name: "Tomba.io",
    optOutUrl: "https://tomba.io/privacy",
    privacyEmail: "privacy@tomba.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NYMERIA: {
    name: "Nymeria",
    optOutUrl: "https://www.nymeria.io/privacy",
    privacyEmail: "privacy@nymeria.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PROSPECTLINKER: {
    name: "ProspectLinker",
    optOutUrl: "https://prospectlinker.com/privacy",
    privacyEmail: "privacy@prospectlinker.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SWORDFISH: {
    name: "Swordfish",
    optOutUrl: "https://swordfish.ai/privacy",
    privacyEmail: "privacy@swordfish.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE MARKETING DATA BROKERS
  // ==========================================
  THETRADEDESK: {
    name: "The Trade Desk",
    optOutUrl: "https://www.thetradedesk.com/general/privacy",
    privacyEmail: "privacy@thetradedesk.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PUBMATIC: {
    name: "PubMatic",
    optOutUrl: "https://pubmatic.com/legal/opt-out/",
    privacyEmail: "privacy@pubmatic.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  MAGNITE: {
    name: "Magnite (Rubicon)",
    optOutUrl: "https://www.magnite.com/legal/consumer-online-profile-and-opt-out/",
    privacyEmail: "privacy@magnite.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  OPENX: {
    name: "OpenX",
    optOutUrl: "https://www.openx.com/privacy-center/",
    privacyEmail: "privacy@openx.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  CRITEO: {
    name: "Criteo",
    optOutUrl: "https://www.criteo.com/privacy/",
    privacyEmail: "privacy@criteo.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  VIANT: {
    name: "Viant",
    optOutUrl: "https://www.viantinc.com/privacy-policy/",
    privacyEmail: "privacy@viantinc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ADSRVR: {
    name: "AdSrvr",
    optOutUrl: "https://adsrvr.org/opt-out/",
    privacyEmail: "privacy@adsrvr.org",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  EYEOTA: {
    name: "Eyeota",
    optOutUrl: "https://www.eyeota.com/privacy-policy",
    privacyEmail: "privacy@eyeota.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE COURT & CRIMINAL RECORDS
  // ==========================================
  CRIMINALWATCHDOG: {
    name: "CriminalWatchDog",
    optOutUrl: "https://www.criminalwatchdog.com/optout",
    privacyEmail: "privacy@criminalwatchdog.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  DOCKETBIRD: {
    name: "DocketBird",
    optOutUrl: "https://www.docketbird.com/privacy",
    privacyEmail: "privacy@docketbird.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PACERMONITOR: {
    name: "PacerMonitor",
    optOutUrl: "https://www.pacermonitor.com/privacy",
    privacyEmail: "privacy@pacermonitor.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TRELLIS_LAW: {
    name: "Trellis Law",
    optOutUrl: "https://trellis.law/privacy",
    privacyEmail: "privacy@trellis.law",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COURTLISTENER: {
    name: "CourtListener",
    optOutUrl: "https://www.courtlistener.com/removal/",
    privacyEmail: "privacy@free.law",
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Free law project - honors removal requests",
  },
  DOCKETALARM: {
    name: "Docket Alarm",
    optOutUrl: "https://www.docketalarm.com/privacy",
    privacyEmail: "privacy@docketalarm.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE GENEALOGY & OBITUARY
  // ==========================================
  LEGACY_COM: {
    name: "Legacy.com",
    optOutUrl: "https://www.legacy.com/privacy/",
    privacyEmail: "privacy@legacy.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Obituary and memorial site",
  },
  TRIBUTES_COM: {
    name: "Tributes.com",
    optOutUrl: "https://www.tributes.com/privacy",
    privacyEmail: "privacy@tributes.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ECHOVITA: {
    name: "Echovita",
    optOutUrl: "https://www.echovita.com/privacy",
    privacyEmail: "privacy@echovita.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EVERHERE: {
    name: "EverHere",
    optOutUrl: "https://www.everhere.com/privacy",
    privacyEmail: "privacy@everhere.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FOLD3: {
    name: "Fold3",
    optOutUrl: "https://www.fold3.com/privacy",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Military records - owned by Ancestry",
  },
  FINDMYPAST: {
    name: "Findmypast",
    optOutUrl: "https://www.findmypast.com/privacy",
    privacyEmail: "privacy@findmypast.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE INTERNATIONAL BROKERS
  // ==========================================
  SPOKEO_UK: {
    name: "Spokeo UK",
    optOutUrl: "https://www.spokeo.co.uk/optout",
    privacyEmail: "privacy@spokeo.com",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  CHECKPEOPLE_UK: {
    name: "CheckPeople UK",
    optOutUrl: "https://checkpeople.co.uk/optout",
    privacyEmail: "privacy@checkpeople.co.uk",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PERSONLOOKUP_UK: {
    name: "PersonLookup UK",
    optOutUrl: "https://personlookup.co.uk/opt-out",
    privacyEmail: "privacy@personlookup.co.uk",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  WHITEPAGES_AU: {
    name: "White Pages Australia",
    optOutUrl: "https://www.whitepages.com.au/opt-out",
    privacyEmail: "privacy@sensis.com.au",
    removalMethod: "FORM",
    estimatedDays: 14,
  },
  PAGESJAUNES: {
    name: "PagesJaunes (France)",
    optOutUrl: "https://www.pagesjaunes.fr/infoslegales",
    privacyEmail: "cnil@solocal.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  DASTELEFONBUCH: {
    name: "DasTelefonbuch (Germany)",
    optOutUrl: "https://www.dastelefonbuch.de/Datenschutz",
    privacyEmail: "datenschutz@telefonbuch.de",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  PAGINEBIANCHE: {
    name: "PagineBianche (Italy)",
    optOutUrl: "https://www.paginebianche.it/privacy",
    privacyEmail: "privacy@paginebianche.it",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
  GUIALOCAL: {
    name: "GuiaLocal (Spain)",
    optOutUrl: "https://www.guialocal.com/privacy",
    privacyEmail: "privacy@guialocal.com",
    removalMethod: "FORM",
    estimatedDays: 30,
  },

  // ==========================================
  // INSURANCE & RISK DATA
  // ==========================================
  LN_RISK_SOLUTIONS: {
    name: "LexisNexis Risk Solutions",
    optOutUrl: "https://risk.lexisnexis.com/consumer-and-data-access-policies",
    privacyEmail: "privacy@lexisnexisrisk.com",
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Insurance risk scoring database - affects premiums",
  },
  VERISK: {
    name: "Verisk",
    optOutUrl: "https://www.verisk.com/privacy-policies/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CLUE_REPORT: {
    name: "C.L.U.E. Report",
    optOutUrl: "https://consumer.risk.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Insurance claims history database",
  },
  ISO_CLAIMS: {
    name: "ISO ClaimSearch",
    optOutUrl: "https://www.verisk.com/privacy-policies/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },

  // ==========================================
  // EMAIL VERIFICATION SERVICES
  // ==========================================
  ZEROBOUNCE: {
    name: "ZeroBounce",
    optOutUrl: "https://www.zerobounce.net/privacy-policy/",
    privacyEmail: "privacy@zerobounce.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEVERBOUNCE: {
    name: "NeverBounce",
    optOutUrl: "https://neverbounce.com/privacy-policy",
    privacyEmail: "privacy@neverbounce.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  KICKBOX: {
    name: "Kickbox",
    optOutUrl: "https://kickbox.com/privacy",
    privacyEmail: "privacy@kickbox.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DEBOUNCE: {
    name: "DeBounce",
    optOutUrl: "https://debounce.io/privacy-policy/",
    privacyEmail: "privacy@debounce.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLISTVERIFY: {
    name: "EmailListVerify",
    optOutUrl: "https://emaillistverify.com/privacy-policy",
    privacyEmail: "privacy@emaillistverify.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CLEAROUT: {
    name: "Clearout",
    optOutUrl: "https://clearout.io/privacy-policy",
    privacyEmail: "privacy@clearout.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // DEVICE & IDENTITY GRAPHS
  // ==========================================
  DRAWBRIDGE: {
    name: "Drawbridge",
    optOutUrl: "https://www.drawbridge.com/privacy",
    privacyEmail: "privacy@drawbridge.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CROSSWISE: {
    name: "Crosswise",
    optOutUrl: "https://www.crosswise.com/privacy",
    privacyEmail: "privacy@crosswise.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IQVIA: {
    name: "IQVIA",
    optOutUrl: "https://www.iqvia.com/about-us/privacy",
    privacyEmail: "privacy@iqvia.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Healthcare and pharmaceutical data",
  },
  ID5: {
    name: "ID5",
    optOutUrl: "https://id5.io/privacy",
    privacyEmail: "privacy@id5.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SHAREDID: {
    name: "SharedID",
    optOutUrl: "https://sharedid.org/opt-out",
    privacyEmail: "privacy@prebid.org",
    removalMethod: "FORM",
    estimatedDays: 30,
  },
};

// Broker categories for organization
export const BROKER_CATEGORIES = {
  PEOPLE_SEARCH: [
    "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "PEOPLEFINDER",
    "TRUEPEOPLESEARCH", "RADARIS", "FASTPEOPLESEARCH", "USSEARCH", "PIPL",
    "INSTANTCHECKMATE", "PEOPLELOOKER", "PEOPLEFINDERS", "THATSTHEM",
    "PUBLICRECORDSNOW", "FAMILYTREENOW", "MYLIFE", "CLUSTRMAPS", "ADDRESSES",
    "ADVANCED_PEOPLE_SEARCH", "ZABASEARCH", "PEEKYOU", "BEEN_VERIFIED_PEOPLE",
    "PUBLICRECORDS360", "PERSOPO", "SMARTBACKGROUNDCHECKS", "LOCATEFAMILY",
    "PEOPLEWISE", "PEOPLESEARCHNOW", "PEOPLEBYNAME", "VIRTORY", "VERICORA",
    "GLADIKNOW", "IDENTITYPI", "QUICKPEOPLETRACE", "OURSTATES", "IDCRAWL",
    "INFOFREE", "CENTEDA", "CUBIB", "KWOLD", "NEWENGLANDFACTS", "OFFICIALUSA",
    "PUB360", "PROFILEENGINE", "PUBLICINFOSERVICES", "PEOPLEBACKGROUNDCHECK",
    "PRIVATERECORDS", "PEOPLEWHIZ", "SEARCHBUG", "SPYTOX", "STATERECORDS",
    "UNITEDSTATESPHONEBOOK", "USA_PEOPLE_SEARCH", "USATRACE", "VERIPAGES", "WELLNUT"
  ],
  BACKGROUND_CHECK: [
    "TRUTHFINDER", "CHECKPEOPLE", "CYBERBACKGROUNDCHECKS", "PUBLICDATACHECK",
    "SEARCHPEOPLEFREE", "FREEPEOPLESEARCH", "SEARCHQUARRY"
  ],
  COURT_RECORDS: [
    "JUDYRECORDS", "UNICOURT", "COURTRECORDS_ORG", "ARRESTFACTS",
    "CRIMINALSEARCHES", "MUGSHOTS_COM", "INSTANTARREST", "PUBLICPOLICERECORD",
    "CRIMINALWATCHDOG", "DOCKETBIRD", "PACERMONITOR", "TRELLIS_LAW",
    "COURTLISTENER", "DOCKETALARM"
  ],
  PHONE_LOOKUP: [
    "ANYWHO", "YELLOWPAGES", "INFOSPACE", "NUWBER", "REVERSEPHONELOOKUP",
    "SPYDIALER", "CALLTRUTH", "USPHONEBOOK", "WHITEPAGES_PREMIUM",
    "PHONEBOOKS_COM", "ADDRESSES_COM", "PHONELOOKUP", "PHONEOWNER",
    "SYNC_ME", "HIYA", "TRUECALLER", "MR_NUMBER", "CALLERIDTEST", "OLDPHONEBOOK",
    "CALLERSMART", "CALLERCENTER", "NUMBERGURU", "NUMBERVILLE", "PHONEVALIDATOR",
    "WHOCALLEDME", "WHOCALLSME", "WHYCALL", "CALLERID411", "FREECALLERIDSEARCH"
  ],
  PROPERTY_RECORDS: [
    "NEIGHBOR_WHO", "HOMEMETRY", "BLOCKSHOPPER", "OWNERLY", "REHOLD",
    "PROPERTYSHARK", "ZILLOW", "REDFIN", "REALTOR_COM", "TRULIA",
    "HOUSEVALUES", "ADDRESSREPORT", "LANDWATCH", "REALTYHOP", "SHOWCASE",
    "HOMES_COM", "HOMESNAP", "MOVOTO", "OPENDOOR", "ESTATELY", "XOME",
    "FORECLOSURE_COM", "LOOPNET"
  ],
  EMAIL_IDENTITY: [
    "VOTERRECORDS", "EMAILSHERLOCK", "EMAILFINDER", "HUNTER_IO"
  ],
  PROFESSIONAL_B2B: [
    "ZOOMINFO", "LUSHA", "APOLLO", "ROCKETREACH", "LEADIQ", "COGNISM",
    "CLEARBIT", "FULLCONTACT", "SEAMLESS_AI", "DATANYZE", "UPLEAD",
    "SNOV_IO", "FINDTHATLEADS", "VOILANORBERT", "ADAPT_IO", "CONTACTOUT",
    "SIGNALHIRE", "WIZA", "OVERLOOP", "SALESLOFT", "AEROLEADS", "GETPROSPECT",
    "KASPR", "DROPCONTACT", "ANYMAILFINDER", "EMAILHUNTER", "FINDYMAIL",
    "SKRAPP", "TOMBA", "NYMERIA", "PROSPECTLINKER", "SWORDFISH"
  ],
  MARKETING: [
    "ACXIOM", "ORACLE_DATACLOUD", "EPSILON", "EXPERIAN_MARKETING",
    "EQUIFAX_MARKETING", "LEXISNEXIS", "LIVERAMP", "TAPAD", "NEUSTAR",
    "NIELSEN", "LOTAME", "DATALOGIX", "BLUEKAI", "INFOGROUP",
    "TRANSUNION", "COMSCORE", "THETRADEDESK", "PUBMATIC", "MAGNITE",
    "OPENX", "CRITEO", "VIANT", "ADSRVR", "EYEOTA"
  ],
  DATING_RELATIONSHIP: [
    "DATING_BACKGROUND", "MATCHDOTCOM_LOOKUP", "DATESEARCHSITE", "ROMANCESCAMS"
  ],
  FINANCIAL: [
    "EXPERIAN_CONSUMER", "EQUIFAX_CONSUMER", "TRANSUNION_CONSUMER",
    "CHEXSYSTEMS", "INNOVIS", "NCTUE", "SAGESTREAM"
  ],
  VEHICLE_DRIVING: [
    "VEHICLEHISTORY", "CARFAX", "AUTOCHECK", "DRIVINGRECORDS"
  ],
  GENEALOGY: [
    "ANCESTRY", "MYHERITAGE", "FINDAGRAVE", "BILLIONGRAVES",
    "ARCHIVES_COM", "GENEALOGYBANK", "NEWSPAPERS_COM", "LEGACY_COM",
    "TRIBUTES_COM", "ECHOVITA", "EVERHERE", "FOLD3", "FINDMYPAST"
  ],
  INTERNATIONAL: [
    "CANADA411", "UK_192", "INFOBEL", "YASNI", "WEBMII", "PIPL_UK", "FOREBEARS",
    "SPOKEO_UK", "CHECKPEOPLE_UK", "PERSONLOOKUP_UK", "WHITEPAGES_AU",
    "PAGESJAUNES", "DASTELEFONBUCH", "PAGINEBIANCHE", "GUIALOCAL"
  ],
  EDUCATIONAL: [
    "NATIONAL_STUDENT_CLEARINGHOUSE", "VERIFYED", "LICENSE_LOOKUP"
  ],
  HEALTHCARE: [
    "HEALTHGRADES", "VITALS", "ZOCDOC", "DOXIMITY", "NPPES"
  ],
  LOCATION_TRACKING: [
    "FOURSQUARE", "SAFEGRAPH", "MOBILEWALLA", "XMODE", "GRAVY_ANALYTICS", "PLACER_AI"
  ],
  INSURANCE_RISK: [
    "LN_RISK_SOLUTIONS", "VERISK", "CLUE_REPORT", "ISO_CLAIMS"
  ],
  EMAIL_VERIFICATION: [
    "ZEROBOUNCE", "NEVERBOUNCE", "KICKBOX", "DEBOUNCE", "EMAILLISTVERIFY", "CLEAROUT"
  ],
  IDENTITY_GRAPHS: [
    "DRAWBRIDGE", "CROSSWISE", "IQVIA", "ID5", "SHAREDID"
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
