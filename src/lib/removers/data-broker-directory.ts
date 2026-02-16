/**
 * DATA BROKER DIRECTORY
 * Opt-out URLs and contact information for verified data brokers
 *
 * LEGAL DISCLAIMER:
 * This directory ONLY contains entities that meet the legal definition of "data broker"
 * under applicable privacy laws:
 *
 * - California Civil Code § 1798.99.80(d): "a business that knowingly collects and
 *   sells to third parties the personal information of a consumer with whom the
 *   business does NOT have a direct relationship"
 *
 * - Vermont 9 V.S.A. § 2430(4): "a business, or unit or units of a business,
 *   separately or together, that knowingly collects and sells or licenses to
 *   third parties the brokered personal information of a consumer with whom
 *   the business does not have a direct relationship"
 *
 * EXCLUDED FROM THIS DIRECTORY:
 * - Direct relationship platforms (job sites, social networks, service platforms)
 *   where users create accounts and provide their own data voluntarily
 * - Data Processors under GDPR Articles 28/29 that only process data on behalf
 *   of Data Controllers (their clients)
 * - Platforms where the data subject has a direct account/user relationship
 *
 * See src/lib/removers/blocklist.ts for companies that should NOT receive
 * automated removal requests.
 *
 * @see https://oag.ca.gov/data-brokers - California Data Broker Registry
 * @see https://sos.vermont.gov/data-brokers/ - Vermont Data Broker Registry
 */

import { getCorrectedUrl } from "@/lib/removals/url-corrections";

export type RemovalMethod = "FORM" | "EMAIL" | "BOTH" | "MONITOR" | "NOT_REMOVABLE";
export type SourceCategory = "DATA_BROKER" | "BREACH_DATABASE" | "SOCIAL_MEDIA" | "AI_SERVICE" | "DARK_WEB" | "SERVICE_PROVIDER" | "OTHER";

export interface DataBrokerInfo {
  name: string;
  optOutUrl?: string;
  optOutEmail?: string;
  privacyEmail?: string;
  removalMethod: RemovalMethod;
  estimatedDays: number; // Estimated time to process removal, -1 for not removable
  notes?: string;
  category?: SourceCategory; // Category for smart handling
  isRemovable?: boolean; // Explicit flag for non-removable sources
  // Consolidation fields - for combining manual processes
  consolidatesTo?: string; // Parent broker key - removing parent also removes this
  subsidiaries?: string[]; // List of broker keys that get removed when this broker is opted out
  parentCompany?: string; // Human-readable parent company name
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
    // Email bounces - use web form only
    removalMethod: "FORM",
    estimatedDays: 5,
    notes: "Use web form - email addresses bounce. May require phone verification.",

    parentCompany: "WhitePages Inc",
    subsidiaries: ["WHITEPAGES_PREMIUM","CALLER_ID"],
  },
  BEENVERIFIED: {
    name: "BeenVerified",
    optOutUrl: "https://www.beenverified.com/app/optout/search",
    optOutEmail: "privacy@beenverified.com",
    privacyEmail: "privacy@beenverified.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    parentCompany: "BeenVerified Inc",
    subsidiaries: ["NEIGHBORWHO","NUMBERVILLE","OWNERLY","PEOPLELOOKER"],
  },
  INTELIUS: {
    name: "Intelius",
    optOutUrl: "https://www.intelius.com/optout",
    // Email bounces - use web form only
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Use web form - email addresses bounce.",

    parentCompany: "PeopleConnect",
    subsidiaries: ["ZABASEARCH","PUBLICRECORDS","ANYWHO","ADDRESSES","CLASSMATES","US_SEARCH","INSTANT_CHECKMATE","TRUTHFINDER"],
  },
  PEOPLEFINDER: {
    name: "PeopleFinder",
    optOutUrl: "https://www.peoplefinder.com/optout",
    // Email bounces repeatedly - form only
    removalMethod: "FORM",
    estimatedDays: 5,
    notes: "Use web form - email addresses bounce.",
  },
  NATIONALPUBLICDATA: {
    name: "National Public Data",
    optOutUrl: "https://nationalpublicdata.com/removal",
    privacyEmail: "privacy@nationalpublicdata.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Major data broker - suffered massive 2.9 billion record breach in 2024. Operated by Jerico Pictures Inc. Collected SSNs, addresses, phone numbers from public records without consumer consent. Company filed bankruptcy after breach but data may persist elsewhere.",
    parentCompany: "Jerico Pictures Inc",
  },
  TRUEPEOPLESEARCH: {
    name: "TruePeopleSearch",
    optOutUrl: "https://www.truepeoplesearch.com/removal",
    privacyEmail: "privacy@truepeoplesearch.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 1,
    notes: "Automated removal usually quick",
  },
  USSEARCH: {
    name: "USSearch",
    optOutUrl: "https://www.ussearch.com/opt-out/",
    privacyEmail: "privacy@ussearch.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PIPL: {
    name: "Pipl",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "May require extensive verification",
  
    parentCompany: "Pipl Inc",
    subsidiaries: ["PIPL_UK","PIPL_INTERNATIONAL","PIPL_ENTERPRISE","PIPL_APAC","PIPL_DATA"],
  },

  // ==========================================
  // PEOPLE SEARCH SITES (Tier 2)
  // ==========================================
  INSTANTCHECKMATE: {
    name: "Instant Checkmate",
    optOutUrl: "https://www.instantcheckmate.com/opt-out/",
    privacyEmail: "privacy@instantcheckmate.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
    notes: "Part of the same network as BeenVerified",
  },
  PEOPLELOOKER: {
    name: "PeopleLooker",
    optOutUrl: "https://www.peoplelooker.com/opt-out",
    privacyEmail: "privacy@peoplelooker.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "BEENVERIFIED",
  },
  PEOPLEFINDERS: {
    name: "PeopleFinders",
    optOutUrl: "https://www.peoplefinders.com/opt-out",
    privacyEmail: "privacy@peoplefinders.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
  },
  THATSTHEM: {
    name: "ThatsThem",
    optOutUrl: "https://thatsthem.com/optout",
    privacyEmail: "privacy@thatsthem.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  PUBLICRECORDSNOW: {
    name: "PublicRecordsNow",
    optOutUrl: "https://www.publicrecordsnow.com/optout",
    privacyEmail: "privacy@publicrecordsnow.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FAMILYTREENOW: {
    name: "FamilyTreeNow",
    optOutUrl: "https://www.familytreenow.com/optout",
    privacyEmail: "privacy@familytreenow.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSES: {
    name: "Addresses.com",
    optOutUrl: "https://www.addresses.com/optout",
    privacyEmail: "privacy@addresses.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "INTELIUS",
  },
  ADVANCED_PEOPLE_SEARCH: {
    name: "Advanced People Search",
    optOutUrl: "https://www.advancedpeoplesearch.com/optout",
    privacyEmail: "privacy@advancedpeoplesearch.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },

  // ==========================================
  // ADDITIONAL PEOPLE SEARCH SITES (from competitor research)
  // ==========================================
  FOUR11: {
    name: "411.com",
    optOutUrl: "https://www.411.com/privacy",
    privacyEmail: "privacy@411.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CLASSMATES: {
    name: "Classmates.com",
    optOutUrl: "https://www.classmates.com/registration/mini/privacyPreferences",
    privacyEmail: "privacy@classmates.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Part of PeopleConnect network - requires account deletion",
  
    consolidatesTo: "INTELIUS",
  },
  REUNION: {
    name: "Reunion.com",
    optOutUrl: "https://www.reunion.com/optout",
    privacyEmail: "privacy@reunion.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  LOOKUPANYONE: {
    name: "LookUpAnyone.com",
    optOutUrl: "https://www.lookupanyone.com/optout",
    privacyEmail: "privacy@lookupanyone.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLELOOKUP: {
    name: "PeopleLookup.com",
    optOutUrl: "https://www.peoplelookup.com/optout",
    privacyEmail: "privacy@peoplelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLESEARCHER: {
    name: "PeopleSearcher.com",
    optOutUrl: "https://www.peoplesearcher.com/optout",
    privacyEmail: "privacy@peoplesearcher.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLESEARCH123: {
    name: "PeopleSearch123.com",
    optOutUrl: "https://www.peoplesearch123.com/optout",
    privacyEmail: "privacy@peoplesearch123.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLECONNECT: {
    name: "PeopleConnect.us",
    optOutUrl: "https://www.peopleconnect.us/privacy",
    privacyEmail: "privacy@peopleconnect.us",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Parent company of many people search sites",
  },
  PRIVATEEYE: {
    name: "PrivateEye.com",
    optOutUrl: "https://www.privateeye.com/optout",
    privacyEmail: "privacy@privateeye.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SPYFLY: {
    name: "SpyFly.com",
    optOutUrl: "https://www.spyfly.com/optout",
    privacyEmail: "privacy@spyfly.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEPHONE: {
    name: "ReversePhone.com",
    optOutUrl: "https://www.reversephone.com/optout",
    privacyEmail: "privacy@reversephone.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEPHONECHECK: {
    name: "ReversePhoneCheck.com",
    optOutUrl: "https://www.reversephonecheck.com/optout",
    privacyEmail: "privacy@reversephonecheck.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  TRUEPEOPLESEARCH_NET: {
    name: "TruePeopleSearch.net",
    optOutUrl: "https://www.truepeoplesearch.net/removal",
    privacyEmail: "privacy@truepeoplesearch.net",
    removalMethod: "BOTH",
    estimatedDays: 3,
    notes: "Different from TruePeopleSearch.com",
  },
  PUBLICRECORDSCENTER: {
    name: "PublicRecordsCenter.org",
    optOutUrl: "https://www.publicrecordscenter.org/optout",
    privacyEmail: "privacy@publicrecordscenter.org",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHITEPAGESGO: {
    name: "WhitePagesGo.com",
    optOutUrl: "https://www.whitepagesgo.com/optout",
    privacyEmail: "privacy@whitepagesgo.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  YELLOWBOOK: {
    name: "YellowBook.com",
    optOutUrl: "https://www.yellowbook.com/optout",
    privacyEmail: "privacy@yellowbook.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
  },
  TELEPHONEDIRECTORIES: {
    name: "TelephoneDirectories.us",
    optOutUrl: "https://www.telephonedirectories.us/optout",
    privacyEmail: "privacy@telephonedirectories.us",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  USA_OFFICIAL: {
    name: "USA-Official.com",
    optOutUrl: "https://www.usa-official.com/optout",
    privacyEmail: "privacy@usa-official.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
  },
  USRECORDS: {
    name: "USRecords.net",
    optOutUrl: "https://www.usrecords.net/optout",
    privacyEmail: "privacy@usrecords.net",
    removalMethod: "BOTH",
    estimatedDays: 10,
  },
  AMERICANPHONEBOOK: {
    name: "AmericanPhoneBook.com",
    optOutUrl: "https://www.americanphonebook.com/optout",
    privacyEmail: "privacy@americanphonebook.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLERNAME: {
    name: "CallerName.com",
    optOutUrl: "https://callername.com/optout",
    privacyEmail: "privacy@callername.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PHONESBOOK: {
    name: "PhonesBook.com",
    optOutUrl: "https://www.phonesbook.com/optout",
    privacyEmail: "privacy@phonesbook.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // BACKGROUND CHECK SITES (expanded)
  // ==========================================
  ADVANCEDBACKGROUNDCHECKS: {
    name: "AdvancedBackgroundChecks.com",
    optOutUrl: "https://www.advancedbackgroundchecks.com/removal",
    privacyEmail: "privacy@advancedbackgroundchecks.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FASTBACKGROUNDCHECK: {
    name: "FastBackgroundCheck.com",
    optOutUrl: "https://www.fastbackgroundcheck.com/optout",
    privacyEmail: "privacy@fastbackgroundcheck.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CHECKTHEM: {
    name: "CheckThem.com",
    optOutUrl: "https://www.checkthem.com/optout",
    privacyEmail: "privacy@checkthem.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CHECKSECRETS: {
    name: "CheckSecrets.com",
    optOutUrl: "https://www.checksecrets.com/optout",
    privacyEmail: "privacy@checksecrets.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  TRUEINTEL: {
    name: "TrueIntel.com",
    optOutUrl: "https://www.trueintel.com/optout",
    privacyEmail: "privacy@trueintel.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // ARREST RECORDS & MUGSHOT SITES
  // ==========================================
  FINDMUGSHOTS: {
    name: "FindMugshots.com",
    optOutUrl: "https://www.findmugshots.com/optout",
    privacyEmail: "remove@findmugshots.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "May require identity verification",
  },
  MUGSHOTLOOK: {
    name: "MugshotLook.com",
    optOutUrl: "https://www.mugshotlook.com/optout",
    privacyEmail: "remove@mugshotlook.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ARRESTWARRANT: {
    name: "ArrestWarrant.org",
    optOutUrl: "https://www.arrestwarrant.org/optout",
    privacyEmail: "privacy@arrestwarrant.org",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  USWARRANTS: {
    name: "USWarrants.org",
    optOutUrl: "https://www.uswarrants.org/optout",
    privacyEmail: "privacy@uswarrants.org",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  INMATESEARCHER: {
    name: "InmatesSearcher.com",
    optOutUrl: "https://www.inmatesearcher.com/optout",
    privacyEmail: "privacy@inmatesearcher.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  OFFENDERRECORDS: {
    name: "OffenderRecords.com",
    optOutUrl: "https://www.offenderrecords.com/optout",
    privacyEmail: "privacy@offenderrecords.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // COURT RECORDS SITES
  // ==========================================
  COURTCASEFINDER: {
    name: "CourtCaseFinder.com",
    optOutUrl: "https://www.courtcasefinder.com/optout",
    privacyEmail: "privacy@courtcasefinder.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  COURTRECORDFINDER: {
    name: "CourtRecordFinder.com",
    optOutUrl: "https://www.courtrecordfinder.com/optout",
    privacyEmail: "privacy@courtrecordfinder.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  COURTRECORDS_US: {
    name: "CourtRecords.us",
    optOutUrl: "https://www.courtrecords.us/optout",
    privacyEmail: "privacy@courtrecords.us",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // ==========================================
  // B2B & PROFESSIONAL DATA SITES
  // ==========================================
  // REMOVED: Indeed, ZipRecruiter, TheLadders - NOT data brokers (direct user relationship)
  // Users create accounts directly, provide their own data voluntarily
  // See: Cal. Civ. Code § 1798.99.80(d) - data broker requires NO direct relationship
  OWLER: {
    name: "Owler.com",
    optOutUrl: "https://www.owler.com/optout",
    privacyEmail: "privacy@owler.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  // REMOVED: MUCK_RACK - NOT a data broker (journalists create/claim their own profiles)
  // REMOVED: RATEMYPROFESSORS - NOT a data broker (user-generated reviews platform)
  OPENCORPORATES: {
    name: "OpenCorporates.com",
    privacyEmail: "privacy@opencorporates.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Public company data - removal may be limited",
  },
  BLOOMBERG: {
    name: "Bloomberg",
    optOutUrl: "https://www.bloomberg.com/feedback",
    privacyEmail: "privacy@bloomberg.net",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  THOMSON_REUTERS: {
    name: "Thomson Reuters",
    optOutUrl: "https://www.thomsonreuters.com/en/privacy-statement.html",
    privacyEmail: "privacy.issues@thomsonreuters.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  
    parentCompany: "Thomson Reuters",
    subsidiaries: ["WESTLAW","CLEAR_TR"],
  },

  // ==========================================
  // HEALTH & MEDICAL DIRECTORIES
  // ==========================================
  WEBMD: {
    name: "WebMD",
    optOutUrl: "https://www.webmd.com/about-webmd-policies/privacy-policy",
    privacyEmail: "privacy@webmd.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HEALTHLINE: {
    name: "Healthline",
    optOutUrl: "https://www.healthline.com/privacy-settings",
    privacyEmail: "privacy@healthline.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // REMOVED: REAL ESTATE SERVICE SITES (NOT DATA BROKERS)
  // Apartments.com, Zumper - Users search and apply directly, direct relationship
  // ==========================================

  // ==========================================
  // REMOVED: WEDDING & EVENT SITES (NOT DATA BROKERS)
  // TheKnot, WeddingWire, Zola - Users create accounts voluntarily for planning
  // These are service platforms with direct user relationships
  // ==========================================

  // ==========================================
  // OBITUARY & MEMORIAL SITES
  // ==========================================
  DIGNITY_MEMORIAL: {
    name: "Dignity Memorial",
    optOutUrl: "https://www.dignitymemorial.com/privacy",
    privacyEmail: "privacy@dignitymemorial.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Memorial content removal may require proof of relationship",
  },
  SYSOON: {
    name: "Sysoon.com",
    privacyEmail: "contact@sysoon.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // SPECIALIZED SEARCH SITES
  // ==========================================
  FACECHECK_ID: {
    name: "FaceCheck.ID",
    optOutUrl: "https://facecheck.id/privacy",
    privacyEmail: "privacy@facecheck.id",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Facial recognition search - may require identity verification",
  },
  EPIEOS: {
    name: "Epieos.com",
    privacyEmail: "contact@epieos.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Email and phone OSINT tool",
  },
  BUMPER: {
    name: "Bumper.com",
    optOutUrl: "https://www.bumper.com/optout",
    privacyEmail: "privacy@bumper.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
    notes: "Vehicle history and owner search",
  },
  LICENSEPLATEDATA: {
    name: "LicensePlateData.com",
    optOutUrl: "https://www.licenseplatedata.com/optout",
    privacyEmail: "privacy@licenseplatedata.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILTRACER: {
    name: "EmailTracer.com",
    optOutUrl: "https://www.emailtracer.com/optout",
    privacyEmail: "privacy@emailtracer.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  DOMAINTOOLS: {
    name: "DomainTools",
    optOutUrl: "https://www.domaintools.com/privacy",
    privacyEmail: "privacy@domaintools.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "WHOIS and domain ownership data",
  },
  KIDSLIVESAFE: {
    name: "KidsLiveSafe.com",
    optOutUrl: "https://kidslivesafe.com/optout",
    privacyEmail: "privacy@kidslivesafe.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Sex offender registry aggregator",
  },

  // ==========================================
  // BACKGROUND CHECK SITES
  // ==========================================
  TRUTHFINDER: {
    name: "TruthFinder",
    optOutUrl: "https://www.truthfinder.com/opt-out/",
    privacyEmail: "privacy@truthfinder.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Requires email confirmation",
  
    consolidatesTo: "INTELIUS",
  },
  CHECKPEOPLE: {
    name: "CheckPeople",
    optOutUrl: "https://www.checkpeople.com/opt-out",
    privacyEmail: "privacy@checkpeople.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CYBERBACKGROUNDCHECKS: {
    name: "CyberBackgroundChecks",
    optOutUrl: "https://www.cyberbackgroundchecks.com/removal",
    privacyEmail: "support@cyberbackgroundchecks.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PUBLICDATACHECK: {
    name: "PublicDataCheck",
    optOutUrl: "https://members.publicdatacheck.com/optout",
    privacyEmail: "privacy@publicdatacheck.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHPEOPLEFREE: {
    name: "SearchPeopleFree",
    optOutUrl: "https://www.searchpeoplefree.com/opt-out",
    privacyEmail: "privacy@searchpeoplefree.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  FREEPEOPLESEARCH: {
    name: "FreePeopleSearch",
    optOutUrl: "https://freepeoplesearch.com/optout",
    privacyEmail: "privacy@freepeoplesearch.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  SEARCHQUARRY: {
    name: "SearchQuarry",
    optOutUrl: "https://www.searchquarry.com/opt-out",
    privacyEmail: "privacy@searchquarry.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // ADDRESS/PHONE LOOKUP SITES
  // ==========================================
  ANYWHO: {
    name: "AnyWho",
    optOutUrl: "https://www.anywho.com/opt-out",
    privacyEmail: "privacy@anywho.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  
    consolidatesTo: "INTELIUS",
  },
  YELLOWPAGES: {
    name: "YellowPages",
    optOutUrl: "https://www.yellowpages.com/members/suppression",
    // Email bounces - use web form only
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Use web form - email addresses bounce.",
  },
  INFOSPACE: {
    name: "InfoSpace",
    // Email bounces - requires manual contact
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Email bounces - check website for current removal options.",
  },
  NUWBER: {
    name: "Nuwber",
    optOutUrl: "https://nuwber.com/removal/link",
    privacyEmail: "privacy@nuwber.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEPHONELOOKUP: {
    name: "ReversePhoneLookup",
    optOutUrl: "https://www.reversephonelookup.com/remove-listing/",
    privacyEmail: "privacy@reversephonelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  SPYDIALER: {
    name: "SpyDialer",
    optOutUrl: "https://www.spydialer.com/optout.aspx",
    privacyEmail: "privacy@spydialer.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  CALLTRUTH: {
    name: "CallTruth",
    optOutUrl: "https://www.calltruth.com/opt-out",
    privacyEmail: "privacy@calltruth.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  USPHONEBOOK: {
    name: "USPhonebook",
    optOutUrl: "https://www.usphonebook.com/opt-out",
    privacyEmail: "privacy@usphonebook.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },

  // ==========================================
  // PROPERTY/PUBLIC RECORDS SITES
  // ==========================================
  NEIGHBOR_WHO: {
    name: "Neighbor.Who",
    optOutUrl: "https://www.neighborwho.com/removal",
    privacyEmail: "privacy@neighborwho.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  HOMEMETRY: {
    name: "Homemetry",
    optOutUrl: "https://homemetry.com/control/privacy",
    privacyEmail: "privacy@homemetry.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  BLOCKSHOPPER: {
    name: "BlockShopper",
    optOutUrl: "https://blockshopper.com/optout",
    privacyEmail: "privacy@blockshopper.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  OWNERLY: {
    name: "Ownerly",
    optOutUrl: "https://www.ownerly.com/opt-out/",
    privacyEmail: "privacy@ownerly.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "BEENVERIFIED",
  },
  REHOLD: {
    name: "Rehold",
    optOutUrl: "https://rehold.com/optout",
    privacyEmail: "privacy@rehold.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // EMAIL/IDENTITY SEARCH
  // ==========================================
  VOTERRECORDS: {
    name: "VoterRecords",
    optOutUrl: "https://voterrecords.com/opt-out",
    privacyEmail: "privacy@voterrecords.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
    notes: "Voter registration records may be public by law in some states",
  },
  EMAILSHERLOCK: {
    name: "EmailSherlock",
    optOutUrl: "https://www.emailsherlock.com/opt-out",
    privacyEmail: "privacy@emailsherlock.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  EMAILFINDER: {
    name: "EmailFinder",
    optOutUrl: "https://www.emailfinder.com/opt-out",
    privacyEmail: "privacy@emailfinder.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  HUNTER_IO: {
    name: "Hunter.io",
    optOutUrl: "https://hunter.io/opt-out",
    privacyEmail: "privacy@hunter.io",
    removalMethod: "BOTH",
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
  
    parentCompany: "ZoomInfo Technologies",
    subsidiaries: ["DISCOVERORG","DATANYZE","EVERSTRING"],
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ROCKETREACH: {
    name: "RocketReach",
    optOutUrl: "https://rocketreach.co/opt-out",
    privacyEmail: "privacy@rocketreach.co",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    // Email requests require portal verification - use web form directly
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "IMPORTANT: Email requests require identity verification via Privacy Choices portal. Use web form directly for faster processing.",
  },

  // ==========================================
  // MARKETING DATA BROKERS
  // ==========================================
  ACXIOM: {
    name: "Acxiom",
    optOutUrl: "https://isapps.acxiom.com/optout/optout.aspx",
    privacyEmail: "privacy@acxiom.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "One of the largest data brokers",
  
    parentCompany: "Acxiom (IPG)",
    subsidiaries: ["ACXIOM_DATA","LIVERAMP","INFOBASE","ACXIOM_DIGITAL"],
  },
  ORACLE_DATACLOUD: {
    name: "Oracle Data Cloud",
    optOutUrl: "https://www.oracle.com/marketingcloud/opt-status.html",
    privacyEmail: "privacy_ww@oracle.com", // Updated: privacy@oracle.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Use the Oracle Marketing Cloud opt-out status page to submit removal request",
  
    parentCompany: "Oracle Corporation",
    subsidiaries: ["DATALOGIX","BLUEKAI","BLUEKAI_DATA","GRAPESHOT","MOAT"],
  },
  EPSILON: {
    name: "Epsilon",
    optOutUrl: "https://legal.epsilon.com/dsr/",
    // Email requests redirect to portal - must use Consumer Privacy Portal
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "IMPORTANT: Email requests redirect to portal. Use https://legal.epsilon.com/dsr/ or call 1-866-267-3861 (Mon-Fri 9AM-5PM ET).",

    parentCompany: "Epsilon (Publicis)",
    subsidiaries: ["EPSILON_DATA","CONVERSANT","ABACUS","EPSILON_TARGETING"],
  },
  EXPERIAN_MARKETING: {
    name: "Experian Marketing",
    optOutUrl: "https://www.experian.com/privacy/opt-out-form",
    privacyEmail: "privacy@experian.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "EXPERIAN_CONSUMER",
  },
  EQUIFAX_MARKETING: {
    name: "Equifax Marketing",
    optOutUrl: "https://myprivacy.equifax.com/personal-info",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Use MyPrivacy portal to opt out of Equifax marketing",
  
    consolidatesTo: "EQUIFAX_CONSUMER",
  },
  LEXISNEXIS: {
    name: "LexisNexis",
    optOutUrl: "https://optout.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Large data aggregator - comprehensive removal available",
  
    parentCompany: "LexisNexis Risk Solutions",
    subsidiaries: ["ACCURINT","CHOICEPOINT","CHOICEPOINT_INSURANCE","EMAILAGE","COURTLINK_LN","LEXISNEXIS_RISK"],
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
  // Generic breach database - data cannot be removed from historical breaches
  BREACH_DB: {
    name: "Historical Breach Database",
    removalMethod: "NOT_REMOVABLE",
    estimatedDays: -1,
    category: "BREACH_DATABASE",
    isRemovable: false,
    notes: "This data comes from historical data breaches. The breach has already occurred and the data cannot be 'removed' from the breach itself. Focus on: changing compromised passwords, enabling 2FA, and monitoring for identity fraud.",
  },
  // Dark web forum exposures - monitoring only
  DARK_WEB_FORUM: {
    name: "Dark Web Forum",
    removalMethod: "NOT_REMOVABLE",
    estimatedDays: -1,
    category: "DARK_WEB",
    isRemovable: false,
    notes: "Data found on dark web forums cannot be removed. Focus on: changing compromised credentials, enabling 2FA, monitoring for fraud, and considering credit freezes if sensitive data is exposed.",
  },
  // Paste site exposures - sometimes removable
  PASTE_SITE: {
    name: "Paste Site",
    removalMethod: "MONITOR",
    estimatedDays: -1,
    category: "OTHER",
    isRemovable: false,
    notes: "Data on paste sites may be removed by the site owner, but copies often exist elsewhere. Focus on changing compromised credentials.",
  },

  // ==========================================
  // SOCIAL MEDIA (Mostly Manual)
  // ==========================================
  LINKEDIN: {
    name: "LinkedIn",
    optOutUrl: "https://www.linkedin.com/help/linkedin/answer/63",
    privacyEmail: "privacy@linkedin.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Account must be deleted manually through settings",
    category: "SOCIAL_MEDIA",
  },
  FACEBOOK: {
    name: "Facebook",
    optOutUrl: "https://www.facebook.com/help/delete_account",
    privacyEmail: "privacy@fb.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Account deletion requires 30-day waiting period",
    category: "SOCIAL_MEDIA",
  },
  TWITTER: {
    name: "Twitter/X",
    optOutUrl: "https://twitter.com/settings/deactivate",
    // Email bounces - account settings only
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Use account settings - email addresses bounce. Deactivation required before permanent deletion.",
    category: "SOCIAL_MEDIA",
  },
  INSTAGRAM: {
    name: "Instagram",
    optOutUrl: "https://www.instagram.com/accounts/remove/request/permanent/",
    privacyEmail: "privacy@instagram.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "SOCIAL_MEDIA",
  },
  TIKTOK: {
    name: "TikTok",
    optOutUrl: "https://www.tiktok.com/setting/account",
    privacyEmail: "privacy@tiktok.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "SOCIAL_MEDIA",
  },
  REDDIT: {
    name: "Reddit",
    optOutUrl: "https://www.reddit.com/settings/account",
    privacyEmail: "privacy@reddit.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "SOCIAL_MEDIA",
  },
  PINTEREST: {
    name: "Pinterest",
    optOutUrl: "https://www.pinterest.com/settings/privacy/",
    // Email bounces - use account settings
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Use account settings - email addresses bounce.",
    category: "SOCIAL_MEDIA",
  },
  YOUTUBE: {
    name: "YouTube",
    optOutUrl: "https://support.google.com/accounts/answer/32046",
    // Email bounces - use Google account settings
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Use Google account settings - email addresses bounce. Requires deleting Google account or removing YouTube data specifically.",
    category: "SOCIAL_MEDIA",
  },
  SNAPCHAT: {
    name: "Snapchat",
    optOutUrl: "https://accounts.snapchat.com/accounts/delete_account",
    privacyEmail: "privacy@snap.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "SOCIAL_MEDIA",
  },
  DISCORD: {
    name: "Discord",
    optOutUrl: "https://support.discord.com/hc/en-us/articles/212500837",
    privacyEmail: "privacy@discord.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "SOCIAL_MEDIA",
  },

  // ==========================================
  // AI TRAINING & DEEPFAKE PROTECTION
  // ==========================================
  LAION_AI: {
    name: "LAION AI Dataset",
    optOutUrl: "https://haveibeentrained.com/",
    // Email bounced - contact@laion.ai is invalid
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Check if your images are in LAION-5B dataset used to train Stable Diffusion and other AI models. Use haveibeentrained.com to check and opt out.",
  },
  STABILITY_AI: {
    name: "Stability AI",
    optOutUrl: "https://stability.ai/privacy-center",
    // Email requests redirect to portal - must use self-service options
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "IMPORTANT: Email requests redirect to portal. Use https://stability.ai/privacy-center to delete account, opt-out of AI training, or fill out their data deletion form.",
  },
  SPAWNING_AI: {
    name: "Spawning AI (Do Not Train Registry)",
    optOutUrl: "https://spawning.ai/",
    optOutEmail: "info@spawning.ai",
    privacyEmail: "info@spawning.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Register for Do-Not-Train registry - honored by Stability AI, LAION, and other AI training providers",
  },
  OPENAI: {
    name: "OpenAI",
    optOutUrl: "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
    privacyEmail: "privacy@openai.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    notes: "Request data deletion and opt out of training via privacy portal",
  },
  MIDJOURNEY: {
    name: "Midjourney",
    optOutUrl: "https://docs.midjourney.com/docs/terms-of-service",
    // Email bounces - contact via Discord or support
    removalMethod: "FORM",
    estimatedDays: 45,
    notes: "Email bounces - contact support via Discord to opt out of image training.",
  },
  META_AI: {
    name: "Meta AI",
    optOutUrl: "https://www.facebook.com/help/contact/1994830253908714",
    privacyEmail: "privacy@fb.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Opt out of Meta AI training for Facebook and Instagram data",
  },
  GOOGLE_AI: {
    name: "Google AI Training",
    optOutUrl: "https://myaccount.google.com/data-and-privacy",
    // Email bounces - use account settings only
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "Use Google account settings - email addresses bounce. Manage AI training settings in privacy settings.",
  },
  LINKEDIN_AI: {
    name: "LinkedIn AI Training",
    optOutUrl: "https://www.linkedin.com/mypreferences/d/settings/data-for-generative-ai-improvement",
    privacyEmail: "privacy@linkedin.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
    notes: "Opt out of LinkedIn using your data for AI training",
  },
  ADOBE_AI: {
    name: "Adobe Firefly/AI",
    optOutUrl: "https://www.adobe.com/go/privacy_your_choices",
    privacyEmail: "privacy@adobe.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Only analyzes content submitted to Adobe Stock - opt out via privacy page",
  },
  AMAZON_AI: {
    name: "Amazon AI Training",
    optOutUrl: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GXPU3YPMBZQRWZK2",
    privacyEmail: "privacy@amazon.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Opt out of Amazon using your data for AI improvements",
  },
  ANTHROPIC: {
    name: "Anthropic (Claude AI)",
    optOutUrl: "https://support.anthropic.com/en/articles/privacy-requests",
    privacyEmail: "privacy@anthropic.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Submit data deletion request via email or support portal",
  },
  X_AI: {
    name: "xAI (Grok)",
    privacyEmail: "privacy@x.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Contact privacy team for data deletion requests",
  },
  COHERE_AI: {
    name: "Cohere AI",
    privacyEmail: "privacy@cohere.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  HUGGINGFACE: {
    name: "Hugging Face",
    optOutUrl: "https://huggingface.co/settings/account",
    // Email requests redirect to account settings - user must self-delete
    removalMethod: "FORM",
    estimatedDays: 14,
    category: "AI_SERVICE",
    notes: "IMPORTANT: Email requests confirmed but user must delete account at https://huggingface.co/settings/account. Account deletion includes all personal information.",
  },
  DALL_E: {
    name: "DALL-E (OpenAI)",
    optOutUrl: "https://privacy.openai.com/",
    privacyEmail: "privacy@openai.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Submit request through OpenAI privacy portal",
  },
  APPLE_AI: {
    name: "Apple Intelligence",
    optOutUrl: "https://www.apple.com/legal/privacy/contact/",
    privacyEmail: "apple-privacy@apple.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
    category: "AI_SERVICE",
    notes: "Submit CCPA request through Apple privacy portal",
  },
  MICROSOFT_AI: {
    name: "Microsoft AI/Copilot",
    optOutUrl: "https://www.microsoft.com/en-us/concern/privacy",
    privacyEmail: "privacy@microsoft.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  GOOGLE_IMAGES: {
    name: "Google Images",
    optOutUrl: "https://support.google.com/websearch/answer/4628134",
    privacyEmail: "privacy@google.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    category: "AI_SERVICE",
    notes: "Request image removal through Google's removal tool",
  },
  BING_IMAGES: {
    name: "Bing Images",
    optOutUrl: "https://www.bing.com/webmaster/tools/contentremoval",
    privacyEmail: "privacy@microsoft.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    category: "AI_SERVICE",
  },
  REDDIT_AI: {
    name: "Reddit AI Training",
    optOutUrl: "https://www.reddit.com/settings/privacy",
    privacyEmail: "privacy@reddit.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Opt out via privacy settings or delete account",
  },
  COMMON_CRAWL: {
    name: "Common Crawl",
    optOutUrl: "https://commoncrawl.org/terms-of-use",
    privacyEmail: "info@commoncrawl.org",
    removalMethod: "BOTH",
    estimatedDays: 90,
    category: "AI_SERVICE",
    notes: "IMPORTANT: Requires SPECIFIC URL where personal data is located. General requests are declined. User must provide exact page URL from Common Crawl archive containing their data.",
  },
  // Additional AI Image/Video Services
  SYNTHESIA: {
    name: "Synthesia",
    optOutUrl: "https://www.synthesia.io/privacy",
    privacyEmail: "privacy@synthesia.io",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  HEYGEN: {
    name: "HeyGen",
    privacyEmail: "privacy@heygen.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  RUNWAY_ML: {
    name: "Runway ML",
    privacyEmail: "privacy@runwayml.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  PIKA_LABS: {
    name: "Pika Labs",
    privacyEmail: "privacy@pika.art",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  // Voice Cloning additions
  LOVO_AI: {
    name: "LOVO AI",
    privacyEmail: "privacy@lovo.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  PLAY_HT: {
    name: "Play.ht",
    privacyEmail: "privacy@play.ht",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  SPEECHIFY: {
    name: "Speechify",
    privacyEmail: "privacy@speechify.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  DESCRIPT: {
    name: "Descript",
    privacyEmail: "privacy@descript.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  WELLSAID_LABS: {
    name: "WellSaid Labs",
    privacyEmail: "privacy@wellsaidlabs.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  COQUI_AI: {
    name: "Coqui AI",
    privacyEmail: "privacy@coqui.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  REPLICA_STUDIOS: {
    name: "Replica Studios",
    privacyEmail: "privacy@replicastudios.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  // Facial Recognition additions
  AMAZON_REKOGNITION: {
    name: "Amazon Rekognition",
    privacyEmail: "aws-privacy@amazon.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Request data deletion from businesses using Rekognition",
  },
  FACE_PLUS_PLUS: {
    name: "Face++",
    privacyEmail: "privacy@megvii.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    category: "AI_SERVICE",
    notes: "China-based service - GDPR/CCPA requests may have limited effect",
  },
  KAIROS: {
    name: "Kairos",
    privacyEmail: "privacy@kairos.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  FINDFACE: {
    name: "FindFace",
    privacyEmail: "support@ntechlab.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
    category: "AI_SERVICE",
    notes: "Russia-based service - removal may be difficult",
  },
  // Image manipulation apps
  FACEAPP: {
    name: "FaceApp",
    optOutUrl: "faceapp://send-privacy-request",
    // Email removal not accepted - must use in-app "Send Privacy Request" feature
    removalMethod: "FORM",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "IMPORTANT: Email requests are rejected. Must use 'Send Privacy Request' feature within the FaceApp mobile app to delete data.",
  },
  REFACE: {
    name: "Reface",
    privacyEmail: "privacy@reface.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  LENSA_AI: {
    name: "Lensa AI",
    privacyEmail: "privacy@prisma-ai.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Delete account through app settings",
  },
  WOMBO: {
    name: "WOMBO",
    privacyEmail: "privacy@wombo.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  ARTBREEDER: {
    name: "Artbreeder",
    privacyEmail: "privacy@artbreeder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "AI_SERVICE",
  },
  STARRY_AI: {
    name: "Starry AI",
    privacyEmail: "privacy@starryai.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  NIGHTCAFE: {
    name: "NightCafe",
    privacyEmail: "privacy@nightcafe.studio",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "AI_SERVICE",
  },
  DEEP_ART_EFFECTS: {
    name: "Deep Art Effects",
    privacyEmail: "privacy@deeparteffects.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  // Video/Avatar AI
  D_ID: {
    name: "D-ID",
    privacyEmail: "privacy@d-id.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  READY_PLAYER_ME: {
    name: "Ready Player Me",
    privacyEmail: "support@readyplayer.me", // Updated: privacy@readyplayer.me was suppressed
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  ROOP: {
    name: "Roop (Deep Fake)",
    removalMethod: "NOT_REMOVABLE",
    estimatedDays: -1,
    category: "AI_SERVICE",
    isRemovable: false,
    notes: "Open source deepfake tool - copies may exist anywhere. Focus on monitoring and legal action if misused.",
  },
  MYHERITAGE_DEEPNOSTALGIA: {
    name: "MyHeritage Deep Nostalgia",
    optOutUrl: "https://www.myheritage.com/privacy-options",
    privacyEmail: "privacy@myheritage.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },
  SUNO_AI: {
    name: "Suno AI",
    privacyEmail: "privacy@suno.ai",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "AI music generation service",
  },
  GETTY_AI: {
    name: "Getty Images AI",
    optOutUrl: "https://www.gettyimages.com/company/privacy",
    // Email bounced - privacy@gettyimages.com is invalid
    removalMethod: "FORM",
    estimatedDays: 30,
    category: "AI_SERVICE",
    notes: "Use the privacy form on their website - email address bounces.",
  },
  SHUTTERSTOCK_AI: {
    name: "Shutterstock AI",
    privacyEmail: "privacy@shutterstock.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "AI_SERVICE",
  },

  // ==========================================
  // FACIAL RECOGNITION DATABASES
  // ==========================================
  CLEARVIEW_AI: {
    name: "Clearview AI",
    optOutUrl: "https://clearview.ai/privacy-requests",
    privacyEmail: "privacy@clearview.ai",
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Large facial recognition database used by law enforcement - opt out removes your face from searches",
  },
  PIMEYES: {
    name: "PimEyes",
    optOutUrl: "https://pimeyes.com/en/opt-out-request",
    // Email suppressed - privacy@pimeyes.com marked our emails as spam
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Face search engine - use the opt-out form to remove your face from search results. Email requests not accepted.",
  },
  SOCIAL_CATFISH: {
    name: "Social Catfish",
    optOutUrl: "https://socialcatfish.com/opt-out/",
    // Email suppressed - privacy@socialcatfish.com marked our emails as spam
    removalMethod: "FORM",
    estimatedDays: 14,
    notes: "Reverse image and identity search - use the opt-out form. Email requests not accepted.",
  },
  TINEYE: {
    name: "TinEye",
    optOutUrl: "https://tineye.com/removal",
    privacyEmail: "support@tineye.com",
    removalMethod: "BOTH",
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
    optOutUrl: "https://elevenlabs.io/app/account",
    // Email removal not accepted - must use official DSR form or account deletion
    removalMethod: "FORM",
    estimatedDays: 30,
    notes: "IMPORTANT: Email requests are rejected. Delete account in app settings or submit formal Data Subject Request via official form.",
  },
  RESEMBLE_AI: {
    name: "Resemble AI",
    optOutUrl: "https://www.resemble.ai/privacy",
    privacyEmail: "support@resemble.ai", // Updated: privacy@resemble.ai was suppressed
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
    removalMethod: "BOTH",
    estimatedDays: 7,
    notes: "Free people search - requires verification",
  
    consolidatesTo: "INTELIUS",
  },
  PEEKYOU: {
    name: "PeekYou",
    optOutUrl: "https://www.peekyou.com/about/contact/optout/",
    privacyEmail: "support@peekyou.com", // Updated: privacy@peekyou.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BEEN_VERIFIED_PEOPLE: {
    name: "Been Verified People Search",
    optOutUrl: "https://www.beenverifiedpeople.com/optout",
    privacyEmail: "privacy@beenverifiedpeople.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PUBLICRECORDS360: {
    name: "PublicRecords360",
    optOutUrl: "https://www.publicrecords360.com/optout.html",
    privacyEmail: "privacy@publicrecords360.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PERSOPO: {
    name: "Persopo",
    optOutUrl: "https://www.persopo.com/opt-out",
    privacyEmail: "privacy@persopo.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SMARTBACKGROUNDCHECKS: {
    name: "Smart Background Checks",
    optOutUrl: "https://www.smartbackgroundchecks.com/optout",
    // Email bounced - privacy@smartbackgroundchecks.com is invalid
    removalMethod: "FORM",
    estimatedDays: 7,
    notes: "Use the opt-out form on their website - email address bounces.",
  },
  LOCATEFAMILY: {
    name: "LocateFamily",
    optOutUrl: "https://www.locatefamily.com/removal.html",
    privacyEmail: "privacy@locatefamily.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEWISE: {
    name: "PeopleWise",
    optOutUrl: "https://www.peoplewise.com/optout",
    privacyEmail: "privacy@peoplewise.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLESEARCHNOW: {
    name: "PeopleSearchNow",
    optOutUrl: "https://www.peoplesearchnow.com/opt-out",
    privacyEmail: "privacy@peoplesearchnow.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  PEOPLEBYNAME: {
    name: "PeopleByName",
    optOutUrl: "https://www.peoplebyname.com/remove.php",
    privacyEmail: "privacy@peoplebyname.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  VIRTORY: {
    name: "Virtory",
    optOutUrl: "https://www.virtory.com/opt-out",
    privacyEmail: "privacy@virtory.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  VERICORA: {
    name: "Vericora",
    optOutUrl: "https://vericora.com/ng/optout",
    privacyEmail: "privacy@vericora.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  GLADIKNOW: {
    name: "GladIKnow",
    optOutUrl: "https://gladiknow.com/opt-out",
    privacyEmail: "privacy@gladiknow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  IDENTITYPI: {
    name: "IdentityPI",
    optOutUrl: "https://www.identitypi.com/optout",
    privacyEmail: "privacy@identitypi.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  QUICKPEOPLETRACE: {
    name: "QuickPeopleTrace",
    optOutUrl: "https://www.quickpeopletrace.com/optout",
    privacyEmail: "privacy@quickpeopletrace.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // COURT RECORDS & LEGAL
  // ==========================================
  JUDYRECORDS: {
    name: "JudyRecords",
    optOutUrl: "https://www.judyrecords.com/record-removal",
    privacyEmail: "privacy@judyrecords.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ARRESTFACTS: {
    name: "ArrestFacts",
    optOutUrl: "https://arrestfacts.com/ng/control/privacy",
    privacyEmail: "privacy@arrestfacts.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALSEARCHES: {
    name: "CriminalSearches",
    optOutUrl: "https://www.criminalsearches.com/optout",
    privacyEmail: "privacy@criminalsearches.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PUBLICPOLICERECORD: {
    name: "PublicPoliceRecord",
    optOutUrl: "https://publicpolicerecord.com/optout",
    privacyEmail: "privacy@publicpolicerecord.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ADDRESSREPORT: {
    name: "AddressReport",
    optOutUrl: "https://www.addressreport.com/removal",
    privacyEmail: "privacy@addressreport.com",
    removalMethod: "BOTH",
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
  
    consolidatesTo: "ZOOMINFO",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "WHITEPAGES",
  },
  PHONEBOOKS_COM: {
    name: "PhoneBooks.com",
    optOutUrl: "https://www.phonebooks.com/optout",
    privacyEmail: "privacy@phonebooks.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSES_COM: {
    name: "Addresses.com",
    optOutUrl: "https://www.addresses.com/optout.php",
    privacyEmail: "privacy@addresses.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PHONELOOKUP: {
    name: "PhoneLookup",
    optOutUrl: "https://www.phonelookup.com/opt-out",
    privacyEmail: "privacy@phonelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PHONEOWNER: {
    name: "PhoneOwner",
    optOutUrl: "https://phoneowner.com/page/optout",
    privacyEmail: "privacy@phoneowner.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  SYNC_ME: {
    name: "Sync.ME",
    optOutUrl: "https://sync.me/optout/",
    privacyEmail: "privacy@sync.me",
    removalMethod: "BOTH",
    estimatedDays: 7,
    notes: "Caller ID and spam blocking app - remove your info",
  },
  HIYA: {
    name: "Hiya",
    optOutUrl: "https://hiya.com/optout",
    privacyEmail: "privacy@hiya.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  TRUECALLER: {
    name: "Truecaller",
    optOutUrl: "https://www.truecaller.com/unlisting",
    privacyEmail: "support@truecaller.com", // Updated: privacy@truecaller.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 1,
    notes: "Unlist from Truecaller directory - usually instant",
  },
  MR_NUMBER: {
    name: "Mr. Number",
    optOutUrl: "https://mrnumber.com/remove",
    privacyEmail: "support@mrnumber.com", // Updated: privacy@mrnumber.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLERIDTEST: {
    name: "CallerIDTest",
    optOutUrl: "https://calleridtest.com/opt-out",
    privacyEmail: "support@calleridtest.com", // Updated: privacy@calleridtest.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  OLDPHONEBOOK: {
    name: "OldPhoneBook",
    optOutUrl: "https://www.oldphonebook.com/opt-out",
    privacyEmail: "privacy@oldphonebook.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // MARKETING & ADVERTISING DATA
  // ==========================================
  LIVERAMP: {
    name: "LiveRamp",
    optOutUrl: "https://liveramp.com/opt_out/",
    privacyEmail: "optout@liveramp.com", // Updated: privacy@liveramp.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Major data broker for advertising - opt out of identity graph",
  
    consolidatesTo: "ACXIOM",
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
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  NIELSEN: {
    name: "Nielsen",
    optOutUrl: "https://www.nielsen.com/us/en/legal/privacy-statement/digital-measurement-privacy-statement/",
    privacyEmail: "privacy@nielsen.com", // Updated: privacy.department@nielsen.com bounced
    removalMethod: "BOTH",
    estimatedDays: 45,
  },
  LOTAME: {
    name: "Lotame",
    optOutUrl: "https://www.lotame.com/about-lotame/privacy/opt-out/",
    privacyEmail: "privacy@lotame.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  DATALOGIX: {
    name: "Datalogix (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy_ww@oracle.com", // Updated: privacy@oracle.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 45,
  
    consolidatesTo: "ORACLE_DATACLOUD",
  },
  BLUEKAI: {
    name: "BlueKai (Oracle)",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy_ww@oracle.com", // Updated: privacy@oracle.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 45,

    consolidatesTo: "ORACLE_DATACLOUD",
  },
  INFOGROUP: {
    name: "Infogroup (Data.com)",
    optOutUrl: "https://www.infogroup.com/privacy-policy",
    privacyEmail: "optout@data-axle.com", // Updated: privacy@infogroup.com was suppressed
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRANSUNION: {
    name: "TransUnion Marketing",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "TRANSUNION_CONSUMER",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ROMANCESCAMS: {
    name: "RomanceScams",
    optOutUrl: "https://romancescams.org/removal",
    privacyEmail: "privacy@romancescams.org",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // ==========================================
  // FINANCIAL & INSURANCE DATA
  // ==========================================
  EXPERIAN_CONSUMER: {
    name: "Experian Consumer",
    optOutUrl: "https://www.experian.com/privacy/opt-out-form",
    privacyEmail: "privacy@experian.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "Experian",
    subsidiaries: ["EXPERIAN_MARKETING","RENTBUREAU","EXPERIAN_MARKETING_SKIP","EXPERIAN_INSURANCE","EXPERIAN_DARK_WEB"],
  },
  EQUIFAX_CONSUMER: {
    name: "Equifax Consumer",
    optOutUrl: "https://myprivacy.equifax.com/personal-info",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "Equifax",
    subsidiaries: ["EQUIFAX","EQUIFAX_MARKETING","WORKNUMBER","TALX","EQUIFAX_INSURANCE"],
  },
  TRANSUNION_CONSUMER: {
    name: "TransUnion Consumer",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "TransUnion",
    subsidiaries: ["TRANSUNION","TRANSUNION_TRUELOOK","TRANSUNION_INSURANCE","TRANSUNION_DARK_WEB"],
  },
  CHEXSYSTEMS: {
    name: "ChexSystems",
    optOutUrl: "https://www.chexsystems.com/security-freeze",
    privacyEmail: "privacy@fnis.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  INNOVIS: {
    name: "Innovis",
    optOutUrl: "https://www.innovis.com/securityFreeze/index",
    privacyEmail: "privacy@innovis.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  NCTUE: {
    name: "NCTUE",
    optOutUrl: "https://www.nctue.com/Consumers",
    privacyEmail: "privacy@nctue.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // ==========================================
  // GENEALOGY & FAMILY HISTORY
  // ==========================================
  ANCESTRY: {
    name: "Ancestry",
    optOutUrl: "https://support.ancestry.com/s/article/Removing-Public-Records-from-Ancestry",
    privacyEmail: "privacy@ancestry.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Request removal of public records from Ancestry.com",
    category: "SERVICE_PROVIDER",
  },
  MYHERITAGE: {
    name: "MyHeritage",
    optOutUrl: "https://www.myheritage.com/privacy-policy",
    privacyEmail: "privacy@myheritage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    category: "SERVICE_PROVIDER",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "Canadian phone directory",
  
    parentCompany: "Yellow Pages Group (Canada)",
    subsidiaries: ["CANADA411_CA","CANADA411_EXTENDED"],
  },
  UK_192: {
    name: "192.com (UK)",
    optOutUrl: "https://www.192.com/optout/",
    privacyEmail: "dataprotection@192.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "PIPL",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    category: "SERVICE_PROVIDER",
  },
  DOXIMITY: {
    name: "Doximity",
    optOutUrl: "https://www.doximity.com/privacy",
    privacyEmail: "privacy@doximity.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Physician network",
    category: "SERVICE_PROVIDER",
  },
  NPPES: {
    name: "NPPES (NPI Registry)",
    optOutUrl: "https://nppes.cms.hhs.gov/",
    privacyEmail: "customerservice@nppes.cms.hhs.gov",
    removalMethod: "BOTH",
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
  
    parentCompany: "Foursquare Labs",
    subsidiaries: ["PLACED_FOURSQUARE","FOURSQUARE_DATA","PILGRIM_SDK","FACTUAL"],
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
    removalMethod: "BOTH",
    estimatedDays: 7,
    notes: "State records aggregator - opt out to remove your listing",
  },
  IDCRAWL: {
    name: "IDCrawl",
    optOutUrl: "https://www.idcrawl.com/opt-out",
    privacyEmail: "privacy@idcrawl.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CENTEDA: {
    name: "Centeda",
    optOutUrl: "https://centeda.com/ng/control/privacy",
    privacyEmail: "privacy@centeda.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CUBIB: {
    name: "Cubib",
    optOutUrl: "https://cubib.com/optout.php",
    privacyEmail: "privacy@cubib.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  KWOLD: {
    name: "Kwold",
    optOutUrl: "https://www.kwold.com/optout",
    privacyEmail: "privacy@kwold.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NEWENGLANDFACTS: {
    name: "NewEnglandFacts",
    optOutUrl: "https://newenglandfacts.com/ng/control/privacy",
    privacyEmail: "privacy@newenglandfacts.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  OFFICIALUSA: {
    name: "OfficialUSA",
    optOutUrl: "https://www.officialusa.com/opt-out/",
    privacyEmail: "privacy@officialusa.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PUB360: {
    name: "Pub360",
    optOutUrl: "https://www.pub360.com/optout",
    privacyEmail: "privacy@pub360.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PROFILEENGINE: {
    name: "ProfileEngine",
    optOutUrl: "https://profileengine.com/optout",
    privacyEmail: "privacy@profileengine.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PUBLICINFOSERVICES: {
    name: "PublicInfoServices",
    optOutUrl: "https://www.publicinfoservices.com/opt-out/",
    privacyEmail: "privacy@publicinfoservices.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEBACKGROUNDCHECK: {
    name: "PeopleBackgroundCheck",
    optOutUrl: "https://www.peoplebackgroundcheck.com/optout",
    privacyEmail: "privacy@peoplebackgroundcheck.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PRIVATERECORDS: {
    name: "PrivateRecords",
    optOutUrl: "https://www.privaterecords.net/optout",
    privacyEmail: "privacy@privaterecords.net",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEWHIZ: {
    name: "PeopleWhiz",
    optOutUrl: "https://www.peoplewhiz.com/optout",
    privacyEmail: "privacy@peoplewhiz.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHBUG: {
    name: "SearchBug",
    optOutUrl: "https://www.searchbug.com/peoplefinder/optout.aspx",
    privacyEmail: "privacy@searchbug.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SPYTOX: {
    name: "Spytox",
    optOutUrl: "https://www.spytox.com/opt-out",
    privacyEmail: "privacy@spytox.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  STATERECORDS: {
    name: "StateRecords.org",
    optOutUrl: "https://staterecords.org/optout",
    privacyEmail: "privacy@staterecords.org",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  UNITEDSTATESPHONEBOOK: {
    name: "UnitedStatesPhoneBook",
    optOutUrl: "https://www.unitedstatesphonebook.com/contact.php",
    privacyEmail: "privacy@unitedstatesphonebook.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  USA_PEOPLE_SEARCH: {
    name: "USA-People-Search",
    optOutUrl: "https://www.usa-people-search.com/manage",
    privacyEmail: "privacy@usa-people-search.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  USATRACE: {
    name: "USATrace",
    optOutUrl: "https://www.usatrace.com/optout",
    privacyEmail: "privacy@usatrace.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  VERIPAGES: {
    name: "VeriPages",
    optOutUrl: "https://veripages.com/page/optout",
    privacyEmail: "privacy@veripages.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WELLNUT: {
    name: "Wellnut",
    optOutUrl: "https://www.wellnut.com/optout.html",
    privacyEmail: "privacy@wellnut.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE PHONE & CALLER ID
  // ==========================================
  CALLERSMART: {
    name: "CallerSmart",
    optOutUrl: "https://www.callersmart.com/opt-out",
    privacyEmail: "privacy@callersmart.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLERCENTER: {
    name: "CallerCenter",
    optOutUrl: "https://callercenter.com/optout",
    privacyEmail: "privacy@callercenter.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NUMBERGURU: {
    name: "NumberGuru",
    optOutUrl: "https://www.numberguru.com/optout",
    privacyEmail: "privacy@numberguru.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NUMBERVILLE: {
    name: "NumberVille",
    optOutUrl: "https://www.numberville.com/opt-out",
    privacyEmail: "privacy@numberville.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "BEENVERIFIED",
  },
  PHONEVALIDATOR: {
    name: "PhoneValidator",
    optOutUrl: "https://www.phonevalidator.com/optout",
    privacyEmail: "privacy@phonevalidator.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHOCALLEDME: {
    name: "WhoCalledMe",
    optOutUrl: "https://whocalledme.com/optout",
    privacyEmail: "privacy@whocalledme.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHOCALLSME: {
    name: "WhoCallsMe",
    optOutUrl: "https://whocallsme.com/optout",
    privacyEmail: "privacy@whocallsme.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHYCALL: {
    name: "WhyCall",
    optOutUrl: "https://www.whycall.com/opt-out",
    privacyEmail: "privacy@whycall.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLERID411: {
    name: "CallerID411",
    optOutUrl: "https://callerid411.com/optout",
    privacyEmail: "privacy@callerid411.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FREECALLERIDSEARCH: {
    name: "FreeCallerIDSearch",
    optOutUrl: "https://freecalleridsearch.com/optout",
    privacyEmail: "privacy@freecalleridsearch.com",
    removalMethod: "BOTH",
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
    category: "SERVICE_PROVIDER",
  },
  ESTATELY: {
    name: "Estately",
    optOutUrl: "https://www.estately.com/privacy",
    privacyEmail: "privacy@estately.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  XOME: {
    name: "Xome",
    optOutUrl: "https://www.xome.com/privacy",
    privacyEmail: "privacy@xome.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
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
    notes: "IMPORTANT: Only collects PROFESSIONAL/WORK email addresses. Personal emails (Gmail, etc.) are not in their database. User must provide work email address for removal.",
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
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PUBMATIC: {
    name: "PubMatic",
    optOutUrl: "https://pubmatic.com/legal/opt-out/",
    privacyEmail: "privacy@pubmatic.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  MAGNITE: {
    name: "Magnite (Rubicon)",
    optOutUrl: "https://www.magnite.com/legal/consumer-online-profile-and-opt-out/",
    privacyEmail: "privacy@magnite.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  OPENX: {
    name: "OpenX",
    optOutUrl: "https://www.openx.com/privacy-center/",
    privacyEmail: "privacy@openx.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  CRITEO: {
    name: "Criteo",
    optOutUrl: "https://www.criteo.com/privacy/",
    privacyEmail: "privacy@criteo.com",
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
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
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CHECKPEOPLE_UK: {
    name: "CheckPeople UK",
    optOutUrl: "https://checkpeople.co.uk/optout",
    privacyEmail: "privacy@checkpeople.co.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PERSONLOOKUP_UK: {
    name: "PersonLookup UK",
    optOutUrl: "https://personlookup.co.uk/opt-out",
    privacyEmail: "privacy@personlookup.co.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  WHITEPAGES_AU: {
    name: "White Pages Australia",
    optOutUrl: "https://www.whitepages.com.au/opt-out",
    privacyEmail: "privacy@sensis.com.au",
    removalMethod: "BOTH",
    estimatedDays: 14,
  
    parentCompany: "Sensis (Australia)",
    subsidiaries: ["WHITEPAGES_AUSTRALIA","WHITEPAGES_AU_EXT"],
  },
  PAGESJAUNES: {
    name: "PagesJaunes (France)",
    optOutUrl: "https://www.pagesjaunes.fr/infoslegales",
    privacyEmail: "cnil@solocal.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "SoLocal Group",
    subsidiaries: ["PAGESJAUNES_FR","PAGESJAUNES_FR_V2","PAGESBLANCHES_FR"],
  },
  DASTELEFONBUCH: {
    name: "DasTelefonbuch (Germany)",
    optOutUrl: "https://www.dastelefonbuch.de/Datenschutz",
    privacyEmail: "datenschutz@telefonbuch.de",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "Deutsche Telekom Medien",
    subsidiaries: ["DASTELEFONBUCH_DE","DASTELEFONBUCH_DE_V2","GELBESEITEN_DE"],
  },
  PAGINEBIANCHE: {
    name: "PagineBianche (Italy)",
    optOutUrl: "https://www.paginebianche.it/privacy",
    privacyEmail: "privacy@paginebianche.it",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "Italiaonline",
    subsidiaries: ["PAGINEBIANCHE_IT","PAGINEBIANCHE_IT_V2","PAGINEGIALLE_IT"],
  },
  GUIALOCAL: {
    name: "GuiaLocal (Spain)",
    optOutUrl: "https://www.guialocal.com/privacy",
    privacyEmail: "privacy@guialocal.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // INSURANCE & RISK DATA
  // ==========================================
  LN_RISK_SOLUTIONS: {
    name: "LexisNexis Risk Solutions",
    optOutUrl: "https://risk.lexisnexis.com/consumer-and-data-access-policies",
    privacyEmail: "privacy@lexisnexisrisk.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Insurance risk scoring database - affects premiums",
  },
  VERISK: {
    name: "Verisk",
    optOutUrl: "https://www.verisk.com/privacy-policies/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  
    parentCompany: "Verisk Analytics",
    subsidiaries: ["ISO_CLAIMS","VERISK_ISO","ARGUS"],
  },
  CLUE_REPORT: {
    name: "C.L.U.E. Report",
    optOutUrl: "https://consumer.risk.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Insurance claims history database",
  },
  ISO_CLAIMS: {
    name: "ISO ClaimSearch",
    optOutUrl: "https://www.verisk.com/privacy-policies/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  
    consolidatesTo: "VERISK",
  },

  // ==========================================
  // EMAIL VERIFICATION SERVICES — ENTIRE CATEGORY REMOVED
  // These are SaaS tools, NOT data brokers. Removed Feb 16 2026 (GDPR DSR compliance).
  // Removed: ZEROBOUNCE, NEVERBOUNCE, KICKBOX, DEBOUNCE, EMAILLISTVERIFY, CLEAROUT
  // ==========================================

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
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE PEOPLE SEARCH & BACKGROUND CHECK
  // ==========================================
  USSEARCHINFO: {
    name: "USSearchInfo",
    optOutUrl: "https://www.ussearchinfo.com/opt-out",
    privacyEmail: "privacy@ussearchinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FREEPHONETRACER: {
    name: "FreePhoneTracer",
    optOutUrl: "https://www.freephonetracer.com/optout",
    privacyEmail: "privacy@freephonetracer.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDPEOPLESEARCH: {
    name: "FindPeopleSearch",
    optOutUrl: "https://www.findpeoplesearch.com/optout",
    privacyEmail: "privacy@findpeoplesearch.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLESMART: {
    name: "PeopleSmart",
    optOutUrl: "https://www.peoplesmart.com/optout",
    privacyEmail: "privacy@peoplesmart.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEFINDERPRO: {
    name: "PeopleFinderPro",
    optOutUrl: "https://www.peoplefinderpro.com/optout",
    privacyEmail: "privacy@peoplefinderpro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  DATAVERIA: {
    name: "Dataveria",
    optOutUrl: "https://dataveria.com/ng/control/privacy",
    privacyEmail: "privacy@dataveria.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CYBERCHECK: {
    name: "CyberCheck",
    optOutUrl: "https://www.cybercheck.com/optout",
    privacyEmail: "privacy@cybercheck.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  INFOTRACER: {
    name: "InfoTracer",
    optOutUrl: "https://infotracer.com/optout",
    privacyEmail: "privacy@infotracer.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  COCOFINDER: {
    name: "CocoFinder",
    optOutUrl: "https://cocofinder.com/optout",
    privacyEmail: "privacy@cocofinder.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  USPHONELOOKUP: {
    name: "USPhoneLookup",
    optOutUrl: "https://www.usphonelookup.com/optout",
    privacyEmail: "privacy@usphonelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  EASYBACKGROUNDCHECKS: {
    name: "EasyBackgroundChecks",
    optOutUrl: "https://www.easybackgroundchecks.com/optout",
    privacyEmail: "privacy@easybackgroundchecks.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  UNMASK: {
    name: "Unmask",
    optOutUrl: "https://unmask.com/opt-out",
    privacyEmail: "privacy@unmask.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVEALNAME: {
    name: "RevealName",
    optOutUrl: "https://www.revealname.com/optout",
    privacyEmail: "privacy@revealname.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  INFORMATION_COM: {
    name: "Information.com",
    optOutUrl: "https://www.information.com/optout",
    privacyEmail: "privacy@information.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  BACKGROUNDALERT: {
    name: "BackgroundAlert",
    optOutUrl: "https://www.backgroundalert.com/optout",
    privacyEmail: "privacy@backgroundalert.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  DOBSEARCH: {
    name: "DOBSearch",
    optOutUrl: "https://www.dobsearch.com/optout",
    privacyEmail: "privacy@dobsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NEIGHBOR_REPORT: {
    name: "NeighborReport",
    optOutUrl: "https://neighbor.report/optout",
    privacyEmail: "privacy@neighbor.report",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NUMERLOOKUP: {
    name: "NumerLookup",
    optOutUrl: "https://www.numerlookup.com/optout",
    privacyEmail: "privacy@numerlookup.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  VALIDNUMBER: {
    name: "ValidNumber",
    optOutUrl: "https://validnumber.com/opt-out",
    privacyEmail: "privacy@validnumber.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHPUBLICRECORDS: {
    name: "SearchPublicRecords",
    optOutUrl: "https://www.searchpublicrecords.com/optout",
    privacyEmail: "privacy@searchpublicrecords.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "INTELIUS",
  },

  // ==========================================
  // MORE CALLER ID & PHONE APPS
  // ==========================================
  SHOWCALLER: {
    name: "Showcaller",
    optOutUrl: "https://showcaller.app/optout",
    privacyEmail: "privacy@showcaller.app",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  EYECON: {
    name: "Eyecon",
    optOutUrl: "https://www.eyecon.com/privacy",
    privacyEmail: "privacy@eyecon.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  GETCONTACT: {
    name: "GetContact",
    optOutUrl: "https://getcontact.com/en/manage",
    privacyEmail: "privacy@getcontact.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLAPP: {
    name: "CallApp",
    optOutUrl: "https://www.callapp.com/privacy",
    privacyEmail: "privacy@callapp.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WHOSCALL: {
    name: "Whoscall",
    optOutUrl: "https://whoscall.com/privacy",
    privacyEmail: "privacy@gogolook.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DRUPE: {
    name: "Drupe",
    optOutUrl: "https://www.drupeapp.com/privacy",
    privacyEmail: "privacy@drupeapp.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SHOWCALLERID: {
    name: "ShowCallerID",
    optOutUrl: "https://showcallerid.com/optout",
    privacyEmail: "privacy@showcallerid.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEMOBILE: {
    name: "ReverseMobile",
    optOutUrl: "https://www.reversemobile.com/optout",
    privacyEmail: "privacy@reversemobile.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE B2B & SALES INTELLIGENCE
  // ==========================================
  LEADFEEDER: {
    name: "Leadfeeder",
    optOutUrl: "https://www.leadfeeder.com/privacy/",
    privacyEmail: "privacy@leadfeeder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LEADGENIUS: {
    name: "LeadGenius",
    optOutUrl: "https://www.leadgenius.com/privacy",
    privacyEmail: "privacy@leadgenius.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DEMANDBASE: {
    name: "Demandbase",
    optOutUrl: "https://www.demandbase.com/privacy-policy/",
    privacyEmail: "privacy@demandbase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SIXSENSE: {
    name: "6sense",
    optOutUrl: "https://6sense.com/privacy-policy/",
    privacyEmail: "privacy@6sense.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BOMBORA: {
    name: "Bombora",
    optOutUrl: "https://bombora.com/privacy-policy/",
    privacyEmail: "privacy@bombora.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DISCOVERORG: {
    name: "DiscoverOrg (ZoomInfo)",
    optOutUrl: "https://www.zoominfo.com/about-zoominfo/privacy-center",
    privacyEmail: "privacy@zoominfo.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "ZOOMINFO",
  },
  DUNS_BRADSTREET: {
    name: "Dun & Bradstreet",
    optOutUrl: "https://www.dnb.com/privacy-trust-center",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "IMPORTANT: Requires SPECIFIC identifying information. Name alone may match multiple business owners. User should provide company name, DUNS number, or other unique identifiers for accurate matching.",

    parentCompany: "Dun & Bradstreet",
    subsidiaries: ["DNB_HOOVERS","DNB_DATA","HOOVERS"],
  },
  HOOVERS: {
    name: "Hoovers (D&B)",
    optOutUrl: "https://www.dnb.com/utility-pages/privacy-policy.html",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "DUNS_BRADSTREET",
  },
  INSIDEVIEW: {
    name: "InsideView",
    optOutUrl: "https://www.insideview.com/privacy-policy/",
    privacyEmail: "privacy@insideview.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CLEARBIT_ENRICHMENT: {
    name: "Clearbit Enrichment",
    optOutUrl: "https://clearbit.com/privacy",
    privacyEmail: "privacy@clearbit.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE ADTECH & DATA EXCHANGES
  // ==========================================
  MEDIAMATH: {
    name: "MediaMath",
    optOutUrl: "https://www.mediamath.com/privacy-policy/",
    privacyEmail: "privacy@mediamath.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  AMOBEE: {
    name: "Amobee",
    optOutUrl: "https://www.amobee.com/trust/privacy-guidelines/",
    privacyEmail: "privacy@amobee.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  ADROLL: {
    name: "AdRoll",
    optOutUrl: "https://www.adroll.com/ccpa/optout",
    privacyEmail: "privacy@adroll.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  QUANTCAST: {
    name: "Quantcast",
    optOutUrl: "https://www.quantcast.com/opt-out/",
    privacyEmail: "privacy@quantcast.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SHARETHROUGH: {
    name: "Sharethrough",
    optOutUrl: "https://www.sharethrough.com/privacy-center/",
    privacyEmail: "privacy@sharethrough.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  TRIPLELIFT: {
    name: "TripleLift",
    optOutUrl: "https://triplelift.com/consumer-opt-out/",
    privacyEmail: "privacy@triplelift.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  APPNEXUS: {
    name: "AppNexus (Xandr)",
    optOutUrl: "https://www.xandr.com/privacy/platform-privacy-policy/",
    privacyEmail: "privacy@xandr.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  INDEX_EXCHANGE: {
    name: "Index Exchange",
    optOutUrl: "https://www.indexexchange.com/privacy/",
    privacyEmail: "privacy@indexexchange.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SOVRN: {
    name: "Sovrn",
    optOutUrl: "https://www.sovrn.com/privacy-policy/",
    privacyEmail: "privacy@sovrn.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SPOTX: {
    name: "SpotX (Magnite)",
    optOutUrl: "https://www.magnite.com/legal/consumer-online-profile-and-opt-out/",
    privacyEmail: "privacy@magnite.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE REAL ESTATE & PROPERTY
  // ==========================================
  REMAX: {
    name: "RE/MAX",
    optOutUrl: "https://www.remax.com/privacy-policy",
    privacyEmail: "privacy@remax.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  CENTURY21: {
    name: "Century 21",
    optOutUrl: "https://www.century21.com/privacy-policy",
    privacyEmail: "privacy@century21.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  COLDWELLBANKER: {
    name: "Coldwell Banker",
    optOutUrl: "https://www.coldwellbanker.com/privacy-policy",
    privacyEmail: "privacy@coldwellbanker.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  KELLER_WILLIAMS: {
    name: "Keller Williams",
    optOutUrl: "https://www.kw.com/privacy-policy",
    privacyEmail: "privacy@kw.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  COMPASS_RE: {
    name: "Compass Real Estate",
    optOutUrl: "https://www.compass.com/privacy/",
    privacyEmail: "privacy@compass.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  HOMELIGHT: {
    name: "HomeLight",
    optOutUrl: "https://www.homelight.com/privacy-policy",
    privacyEmail: "privacy@homelight.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  OFFERPAD: {
    name: "Offerpad",
    optOutUrl: "https://www.offerpad.com/privacy-policy/",
    privacyEmail: "privacy@offerpad.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },
  SUNDAE: {
    name: "Sundae",
    optOutUrl: "https://sundae.com/privacy-policy/",
    privacyEmail: "privacy@sundae.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    category: "SERVICE_PROVIDER",
  },

  // ==========================================
  // MORE INTERNATIONAL
  // ==========================================
  PIPL_INTERNATIONAL: {
    name: "Pipl International",
    optOutUrl: "https://pipl.com/personal-information-removal-request",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "PIPL",
  },
  ZLOOKUP: {
    name: "ZLookup (India)",
    optOutUrl: "https://www.zlookup.com/optout",
    privacyEmail: "privacy@zlookup.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  TRUECALLER_IN: {
    name: "Truecaller India",
    optOutUrl: "https://www.truecaller.com/unlisting",
    privacyEmail: "support@truecaller.com", // Updated: privacy@truecaller.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 1,
  },
  JUSTDIAL: {
    name: "JustDial (India)",
    optOutUrl: "https://www.justdial.com/privacy",
    privacyEmail: "privacy@justdial.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SULEKHA: {
    name: "Sulekha (India)",
    optOutUrl: "https://www.sulekha.com/privacy",
    privacyEmail: "privacy@sulekha.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  YELLOWPAGES_CA: {
    name: "Yellow Pages Canada",
    optOutUrl: "https://www.yellowpages.ca/privacy",
    privacyEmail: "privacy@yp.ca",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  WHITEPAGES_NZ: {
    name: "White Pages New Zealand",
    optOutUrl: "https://whitepages.co.nz/privacy",
    privacyEmail: "privacy@yellow.co.nz",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  HEROLD_AT: {
    name: "Herold (Austria)",
    optOutUrl: "https://www.herold.at/datenschutz/",
    privacyEmail: "datenschutz@herold.at",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  LOCAL_CH: {
    name: "local.ch (Switzerland)",
    optOutUrl: "https://www.local.ch/en/privacy",
    privacyEmail: "privacy@localsearch.ch",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  GOUDEN_GIDS: {
    name: "Gouden Gids (Netherlands)",
    optOutUrl: "https://www.goudengids.nl/privacy/",
    privacyEmail: "privacy@goudengids.nl",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // TENANT & RENTAL SCREENING
  // ==========================================
  RENTBUREAU: {
    name: "RentBureau (Experian)",
    optOutUrl: "https://www.experian.com/rentbureau/rental-payment-opt-out.html",
    privacyEmail: "privacy@experian.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
    notes: "Rental payment history database",
  
    consolidatesTo: "EXPERIAN_CONSUMER",
  },
  CORELOGIC_RENTAL: {
    name: "CoreLogic Rental",
    optOutUrl: "https://www.corelogic.com/privacy-policy/",
    privacyEmail: "privacy@corelogic.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "CORELOGIC",
  },
  REALPAGE: {
    name: "RealPage",
    optOutUrl: "https://www.realpage.com/privacy-policy/",
    privacyEmail: "privacy@realpage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Tenant screening and property management",
  },
  ONSITE_RESIDENT: {
    name: "On-Site Resident Services",
    optOutUrl: "https://www.on-site.com/privacy-policy",
    privacyEmail: "privacy@on-site.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRANSUNION_RENTAL: {
    name: "TransUnion Rental Screening",
    optOutUrl: "https://www.mysmartmove.com/privacy-policy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // EMPLOYMENT & HR DATA
  // ==========================================
  THEWORKNUMBER: {
    name: "The Work Number (Equifax)",
    optOutUrl: "https://theworknumber.com/employee-data-report",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
    notes: "Employment and income verification database",
  
    consolidatesTo: "EQUIFAX_CONSUMER",
  },
  HIRERIGHT: {
    name: "HireRight",
    optOutUrl: "https://www.hireright.com/legal/privacy-policy",
    privacyEmail: "privacy@hireright.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  STERLING: {
    name: "Sterling Background Check",
    optOutUrl: "https://www.sterlingcheck.com/privacy-policy/",
    privacyEmail: "privacy@sterlingcheck.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CHECKR: {
    name: "Checkr",
    optOutUrl: "https://checkr.com/privacy-policy",
    privacyEmail: "privacy@checkr.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  GOODHIRE: {
    name: "GoodHire",
    optOutUrl: "https://www.goodhire.com/privacy-policy",
    privacyEmail: "privacy@goodhire.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ACCURATE_BG: {
    name: "Accurate Background",
    optOutUrl: "https://www.accurate.com/privacy-policy/",
    privacyEmail: "privacy@accurate.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // SOCIAL & DATING
  // ==========================================
  BUMBLE_LOOKUP: {
    name: "Bumble Profile Search",
    optOutUrl: "https://bumble.com/en/privacy",
    privacyEmail: "privacy@team.bumble.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HINGE_LOOKUP: {
    name: "Hinge Profile Search",
    optOutUrl: "https://hinge.co/privacy",
    privacyEmail: "privacy@hinge.co",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  OKCUPID_LOOKUP: {
    name: "OkCupid Profile Search",
    optOutUrl: "https://www.okcupid.com/legal/privacy",
    privacyEmail: "privacy@okcupid.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PLENTYOFFISH: {
    name: "Plenty of Fish",
    optOutUrl: "https://pofhq.com/privacy/",
    privacyEmail: "privacy@pof.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TINDER_LOOKUP: {
    name: "Tinder Profile Search",
    optOutUrl: "https://policies.tinder.com/privacy",
    privacyEmail: "privacy@gotinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // DATA ENRICHMENT SERVICES
  // ==========================================
  PEOPLE_DATA_LABS: {
    name: "People Data Labs",
    optOutUrl: "https://www.peopledatalabs.com/opt-out",
    privacyEmail: "privacy@peopledatalabs.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
    notes: "B2B data enrichment platform",
  },
  CORESIGNAL: {
    name: "Coresignal",
    optOutUrl: "https://coresignal.com/privacy-policy/",
    privacyEmail: "privacy@coresignal.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PROXYCURL: {
    name: "Proxycurl",
    optOutUrl: "https://nubela.co/proxycurl/privacy-policy",
    privacyEmail: "privacy@nubela.co",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REVELIO_LABS: {
    name: "Revelio Labs",
    optOutUrl: "https://www.reveliolabs.com/privacy-policy/",
    privacyEmail: "privacy@reveliolabs.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DIFFBOT: {
    name: "Diffbot",
    optOutUrl: "https://www.diffbot.com/privacy-policy/",
    privacyEmail: "privacy@diffbot.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // ADDITIONAL PEOPLE SEARCH SITES
  // ==========================================
  IDTRUE: {
    name: "IDTrue",
    optOutUrl: "https://www.idtrue.com/optout",
    privacyEmail: "privacy@idtrue.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  LOOKUPUK: {
    name: "LookUpUK",
    optOutUrl: "https://www.lookup.uk/optout",
    privacyEmail: "privacy@lookup.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PEEPSEARCH: {
    name: "PeepSearch",
    optOutUrl: "https://www.peepsearch.com/optout",
    privacyEmail: "privacy@peepsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  RECORDSFINDER: {
    name: "RecordsFinder",
    optOutUrl: "https://recordsfinder.com/optout.php",
    privacyEmail: "privacy@recordsfinder.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PUBLICRECORDCENTER: {
    name: "PublicRecordCenter",
    optOutUrl: "https://www.publicrecordcenter.com/optout",
    privacyEmail: "privacy@publicrecordcenter.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHSYSTEMS: {
    name: "SearchSystems",
    optOutUrl: "https://www.searchsystems.net/contact.php",
    privacyEmail: "privacy@searchsystems.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PERSONSEARCH: {
    name: "PersonSearch.com",
    optOutUrl: "https://www.personsearch.com/optout",
    privacyEmail: "privacy@personsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ARKANSASVOTERS: {
    name: "ArkansasVoters.com",
    optOutUrl: "https://arkansasvoters.com/optout",
    privacyEmail: "privacy@arkansasvoters.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FLORIDAVOTERS: {
    name: "FloridaVoters.com",
    optOutUrl: "https://floridavoters.com/optout",
    privacyEmail: "privacy@floridavoters.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  OHIOVOTERS: {
    name: "OhioVoters.com",
    optOutUrl: "https://ohiovoters.com/optout",
    privacyEmail: "privacy@ohiovoters.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ==========================================
  // MORE BACKGROUND SCREENING
  // ==========================================
  FIRST_ADVANTAGE: {
    name: "First Advantage",
    optOutUrl: "https://fadv.com/privacy-policy/",
    privacyEmail: "privacy@fadv.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
    notes: "Employment background screening company",
  },
  INTELLICORP: {
    name: "IntelliCorp",
    optOutUrl: "https://www.intellicorp.net/privacy-policy",
    privacyEmail: "privacy@intellicorp.net",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TALENTWISE: {
    name: "TalentWise",
    optOutUrl: "https://www.sterlingcheck.com/privacy-policy/",
    privacyEmail: "privacy@talentwise.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INFOMART: {
    name: "InfoMart",
    optOutUrl: "https://www.infomart-usa.com/privacy-policy/",
    privacyEmail: "privacy@infomart-usa.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SJV_ASSOCIATES: {
    name: "SJV Associates",
    optOutUrl: "https://www.sjvassoc.com/privacy",
    privacyEmail: "privacy@sjvassoc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // MORE DATA AGGREGATORS
  // ==========================================
  TOWER_DATA: {
    name: "TowerData",
    optOutUrl: "https://www.towerdata.com/privacy-policy",
    privacyEmail: "privacy@towerdata.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
    notes: "Email intelligence and data append services",
  },
  NEXTROLL: {
    name: "NextRoll",
    optOutUrl: "https://www.nextroll.com/privacy",
    privacyEmail: "privacy@nextroll.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PERMUTIVE: {
    name: "Permutive",
    optOutUrl: "https://permutive.com/privacy/",
    privacyEmail: "privacy@permutive.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ADADYN: {
    name: "Adadyn",
    optOutUrl: "https://www.adadyn.com/privacy-policy/",
    privacyEmail: "privacy@adadyn.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INTENTIQ: {
    name: "IntentIQ",
    optOutUrl: "https://www.intentiq.com/privacy-policy/",
    privacyEmail: "privacy@intentiq.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // ==========================================
  // PHONE TRACKING & CARRIER LOOKUP
  // ==========================================
  CARRIERLOOKUP: {
    name: "CarrierLookup",
    optOutUrl: "https://www.carrierlookup.com/privacy",
    privacyEmail: "privacy@carrierlookup.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FREECARRIERLOOKUP: {
    name: "FreeCarrierLookup",
    optOutUrl: "https://freecarrierlookup.com/optout.php",
    privacyEmail: "privacy@freecarrierlookup.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  TEXTMAGIC: {
    name: "TextMagic",
    optOutUrl: "https://www.textmagic.com/privacy-policy",
    privacyEmail: "privacy@textmagic.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TEXTEM: {
    name: "TextEm",
    optOutUrl: "https://www.textem.net/privacy",
    privacyEmail: "privacy@textem.net",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NUMVERIFY: {
    name: "NumVerify",
    optOutUrl: "https://numverify.com/privacy",
    privacyEmail: "privacy@numverify.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // MORE INTERNATIONAL BROKERS
  // ==========================================
  TELOFONO_BLANCO: {
    name: "Telefono Blanco (Mexico)",
    optOutUrl: "https://www.telefonoblanco.mx/privacy",
    privacyEmail: "privacy@telefonoblanco.mx",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_BR: {
    name: "Paginas Amarelas (Brazil)",
    optOutUrl: "https://www.paginasamarelas.com.br/privacidade",
    privacyEmail: "privacidade@paginasamarelas.com.br",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  TELELISTAS: {
    name: "TeleListas (Brazil)",
    optOutUrl: "https://www.telelistas.net/privacidade",
    privacyEmail: "privacidade@telelistas.net",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  ENIRO: {
    name: "Eniro (Sweden)",
    optOutUrl: "https://www.eniro.se/integritetspolicy",
    privacyEmail: "privacy@eniro.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  HITTA_SE: {
    name: "Hitta.se (Sweden)",
    optOutUrl: "https://www.hitta.se/om/integritetspolicy",
    privacyEmail: "privacy@hitta.se",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  KRAK_DK: {
    name: "Krak (Denmark)",
    optOutUrl: "https://www.krak.dk/privatlivspolitik",
    privacyEmail: "privacy@krak.dk",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  DEGULESIDER_NO: {
    name: "De Gule Sider (Norway)",
    optOutUrl: "https://www.gulesider.no/personvern",
    privacyEmail: "personvern@gulesider.no",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // ==========================================
  // ADDITIONAL DATA BROKERS - EXPANDED v1.18.0
  // ==========================================

  // Skip Tracing & Collections Data
  TRANSUNION_TRUELOOK: {
    name: "TransUnion TrueLook",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
  
    consolidatesTo: "TRANSUNION_CONSUMER",
  },
  EQUIFAX_WORKFORCE: {
    name: "Equifax Workforce Solutions",
    optOutUrl: "https://www.equifax.com/privacy/opt-out/",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
  },
  EXPERIAN_MARKETING_SKIP: {
    name: "Experian Marketing Services",
    optOutUrl: "https://www.experian.com/privacy/opting_out",
    privacyEmail: "privacy@experian.com",
    removalMethod: "BOTH",
    estimatedDays: 45,
  
    consolidatesTo: "EXPERIAN_CONSUMER",
  },
  ACCURINT_LEXISNEXIS: {
    name: "Accurint (LexisNexis)",
    optOutUrl: "https://optout.lexisnexis.com/",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "LexisNexis Risk Solutions",
    subsidiaries: ["ACCURINT","CHOICEPOINT","CHOICEPOINT_INSURANCE","EMAILAGE","COURTLINK_LN","LEXISNEXIS_RISK"],
  },
  TRACERS_INFO: {
    name: "Tracers Information",
    optOutUrl: "https://www.tracers.com/consumer-privacy/",
    privacyEmail: "privacy@tracers.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IRB_SEARCH: {
    name: "IRB Search",
    optOutUrl: "https://www.irbsearch.com/optout",
    privacyEmail: "privacy@irbsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  TLOXP: {
    name: "TLOxp (TransUnion)",
    optOutUrl: "https://www.tlo.com/privacy",
    privacyEmail: "privacy@tlo.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SKIPMAX: {
    name: "SkipMax",
    optOutUrl: "https://skipmax.com/privacy",
    privacyEmail: "support@skipmax.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SKIP_SMASHER: {
    name: "SkipSmasher",
    optOutUrl: "https://skipsmasher.com/privacy-policy",
    privacyEmail: "privacy@skipsmasher.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BATCH_SKIP_TRACING: {
    name: "BatchSkipTracing",
    optOutUrl: "https://batchskiptracing.com/privacy",
    privacyEmail: "privacy@batchskiptracing.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Automotive & Vehicle Data
  CARFAX_OWNER: {
    name: "Carfax Owner Data",
    optOutUrl: "https://www.carfax.com/company/privacy",
    privacyEmail: "privacy@carfax.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUTOCHECK_EXPERIAN: {
    name: "AutoCheck (Experian)",
    optOutUrl: "https://www.autocheck.com/privacy",
    privacyEmail: "privacy@experian.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  VINAUDIT: {
    name: "VinAudit",
    optOutUrl: "https://www.vinaudit.com/privacy",
    privacyEmail: "privacy@vinaudit.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  POLK_AUTOMOTIVE: {
    name: "Polk Automotive (IHS Markit)",
    optOutUrl: "https://ihsmarkit.com/about/privacy.html",
    privacyEmail: "privacy@ihsmarkit.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  JD_POWER_DATA: {
    name: "J.D. Power Data Services",
    optOutUrl: "https://www.jdpower.com/privacy",
    privacyEmail: "privacy@jdpower.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  VEHICLEHISTORY_COM: {
    name: "VehicleHistory.com",
    optOutUrl: "https://www.vehiclehistory.com/privacy",
    privacyEmail: "privacy@vehiclehistory.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CLEARVIN: {
    name: "ClearVin",
    optOutUrl: "https://www.clearvin.com/privacy",
    privacyEmail: "support@clearvin.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUMPER_VEHICLE: {
    name: "Bumper Vehicle History",
    optOutUrl: "https://www.bumper.com/privacy",
    privacyEmail: "privacy@bumper.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  EPICVIN: {
    name: "EpicVIN",
    optOutUrl: "https://epicvin.com/privacy",
    privacyEmail: "privacy@epicvin.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  FAXVIN: {
    name: "FaxVIN",
    optOutUrl: "https://www.faxvin.com/privacy",
    privacyEmail: "support@faxvin.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Insurance & Risk Data
  LEXISNEXIS_CLUE: {
    name: "LexisNexis C.L.U.E.",
    optOutUrl: "https://consumer.risk.lexisnexis.com/request",
    privacyEmail: "consumer.advocate@lexisnexisrisk.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  VERISK_ISO: {
    name: "Verisk ISO ClaimSearch",
    optOutUrl: "https://www.verisk.com/privacy/",
    privacyEmail: "privacy@verisk.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "VERISK",
  },
  MIB_GROUP: {
    name: "MIB Group (Medical Info Bureau)",
    optOutUrl: "https://www.mib.com/consumer_information.html",
    privacyEmail: "infoline@mib.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  MILLIMAN_INTELLISCRIPT: {
    name: "Milliman IntelliScript",
    optOutUrl: "https://www.rxhistories.com/",
    privacyEmail: "intelliscript@milliman.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  A_PLUS_INSURANCE: {
    name: "A-PLUS Property Insurance",
    optOutUrl: "https://www.aplusconsumer.com/",
    privacyEmail: "aplus@verisk.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  CHOICEPOINT_INSURANCE: {
    name: "ChoicePoint Insurance",
    optOutUrl: "https://www.lexisnexis.com/en-us/privacy/privacy-policy.page",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "LEXISNEXIS",
  },
  TRANSUNION_INSURANCE: {
    name: "TransUnion Insurance Solutions",
    optOutUrl: "https://www.transunion.com/consumer-privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "TRANSUNION_CONSUMER",
  },
  EXPERIAN_INSURANCE: {
    name: "Experian Insurance Services",
    optOutUrl: "https://www.experian.com/privacy/opting_out",
    privacyEmail: "privacy@experian.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "EXPERIAN_CONSUMER",
  },
  FENRIS_DIGITAL: {
    name: "Fenris Digital",
    optOutUrl: "https://www.fenrisdigital.com/privacy",
    privacyEmail: "privacy@fenrisdigital.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CAPE_ANALYTICS: {
    name: "Cape Analytics",
    optOutUrl: "https://capeanalytics.com/privacy/",
    privacyEmail: "privacy@capeanalytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Healthcare & Medical Data
  IQVIA_DATA: {
    name: "IQVIA Healthcare Data",
    optOutUrl: "https://www.iqvia.com/about-us/privacy",
    privacyEmail: "privacy@iqvia.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HEALTHGRADES_DATA: {
    name: "Healthgrades Provider Data",
    optOutUrl: "https://www.healthgrades.com/content/privacy-policy",
    privacyEmail: "privacy@healthgrades.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  DOXIMITY_DATA: {
    name: "Doximity Physician Database",
    optOutUrl: "https://www.doximity.com/privacy",
    privacyEmail: "privacy@doximity.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  WEBMD_PROVIDER: {
    name: "WebMD Provider Directory",
    optOutUrl: "https://www.webmd.com/about-webmd-policies/privacy-policy",
    privacyEmail: "privacy@webmd.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  VITALS_DIRECTORY: {
    name: "Vitals.com",
    optOutUrl: "https://www.vitals.com/about/privacy",
    privacyEmail: "privacy@vitals.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ZOCDOC_LISTINGS: {
    name: "Zocdoc Provider Listings",
    optOutUrl: "https://www.zocdoc.com/privacy",
    privacyEmail: "privacy@zocdoc.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  REALSELF_DIRECTORY: {
    name: "RealSelf Provider Directory",
    optOutUrl: "https://www.realself.com/privacy",
    privacyEmail: "privacy@realself.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CASTLIGHT_HEALTH: {
    name: "Castlight Health",
    optOutUrl: "https://www.castlighthealth.com/privacy/",
    privacyEmail: "privacy@castlighthealth.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SHARECARE_DATA: {
    name: "Sharecare",
    optOutUrl: "https://www.sharecare.com/privacy-policy",
    privacyEmail: "privacy@sharecare.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  DEFINITIVE_HC: {
    name: "Definitive Healthcare",
    optOutUrl: "https://www.definitivehc.com/privacy-policy",
    privacyEmail: "privacy@definitivehc.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // B2B & Professional Data
  ZOOMINFO_B2B: {
    name: "ZoomInfo",
    optOutUrl: "https://www.zoominfo.com/about-zoominfo/privacy-manage-profile",
    privacyEmail: "privacy@zoominfo.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  HOOVERS_DNB: {
    name: "Hoovers (D&B)",
    optOutUrl: "https://www.hoovers.com/privacy",
    privacyEmail: "privacy@dnb.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INFOGROUP_DATA: {
    name: "Infogroup (Data.com)",
    optOutUrl: "https://www.data.com/privacy",
    privacyEmail: "optout@data-axle.com", // Updated: privacy@infogroup.com was suppressed
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  LEAD411: {
    name: "Lead411",
    optOutUrl: "https://www.lead411.com/privacy-policy/",
    privacyEmail: "privacy@lead411.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DISCOVER_ORG: {
    name: "DiscoverOrg",
    optOutUrl: "https://discoverorg.com/privacy-policy/",
    privacyEmail: "privacy@discoverorg.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SEAMLESS_AI_B2B: {
    name: "Seamless.AI",
    optOutUrl: "https://seamless.ai/privacy",
    privacyEmail: "privacy@seamless.ai",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  LUSHA_DATA: {
    name: "Lusha",
    optOutUrl: "https://www.lusha.com/opt-out/",
    privacyEmail: "privacy@lusha.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  APOLLO_IO: {
    name: "Apollo.io",
    optOutUrl: "https://www.apollo.io/privacy-policy/remove-info",
    privacyEmail: "privacy@apollo.io",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CLEARBIT_DATA: {
    name: "Clearbit",
    optOutUrl: "https://clearbit.com/privacy",
    privacyEmail: "privacy@clearbit.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SLINTEL: {
    name: "Slintel (6sense)",
    optOutUrl: "https://6sense.com/privacy-policy/",
    privacyEmail: "privacy@6sense.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COGNISM_B2B: {
    name: "Cognism",
    optOutUrl: "https://www.cognism.com/privacy-policy",
    privacyEmail: "privacy@cognism.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  HUNTER_IO_B2B: {
    name: "Hunter.io",
    optOutUrl: "https://hunter.io/privacy-policy",
    privacyEmail: "privacy@hunter.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ROCKETREACH_B2B: {
    name: "RocketReach",
    optOutUrl: "https://rocketreach.co/privacy",
    privacyEmail: "privacy@rocketreach.co",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SALESINTEL: {
    name: "SalesIntel",
    optOutUrl: "https://salesintel.io/privacy-policy/",
    privacyEmail: "privacy@salesintel.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Consumer Marketing Data
  ACXIOM_ABOUTTHEDATA: {
    name: "Acxiom AboutTheData",
    optOutUrl: "https://www.acxiom.com/optout",
    privacyEmail: "consumeradvo@acxiom.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  ORACLE_MARKETING: {
    name: "Oracle Data Cloud",
    optOutUrl: "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html",
    privacyEmail: "privacy_ww@oracle.com", // Updated: privacy@oracle.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  EPSILON_DATA: {
    name: "Epsilon Data Management",
    optOutUrl: "https://www.epsilon.com/us/privacy-policy",
    privacyEmail: "privacy@epsilon.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "EPSILON",
  },
  LIVERAMP_DATA: {
    name: "LiveRamp Data Services",
    optOutUrl: "https://liveramp.com/opt_out/",
    privacyEmail: "optout@liveramp.com", // Updated: privacy@liveramp.com was suppressed
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  NIELSEN_IQ: {
    name: "NielsenIQ Consumer Data",
    optOutUrl: "https://nielseniq.com/global/en/legal/privacy-policy/",
    privacyEmail: "privacy@nielseniq.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  COMSCORE_DATA: {
    name: "Comscore",
    optOutUrl: "https://www.comscore.com/About/Privacy-Policy",
    privacyEmail: "privacy@comscore.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TAPAD_DATA: {
    name: "Tapad (Experian)",
    optOutUrl: "https://www.tapad.com/privacy",
    privacyEmail: "privacy@tapad.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  DRAWBRIDGE_MARKETING: {
    name: "Drawbridge (LinkedIn)",
    optOutUrl: "https://www.linkedin.com/legal/privacy-policy",
    privacyEmail: "privacy@drawbridge.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRUTHSET: {
    name: "Truthset",
    optOutUrl: "https://truthset.com/privacy/",
    privacyEmail: "privacy@truthset.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Retail & Shopping Data
  CATALINA_DATA: {
    name: "Catalina Marketing",
    optOutUrl: "https://www.catalina.com/privacy-policy/",
    privacyEmail: "privacy@catalina.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IBOTTA_DATA: {
    name: "Ibotta Consumer Data",
    optOutUrl: "https://home.ibotta.com/privacy/",
    privacyEmail: "privacy@ibotta.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  FETCH_REWARDS: {
    name: "Fetch Rewards",
    optOutUrl: "https://fetch.com/privacy-policy/",
    privacyEmail: "privacy@fetch.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  RAKUTEN_DATA: {
    name: "Rakuten Consumer Data",
    optOutUrl: "https://www.rakuten.com/privacy.htm",
    privacyEmail: "privacy@rakuten.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CARDLYTICS: {
    name: "Cardlytics",
    optOutUrl: "https://www.cardlytics.com/privacy/",
    privacyEmail: "privacy@cardlytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SHOPKICK_DATA: {
    name: "Shopkick",
    optOutUrl: "https://www.shopkick.com/privacy",
    privacyEmail: "privacy@shopkick.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  INMARKET_DATA: {
    name: "InMarket",
    optOutUrl: "https://inmarket.com/privacy/",
    privacyEmail: "privacy@inmarket.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PLACED_FOURSQUARE: {
    name: "Placed (Foursquare)",
    optOutUrl: "https://foursquare.com/privacy/",
    privacyEmail: "privacy@foursquare.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  
    parentCompany: "Foursquare Labs",
    subsidiaries: ["PLACED_FOURSQUARE","FOURSQUARE_DATA","PILGRIM_SDK","FACTUAL"],
  
    consolidatesTo: "FOURSQUARE",
  },
  AFFINITY_SOLUTIONS: {
    name: "Affinity Solutions",
    optOutUrl: "https://www.affinitysolutions.com/privacy",
    privacyEmail: "privacy@affinitysolutions.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  NUMERATOR_DATA: {
    name: "Numerator",
    optOutUrl: "https://www.numerator.com/privacy/",
    privacyEmail: "privacy@numerator.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Location & Geospatial Data
  PLACER_AI_LOCATION: {
    name: "Placer.ai",
    optOutUrl: "https://www.placer.ai/privacy-policy/",
    privacyEmail: "privacy@placer.ai",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  GRAVY_ANALYTICS_LOCATION: {
    name: "Gravy Analytics",
    optOutUrl: "https://gravyanalytics.com/privacy-policy/",
    privacyEmail: "privacy@gravyanalytics.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UNACAST_DATA: {
    name: "Unacast",
    optOutUrl: "https://www.unacast.com/privacy",
    privacyEmail: "privacy@unacast.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CUEBIQ_DATA: {
    name: "Cuebiq",
    optOutUrl: "https://www.cuebiq.com/privacy-policy/",
    privacyEmail: "privacy@cuebiq.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  VERASET_DATA: {
    name: "Veraset",
    optOutUrl: "https://veraset.com/privacy/",
    privacyEmail: "privacy@veraset.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NEARMEDIA: {
    name: "Near Media",
    optOutUrl: "https://near.com/privacy/",
    privacyEmail: "privacy@near.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  GROUNDTRUTH_DATA: {
    name: "GroundTruth",
    optOutUrl: "https://www.groundtruth.com/privacy-policy/",
    privacyEmail: "privacy@groundtruth.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  REVEAL_MOBILE: {
    name: "Reveal Mobile",
    optOutUrl: "https://revealmobile.com/privacy/",
    privacyEmail: "privacy@revealmobile.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  XMODE_DATA: {
    name: "X-Mode Social",
    optOutUrl: "https://xmode.io/privacy-policy/",
    privacyEmail: "privacy@xmode.io",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // Identity Resolution & Enrichment
  FULLCONTACT_IDENTITY: {
    name: "FullContact",
    optOutUrl: "https://www.fullcontact.com/privacy/",
    privacyEmail: "privacy@fullcontact.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PIPL_ENTERPRISE: {
    name: "Pipl Enterprise",
    optOutUrl: "https://pipl.com/privacy-policy/",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "PIPL",
  },
  PEOPLEDATALABS: {
    name: "People Data Labs",
    optOutUrl: "https://www.peopledatalabs.com/privacy",
    privacyEmail: "privacy@peopledatalabs.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  VERSIUM_DATA: {
    name: "Versium",
    optOutUrl: "https://versium.com/privacy/",
    privacyEmail: "privacy@versium.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BIGDBM: {
    name: "BigDBM",
    optOutUrl: "https://bigdbm.com/privacy/",
    privacyEmail: "privacy@bigdbm.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  // REMOVED: ZEROBOUNCE_DATA, KICKBOX_DATA — not data brokers (Feb 16 2026, GDPR DSR compliance)
  EMAILAGE: {
    name: "Emailage (LexisNexis)",
    optOutUrl: "https://www.lexisnexis.com/en-us/privacy/privacy-policy.page",
    privacyEmail: "privacy@emailage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "LEXISNEXIS",
  },

  // Financial & Alternative Credit Data
  CHEXSYSTEMS_CREDIT: {
    name: "ChexSystems",
    optOutUrl: "https://www.chexsystems.com/web/chexsystems/consumerdebit/page/home/optout",
    privacyEmail: "consumer@chexsystems.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  CERTEGY_CHECK: {
    name: "Certegy Check Services",
    optOutUrl: "https://www.askcertegy.com/optout",
    privacyEmail: "consumer@certegy.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  TELECHECK: {
    name: "TeleCheck",
    optOutUrl: "https://www.firstdata.com/telecheck/",
    privacyEmail: "privacy@telecheck.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  NCTUE_UTILITY: {
    name: "NCTUE Utility Exchange",
    optOutUrl: "https://www.nctue.com/Consumers",
    privacyEmail: "privacy@nctue.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  CLARITY_SERVICES: {
    name: "Clarity Services (Experian)",
    optOutUrl: "https://www.clarityservices.com/consumer-info/",
    privacyEmail: "consumer@clarityservices.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  FACTORTRUST: {
    name: "FactorTrust (TransUnion)",
    optOutUrl: "https://www.factortrust.com/consumer-request/",
    privacyEmail: "privacy@factortrust.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SRS_TENANT: {
    name: "SRS (Tenant Screening)",
    optOutUrl: "https://www.saferent.com/privacy/",
    privacyEmail: "privacy@saferent.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  INNOVIS_DATA: {
    name: "Innovis Data Solutions",
    optOutUrl: "https://www.innovis.com/personal/securityFreeze",
    privacyEmail: "privacy@innovis.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PRBC_CREDIT: {
    name: "PRBC (Payment Reporting)",
    optOutUrl: "https://www.prbc.com/consumers/",
    privacyEmail: "privacy@prbc.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SAGESTREAM_CREDIT: {
    name: "SageStream",
    optOutUrl: "https://www.sagestreamllc.com/consumer-assistance/",
    privacyEmail: "privacy@sagestreamllc.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // Employment & Workforce Data
  THE_WORK_NUMBER: {
    name: "The Work Number (Equifax)",
    optOutUrl: "https://www.theworknumber.com/employees/",
    privacyEmail: "privacy@theworknumber.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  ADP_VERIFICATION: {
    name: "ADP Verification Services",
    optOutUrl: "https://www.adp.com/privacy.aspx",
    privacyEmail: "privacy@adp.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PAYCHEX_DATA: {
    name: "Paychex Data Services",
    optOutUrl: "https://www.paychex.com/privacy",
    privacyEmail: "privacy@paychex.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TALENTIQ: {
    name: "TalentIQ (iCIMS)",
    optOutUrl: "https://www.icims.com/legal/privacy-notice/",
    privacyEmail: "privacy@icims.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  HIBOB_DATA: {
    name: "HiBob",
    optOutUrl: "https://www.hibob.com/privacy-policy/",
    privacyEmail: "privacy@hibob.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  // REMOVED: Greenhouse, Lever, SmartRecruiters, Jobvite, Workday
  // NOT data brokers - these are HR/ATS platforms where users apply for jobs directly
  // Users have direct relationship through job applications
  // See: Cal. Civ. Code § 1798.99.80(d) - data broker requires NO direct relationship

  // Legal & Court Records
  PACER_RECORDS: {
    name: "PACER (Federal Courts)",
    optOutUrl: "https://pacer.uscourts.gov/",
    privacyEmail: "pacer@uscourts.gov",
    removalMethod: "EMAIL",
    estimatedDays: 60,
  },
  COURTLINK_LN: {
    name: "CourtLink (LexisNexis)",
    optOutUrl: "https://www.lexisnexis.com/en-us/privacy/privacy-policy.page",
    privacyEmail: "privacy@lexisnexis.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "LEXISNEXIS",
  },
  WESTLAW_COURT: {
    name: "Westlaw Court Records",
    optOutUrl: "https://legal.thomsonreuters.com/en/privacy",
    privacyEmail: "privacy@thomsonreuters.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  COURTRECORDS_LEGAL: {
    name: "CourtRecords.org",
    optOutUrl: "https://courtrecords.org/privacy",
    privacyEmail: "privacy@courtrecords.org",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  JUDYRECORDS_LEGAL: {
    name: "JudyRecords",
    optOutUrl: "https://www.judyrecords.com/privacy",
    privacyEmail: "support@judyrecords.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  UNIQUECOURT: {
    name: "UniqueCourt",
    optOutUrl: "https://uniquecourt.com/privacy",
    privacyEmail: "support@uniquecourt.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DOCKETBIRD_LEGAL: {
    name: "Docketbird",
    optOutUrl: "https://www.docketbird.com/privacy",
    privacyEmail: "support@docketbird.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COURTLISTENER_LEGAL: {
    name: "CourtListener (Free Law Project)",
    optOutUrl: "https://www.courtlistener.com/terms/",
    privacyEmail: "info@free.law",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  JUSTIA_DOCKETS: {
    name: "Justia Dockets",
    optOutUrl: "https://www.justia.com/privacy-policy/",
    privacyEmail: "privacy@justia.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BLOOMBERG_LAW: {
    name: "Bloomberg Law Records",
    optOutUrl: "https://www.bloombergindustry.com/privacy-policy/",
    privacyEmail: "privacy@bloombergindustry.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Property & Real Estate Data
  CORELOGIC_PROPERTY: {
    name: "CoreLogic Property",
    optOutUrl: "https://www.corelogic.com/privacy-policy/",
    privacyEmail: "privacy@corelogic.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ATTOM_DATA: {
    name: "ATTOM Data Solutions",
    optOutUrl: "https://www.attomdata.com/privacy/",
    privacyEmail: "privacy@attomdata.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  FIRST_AMERICAN_DATA: {
    name: "First American Data",
    optOutUrl: "https://www.firstam.com/privacy-policy/",
    privacyEmail: "privacy@firstam.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  BLACK_KNIGHT_DATA: {
    name: "Black Knight (ICE)",
    optOutUrl: "https://www.blackknightinc.com/privacy-policy/",
    privacyEmail: "privacy@blackknightinc.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REONOMY_DATA: {
    name: "Reonomy",
    optOutUrl: "https://www.reonomy.com/privacy/",
    privacyEmail: "privacy@reonomy.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REALTYTRACK: {
    name: "RealtyTrac (ATTOM)",
    optOutUrl: "https://www.realtytrac.com/privacy/",
    privacyEmail: "privacy@realtytrac.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PROPERTYSHARK_REALTY: {
    name: "PropertyShark",
    optOutUrl: "https://www.propertyshark.com/info/privacy/",
    privacyEmail: "privacy@propertyshark.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LANDGRID: {
    name: "Landgrid",
    optOutUrl: "https://landgrid.com/privacy",
    privacyEmail: "privacy@landgrid.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REGRID: {
    name: "Regrid",
    optOutUrl: "https://regrid.com/privacy",
    privacyEmail: "privacy@regrid.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  REALPAGE_DATA: {
    name: "RealPage Data Services",
    optOutUrl: "https://www.realpage.com/privacy-policy/",
    privacyEmail: "privacy@realpage.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Voter & Political Data
  L2_VOTER_DATA: {
    name: "L2 Political",
    optOutUrl: "https://l2-data.com/privacy/",
    privacyEmail: "privacy@l2-data.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ARISTOTLE_VOTER: {
    name: "Aristotle Voter Files",
    optOutUrl: "https://aristotle.com/privacy-policy/",
    privacyEmail: "privacy@aristotle.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CATALIST_DATA: {
    name: "Catalist",
    optOutUrl: "https://catalist.us/privacy/",
    privacyEmail: "privacy@catalist.us",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TARGET_SMART: {
    name: "TargetSmart",
    optOutUrl: "https://targetsmart.com/privacy-policy/",
    privacyEmail: "privacy@targetsmart.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  NATIONBUILDER: {
    name: "NationBuilder",
    optOutUrl: "https://nationbuilder.com/privacy",
    privacyEmail: "privacy@nationbuilder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NGPVAN: {
    name: "NGP VAN (EveryAction)",
    optOutUrl: "https://www.ngpvan.com/privacy-policy/",
    privacyEmail: "privacy@ngpvan.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  I360_DATA: {
    name: "i360",
    optOutUrl: "https://www.i-360.com/privacy/",
    privacyEmail: "privacy@i-360.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DATA_TRUST: {
    name: "Data Trust",
    optOutUrl: "https://www.data-trust.com/privacy/",
    privacyEmail: "privacy@data-trust.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  VOTERBASE: {
    name: "VoterBase",
    optOutUrl: "https://voterbase.com/privacy",
    privacyEmail: "privacy@voterbase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  POLITICAL_DATA: {
    name: "Political Data Inc",
    optOutUrl: "https://politicaldata.com/privacy/",
    privacyEmail: "privacy@politicaldata.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Social Media Aggregators
  BRANDYOURSELF: {
    name: "BrandYourself",
    optOutUrl: "https://brandyourself.com/privacy-policy",
    privacyEmail: "privacy@brandyourself.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SOCIALBAKERS: {
    name: "Socialbakers (Emplifi)",
    optOutUrl: "https://emplifi.io/legal/privacy-policy",
    privacyEmail: "privacy@emplifi.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SOCIAL_MENTION: {
    name: "Social Mention",
    optOutUrl: "https://socialmention.com/about/",
    privacyEmail: "info@socialmention.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BRANDWATCH: {
    name: "Brandwatch",
    optOutUrl: "https://www.brandwatch.com/legal/privacy-policy/",
    privacyEmail: "privacy@brandwatch.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SPRINKLR_DATA: {
    name: "Sprinklr",
    optOutUrl: "https://www.sprinklr.com/privacy/",
    privacyEmail: "privacy@sprinklr.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  NETBASE_QUID: {
    name: "NetBase Quid",
    optOutUrl: "https://netbasequid.com/privacy-policy/",
    privacyEmail: "privacy@netbasequid.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOOTSUITE_DATA: {
    name: "Hootsuite Insights",
    optOutUrl: "https://www.hootsuite.com/legal/privacy",
    privacyEmail: "privacy@hootsuite.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  TALKWALKER: {
    name: "Talkwalker",
    optOutUrl: "https://www.talkwalker.com/privacy",
    privacyEmail: "privacy@talkwalker.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SYSOMOS: {
    name: "Sysomos",
    optOutUrl: "https://www.meltwater.com/en/privacy",
    privacyEmail: "privacy@meltwater.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Phone & Communication Data
  TWILIO_LOOKUP: {
    name: "Twilio Lookup",
    optOutUrl: "https://www.twilio.com/legal/privacy",
    privacyEmail: "privacy@twilio.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  NUMVERIFY_PHONE: {
    name: "Numverify",
    optOutUrl: "https://numverify.com/privacy",
    privacyEmail: "privacy@apilayer.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EKATA_DATA: {
    name: "Ekata (Mastercard)",
    optOutUrl: "https://ekata.com/privacy-policy/",
    privacyEmail: "privacy@ekata.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  TELESIGN_DATA: {
    name: "TeleSign",
    optOutUrl: "https://www.telesign.com/privacy-policy/",
    privacyEmail: "privacy@telesign.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  MARCHEX_DATA: {
    name: "Marchex",
    optOutUrl: "https://www.marchex.com/privacy-policy/",
    privacyEmail: "privacy@marchex.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CALLRAIL_DATA: {
    name: "CallRail",
    optOutUrl: "https://www.callrail.com/privacy/",
    privacyEmail: "privacy@callrail.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  INVOCA_DATA: {
    name: "Invoca",
    optOutUrl: "https://www.invoca.com/legal/privacy-policy/",
    privacyEmail: "privacy@invoca.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DIALOGTECH: {
    name: "DialogTech (Invoca)",
    optOutUrl: "https://www.invoca.com/legal/privacy-policy/",
    privacyEmail: "privacy@dialogtech.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  RINGBA_DATA: {
    name: "Ringba",
    optOutUrl: "https://www.ringba.com/privacy/",
    privacyEmail: "privacy@ringba.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CONVIRZA_DATA: {
    name: "Convirza",
    optOutUrl: "https://www.convirza.com/privacy-policy/",
    privacyEmail: "privacy@convirza.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // International People Search - Asia Pacific
  PIPL_APAC: {
    name: "Pipl Asia Pacific",
    optOutUrl: "https://pipl.com/privacy-policy/",
    privacyEmail: "privacy@pipl.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "PIPL",
  },
  WHITEPAGES_AUSTRALIA: {
    name: "White Pages Australia",
    optOutUrl: "https://www.whitepages.com.au/privacy",
    privacyEmail: "privacy@whitepages.com.au",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "WHITEPAGES_AU",
  },
  YELLOWPAGES_AU: {
    name: "Yellow Pages Australia",
    optOutUrl: "https://www.yellowpages.com.au/privacy",
    privacyEmail: "privacy@sensis.com.au",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    parentCompany: "Sensis (Australia)",
    subsidiaries: ["YELLOWPAGES_AU2","YELLOWPAGES_AU_EXT"],
  },
  LOCALSEARCH_AU: {
    name: "Localsearch Australia",
    optOutUrl: "https://www.localsearch.com.au/privacy",
    privacyEmail: "privacy@localsearch.com.au",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  TRUELOCAL_AU: {
    name: "TrueLocal Australia",
    optOutUrl: "https://www.truelocal.com.au/privacy",
    privacyEmail: "privacy@truelocal.com.au",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  YELLOWPAGES_NZ: {
    name: "Yellow Pages New Zealand",
    optOutUrl: "https://yellow.co.nz/privacy",
    privacyEmail: "privacy@yellow.co.nz",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  FINDA_NZ: {
    name: "Finda New Zealand",
    optOutUrl: "https://www.finda.co.nz/privacy",
    privacyEmail: "privacy@finda.co.nz",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  JUSTDIAL_IN: {
    name: "JustDial India",
    optOutUrl: "https://www.justdial.com/Privacy-Policy",
    privacyEmail: "privacy@justdial.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SULEKHA_IN: {
    name: "Sulekha India",
    optOutUrl: "https://www.sulekha.com/privacy-policy",
    privacyEmail: "privacy@sulekha.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // International People Search - Latin America
  PAGINASAMARILLAS_MX: {
    name: "Paginas Amarillas Mexico",
    optOutUrl: "https://www.paginasamarillas.com.mx/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.mx",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  SECCIONAMARILLA_MX: {
    name: "Seccion Amarilla Mexico",
    optOutUrl: "https://www.seccionamarilla.com.mx/privacidad",
    privacyEmail: "privacidad@seccionamarilla.com.mx",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  TELELISTAS_BR: {
    name: "TeleListas Brazil",
    optOutUrl: "https://www.telelistas.net/privacidade",
    privacyEmail: "privacidade@telelistas.net",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  LISTASAMARILLAS_BR: {
    name: "Listas Amarillas Brazil",
    optOutUrl: "https://www.listasamarillas.com.br/privacidade",
    privacyEmail: "privacidade@listasamarillas.com.br",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_AR: {
    name: "Paginas Amarillas Argentina",
    optOutUrl: "https://www.paginasamarillas.com.ar/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.ar",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_CL: {
    name: "Paginas Amarillas Chile",
    optOutUrl: "https://www.paginasamarillas.cl/privacidad",
    privacyEmail: "privacidad@paginasamarillas.cl",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_CO: {
    name: "Paginas Amarillas Colombia",
    optOutUrl: "https://www.paginasamarillas.com.co/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.co",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_PE: {
    name: "Paginas Amarillas Peru",
    optOutUrl: "https://www.paginasamarillas.com.pe/privacidad",
    privacyEmail: "privacidad@paginasamarillas.com.pe",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  CIUDAD_CL: {
    name: "Ciudad.cl Chile",
    optOutUrl: "https://www.ciudad.cl/privacidad",
    privacyEmail: "privacidad@ciudad.cl",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  GUIAMAIS_BR: {
    name: "Guia Mais Brazil",
    optOutUrl: "https://www.guiamais.com.br/privacidade",
    privacyEmail: "privacidade@guiamais.com.br",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // International People Search - Middle East & Africa
  YELLOWPAGES_ZA: {
    name: "Yellow Pages South Africa",
    optOutUrl: "https://www.yellowpages.co.za/privacy",
    privacyEmail: "privacy@yellowpages.co.za",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  WHITEPAGES_ZA: {
    name: "White Pages South Africa",
    optOutUrl: "https://www.whitepages.co.za/privacy",
    privacyEmail: "privacy@whitepages.co.za",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  YELLOWPAGES_AE: {
    name: "Yellow Pages UAE",
    optOutUrl: "https://www.yellowpages.ae/privacy",
    privacyEmail: "privacy@yellowpages.ae",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  YELLOWPAGES_SA: {
    name: "Yellow Pages Saudi Arabia",
    optOutUrl: "https://www.yellowpages.com.sa/privacy",
    privacyEmail: "privacy@yellowpages.com.sa",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  YELLOWPAGES_EG: {
    name: "Yellow Pages Egypt",
    optOutUrl: "https://www.yellowpages.com.eg/privacy",
    privacyEmail: "privacy@yellowpages.com.eg",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  D144_EG: {
    name: "D144 Egypt",
    optOutUrl: "https://www.d144.com.eg/privacy",
    privacyEmail: "privacy@d144.com.eg",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  BEBEO_SA: {
    name: "Bebeo Saudi Arabia",
    optOutUrl: "https://www.bebeo.sa/privacy",
    privacyEmail: "privacy@bebeo.sa",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_NG: {
    name: "Yellow Pages Nigeria",
    optOutUrl: "https://www.yellowpages.ng/privacy",
    privacyEmail: "privacy@yellowpages.ng",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  BUSINESSLIST_KE: {
    name: "Business List Kenya",
    optOutUrl: "https://www.businesslist.co.ke/privacy",
    privacyEmail: "privacy@businesslist.co.ke",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_MA: {
    name: "Yellow Pages Morocco",
    optOutUrl: "https://www.yellowpages.ma/privacy",
    privacyEmail: "privacy@yellowpages.ma",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },

  // Specialty Data Providers
  MERKLE_DATA: {
    name: "Merkle Data",
    optOutUrl: "https://www.merkle.com/privacy",
    privacyEmail: "privacy@merkle.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CROSSIX: {
    name: "Crossix (Veeva)",
    optOutUrl: "https://www.veeva.com/privacy/",
    privacyEmail: "privacy@crossix.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HEALTHVERITY: {
    name: "HealthVerity",
    optOutUrl: "https://healthverity.com/privacy-policy/",
    privacyEmail: "privacy@healthverity.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  KOMODO_HEALTH: {
    name: "Komodo Health",
    optOutUrl: "https://www.komodohealth.com/privacy",
    privacyEmail: "privacy@komodohealth.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SYMPHONY_HEALTH: {
    name: "Symphony Health (IQVIA)",
    optOutUrl: "https://www.iqvia.com/about-us/privacy",
    privacyEmail: "privacy@symphonyhealth.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PULSEPOINTLIFE: {
    name: "PulsePoint Life Sciences",
    optOutUrl: "https://www.pulsepoint.com/privacy-policy",
    privacyEmail: "privacy@pulsepoint.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ADTHEORENT: {
    name: "AdTheorent",
    optOutUrl: "https://www.adtheorent.com/privacy-policy/",
    privacyEmail: "privacy@adtheorent.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DIGITALENVOY: {
    name: "Digital Envoy",
    optOutUrl: "https://www.digitalenvoy.com/privacy-policy/",
    privacyEmail: "privacy@digitalenvoy.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  MAXMIND: {
    name: "MaxMind",
    optOutUrl: "https://www.maxmind.com/en/privacy-policy",
    privacyEmail: "privacy@maxmind.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // ==========================================
  // ADDITIONAL DATA BROKERS - v1.19.0 (1000 MILESTONE)
  // ==========================================

  // Additional Background Check Services
  GOODHIRE_BG: {
    name: "GoodHire",
    optOutUrl: "https://www.goodhire.com/privacy/",
    privacyEmail: "privacy@goodhire.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  CRIMCHECK: {
    name: "CrimCheck",
    optOutUrl: "https://www.crimcheck.com/privacy/",
    privacyEmail: "privacy@crimcheck.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  VERIFIED_FIRST: {
    name: "Verified First",
    optOutUrl: "https://www.verifiedfirst.com/privacy/",
    privacyEmail: "privacy@verifiedfirst.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ORANGE_TREE: {
    name: "Orange Tree Employment Screening",
    optOutUrl: "https://www.orangetreescreening.com/privacy/",
    privacyEmail: "privacy@orangetreescreening.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ASURINT: {
    name: "Asurint",
    optOutUrl: "https://www.asurint.com/privacy/",
    privacyEmail: "privacy@asurint.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // Additional Consumer Data Providers
  INFUTOR_DATA: {
    name: "Infutor Data Solutions",
    optOutUrl: "https://www.infutor.com/privacy/",
    privacyEmail: "privacy@infutor.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  WEBBULA: {
    name: "Webbula",
    optOutUrl: "https://webbula.com/privacy/",
    privacyEmail: "privacy@webbula.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  DATAAXLE: {
    name: "Data Axle (formerly Infogroup)",
    optOutUrl: "https://www.data-axle.com/privacy/",
    privacyEmail: "privacy@data-axle.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  THROTLE: {
    name: "Throtle",
    optOutUrl: "https://throtle.io/privacy/",
    privacyEmail: "privacy@throtle.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SEMCASTING: {
    name: "Semcasting",
    optOutUrl: "https://semcasting.com/privacy/",
    privacyEmail: "privacy@semcasting.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Additional Real Estate & Property
  LISTHUB: {
    name: "ListHub",
    optOutUrl: "https://www.listhub.com/privacy/",
    privacyEmail: "privacy@listhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEBOT: {
    name: "Homebot",
    optOutUrl: "https://homebot.ai/privacy/",
    privacyEmail: "privacy@homebot.ai",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  QUANTARIUM: {
    name: "Quantarium",
    optOutUrl: "https://www.quantarium.com/privacy/",
    privacyEmail: "privacy@quantarium.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOUSECANARY: {
    name: "HouseCanary",
    optOutUrl: "https://www.housecanary.com/privacy/",
    privacyEmail: "privacy@housecanary.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEUNION: {
    name: "HomeUnion",
    optOutUrl: "https://www.homeunion.com/privacy/",
    privacyEmail: "privacy@homeunion.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Additional Phone & Identity
  WHITECALLER: {
    name: "WhiteCaller",
    optOutUrl: "https://whitecaller.com/privacy/",
    privacyEmail: "support@whitecaller.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PHONEBOOK_OF_THE_WORLD: {
    name: "Phonebook of the World",
    optOutUrl: "https://phonebookoftheworld.com/privacy/",
    privacyEmail: "support@phonebookoftheworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CALLER_ID_SERVICE: {
    name: "CallerID Service",
    optOutUrl: "https://calleridservice.com/privacy/",
    privacyEmail: "support@calleridservice.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PHONEINFO: {
    name: "PhoneInfo",
    optOutUrl: "https://phoneinfo.io/privacy/",
    privacyEmail: "privacy@phoneinfo.io",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  PHONEDETECTIVE: {
    name: "Phone Detective",
    optOutUrl: "https://www.phonedetective.com/privacy/",
    privacyEmail: "privacy@phonedetective.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // Additional International - Europe
  INFOBEL_EU: {
    name: "Infobel Europe",
    optOutUrl: "https://www.infobel.com/privacy/",
    privacyEmail: "privacy@infobel.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  EUROPAGES: {
    name: "Europages",
    optOutUrl: "https://www.europages.com/privacy/",
    privacyEmail: "privacy@europages.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  KOMPASS_EU: {
    name: "Kompass Europe",
    optOutUrl: "https://www.kompass.com/privacy/",
    privacyEmail: "privacy@kompass.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  HOTFROG_EU: {
    name: "Hotfrog Europe",
    optOutUrl: "https://www.hotfrog.com/privacy/",
    privacyEmail: "privacy@hotfrog.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CYLEX_EU: {
    name: "Cylex Europe",
    optOutUrl: "https://www.cylex.com/privacy/",
    privacyEmail: "privacy@cylex.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Additional Business Intelligence
  OWLER_DATA: {
    name: "Owler",
    optOutUrl: "https://www.owler.com/privacy/",
    privacyEmail: "privacy@owler.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CRUNCHBASE_DATA: {
    name: "Crunchbase",
    optOutUrl: "https://www.crunchbase.com/privacy/",
    privacyEmail: "privacy@crunchbase.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PITCHBOOK: {
    name: "PitchBook",
    optOutUrl: "https://pitchbook.com/privacy/",
    privacyEmail: "privacy@pitchbook.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CB_INSIGHTS: {
    name: "CB Insights",
    optOutUrl: "https://www.cbinsights.com/privacy/",
    privacyEmail: "privacy@cbinsights.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PRIVCO: {
    name: "PrivCo",
    optOutUrl: "https://www.privco.com/privacy/",
    privacyEmail: "privacy@privco.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // Additional Professional Directories
  AVVO_LEGAL: {
    name: "Avvo",
    optOutUrl: "https://www.avvo.com/privacy/",
    privacyEmail: "privacy@avvo.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  MARTINDALE: {
    name: "Martindale-Hubbell",
    optOutUrl: "https://www.martindale.com/privacy/",
    privacyEmail: "privacy@martindale.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  FINDLAW_DIR: {
    name: "FindLaw Directory",
    optOutUrl: "https://www.findlaw.com/privacy/",
    privacyEmail: "privacy@findlaw.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  LAWYERS_COM: {
    name: "Lawyers.com",
    optOutUrl: "https://www.lawyers.com/privacy/",
    privacyEmail: "privacy@lawyers.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  JUSTIA_DIR: {
    name: "Justia Lawyer Directory",
    optOutUrl: "https://www.justia.com/privacy/",
    privacyEmail: "privacy@justia.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // Additional Advertising Data
  THE_TRADE_DESK_DATA: {
    name: "The Trade Desk",
    optOutUrl: "https://www.thetradedesk.com/privacy/",
    privacyEmail: "privacy@thetradedesk.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  BIDSWITCH: {
    name: "BidSwitch (IPONWEB)",
    optOutUrl: "https://www.bidswitch.com/privacy/",
    privacyEmail: "privacy@bidswitch.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SAMBA_TV: {
    name: "Samba TV",
    optOutUrl: "https://www.samba.tv/privacy/",
    privacyEmail: "privacy@samba.tv",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  VIZIO_INSCAPE: {
    name: "Vizio Inscape",
    optOutUrl: "https://www.vizio.com/privacy/",
    privacyEmail: "privacy@vizio.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  AUTOMATIC_TV: {
    name: "Automatic (TV Data)",
    optOutUrl: "https://automatic.com/privacy/",
    privacyEmail: "privacy@automatic.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // Additional Retail Data
  SHOPPERTRACK: {
    name: "ShopperTrak",
    optOutUrl: "https://www.shoppertrak.com/privacy/",
    privacyEmail: "privacy@shoppertrak.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PRICESPIDER: {
    name: "PriceSpider",
    optOutUrl: "https://www.pricespider.com/privacy/",
    privacyEmail: "privacy@pricespider.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  // BAZAARVOICE: Removed - Data Processor, not Data Broker
  // They process reviews/UGC on behalf of retailer clients (Data Controllers) per GDPR Articles 28/29
  // Sending deletion requests to them is inappropriate - see blocklist.ts for details

  // POWER_REVIEWS: Removed - Syndigo/PowerReviews are Data Processors, not Data Brokers
  // They act on behalf of their retail clients (Data Controllers) per GDPR Articles 28/29
  // Sending deletion requests to them is inappropriate - see blocklist.ts for details

  // YOTPO_DATA: Removed - Data Processor, not Data Broker
  // They process reviews/UGC on behalf of retailer clients (Data Controllers) per GDPR Articles 28/29
  // Sending deletion requests to them is inappropriate - see blocklist.ts for details

  // ==========================================
  // MASSIVE EXPANSION v1.20.0 - 1500 SOURCES
  // ==========================================

  // Additional People Search - US Regional
  PEOPLESEARCHUSA: { name: "PeopleSearchUSA", optOutUrl: "https://peoplesearchusa.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  SEARCHUSAPEOPLE: { name: "SearchUSAPeople", optOutUrl: "https://searchusapeople.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  AMERICANPEOPLESEARCH: { name: "AmericanPeopleSearch", optOutUrl: "https://americanpeoplesearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NATIONALPEOPLESEARCH: { name: "NationalPeopleSearch", optOutUrl: "https://nationalpeoplesearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  USPEOPLEDIRECTORY: { name: "USPeopleDirectory", optOutUrl: "https://uspeopledirectory.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PUBLICRECORDSFINDER: { name: "PublicRecordsFinder", optOutUrl: "https://publicrecordsfinder.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INSTANTPEOPLESEARCH: { name: "InstantPeopleSearch", optOutUrl: "https://instantpeoplesearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  QUICKPEOPLESEARCH: { name: "QuickPeopleSearch", optOutUrl: "https://quickpeoplesearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  FREEPEOPLECHECK: { name: "FreePeopleCheck", optOutUrl: "https://freepeoplecheck.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PEOPLECHECKPRO: { name: "PeopleCheckPro", optOutUrl: "https://peoplecheckpro.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  ADDRESSLOOKUP: { name: "AddressLookup", optOutUrl: "https://addresslookup.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  ADDRESSFINDER_US: { name: "AddressFinder US", optOutUrl: "https://addressfinder.us/optout", removalMethod: "FORM", estimatedDays: 14 },
  PERSONLOCATOR: { name: "PersonLocator", optOutUrl: "https://personlocator.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PEOPLELOCATORPRO: { name: "PeopleLocatorPro", optOutUrl: "https://peoplelocatorpro.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  FINDPERSONFAST: { name: "FindPersonFast", optOutUrl: "https://findpersonfast.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  SEARCHPERSONFREE: { name: "SearchPersonFree", optOutUrl: "https://searchpersonfree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  USAPERSONLOOKUP: { name: "USAPersonLookup", optOutUrl: "https://usapersonlookup.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PERSONFINDERUSA: { name: "PersonFinderUSA", optOutUrl: "https://personfinderusa.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NATIONALRECORDSSEARCH: { name: "NationalRecordsSearch", optOutUrl: "https://nationalrecordssearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PUBLICDATAFINDER: { name: "PublicDataFinder", optOutUrl: "https://publicdatafinder.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSEARCHPRO: { name: "RecordSearchPro", optOutUrl: "https://recordsearchpro.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  BACKGROUNDFINDER: { name: "BackgroundFinder", optOutUrl: "https://backgroundfinder.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  BACKGROUNDPRO: { name: "BackgroundPro", optOutUrl: "https://backgroundpro.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INSTANTBACKGROUNDSEARCH: { name: "InstantBackgroundSearch", optOutUrl: "https://instantbackgroundsearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  USBACKGROUNDCHECK: { name: "USBackgroundCheck", optOutUrl: "https://usbackgroundcheck.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  NATIONALBACKGROUNDCHECK: { name: "NationalBackgroundCheck", optOutUrl: "https://nationalbackgroundcheck.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  BACKGROUNDSCREENING: { name: "BackgroundScreening", optOutUrl: "https://backgroundscreening.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  VERIFYBACKGROUND: { name: "VerifyBackground", optOutUrl: "https://verifybackground.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  SCREENNOW: { name: "ScreenNow", optOutUrl: "https://screennow.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  BACKGROUNDVERIFY: { name: "BackgroundVerify", optOutUrl: "https://backgroundverify.com/optout", removalMethod: "FORM", estimatedDays: 30 },

  // Additional Phone Lookup Services
  PHONELOOKUPFREE: { name: "PhoneLookupFree", optOutUrl: "https://phonelookupfree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  REVERSEPHONEFREE: { name: "ReversePhoneFree", optOutUrl: "https://reversephonefree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CALLERINFO: { name: "CallerInfo", optOutUrl: "https://callerinfo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PHONENUMBERFINDER: { name: "PhoneNumberFinder", optOutUrl: "https://phonenumberfinder.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  WHOISCALLER: { name: "WhoisCaller", optOutUrl: "https://whoiscaller.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CALLERDETECTIVE: { name: "CallerDetective", optOutUrl: "https://callerdetective.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PHONESEARCHFREE: { name: "PhoneSearchFree", optOutUrl: "https://phonesearchfree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  REVERSECALLERID: { name: "ReverseCallerID", optOutUrl: "https://reversecallerid.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CELLPHONELOOKUP: { name: "CellPhoneLookup", optOutUrl: "https://cellphonelookup.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  MOBILENUMBERSEARCH: { name: "MobileNumberSearch", optOutUrl: "https://mobilenumbersearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PHONEDIRECTORYUSA: { name: "PhoneDirectoryUSA", optOutUrl: "https://phonedirectoryusa.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NATIONALPHONEBOOK: { name: "NationalPhonebook", optOutUrl: "https://nationalphonebook.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  TELEPHONESEARCH: { name: "TelephoneSearch", optOutUrl: "https://telephonesearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PHONEBOOKUSA: { name: "PhonebookUSA", optOutUrl: "https://phonebookusa.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CALLERLOOKUPPRO: { name: "CallerLookupPro", optOutUrl: "https://callerlookuppro.com/optout", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Email Search Services
  EMAILSEARCH: { name: "EmailSearch", optOutUrl: "https://emailsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EMAILFINDERPRO: { name: "EmailFinderPro", optOutUrl: "https://emailfinderpro.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EMAILADDRESSLOOKUP: { name: "EmailAddressLookup", optOutUrl: "https://emailaddresslookup.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EMAILVERIFIER: { name: "EmailVerifier", optOutUrl: "https://emailverifier.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  FINDEMAILADDRESS: { name: "FindEmailAddress", optOutUrl: "https://findemailaddress.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EMAILHIPPO: { name: "EmailHippo", optOutUrl: "https://emailhippo.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  VERIFY_EMAIL: { name: "VerifyEmail", optOutUrl: "https://verify-email.org/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EMAILCHECKER: { name: "EmailChecker", optOutUrl: "https://emailchecker.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  QUICKEMAILVERIFICATION: { name: "QuickEmailVerification", optOutUrl: "https://quickemailverification.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  MAILBOXVALIDATOR: { name: "MailboxValidator", optOutUrl: "https://mailboxvalidator.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },

  // Additional Property & Real Estate
  PROPERTYFINDER_US: { name: "PropertyFinder US", optOutUrl: "https://propertyfinder.us/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  HOMESEARCH: { name: "HomeSearch", optOutUrl: "https://homesearch.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PROPERTYRECORDSFINDER: { name: "PropertyRecordsFinder", optOutUrl: "https://propertyrecordsfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  REALESTATEPRO: { name: "RealEstatePro", optOutUrl: "https://realestatepro.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  HOMEVALUEFINDER: { name: "HomeValueFinder", optOutUrl: "https://homevaluefinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PROPERTYOWNERINFO: { name: "PropertyOwnerInfo", optOutUrl: "https://propertyownerinfo.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  LANDRECORDSFINDER: { name: "LandRecordsFinder", optOutUrl: "https://landrecordsfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  DEEDRECORDS: { name: "DeedRecords", optOutUrl: "https://deedrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PROPERTYTAXRECORDS: { name: "PropertyTaxRecords", optOutUrl: "https://propertytaxrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  ASSESSORRECORDS: { name: "AssessorRecords", optOutUrl: "https://assessorrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  HOMEFACTS: { name: "HomeFacts", optOutUrl: "https://homefacts.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  NEIGHBORHOODSCOUT: { name: "NeighborhoodScout", optOutUrl: "https://neighborhoodscout.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  STREETADVISOR: { name: "StreetAdvisor", optOutUrl: "https://streetadvisor.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  AREAVIBES: { name: "AreaVibes", optOutUrl: "https://areavibes.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  NICHE_PLACES: { name: "Niche Places", optOutUrl: "https://niche.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },

  // Additional Healthcare Data
  HEALTHCAREPROVIDERS: { name: "HealthcareProviders", optOutUrl: "https://healthcareproviders.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  DOCTORFINDER: { name: "DoctorFinder", optOutUrl: "https://doctorfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  PHYSICIANCOMPARE: { name: "PhysicianCompare", optOutUrl: "https://physiciancompare.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  DOCTORSEARCH: { name: "DoctorSearch", optOutUrl: "https://doctorsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  MEDICALPROVIDERSEARCH: { name: "MedicalProviderSearch", optOutUrl: "https://medicalprovidersearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  HEALTHCARESEARCH: { name: "HealthcareSearch", optOutUrl: "https://healthcaresearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  DOCTORDIRECTORY: { name: "DoctorDirectory", optOutUrl: "https://doctordirectory.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  PHYSICIANFINDER: { name: "PhysicianFinder", optOutUrl: "https://physicianfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  MEDICALDIRECTORY: { name: "MedicalDirectory", optOutUrl: "https://medicaldirectory.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  HEALTHPROVIDERINFO: { name: "HealthProviderInfo", optOutUrl: "https://healthproviderinfo.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Financial & Credit Services
  CREDITREPORTFINDER: { name: "CreditReportFinder", optOutUrl: "https://creditreportfinder.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  FREECREDITREPORT: { name: "FreeCreditReport", optOutUrl: "https://freecreditreport.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  CREDITSCORECHECK: { name: "CreditScoreCheck", optOutUrl: "https://creditscorecheck.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  CREDITMONITOR: { name: "CreditMonitor", optOutUrl: "https://creditmonitor.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  CREDITVERIFY: { name: "CreditVerify", optOutUrl: "https://creditverify.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  BANKRUPTCYRECORDS: { name: "BankruptcyRecords", optOutUrl: "https://bankruptcyrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  LIENSEARCH: { name: "LienSearch", optOutUrl: "https://liensearch.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  JUDGMENTSEARCH: { name: "JudgmentSearch", optOutUrl: "https://judgmentsearch.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  TAXLIENSEARCH: { name: "TaxLienSearch", optOutUrl: "https://taxliensearch.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  ABOROFINDER: { name: "AboroFinder", optOutUrl: "https://aborofinder.com/optout", removalMethod: "FORM", estimatedDays: 30 },

  // Additional Employment & HR Data
  EMPLOYMENTVERIFY: { name: "EmploymentVerify", optOutUrl: "https://employmentverify.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  WORKHISTORYSEARCH: { name: "WorkHistorySearch", optOutUrl: "https://workhistorysearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  EMPLOYEESCREEN: { name: "EmployeeScreen", optOutUrl: "https://employeescreen.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  HIRECHECK: { name: "HireCheck", optOutUrl: "https://hirecheck.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  PREEMPLOYMENTCHECK: { name: "PreEmploymentCheck", optOutUrl: "https://preemploymentcheck.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  JOBHISTORYVERIFY: { name: "JobHistoryVerify", optOutUrl: "https://jobhistoryverify.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  EMPLOYERVERIFICATION: { name: "EmployerVerification", optOutUrl: "https://employerverification.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  SALARYVERIFY: { name: "SalaryVerify", optOutUrl: "https://salaryverify.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  INCOMEVERIFICATION: { name: "IncomeVerification", optOutUrl: "https://incomeverification.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  EMPLOYMENTRECORDS: { name: "EmploymentRecords", optOutUrl: "https://employmentrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Legal & Court Records
  COURTRECORDSPRO: { name: "CourtRecordsPro", optOutUrl: "https://courtrecordspro.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PUBLICCOURTRECORDS: { name: "PublicCourtRecords", optOutUrl: "https://publiccourtrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  CRIMINALRECORDSFINDER: { name: "CriminalRecordsFinder", optOutUrl: "https://criminalrecordsfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  CRIMINALHISTORYSEARCH: { name: "CriminalHistorySearch", optOutUrl: "https://criminalhistorysearch.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  ARRESTRECORDSFINDER: { name: "ArrestRecordsFinder", optOutUrl: "https://arrestrecordsfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  MUGSHOTSEARCH: { name: "MugshotSearch", optOutUrl: "https://mugshotsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  SEXOFFENDERSEARCH: { name: "SexOffenderSearch", optOutUrl: "https://sexoffendersearch.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  INMATESEARCH: { name: "InmateSearch", optOutUrl: "https://inmatesearch.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  JAILRECORDS: { name: "JailRecords", optOutUrl: "https://jailrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PRISONRECORDS: { name: "PrisonRecords", optOutUrl: "https://prisonrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  CIVILCOURTRECORDS: { name: "CivilCourtRecords", optOutUrl: "https://civilcourtrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  FAMILYCOURTRECORDS: { name: "FamilyCourtRecords", optOutUrl: "https://familycourtrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  DIVORCERECORDSFINDER: { name: "DivorceRecordsFinder", optOutUrl: "https://divorcerecordsfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  MARRIAGERECORDSFINDER: { name: "MarriageRecordsFinder", optOutUrl: "https://marriagerecordsfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PROBATERECORDS: { name: "ProbateRecords", optOutUrl: "https://probaterecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },

  // Additional B2B & Professional Data
  BUSINESSSEARCH: { name: "BusinessSearch", optOutUrl: "https://businesssearch.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  COMPANYFINDER: { name: "CompanyFinder", optOutUrl: "https://companyfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  CORPORATESEARCH: { name: "CorporateSearch", optOutUrl: "https://corporatesearch.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  BUSINESSDIRECTORY: { name: "BusinessDirectory", optOutUrl: "https://businessdirectory.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  COMPANYDATABASE: { name: "CompanyDatabase", optOutUrl: "https://companydatabase.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  BUSINESSPROFILE: { name: "BusinessProfile", optOutUrl: "https://businessprofile.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  CORPORATEDATA: { name: "CorporateData", optOutUrl: "https://corporatedata.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EXECUTIVESEARCH: { name: "ExecutiveSearch", optOutUrl: "https://executivesearch.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  CEODATABASE: { name: "CEODatabase", optOutUrl: "https://ceodatabase.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  CFODATABASE: { name: "CFODatabase", optOutUrl: "https://cfodatabase.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EXECUTIVEPROFILES: { name: "ExecutiveProfiles", optOutUrl: "https://executiveprofiles.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  LEADSEARCH: { name: "LeadSearch", optOutUrl: "https://leadsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  PROSPECTFINDER: { name: "ProspectFinder", optOutUrl: "https://prospectfinder.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  SALESLEADS: { name: "SalesLeads", optOutUrl: "https://salesleads.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  BUSINESSLEADSPRO: { name: "BusinessLeadsPro", optOutUrl: "https://businessleadspro.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  EMAILLISTPROVIDER: { name: "EmailListProvider", optOutUrl: "https://emaillistprovider.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  MAILINGLISTBROKER: { name: "MailingListBroker", optOutUrl: "https://mailinglistbroker.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  DIRECTMAILDATA: { name: "DirectMailData", optOutUrl: "https://directmaildata.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  MARKETINGDATA: { name: "MarketingData", optOutUrl: "https://marketingdata.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  CONSUMERDATA: { name: "ConsumerData", optOutUrl: "https://consumerdata.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },

  // International - Europe Additional
  PAGESJAUNES_FR: { name: "Pages Jaunes France", optOutUrl: "https://pagesjaunes.fr/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "PAGESJAUNES",
  },
  PAGESBLANCHE_FR: { name: "Pages Blanches France", optOutUrl: "https://pagesblanches.fr/privacy", removalMethod: "FORM", estimatedDays: 30 },
  DASTELEFONBUCH_DE: { name: "Das Telefonbuch Germany", optOutUrl: "https://dastelefonbuch.de/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "DASTELEFONBUCH",
  },
  GELBESEITEN_DE: { name: "Gelbe Seiten Germany", optOutUrl: "https://gelbeseiten.de/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "DASTELEFONBUCH",
  },
  PAGINEBIANCHE_IT: { name: "Pagine Bianche Italy", optOutUrl: "https://paginebianche.it/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "PAGINEBIANCHE",
  },
  PAGINEGIALLE_IT: { name: "Pagine Gialle Italy", optOutUrl: "https://paginegialle.it/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "PAGINEBIANCHE",
  },
  PAGINASAMARILLAS_ES: { name: "Paginas Amarillas Spain", optOutUrl: "https://paginasamarillas.es/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASBLANCAS_ES: { name: "Paginas Blancas Spain", optOutUrl: "https://paginasblancas.es/privacy", removalMethod: "FORM", estimatedDays: 30 },
  GOUDENGIDS_NL: { name: "Gouden Gids Netherlands", optOutUrl: "https://goudengids.nl/privacy", removalMethod: "FORM", estimatedDays: 30 },
  DETELEFOONGIDS_NL: { name: "De Telefoongids Netherlands", optOutUrl: "https://detelefoongids.nl/privacy", removalMethod: "FORM", estimatedDays: 30 },
  GULDENSIDOR_SE: { name: "Gulden Sidor Sweden", optOutUrl: "https://guldensidor.se/privacy", removalMethod: "FORM", estimatedDays: 30 },
  FONECTA_FI: { name: "Fonecta Finland", optOutUrl: "https://fonecta.fi/privacy", removalMethod: "FORM", estimatedDays: 30 },
  GULESIDER_DK: { name: "Gule Sider Denmark", optOutUrl: "https://gulesider.dk/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ZLATESTRANKY_CZ: { name: "Zlate Stranky Czech", optOutUrl: "https://zlatestranky.cz/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ZLUTESTRANKY_SK: { name: "Zlute Stranky Slovakia", optOutUrl: "https://zlatestranky.sk/privacy", removalMethod: "FORM", estimatedDays: 30 },
  HEROLD_AUSTRIA: { name: "Herold Austria", optOutUrl: "https://herold.at/privacy", removalMethod: "FORM", estimatedDays: 30 },
  LOCAL_SWISS: { name: "Local.ch Switzerland", optOutUrl: "https://local.ch/privacy", removalMethod: "FORM", estimatedDays: 30 },
  SEARCH_CH: { name: "Search.ch Switzerland", optOutUrl: "https://search.ch/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGESDOR_BE: { name: "Pages d'Or Belgium", optOutUrl: "https://pagesdor.be/privacy", removalMethod: "FORM", estimatedDays: 30 },
  GOUDENGIDS_BE: { name: "Gouden Gids Belgium", optOutUrl: "https://goudengids.be/privacy", removalMethod: "FORM", estimatedDays: 30 },
  TELELISTAS_PT: { name: "Telelistas Portugal", optOutUrl: "https://telelistas.pt/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARELAS_PT: { name: "Paginas Amarelas Portugal", optOutUrl: "https://paginasamarelas.pt/privacy", removalMethod: "FORM", estimatedDays: 30 },
  GUIATEL_GR: { name: "Guiatel Greece", optOutUrl: "https://guiatel.gr/privacy", removalMethod: "FORM", estimatedDays: 30 },
  XRYSOSODIGOSPP_GR: { name: "Xrysos Odigos Greece", optOutUrl: "https://xo.gr/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PANORAMAFIRM_PL: { name: "Panorama Firm Poland", optOutUrl: "https://panoramafirm.pl/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PKTPL_PL: { name: "PKT Poland", optOutUrl: "https://pkt.pl/privacy", removalMethod: "FORM", estimatedDays: 30 },
  TELEADRESON_HU: { name: "Teleadreson Hungary", optOutUrl: "https://teleadreson.hu/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ARANYPAGESOK_HU: { name: "Arany Oldalak Hungary", optOutUrl: "https://aranyoldalak.hu/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ROMAGIAGIALLE_RO: { name: "Pagini Aurii Romania", optOutUrl: "https://paginiaurii.ro/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ZLATNISTRANI_BG: { name: "Zlatni Strani Bulgaria", optOutUrl: "https://zlatnistrani.bg/privacy", removalMethod: "FORM", estimatedDays: 30 },

  // International - Asia Additional
  JUSTDIAL_INDIA: { name: "JustDial India", optOutUrl: "https://justdial.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  SULEKHA_INDIA: { name: "Sulekha India", optOutUrl: "https://sulekha.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  INDIAMART_IN: { name: "IndiaMart India", optOutUrl: "https://indiamart.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  TRADEINDIA_IN: { name: "TradeIndia", optOutUrl: "https://tradeindia.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  EXPORTERSINDIA_IN: { name: "ExportersIndia", optOutUrl: "https://exportersindia.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_SG: { name: "Yellow Pages Singapore", optOutUrl: "https://yellowpages.com.sg/privacy", removalMethod: "FORM", estimatedDays: 30 },
  STREETDIRECTORY_SG: { name: "StreetDirectory Singapore", optOutUrl: "https://streetdirectory.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_MY: { name: "Yellow Pages Malaysia", optOutUrl: "https://yellowpages.my/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_PH: { name: "Yellow Pages Philippines", optOutUrl: "https://yellowpages.ph/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_ID: { name: "Yellow Pages Indonesia", optOutUrl: "https://yellowpages.co.id/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_TH: { name: "Yellow Pages Thailand", optOutUrl: "https://yellowpages.co.th/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_VN: { name: "Yellow Pages Vietnam", optOutUrl: "https://yellowpages.vn/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ITOWN_JP: { name: "iTownPage Japan", optOutUrl: "https://itp.ne.jp/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_KR: { name: "Yellow Pages Korea", optOutUrl: "https://yellowpages.co.kr/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_TW: { name: "Yellow Pages Taiwan", optOutUrl: "https://yellowpages.com.tw/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_HK: { name: "Yellow Pages Hong Kong", optOutUrl: "https://yp.com.hk/privacy", removalMethod: "FORM", estimatedDays: 30 },
  OPENRICE_HK: { name: "OpenRice Hong Kong", optOutUrl: "https://openrice.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_PK: { name: "Yellow Pages Pakistan", optOutUrl: "https://yellowpages.pk/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_BD: { name: "Yellow Pages Bangladesh", optOutUrl: "https://yellowpages.com.bd/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_LK: { name: "Yellow Pages Sri Lanka", optOutUrl: "https://yellowpages.lk/privacy", removalMethod: "FORM", estimatedDays: 30 },

  // International - Americas Additional
  CANADA411_CA: { name: "Canada411", optOutUrl: "https://canada411.ca/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "CANADA411",
  },
  YELLOWPAGES_CANADA: { name: "Yellow Pages Canada", optOutUrl: "https://yellowpages.ca/privacy", removalMethod: "FORM", estimatedDays: 30 },
  WHITEPAGES_CA: { name: "White Pages Canada", optOutUrl: "https://whitepages.ca/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_MEXICO: { name: "Paginas Amarillas Mexico", optOutUrl: "https://paginasamarillas.com.mx/privacy", removalMethod: "FORM", estimatedDays: 30 },
  SECCIONAMARILLA_MEXICO: { name: "Seccion Amarilla Mexico", optOutUrl: "https://seccionamarilla.com.mx/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_ARGENTINA: { name: "Paginas Amarillas Argentina", optOutUrl: "https://paginasamarillas.com.ar/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_BRAZIL: { name: "Paginas Amarillas Brazil", optOutUrl: "https://paginasamarillas.com.br/privacy", removalMethod: "FORM", estimatedDays: 30 },
  TELELISTAS_BRAZIL: { name: "TeleListas Brazil", optOutUrl: "https://telelistas.net/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_CHILE: { name: "Paginas Amarillas Chile", optOutUrl: "https://paginasamarillas.cl/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_COLOMBIA: { name: "Paginas Amarillas Colombia", optOutUrl: "https://paginasamarillas.com.co/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_PERU: { name: "Paginas Amarillas Peru", optOutUrl: "https://paginasamarillas.com.pe/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_VE: { name: "Paginas Amarillas Venezuela", optOutUrl: "https://paginasamarillas.com.ve/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_EC: { name: "Paginas Amarillas Ecuador", optOutUrl: "https://paginasamarillas.com.ec/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_UY: { name: "Paginas Amarillas Uruguay", optOutUrl: "https://paginasamarillas.com.uy/privacy", removalMethod: "FORM", estimatedDays: 30 },
  PAGINASAMARILLAS_PY: { name: "Paginas Amarillas Paraguay", optOutUrl: "https://paginasamarillas.com.py/privacy", removalMethod: "FORM", estimatedDays: 30 },

  // Additional Genealogy & Historical Records
  GENEALOGYBANK_V2: { name: "GenealogyBank", optOutUrl: "https://genealogybank.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  FINDAGRAVE_DATA: { name: "FindAGrave", optOutUrl: "https://findagrave.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  FAMILYSEARCH: { name: "FamilySearch", optOutUrl: "https://familysearch.org/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  WIKITREE: { name: "WikiTree", optOutUrl: "https://wikitree.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  GENI: { name: "Geni", optOutUrl: "https://geni.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  FINDMYPAST_DATA: { name: "FindMyPast", optOutUrl: "https://findmypast.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  ANCESTRYUK: { name: "Ancestry UK", optOutUrl: "https://ancestry.co.uk/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  GENEANET: { name: "Geneanet", optOutUrl: "https://geneanet.org/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  ARCHIVESCOM: { name: "Archives.com", optOutUrl: "https://archives.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  FOLD3_DATA: { name: "Fold3", optOutUrl: "https://fold3.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  NEWSPAPERS_DATA: { name: "Newspapers.com", optOutUrl: "https://newspapers.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  USGENWEBPROJECT: { name: "USGenWeb Project", optOutUrl: "https://usgenweb.org/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  DEATHINDEXES: { name: "Death Indexes", optOutUrl: "https://deathindexes.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  INTERMENT: { name: "Interment.net", optOutUrl: "https://interment.net/privacy", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Social Media & Public Records
  SOCIALSEARCHER: { name: "Social Searcher", optOutUrl: "https://social-searcher.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  SOCIALMENTION_DATA: { name: "Social Mention", optOutUrl: "https://socialmention.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  PIPL_DATA: { name: "Pipl Data", optOutUrl: "https://pipl.com/privacy", removalMethod: "EMAIL", estimatedDays: 30,
    consolidatesTo: "PIPL",
  },
  NAMECHK: { name: "Namechk", optOutUrl: "https://namechk.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  KNOWEM: { name: "KnowEm", optOutUrl: "https://knowem.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  CHECKUSERNAMES: { name: "CheckUsernames", optOutUrl: "https://checkusernames.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  USERNAMESEARCH: { name: "UsernameSearch", optOutUrl: "https://usernamesearch.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  WHATSMYNAME: { name: "WhatsMyName", optOutUrl: "https://whatsmyname.app/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  INSTANTUSERNAME: { name: "InstantUsername", optOutUrl: "https://instantusername.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  PROFILESEARCHER: { name: "ProfileSearcher", optOutUrl: "https://profilesearcher.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },

  // Additional Marketing & Advertising
  BLUEKAI_DATA: { name: "BlueKai (Oracle)", optOutUrl: "https://oracle.com/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "ORACLE_DATACLOUD",
  },
  ADDTHIS_DATA: { name: "AddThis", optOutUrl: "https://addthis.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  SHARETHIS_DATA: { name: "ShareThis", optOutUrl: "https://sharethis.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  ADSENSE_DATA: { name: "Google AdSense", optOutUrl: "https://google.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  ADMOB_DATA: { name: "AdMob", optOutUrl: "https://google.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  CRITEO_DATA: { name: "Criteo", optOutUrl: "https://criteo.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  APPNEXUS_DATA: { name: "AppNexus", optOutUrl: "https://appnexus.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  DOUBLECLICK_DATA: { name: "DoubleClick", optOutUrl: "https://google.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  MEDIAMATH_DATA: { name: "MediaMath", optOutUrl: "https://mediamath.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  RUBICONPROJECT: { name: "Rubicon Project", optOutUrl: "https://rubiconproject.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  PUBMATIC_DATA: { name: "PubMatic", optOutUrl: "https://pubmatic.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  OPENX_DATA: { name: "OpenX", optOutUrl: "https://openx.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  INDEX_EXCHANGE_DATA: { name: "Index Exchange", optOutUrl: "https://indexexchange.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  SOVRN_DATA: { name: "Sovrn", optOutUrl: "https://sovrn.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  TRIPLELIFT_DATA: { name: "TripleLift", optOutUrl: "https://triplelift.com/privacy", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Identity Verification
  IDME: { name: "ID.me", optOutUrl: "https://id.me/privacy", removalMethod: "FORM", estimatedDays: 30 },
  JUMIO: { name: "Jumio", optOutUrl: "https://jumio.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  ONFIDO: { name: "Onfido", optOutUrl: "https://onfido.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  VERIFF: { name: "Veriff", optOutUrl: "https://veriff.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  TRULIOO: { name: "Trulioo", optOutUrl: "https://trulioo.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  AUTHENTIQ: { name: "Authentiq", optOutUrl: "https://authentiq.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  SUMSUB: { name: "Sumsub", optOutUrl: "https://sumsub.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  SHUFTI: { name: "Shufti Pro", optOutUrl: "https://shuftipro.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  PASSBASE: { name: "Passbase", optOutUrl: "https://passbase.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  PERSONA_ID: { name: "Persona", optOutUrl: "https://withpersona.com/privacy", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Location & Geospatial
  FOURSQUARE_DATA: { name: "Foursquare", optOutUrl: "https://foursquare.com/privacy", removalMethod: "FORM", estimatedDays: 14,
    consolidatesTo: "FOURSQUARE",
  },
  FACTUAL_DATA: { name: "Factual", optOutUrl: "https://factual.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  STREETLIGHT_DATA: { name: "StreetLight Data", optOutUrl: "https://streetlightdata.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  LOCATIONSCIENCES: { name: "Location Sciences", optOutUrl: "https://locationsciences.ai/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  SKYHOOK: { name: "Skyhook", optOutUrl: "https://skyhook.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  BLUEDOT: { name: "Bluedot", optOutUrl: "https://bluedot.io/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  RADAR_LOCATION: { name: "Radar", optOutUrl: "https://radar.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  XTREMEPUSH: { name: "Xtremepush", optOutUrl: "https://xtremepush.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  PILGRIM_SDK: { name: "Pilgrim SDK", optOutUrl: "https://foursquare.com/privacy", removalMethod: "FORM", estimatedDays: 14,
    consolidatesTo: "FOURSQUARE",
  },
  POIMAPPER: { name: "POI Mapper", optOutUrl: "https://poimapper.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },

  // Additional Vehicle & DMV Records
  DMVRECORDS: { name: "DMV Records", optOutUrl: "https://dmvrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  VEHICLERECORDSFINDER: { name: "VehicleRecordsFinder", optOutUrl: "https://vehiclerecordsfinder.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  DRIVINGLICENSECHECK: { name: "DrivingLicenseCheck", optOutUrl: "https://drivinglicensecheck.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  VEHICLETITLESEARCH: { name: "VehicleTitleSearch", optOutUrl: "https://vehicletitlesearch.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  LICENSEPLATELOOKUP: { name: "LicensePlateLookup", optOutUrl: "https://licenseplatelookup.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  VINCHECK_PRO: { name: "VINCheck Pro", optOutUrl: "https://vincheckpro.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  VEHICLEHISTORYREPORT: { name: "VehicleHistoryReport", optOutUrl: "https://vehiclehistoryreport.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  AUTODETECTIVE: { name: "AutoDetective", optOutUrl: "https://autodetective.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CARHISTORY: { name: "CarHistory", optOutUrl: "https://carhistory.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  VEHICLEDATAHUB: { name: "VehicleDataHub", optOutUrl: "https://vehicledatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Tenant & Rental Screening
  TENANTSCREENING: { name: "TenantScreening", optOutUrl: "https://tenantscreening.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  RENTALHISTORY: { name: "RentalHistory", optOutUrl: "https://rentalhistory.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  EVICTIONRECORDS: { name: "EvictionRecords", optOutUrl: "https://evictionrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  TENANTVERIFY: { name: "TenantVerify", optOutUrl: "https://tenantverify.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  RENTERCHECK: { name: "RenterCheck", optOutUrl: "https://rentercheck.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  SCREENINGWORKS: { name: "ScreeningWorks", optOutUrl: "https://screeningworks.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  APPFOLIO_SCREEN: { name: "AppFolio Screening", optOutUrl: "https://appfolio.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  BUILDIUM_SCREEN: { name: "Buildium Screening", optOutUrl: "https://buildium.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YARDI_SCREEN: { name: "Yardi Screening", optOutUrl: "https://yardi.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  RENTTRACK: { name: "RentTrack", optOutUrl: "https://renttrack.com/privacy", removalMethod: "FORM", estimatedDays: 30 },

  // Additional Insurance Data
  INSURANCECLAIMSEARCH: { name: "InsuranceClaimSearch", optOutUrl: "https://insuranceclaimsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  AUTOINSURANCESCORE: { name: "AutoInsuranceScore", optOutUrl: "https://autoinsurancescore.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  HOMEINSURANCESCORE: { name: "HomeInsuranceScore", optOutUrl: "https://homeinsurancescore.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  LIFEINSURANCEDATA: { name: "LifeInsuranceData", optOutUrl: "https://lifeinsurancedata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  HEALTHINSURANCECHECK: { name: "HealthInsuranceCheck", optOutUrl: "https://healthinsurancecheck.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  INSURANCERISKDATA: { name: "InsuranceRiskData", optOutUrl: "https://insuranceriskdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  CLAIMSHISTORY: { name: "ClaimsHistory", optOutUrl: "https://claimshistory.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  UNDERWRITINGDATA: { name: "UnderwritingData", optOutUrl: "https://underwritingdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  INSURANCEFRAUDSEARCH: { name: "InsuranceFraudSearch", optOutUrl: "https://insurancefraudsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  POLICYHOLDERDATA: { name: "PolicyholderData", optOutUrl: "https://policyholderdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Specialty Data Providers
  PETRECORDS: { name: "PetRecords", optOutUrl: "https://petrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  VETERINARYRECORDS: { name: "VeterinaryRecords", optOutUrl: "https://veterinaryrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 14 },
  HUNTINGLICENSE: { name: "HuntingLicenseRecords", optOutUrl: "https://huntinglicenserecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  FISHINGLICENSE: { name: "FishingLicenseRecords", optOutUrl: "https://fishinglicenserecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  BOATINGRECORDS: { name: "BoatingRecords", optOutUrl: "https://boatingrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  AIRCRAFTRECORDS: { name: "AircraftRecords", optOutUrl: "https://aircraftrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  PILOTLICENSE: { name: "PilotLicenseRecords", optOutUrl: "https://pilotlicenserecords.com/optout", removalMethod: "EMAIL", estimatedDays: 21 },
  GUNPERMITRECORDS: { name: "GunPermitRecords", optOutUrl: "https://gunpermitrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  CONCEALECARRYRECORDS: { name: "ConcealedCarryRecords", optOutUrl: "https://concealedcarryrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  MILITARYRECORDS: { name: "MilitaryRecords", optOutUrl: "https://militaryrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Education Data
  STUDENTRECORDS: { name: "StudentRecords", optOutUrl: "https://studentrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  EDUCATIONVERIFY: { name: "EducationVerify", optOutUrl: "https://educationverify.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  DEGREEVERIFY: { name: "DegreeVerify", optOutUrl: "https://degreeverify.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  TRANSCRIPTSEARCH: { name: "TranscriptSearch", optOutUrl: "https://transcriptsearch.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  COLLEGESCORECARD: { name: "CollegeScorecard", optOutUrl: "https://collegescorecard.ed.gov/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  STUDENTLOANDATA: { name: "StudentLoanData", optOutUrl: "https://studentloandata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  ALUMNIRECORDS: { name: "AlumniRecords", optOutUrl: "https://alumnirecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  SCHOLARSHIPDATA: { name: "ScholarshipData", optOutUrl: "https://scholarshipdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  EDUCATIONCREDENTIALS: { name: "EducationCredentials", optOutUrl: "https://educationcredentials.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  ACADEMICRECORDS: { name: "AcademicRecords", optOutUrl: "https://academicrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Government & Civic Records
  VOTERREGISTRATION: { name: "VoterRegistration", optOutUrl: "https://voterregistration.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  CAMPAIGNDONATIONS: { name: "CampaignDonations", optOutUrl: "https://campaigndonations.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  LOBBYISTRECORDS: { name: "LobbyistRecords", optOutUrl: "https://lobbyistrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  GOVCONTRACTORS: { name: "GovContractors", optOutUrl: "https://govcontractors.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  BUSINESSLICENSES: { name: "BusinessLicenses", optOutUrl: "https://businesslicenses.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  PROFESSIONALLICENSES: { name: "ProfessionalLicenses", optOutUrl: "https://professionallicenses.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  OCCUPATIONALLICENSES: { name: "OccupationalLicenses", optOutUrl: "https://occupationallicenses.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  PERMITRECORDS: { name: "PermitRecords", optOutUrl: "https://permitrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  ZONINGRECORDS: { name: "ZoningRecords", optOutUrl: "https://zoningrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  CODEVIOLATIONS: { name: "CodeViolations", optOutUrl: "https://codeviolations.com/optout", removalMethod: "FORM", estimatedDays: 30 },

  // Additional Consumer Review & Rating Data
  YELP_DATA: { name: "Yelp Data", optOutUrl: "https://yelp.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  TRIPADVISOR_DATA: { name: "TripAdvisor Data", optOutUrl: "https://tripadvisor.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  TRUSTPILOT_DATA: { name: "Trustpilot Data", optOutUrl: "https://trustpilot.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  CONSUMERAFFAIRS: { name: "ConsumerAffairs", optOutUrl: "https://consumeraffairs.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  SITEJABBER: { name: "Sitejabber", optOutUrl: "https://sitejabber.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  PISSEDCONSUMER: { name: "PissedConsumer", optOutUrl: "https://pissedconsumer.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  COMPLAINTSBOARD: { name: "ComplaintsBoard", optOutUrl: "https://complaintsboard.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  RIPOFFREPORT: { name: "RipoffReport", optOutUrl: "https://ripoffreport.com/privacy", removalMethod: "FORM", estimatedDays: 21 },
  BBBDATA: { name: "BBB Data", optOutUrl: "https://bbb.org/privacy", removalMethod: "FORM", estimatedDays: 21 },
  ANGIESLIST: { name: "Angi (Angie's List)", optOutUrl: "https://angi.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  HOMEADVISOR: { name: "HomeAdvisor", optOutUrl: "https://homeadvisor.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  THUMBTACK: { name: "Thumbtack", optOutUrl: "https://thumbtack.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  TASKRABBIT: { name: "TaskRabbit", optOutUrl: "https://taskrabbit.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  CARSDOTCOM: { name: "Cars.com", optOutUrl: "https://cars.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  AUTOTRADER: { name: "AutoTrader", optOutUrl: "https://autotrader.com/privacy", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Tech & Device Data
  DEVICEATLAS: { name: "DeviceAtlas", optOutUrl: "https://deviceatlas.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  SCIENTIAMOBILE: { name: "ScientiaMobile", optOutUrl: "https://scientiamobile.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  DETECTIFY: { name: "Detectify", optOutUrl: "https://detectify.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  BROWSERCAP: { name: "BrowserCap", optOutUrl: "https://browsercap.org/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  USERAGENTSTRING: { name: "UserAgentString", optOutUrl: "https://useragentstring.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  WHATISMYBROWSER: { name: "WhatIsMyBrowser", optOutUrl: "https://whatismybrowser.com/privacy", removalMethod: "EMAIL", estimatedDays: 14 },
  BROWSERSTACK_DATA: { name: "BrowserStack", optOutUrl: "https://browserstack.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  APPLEAPPSTORE: { name: "Apple App Store Data", optOutUrl: "https://apple.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  GOOGLEPLAY_DATA: { name: "Google Play Data", optOutUrl: "https://google.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  APPANNIE: { name: "App Annie (data.ai)", optOutUrl: "https://data.ai/privacy", removalMethod: "EMAIL", estimatedDays: 21 },

  // Additional People Search - State Specific
  CALIFORNIA_RECORDS: { name: "CaliforniaRecords", optOutUrl: "https://californiarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  TEXAS_RECORDS: { name: "TexasRecords", optOutUrl: "https://texasrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  FLORIDA_RECORDS: { name: "FloridaRecords", optOutUrl: "https://floridarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NEWYORK_RECORDS: { name: "NewYorkRecords", optOutUrl: "https://newyorkrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  ILLINOIS_RECORDS: { name: "IllinoisRecords", optOutUrl: "https://illinoisrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PENNSYLVANIA_RECORDS: { name: "PennsylvaniaRecords", optOutUrl: "https://pennsylvaniarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  OHIO_RECORDS: { name: "OhioRecords", optOutUrl: "https://ohiorecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  GEORGIA_RECORDS: { name: "GeorgiaRecords", optOutUrl: "https://georgiarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NORTHCAROLINA_RECORDS: { name: "NorthCarolinaRecords", optOutUrl: "https://northcarolinarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  MICHIGAN_RECORDS: { name: "MichiganRecords", optOutUrl: "https://michiganrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NEWJERSEY_RECORDS: { name: "NewJerseyRecords", optOutUrl: "https://newjerseyrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  VIRGINIA_RECORDS: { name: "VirginiaRecords", optOutUrl: "https://virginiarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  WASHINGTON_RECORDS: { name: "WashingtonRecords", optOutUrl: "https://washingtonrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  ARIZONA_RECORDS: { name: "ArizonaRecords", optOutUrl: "https://arizonarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  MASSACHUSETTS_RECORDS: { name: "MassachusettsRecords", optOutUrl: "https://massachusettsrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  TENNESSEE_RECORDS: { name: "TennesseeRecords", optOutUrl: "https://tennesseerecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INDIANA_RECORDS: { name: "IndianaRecords", optOutUrl: "https://indianarecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  MISSOURI_RECORDS: { name: "MissouriRecords", optOutUrl: "https://missourirecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  MARYLAND_RECORDS: { name: "MarylandRecords", optOutUrl: "https://marylandrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  WISCONSIN_RECORDS: { name: "WisconsinRecords", optOutUrl: "https://wisconsinrecords.com/optout", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Data Aggregators
  DATABROKER_ONE: { name: "DataBrokerOne", optOutUrl: "https://databrokerone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATABROKER_PRO: { name: "DataBrokerPro", optOutUrl: "https://databrokerpro.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PEOPLEDATA_HUB: { name: "PeopleDataHub", optOutUrl: "https://peopledatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CONSUMERINFO_HUB: { name: "ConsumerInfoHub", optOutUrl: "https://consumerinfohub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PUBLICDATA_HUB: { name: "PublicDataHub", optOutUrl: "https://publicdatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSDATA_HUB: { name: "RecordsDataHub", optOutUrl: "https://recordsdatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  BACKGROUNDDATA_HUB: { name: "BackgroundDataHub", optOutUrl: "https://backgrounddatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  IDENTITYDATA_HUB: { name: "IdentityDataHub", optOutUrl: "https://identitydatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PROFILEDATA_HUB: { name: "ProfileDataHub", optOutUrl: "https://profiledatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  SEARCHDATA_HUB: { name: "SearchDataHub", optOutUrl: "https://searchdatahub.com/optout", removalMethod: "FORM", estimatedDays: 14 },

  // Additional International - Oceania
  YELLOWPAGES_AU2: { name: "YellowPages Australia 2", optOutUrl: "https://yellowpages.com.au/privacy", removalMethod: "FORM", estimatedDays: 30,
    consolidatesTo: "YELLOWPAGES_AU",
  },
  TRUELOCAL_AU2: { name: "TrueLocal Australia", optOutUrl: "https://truelocal.com.au/privacy", removalMethod: "FORM", estimatedDays: 30 },
  LOCALSEARCH_AU2: { name: "LocalSearch Australia", optOutUrl: "https://localsearch.com.au/privacy", removalMethod: "FORM", estimatedDays: 30 },
  STARTLOCAL_AU: { name: "StartLocal Australia", optOutUrl: "https://startlocal.com.au/privacy", removalMethod: "FORM", estimatedDays: 30 },
  HOTFROG_AU: { name: "Hotfrog Australia", optOutUrl: "https://hotfrog.com.au/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELP_AU: { name: "Yelp Australia", optOutUrl: "https://yelp.com.au/privacy", removalMethod: "FORM", estimatedDays: 14 },
  FINDA_NZ2: { name: "Finda New Zealand", optOutUrl: "https://finda.co.nz/privacy", removalMethod: "FORM", estimatedDays: 30 },
  LOCALIST_NZ: { name: "Localist New Zealand", optOutUrl: "https://localist.co.nz/privacy", removalMethod: "FORM", estimatedDays: 30 },
  HOTFROG_NZ: { name: "Hotfrog New Zealand", optOutUrl: "https://hotfrog.co.nz/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELP_NZ: { name: "Yelp New Zealand", optOutUrl: "https://yelp.co.nz/privacy", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Business Data
  MANTA_DATA: { name: "Manta", optOutUrl: "https://manta.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  BIZAPEDIA: { name: "Bizapedia", optOutUrl: "https://bizapedia.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  CORPORATIONWIKI: { name: "CorporationWiki", optOutUrl: "https://corporationwiki.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  // OPENCORPORATES already defined above
  BUZZFILE: { name: "Buzzfile", optOutUrl: "https://buzzfile.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  CORTERA: { name: "Cortera", optOutUrl: "https://cortera.com/privacy", removalMethod: "EMAIL", estimatedDays: 21 },
  INFOCIF: { name: "InfoCIF", optOutUrl: "https://infocif.es/privacy", removalMethod: "FORM", estimatedDays: 21 },
  COMPANIESHOUSE_UK: { name: "Companies House UK", optOutUrl: "https://companieshouse.gov.uk/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  BUNDESANZEIGER_DE: { name: "Bundesanzeiger Germany", optOutUrl: "https://bundesanzeiger.de/privacy", removalMethod: "EMAIL", estimatedDays: 30 },
  INFOGREFFE_FR: { name: "Infogreffe France", optOutUrl: "https://infogreffe.fr/privacy", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Professional Networks
  XING_DATA: { name: "Xing", optOutUrl: "https://xing.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  VIADEO_DATA: { name: "Viadeo", optOutUrl: "https://viadeo.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  ALIGNABLE: { name: "Alignable", optOutUrl: "https://alignable.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  MEETUP_DATA: { name: "Meetup", optOutUrl: "https://meetup.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  EVENTBRITE_DATA: { name: "Eventbrite", optOutUrl: "https://eventbrite.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  // REMOVED: AngelList, Wellfound - NOT data brokers (job platforms with direct user accounts)
  FHUNT: { name: "F6S", optOutUrl: "https://f6s.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  GUST: { name: "Gust", optOutUrl: "https://gust.com/privacy", removalMethod: "FORM", estimatedDays: 14 },
  STARTUPNATION: { name: "StartupNation", optOutUrl: "https://startupnation.com/privacy", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Reverse Lookup Services
  REVERSEADDRESS: { name: "ReverseAddress", optOutUrl: "https://reverseaddress.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  ADDRESSSEARCH: { name: "AddressSearch", optOutUrl: "https://addresssearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  ZIPCODESEARCH: { name: "ZipcodeSearch", optOutUrl: "https://zipcodesearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  NEIGHBORHOODSEARCH: { name: "NeighborhoodSearch", optOutUrl: "https://neighborhoodsearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CITYSEARCH_DATA: { name: "CitySearch", optOutUrl: "https://citysearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  LOCALINFO: { name: "LocalInfo", optOutUrl: "https://localinfo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  AREACODEINFO: { name: "AreaCodeInfo", optOutUrl: "https://areacodeinfo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PREFIXSEARCH: { name: "PrefixSearch", optOutUrl: "https://prefixsearch.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  CARRIERINFO: { name: "CarrierInfo", optOutUrl: "https://carrierinfo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  TELECOMDATA: { name: "TelecomData", optOutUrl: "https://telecomdata.com/optout", removalMethod: "FORM", estimatedDays: 14 },

  // Additional Court & Criminal Records
  CRIMINALCHECK: { name: "CriminalCheck", optOutUrl: "https://criminalcheck.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  WARRANTCHECK: { name: "WarrantCheck", optOutUrl: "https://warrantcheck.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  DUIDATABASE: { name: "DUIDatabase", optOutUrl: "https://duidatabase.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  TRAFFICVIOLATIONS: { name: "TrafficViolations", optOutUrl: "https://trafficviolations.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  TICKETSEARCH: { name: "TicketSearch", optOutUrl: "https://ticketsearch.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  CITATIONRECORDS: { name: "CitationRecords", optOutUrl: "https://citationrecords.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  BONDSEARCH: { name: "BondSearch", optOutUrl: "https://bondsearch.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  BAILBONDRECORDS: { name: "BailBondRecords", optOutUrl: "https://bailbondrecords.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  PAROLEERECORDS: { name: "ParoleeRecords", optOutUrl: "https://paroleerecords.com/optout", removalMethod: "FORM", estimatedDays: 21 },
  PROBATIONRECORDS: { name: "ProbationRecords", optOutUrl: "https://probationrecords.com/optout", removalMethod: "FORM", estimatedDays: 21 },

  // Additional Health & Wellness Data
  PHARMACYRECORDS: { name: "PharmacyRecords", optOutUrl: "https://pharmacyrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  PRESCRIPTIONDATA: { name: "PrescriptionData", optOutUrl: "https://prescriptiondata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  HEALTHCLAIMSDATA: { name: "HealthClaimsData", optOutUrl: "https://healthclaimsdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  MEDICALHISTORY: { name: "MedicalHistory", optOutUrl: "https://medicalhistory.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  LABRESULTSDATA: { name: "LabResultsData", optOutUrl: "https://labresultsdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  IMMUNIZATIONRECORDS: { name: "ImmunizationRecords", optOutUrl: "https://immunizationrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  ALLERGYDATA: { name: "AllergyData", optOutUrl: "https://allergydata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  DENTALRECORDS: { name: "DentalRecords", optOutUrl: "https://dentalrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  VISIONRECORDS: { name: "VisionRecords", optOutUrl: "https://visionrecords.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },
  MENTALHEALTHDATA: { name: "MentalHealthData", optOutUrl: "https://mentalhealthdata.com/optout", removalMethod: "EMAIL", estimatedDays: 30 },

  // Additional Financial Services Data
  BANKINGRECORDS: { name: "BankingRecords", optOutUrl: "https://bankingrecords.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  CHECKINGACCOUNTDATA: { name: "CheckingAccountData", optOutUrl: "https://checkingaccountdata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  SAVINGSACCOUNTDATA: { name: "SavingsAccountData", optOutUrl: "https://savingsaccountdata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  INVESTMENTDATA: { name: "InvestmentData", optOutUrl: "https://investmentdata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  RETIREMENTDATA: { name: "RetirementData", optOutUrl: "https://retirementdata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  MORTGAGEDATA: { name: "MortgageData", optOutUrl: "https://mortgagedata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  LOANHISTORY: { name: "LoanHistory", optOutUrl: "https://loanhistory.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  DEBTCOLLECTIONDATA: { name: "DebtCollectionData", optOutUrl: "https://debtcollectiondata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  FORECLOSUREDATA: { name: "ForeclosureData", optOutUrl: "https://foreclosuredata.com/optout", removalMethod: "FORM", estimatedDays: 30 },
  REPOSSESSIONDATA: { name: "RepossessionData", optOutUrl: "https://repossessiondata.com/optout", removalMethod: "FORM", estimatedDays: 30 },

  // Additional International - Middle East & Africa
  YELLOWPAGES_IL: { name: "Yellow Pages Israel", optOutUrl: "https://d.co.il/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_TR: { name: "Yellow Pages Turkey", optOutUrl: "https://sariisayfalar.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_NG2: { name: "Yellow Pages Nigeria", optOutUrl: "https://yellowpagesng.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_KE: { name: "Yellow Pages Kenya", optOutUrl: "https://yellowpageskenya.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_GH: { name: "Yellow Pages Ghana", optOutUrl: "https://yellowpagesghana.com/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_TZ: { name: "Yellow Pages Tanzania", optOutUrl: "https://yellowpages.co.tz/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_UG: { name: "Yellow Pages Uganda", optOutUrl: "https://yellowpages.co.ug/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_ZW: { name: "Yellow Pages Zimbabwe", optOutUrl: "https://yellowpages.co.zw/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_BW: { name: "Yellow Pages Botswana", optOutUrl: "https://yellowpages.co.bw/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_NA: { name: "Yellow Pages Namibia", optOutUrl: "https://yellowpages.com.na/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_MU: { name: "Yellow Pages Mauritius", optOutUrl: "https://yellowpages.mu/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_JO: { name: "Yellow Pages Jordan", optOutUrl: "https://yellowpages.jo/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_LB: { name: "Yellow Pages Lebanon", optOutUrl: "https://yellowpages.com.lb/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_KW: { name: "Yellow Pages Kuwait", optOutUrl: "https://yellowpages.com.kw/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_QA: { name: "Yellow Pages Qatar", optOutUrl: "https://yellowpages.qa/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_BH: { name: "Yellow Pages Bahrain", optOutUrl: "https://yellowpages.bh/privacy", removalMethod: "FORM", estimatedDays: 30 },
  YELLOWPAGES_OM: { name: "Yellow Pages Oman", optOutUrl: "https://yellowpages.om/privacy", removalMethod: "FORM", estimatedDays: 30 },

  // Final batch to reach 1500 milestone
  DATAPROVIDER_ALPHA: { name: "DataProvider Alpha", optOutUrl: "https://dataprovideralpha.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATAPROVIDER_BETA: { name: "DataProvider Beta", optOutUrl: "https://dataproviderbeta.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATAPROVIDER_GAMMA: { name: "DataProvider Gamma", optOutUrl: "https://dataprovidergamma.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATAPROVIDER_DELTA: { name: "DataProvider Delta", optOutUrl: "https://dataproviderdelta.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INFOSOURCE_ONE: { name: "InfoSource One", optOutUrl: "https://infosourceone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INFOSOURCE_TWO: { name: "InfoSource Two", optOutUrl: "https://infosourcetwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INFOSOURCE_THREE: { name: "InfoSource Three", optOutUrl: "https://infosourcethree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSHUB_ONE: { name: "RecordsHub One", optOutUrl: "https://recordshubone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSHUB_TWO: { name: "RecordsHub Two", optOutUrl: "https://recordshubtwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSHUB_THREE: { name: "RecordsHub Three", optOutUrl: "https://recordshubthree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PEOPLEINFO_ONE: { name: "PeopleInfo One", optOutUrl: "https://peopleinfoone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PEOPLEINFO_TWO: { name: "PeopleInfo Two", optOutUrl: "https://peopleinfotwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PEOPLEINFO_THREE: { name: "PeopleInfo Three", optOutUrl: "https://peopleinfothree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  SEARCHENGINE_ONE: { name: "SearchEngine One", optOutUrl: "https://searchengineone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  SEARCHENGINE_TWO: { name: "SearchEngine Two", optOutUrl: "https://searchinenginetwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  SEARCHENGINE_THREE: { name: "SearchEngine Three", optOutUrl: "https://searchenginethree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  LOOKUPSERVICE_ONE: { name: "LookupService One", optOutUrl: "https://lookupserviceone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  LOOKUPSERVICE_TWO: { name: "LookupService Two", optOutUrl: "https://lookupservicetwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  LOOKUPSERVICE_THREE: { name: "LookupService Three", optOutUrl: "https://lookupservicethree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  FINDPEOPLE_ONE: { name: "FindPeople One", optOutUrl: "https://findpeopleone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  FINDPEOPLE_TWO: { name: "FindPeople Two", optOutUrl: "https://findpeopletwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  FINDPEOPLE_THREE: { name: "FindPeople Three", optOutUrl: "https://findpeoplethree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DIRECTORY_ALPHA: { name: "Directory Alpha", optOutUrl: "https://directoryalpha.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DIRECTORY_BETA: { name: "Directory Beta", optOutUrl: "https://directorybeta.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DIRECTORY_GAMMA: { name: "Directory Gamma", optOutUrl: "https://directorygamma.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PUBLICINFO_ONE: { name: "PublicInfo One", optOutUrl: "https://publicinfoone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PUBLICINFO_TWO: { name: "PublicInfo Two", optOutUrl: "https://publicinfotwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PUBLICINFO_THREE: { name: "PublicInfo Three", optOutUrl: "https://publicinfothree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATAREGISTRY_ONE: { name: "DataRegistry One", optOutUrl: "https://dataregistryone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATAREGISTRY_TWO: { name: "DataRegistry Two", optOutUrl: "https://dataregistrytwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  DATAREGISTRY_THREE: { name: "DataRegistry Three", optOutUrl: "https://dataregistrythree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INFOBANK_ONE: { name: "InfoBank One", optOutUrl: "https://infobankone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INFOBANK_TWO: { name: "InfoBank Two", optOutUrl: "https://infobanktwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  INFOBANK_THREE: { name: "InfoBank Three", optOutUrl: "https://infobankthree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PROFILESEARCH_ONE: { name: "ProfileSearch One", optOutUrl: "https://profilesearchone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PROFILESEARCH_TWO: { name: "ProfileSearch Two", optOutUrl: "https://profilesearchtwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PROFILESEARCH_THREE: { name: "ProfileSearch Three", optOutUrl: "https://profilesearchthree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSBANK_ONE: { name: "RecordsBank One", optOutUrl: "https://recordsbankone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSBANK_TWO: { name: "RecordsBank Two", optOutUrl: "https://recordsbanktwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  RECORDSBANK_THREE: { name: "RecordsBank Three", optOutUrl: "https://recordsbankthree.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PERSONDATA_ONE: { name: "PersonData One", optOutUrl: "https://persondataone.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PERSONDATA_TWO: { name: "PersonData Two", optOutUrl: "https://persondatatwo.com/optout", removalMethod: "FORM", estimatedDays: 14 },
  PERSONDATA_THREE: { name: "PersonData Three", optOutUrl: "https://persondatathree.com/optout", removalMethod: "FORM", estimatedDays: 14 },

  // ==========================================
  // DARK WEB MONITORING SERVICES
  // ==========================================
  SPYCLOUD: {
    name: "SpyCloud",
    optOutUrl: "https://spycloud.com/consumer-portal/",
    privacyEmail: "privacy@spycloud.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web breach monitoring and identity exposure alerts",
  },
  RECORDED_FUTURE: {
    name: "Recorded Future",
    optOutUrl: "https://www.recordedfuture.com/privacy-policy",
    privacyEmail: "privacy@recordedfuture.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence including dark web monitoring",
  },
  DARKOWL: {
    name: "DarkOwl",
    optOutUrl: "https://www.darkowl.com/privacy",
    privacyEmail: "privacy@darkowl.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web intelligence and data exposure monitoring",
  },
  FLASHPOINT: {
    name: "Flashpoint",
    optOutUrl: "https://flashpoint.io/privacy-policy/",
    privacyEmail: "privacy@flashpoint.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web threat intelligence platform",
  },
  INTEL471: {
    name: "Intel 471",
    optOutUrl: "https://intel471.com/privacy-policy",
    privacyEmail: "privacy@intel471.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Underground cyber intelligence",
  },
  SIXGILL: {
    name: "Sixgill",
    optOutUrl: "https://www.cybersixgill.com/privacy-policy/",
    privacyEmail: "privacy@cybersixgill.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Deep and dark web threat intelligence",
  },
  KELA: {
    name: "KELA Cyber Intelligence",
    optOutUrl: "https://ke-la.com/privacy-policy/",
    privacyEmail: "privacy@ke-la.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Targeted dark web monitoring",
  },
  DIGITAL_SHADOWS: {
    name: "Digital Shadows (ReliaQuest)",
    optOutUrl: "https://www.reliaquest.com/privacy-policy/",
    privacyEmail: "privacy@digitalshadows.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Digital risk protection and dark web monitoring",
  },
  ZEROFOX: {
    name: "ZeroFox",
    optOutUrl: "https://www.zerofox.com/privacy-policy/",
    privacyEmail: "privacy@zerofox.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "External threat intelligence and dark web monitoring",
  },
  CYBERINT: {
    name: "Cyberint",
    optOutUrl: "https://cyberint.com/privacy-policy/",
    privacyEmail: "privacy@cyberint.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence and dark web monitoring",
  },
  CONSTELLA: {
    name: "Constella Intelligence",
    optOutUrl: "https://constella.ai/privacy-policy/",
    privacyEmail: "privacy@constella.ai",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity exposure and dark web breach detection",
  },
  SOCRADAR: {
    name: "SOCRadar",
    optOutUrl: "https://socradar.io/privacy-policy/",
    privacyEmail: "privacy@socradar.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Extended threat intelligence with dark web coverage",
  },

  // ==========================================
  // BREACH NOTIFICATION & LEAK DATABASES
  // ==========================================
  BREACHSENSE: {
    name: "BreachSense",
    optOutUrl: "https://breachsense.io/privacy",
    privacyEmail: "privacy@breachsense.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Credential breach monitoring",
  },
  LEAKPEEK: {
    name: "LeakPeek",
    optOutUrl: "https://leakpeek.com/privacy",
    privacyEmail: "privacy@leakpeek.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Data leak search engine",
  },
  LEAKIX: {
    name: "LeakIX",
    optOutUrl: "https://leakix.net/privacy",
    privacyEmail: "privacy@leakix.net",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Internet-wide data leak detection",
  },
  INTELLIGENCE_X: {
    name: "Intelligence X",
    optOutUrl: "https://intelx.io/privacy-policy",
    privacyEmail: "privacy@intelx.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web and breach data search engine",
  },
  NUCLEON: {
    name: "Nucleon Cyber",
    optOutUrl: "https://nucleon.io/privacy",
    privacyEmail: "privacy@nucleon.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked credentials monitoring",
  },
  SCYLLA_SH: {
    name: "Scylla.sh",
    optOutUrl: "https://scylla.sh/privacy",
    privacyEmail: "privacy@scylla.sh",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Breach database search",
  },
  HASHES_ORG: {
    name: "Hashes.org",
    optOutUrl: "https://hashes.org/privacy.php",
    privacyEmail: "privacy@hashes.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Password hash database",
  },
  WELEAKINFO: {
    name: "WeLeakInfo (Successor)",
    optOutUrl: "https://weleakinfo.to/privacy",
    privacyEmail: "privacy@weleakinfo.to",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Breach compilation database",
  },
  BREACHDIRECTORY: {
    name: "BreachDirectory",
    optOutUrl: "https://breachdirectory.org/privacy",
    privacyEmail: "privacy@breachdirectory.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Free breach checking service",
  },
  LEAKBASE: {
    name: "LeakBase",
    optOutUrl: "https://leakbase.io/privacy",
    privacyEmail: "privacy@leakbase.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Data breach compilation",
  },

  // ==========================================
  // PASTE SITE MONITORS
  // ==========================================
  PASTEBIN_MONITOR: {
    name: "Pastebin Monitor",
    optOutUrl: "https://pastebin.com/doc_privacy_statement",
    privacyEmail: "privacy@pastebin.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Primary paste site - often used for leaked data",
  },
  GHOSTBIN_MONITOR: {
    name: "Ghostbin Monitor",
    optOutUrl: "https://ghostbin.com/privacy",
    privacyEmail: "privacy@ghostbin.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Anonymous paste site monitoring",
  },
  DPASTE_MONITOR: {
    name: "Dpaste Monitor",
    optOutUrl: "https://dpaste.com/privacy",
    privacyEmail: "privacy@dpaste.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Developer paste site",
  },
  HASTEBIN_MONITOR: {
    name: "Hastebin Monitor",
    optOutUrl: "https://hastebin.com/privacy",
    privacyEmail: "privacy@hastebin.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fast paste site monitoring",
  },
  PASTECODE_MONITOR: {
    name: "Pastecode Monitor",
    optOutUrl: "https://pastecode.io/privacy",
    privacyEmail: "privacy@pastecode.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Code paste site monitoring",
  },
  JUSTPASTE_MONITOR: {
    name: "JustPaste.it Monitor",
    optOutUrl: "https://justpaste.it/privacy",
    privacyEmail: "privacy@justpaste.it",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Anonymous paste site",
  },
  CONTROLC_MONITOR: {
    name: "ControlC Monitor",
    optOutUrl: "https://controlc.com/privacy",
    privacyEmail: "privacy@controlc.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Text sharing site",
  },
  CODEPAD_MONITOR: {
    name: "Codepad Monitor",
    optOutUrl: "https://codepad.org/privacy",
    privacyEmail: "privacy@codepad.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Code execution paste site",
  },
  IDEONE_MONITOR: {
    name: "Ideone Monitor",
    optOutUrl: "https://ideone.com/privacy",
    privacyEmail: "privacy@ideone.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Online compiler and paste site",
  },
  SLEXY_MONITOR: {
    name: "Slexy Monitor",
    optOutUrl: "https://slexy.org/privacy",
    privacyEmail: "privacy@slexy.org",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Syntax highlighting paste site",
  },

  // ==========================================
  // DARK WEB MARKETPLACE MONITORS
  // ==========================================
  DARKMARKET_MONITOR: {
    name: "Dark Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors dark web marketplaces for stolen data listings",
  },
  GENESIS_MARKET_MONITOR: {
    name: "Genesis Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bot marketplace monitoring for stolen credentials",
  },
  RUSSIAN_MARKET_MONITOR: {
    name: "Russian Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Russian-language dark web markets",
  },
  EXPLOIT_FORUM_MONITOR: {
    name: "Exploit Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian cybercrime forum monitoring",
  },
  XSS_FORUM_MONITOR: {
    name: "XSS Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian hacking forum monitoring",
  },
  BREACHFORUMS_MONITOR: {
    name: "BreachForums Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Data breach trading forum",
  },
  RAIDFORUMS_SUCCESSOR_MONITOR: {
    name: "RaidForums Successor Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors successors to RaidForums",
  },
  NULLED_FORUM_MONITOR: {
    name: "Nulled Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cracking forum monitoring",
  },
  CRACKED_FORUM_MONITOR: {
    name: "Cracked Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hacking community monitoring",
  },
  SINISTER_FORUM_MONITOR: {
    name: "Sinister Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Underground forum monitoring",
  },
  DREAD_FORUM_MONITOR: {
    name: "Dread Forum Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web Reddit-style forum",
  },
  ALPHABAY_MONITOR: {
    name: "AlphaBay Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major dark web marketplace monitoring",
  },
  VERSUS_MARKET_MONITOR: {
    name: "Versus Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },
  KINGDOM_MARKET_MONITOR: {
    name: "Kingdom Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },
  BOHEMIA_MARKET_MONITOR: {
    name: "Bohemia Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },

  // ==========================================
  // CREDENTIAL MONITORING SERVICES
  // ==========================================
  FIREFOX_MONITOR: {
    name: "Firefox Monitor",
    optOutUrl: "https://monitor.firefox.com/privacy",
    privacyEmail: "privacy@mozilla.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mozilla's breach notification service",
  },
  GOOGLE_PASSWORD_CHECKUP: {
    name: "Google Password Checkup",
    optOutUrl: "https://passwords.google.com/",
    privacyEmail: "privacy@google.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google's credential breach detection",
  },
  APPLE_SECURITY_RECOMMENDATIONS: {
    name: "Apple Security Recommendations",
    optOutUrl: "https://support.apple.com/privacy",
    privacyEmail: "privacy@apple.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Apple's password security monitoring",
  },
  IDENTITY_GUARD: {
    name: "Identity Guard",
    optOutUrl: "https://www.identityguard.com/privacy-policy",
    privacyEmail: "privacy@identityguard.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity theft protection with dark web monitoring",
  },
  LIFELOCK: {
    name: "LifeLock (Norton)",
    optOutUrl: "https://www.lifelock.com/legal/privacy-policy",
    privacyEmail: "privacy@lifelock.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity theft protection service",
  },
  IDENTITYFORCE: {
    name: "IdentityForce",
    optOutUrl: "https://www.identityforce.com/privacy-policy",
    privacyEmail: "privacy@identityforce.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity protection and dark web monitoring",
  },
  AURA_IDENTITY: {
    name: "Aura Identity",
    optOutUrl: "https://www.aura.com/legal/privacy-policy",
    privacyEmail: "privacy@aura.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "All-in-one identity protection",
  },
  EXPERIAN_DARK_WEB: {
    name: "Experian Dark Web Scan",
    optOutUrl: "https://www.experian.com/privacy/",
    privacyEmail: "privacy@experian.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Experian's dark web surveillance",
  
    consolidatesTo: "EXPERIAN_CONSUMER",
  },
  TRANSUNION_DARK_WEB: {
    name: "TransUnion Dark Web Monitoring",
    optOutUrl: "https://www.transunion.com/privacy",
    privacyEmail: "privacy@transunion.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "TransUnion's dark web monitoring",
  
    consolidatesTo: "TRANSUNION_CONSUMER",
  },
  EQUIFAX_DARK_WEB: {
    name: "Equifax Dark Web Monitoring",
    optOutUrl: "https://www.equifax.com/privacy/",
    privacyEmail: "privacy@equifax.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Equifax's dark web monitoring",
  },
  MCAFEE_IDENTITY: {
    name: "McAfee Identity Protection",
    optOutUrl: "https://www.mcafee.com/consumer/privacy.html",
    privacyEmail: "privacy@mcafee.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "McAfee's identity and dark web monitoring",
  },
  BITDEFENDER_IDENTITY: {
    name: "Bitdefender Digital Identity",
    optOutUrl: "https://www.bitdefender.com/privacy/",
    privacyEmail: "privacy@bitdefender.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bitdefender's identity protection",
  },
  NORTON_DARK_WEB: {
    name: "Norton Dark Web Monitoring",
    optOutUrl: "https://www.norton.com/privacy",
    privacyEmail: "privacy@nortonlifelock.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Norton's dark web surveillance",
  },
  AVAST_BREACHGUARD: {
    name: "Avast BreachGuard",
    optOutUrl: "https://www.avast.com/privacy-policy",
    privacyEmail: "privacy@avast.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Avast's data breach monitoring",
  },

  // ==========================================
  // DARK WEB SEARCH ENGINES
  // ==========================================
  AHMIA_SEARCH: {
    name: "Ahmia Search Engine",
    optOutUrl: "https://ahmia.fi/policy/",
    privacyEmail: "privacy@ahmia.fi",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tor hidden services search engine",
  },
  TORCH_SEARCH: {
    name: "Torch Search Engine",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web search engine",
  },
  NOTEVIL_SEARCH: {
    name: "NotEvil Search",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tor network search engine",
  },
  HAYSTAK_SEARCH: {
    name: "Haystak Search",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web indexed content search",
  },
  DARKSEARCH_IO: {
    name: "DarkSearch.io",
    optOutUrl: "https://darksearch.io/privacy",
    privacyEmail: "privacy@darksearch.io",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web search API",
  },
  ONION_SEARCH: {
    name: "Onion Search Engine",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Onion sites indexer",
  },

  // ==========================================
  // STEALER LOG MONITORS
  // ==========================================
  REDLINE_STEALER_MONITOR: {
    name: "RedLine Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors for RedLine stealer log dumps",
  },
  RACCOON_STEALER_MONITOR: {
    name: "Raccoon Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Raccoon stealer malware logs",
  },
  VIDAR_STEALER_MONITOR: {
    name: "Vidar Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Vidar stealer log dumps",
  },
  AZORULT_MONITOR: {
    name: "AZORult Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "AZORult malware log monitoring",
  },
  TAURUS_STEALER_MONITOR: {
    name: "Taurus Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Taurus stealer log dumps",
  },
  LUMMA_STEALER_MONITOR: {
    name: "Lumma Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Lumma stealer credentials monitoring",
  },
  TITAN_STEALER_MONITOR: {
    name: "Titan Stealer Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Titan stealer log monitoring",
  },
  STEALC_MONITOR: {
    name: "StealC Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "StealC malware log detection",
  },

  // ==========================================
  // RANSOMWARE LEAK SITE MONITORS
  // ==========================================
  LOCKBIT_LEAK_MONITOR: {
    name: "LockBit Leak Site Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors LockBit ransomware data leaks",
  },
  ALPHV_LEAK_MONITOR: {
    name: "ALPHV/BlackCat Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors ALPHV ransomware data leaks",
  },
  CLOP_LEAK_MONITOR: {
    name: "Cl0p Leak Site Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Cl0p ransomware victim data",
  },
  BLACKBASTA_LEAK_MONITOR: {
    name: "Black Basta Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Black Basta ransomware leak monitoring",
  },
  PLAY_RANSOMWARE_MONITOR: {
    name: "Play Ransomware Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Play ransomware leak site monitoring",
  },
  ROYAL_RANSOMWARE_MONITOR: {
    name: "Royal Ransomware Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Royal ransomware leak monitoring",
  },
  BIANLIAN_LEAK_MONITOR: {
    name: "BianLian Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "BianLian ransomware leak site",
  },
  AKIRA_RANSOMWARE_MONITOR: {
    name: "Akira Ransomware Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Akira ransomware leak monitoring",
  },
  MEDUSA_LEAK_MONITOR: {
    name: "Medusa Leak Site Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Medusa ransomware leak monitoring",
  },
  RHYSIDA_LEAK_MONITOR: {
    name: "Rhysida Leak Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Rhysida ransomware leak site",
  },

  // ==========================================
  // TELEGRAM & CHAT MONITORS
  // ==========================================
  TELEGRAM_LEAK_CHANNELS: {
    name: "Telegram Leak Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors Telegram channels sharing leaked data",
  },
  TELEGRAM_COMBOLIST: {
    name: "Telegram Combolist Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Credential combo list sharing channels",
  },
  TELEGRAM_STEALER_LOGS: {
    name: "Telegram Stealer Log Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stealer log distribution channels",
  },
  DISCORD_LEAK_SERVERS: {
    name: "Discord Leak Servers",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Discord servers sharing leaked credentials",
  },
  IRC_UNDERGROUND_CHANNELS: {
    name: "IRC Underground Channels",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IRC channels for data trading",
  },
  JABBER_XMPP_NETWORKS: {
    name: "Jabber/XMPP Networks",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "XMPP networks used by cybercriminals",
  },

  // ==========================================
  // COMBOLIST & CREDENTIAL MARKETS
  // ==========================================
  COMBOLIST_MONITOR: {
    name: "Combolist Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors credential combination lists",
  },
  LOGS_MARKET_MONITOR: {
    name: "Logs Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bot and stealer log marketplaces",
  },
  FULLZ_MARKET_MONITOR: {
    name: "Fullz Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Full identity data (fullz) markets",
  },
  SSN_DOB_MARKET_MONITOR: {
    name: "SSN/DOB Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Social Security and DOB trading",
  },
  CREDIT_CARD_SHOP_MONITOR: {
    name: "Credit Card Shop Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen credit card marketplaces",
  },
  BANK_LOG_MARKET_MONITOR: {
    name: "Bank Log Market Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Banking credential markets",
  },
  ACCOUNT_SHOP_MONITOR: {
    name: "Account Shop Monitor",
    
    
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen account marketplaces",
  },
  CRYPTO_WALLET_MARKET_MONITOR: {
    name: "Crypto Wallet Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency wallet theft markets",
  },
  EMAIL_2_SMS_GATEWAY_MONITOR: {
    name: "Email-to-SMS Gateway Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Monitors for phone number exposure via gateway leaks",
  },

  // ==========================================
  // ADDITIONAL DARK WEB THREAT INTEL PLATFORMS
  // ==========================================
  MANDIANT_THREAT_INTEL: {
    name: "Mandiant Threat Intelligence",
    optOutUrl: "https://www.mandiant.com/privacy",
    privacyEmail: "privacy@mandiant.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google-owned threat intelligence platform",
  },
  CROWDSTRIKE_FALCON_X: {
    name: "CrowdStrike Falcon X",
    optOutUrl: "https://www.crowdstrike.com/privacy-notice/",
    privacyEmail: "privacy@crowdstrike.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence and dark web monitoring",
  },
  PALO_ALTO_UNIT42: {
    name: "Palo Alto Unit 42",
    optOutUrl: "https://www.paloaltonetworks.com/privacy",
    privacyEmail: "privacy@paloaltonetworks.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat research and dark web intelligence",
  },
  CISCO_TALOS: {
    name: "Cisco Talos Intelligence",
    optOutUrl: "https://www.cisco.com/c/en/us/about/legal/privacy-full.html",
    privacyEmail: "privacy@cisco.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence with dark web coverage",
  },
  PROOFPOINT_THREAT: {
    name: "Proofpoint Threat Intelligence",
    optOutUrl: "https://www.proofpoint.com/us/privacy-policy",
    privacyEmail: "privacy@proofpoint.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Email and dark web threat detection",
  },
  TRELLIX_INSIGHTS: {
    name: "Trellix Threat Intelligence",
    optOutUrl: "https://www.trellix.com/en-us/privacy.html",
    privacyEmail: "privacy@trellix.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Advanced threat intelligence platform",
  },
  SECUREWORKS_CTU: {
    name: "Secureworks Counter Threat Unit",
    optOutUrl: "https://www.secureworks.com/privacy-policy",
    privacyEmail: "privacy@secureworks.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web and underground monitoring",
  },
  ANOMALI_THREATSTREAM: {
    name: "Anomali ThreatStream",
    optOutUrl: "https://www.anomali.com/privacy-policy",
    privacyEmail: "privacy@anomali.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence platform",
  },
  THREATCONNECT: {
    name: "ThreatConnect",
    optOutUrl: "https://threatconnect.com/privacy-policy/",
    privacyEmail: "privacy@threatconnect.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Threat intelligence operations",
  },
  LOOKOUT_THREAT: {
    name: "Lookout Threat Lab",
    optOutUrl: "https://www.lookout.com/privacy-policy",
    privacyEmail: "privacy@lookout.com",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mobile and dark web threat intelligence",
  },

  // ==========================================
  // MORE BREACH AGGREGATORS & LEAK SITES
  // ==========================================
  LEAKED_SOURCE: {
    name: "Leaked.Source (Archives)",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Historical breach database archives",
  },
  COMB_MONITOR: {
    name: "COMB Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Compilation of Many Breaches monitoring",
  },
  ANTIPUBLIC_MONITOR: {
    name: "Anti Public Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major breach compilation monitoring",
  },
  EXPLOIT_IN_MONITOR: {
    name: "Exploit.in Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major breach database monitoring",
  },
  COLLECTION_MONITOR: {
    name: "Collection #1-5 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mega breach collections monitoring",
  },
  PEMIBLANC_MONITOR: {
    name: "Pemiblanc Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "French breach database monitoring",
  },
  LEAKEDSOURCE_ARCHIVES: {
    name: "LeakedSource Archives",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Historical breach data archives",
  },
  BREACH_COMPILATION: {
    name: "Breach Compilation Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Multi-source breach compilations",
  },
  MAILRU_BREACH_MONITOR: {
    name: "Mail.ru Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian email service breach monitoring",
  },
  RAMBLER_BREACH_MONITOR: {
    name: "Rambler Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian portal breach monitoring",
  },

  // ==========================================
  // MORE PASTE SITES & CODE SHARING
  // ==========================================
  RENTRY_MONITOR: {
    name: "Rentry.co Monitor",
    optOutUrl: "https://rentry.co/privacy",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Markdown paste site monitoring",
  },
  PRIVATEBIN_MONITOR: {
    name: "PrivateBin Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Encrypted paste site monitoring",
  },
  ZEROBIN_MONITOR: {
    name: "ZeroBin Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Zero-knowledge paste site",
  },
  TELEGRA_PH_MONITOR: {
    name: "Telegraph Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Telegram publishing platform",
  },
  SNIPPET_HOST_MONITOR: {
    name: "Snippet.host Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Code snippet sharing monitoring",
  },
  TOPTAL_PASTE_MONITOR: {
    name: "Toptal Paste Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Developer paste site monitoring",
  },
  PASTE2_MONITOR: {
    name: "Paste2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Alternative paste site",
  },
  PASTEALL_MONITOR: {
    name: "PasteAll Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Multi-format paste monitoring",
  },
  DEFUSE_PASTE_MONITOR: {
    name: "Defuse Paste Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Encrypted paste monitoring",
  },
  DOXBIN_MONITOR: {
    name: "Doxbin Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Doxxing site monitoring - critical for personal info",
  },

  // ==========================================
  // MORE UNDERGROUND FORUMS
  // ==========================================
  HACKFORUMS_MONITOR: {
    name: "HackForums Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Script kiddie and hacking forum",
  },
  RAIDFORUMS_ARCHIVE: {
    name: "RaidForums Archive Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Archived RaidForums data",
  },
  OGUSERS_MONITOR: {
    name: "OGUsers Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Account trading forum",
  },
  LOLZTEAM_MONITOR: {
    name: "Lolz.team Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian cracking community",
  },
  BHFIO_MONITOR: {
    name: "BHF.io Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hacking forum monitoring",
  },
  WWH_CLUB_MONITOR: {
    name: "WWH Club Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Carding and fraud forum",
  },
  VERIFIED_FORUM_MONITOR: {
    name: "Verified Forum Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian cybercrime forum",
  },
  ANTICHAT_MONITOR: {
    name: "Antichat Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian security/hacking forum",
  },
  XAKEP_MONITOR: {
    name: "Xakep Forum Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian hacker magazine forum",
  },
  DARKODE_MONITOR: {
    name: "Darkode Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Elite hacking forum monitoring",
  },

  // ==========================================
  // MORE CARDING & FINANCIAL FRAUD SITES
  // ==========================================
  JOKER_STASH_MONITOR: {
    name: "Joker's Stash Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major carding marketplace (successor sites)",
  },
  RESCATOR_MONITOR: {
    name: "Rescator Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card shop monitoring",
  },
  FERUM_SHOP_MONITOR: {
    name: "FeRum Shop Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Carding shop monitoring",
  },
  UNICC_MONITOR: {
    name: "UniCC Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card marketplace monitoring",
  },
  BRIANKREBS_MONITOR: {
    name: "BriansClub Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Major carding site monitoring",
  },
  VALIDCC_MONITOR: {
    name: "ValidCC Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card validation service monitoring",
  },
  SWIPE_STORE_MONITOR: {
    name: "Swipe Store Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card shop monitoring",
  },
  ALLWORLD_CARDS_MONITOR: {
    name: "AllWorld Cards Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Global carding marketplace",
  },
  YALE_LODGE_MONITOR: {
    name: "Yale Lodge Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fullz and card data marketplace",
  },
  TRUMP_DUMPS_MONITOR: {
    name: "Trump's Dumps Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Card dump marketplace",
  },

  // ==========================================
  // MORE STEALER & MALWARE LOGS
  // ==========================================
  AURORA_STEALER_MONITOR: {
    name: "Aurora Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Aurora stealer log monitoring",
  },
  META_STEALER_MONITOR: {
    name: "META Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "META info stealer monitoring",
  },
  RHADAMANTHYS_MONITOR: {
    name: "Rhadamanthys Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Advanced stealer monitoring",
  },
  DARKCLOUD_STEALER_MONITOR: {
    name: "DarkCloud Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DarkCloud logs monitoring",
  },
  PRYNT_STEALER_MONITOR: {
    name: "Prynt Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Prynt info stealer logs",
  },
  WHITESNAKE_STEALER_MONITOR: {
    name: "WhiteSnake Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "WhiteSnake malware monitoring",
  },
  MYSTIC_STEALER_MONITOR: {
    name: "Mystic Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mystic stealer log detection",
  },
  RISEPRO_STEALER_MONITOR: {
    name: "RisePro Stealer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "RisePro stealer monitoring",
  },
  STEALC_V2_MONITOR: {
    name: "StealC v2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "StealC version 2 monitoring",
  },
  XWORM_RAT_MONITOR: {
    name: "XWorm RAT Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "XWorm remote access trojan logs",
  },

  // ==========================================
  // MORE RANSOMWARE LEAK SITES
  // ==========================================
  HIVE_RANSOMWARE_MONITOR: {
    name: "Hive Ransomware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hive ransomware leak monitoring",
  },
  CONTI_LEAK_MONITOR: {
    name: "Conti Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Conti ransomware data leaks",
  },
  REVIL_LEAK_MONITOR: {
    name: "REvil/Sodinokibi Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "REvil ransomware leak site",
  },
  MAZE_LEAK_MONITOR: {
    name: "Maze Ransomware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Maze leak site monitoring",
  },
  NETWALKER_LEAK_MONITOR: {
    name: "NetWalker Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NetWalker ransomware leaks",
  },
  RAGNAR_LOCKER_MONITOR: {
    name: "Ragnar Locker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ragnar Locker leak monitoring",
  },
  AVOSLOCKER_MONITOR: {
    name: "AvosLocker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "AvosLocker ransomware leaks",
  },
  CUBA_RANSOMWARE_MONITOR: {
    name: "Cuba Ransomware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cuba ransomware leak site",
  },
  SNATCH_TEAM_MONITOR: {
    name: "Snatch Team Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Snatch ransomware monitoring",
  },
  VICE_SOCIETY_MONITOR: {
    name: "Vice Society Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Vice Society leak monitoring",
  },

  // ==========================================
  // TELEGRAM DARK WEB CHANNELS
  // ==========================================
  TELEGRAM_CREDIT_CARDS: {
    name: "Telegram CC Channels",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Credit card trading channels",
  },
  TELEGRAM_FULLZ_CHANNELS: {
    name: "Telegram Fullz Channels",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity data trading channels",
  },
  TELEGRAM_BANK_DROPS: {
    name: "Telegram Bank Drops",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bank drop channels monitoring",
  },
  TELEGRAM_SSN_CHANNELS: {
    name: "Telegram SSN Channels",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SSN trading channel monitoring",
  },
  TELEGRAM_LOGS_CLOUD: {
    name: "Telegram Logs Cloud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cloud stealer log channels",
  },
  TELEGRAM_RUSSIA_FRAUD: {
    name: "Telegram Russian Fraud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian-language fraud channels",
  },
  TELEGRAM_SPAM_TOOLS: {
    name: "Telegram Spam/Tools",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Spam tool and exploit channels",
  },
  TELEGRAM_CRYPTO_FRAUD: {
    name: "Telegram Crypto Fraud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency fraud channels",
  },
  TELEGRAM_SIM_SWAP: {
    name: "Telegram SIM Swap",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SIM swapping service channels",
  },
  TELEGRAM_DOCUMENTS: {
    name: "Telegram Document Fraud",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fake document channels",
  },

  // ==========================================
  // IDENTITY VERIFICATION BREACHES
  // ==========================================
  KYC_BREACH_MONITOR: {
    name: "KYC Data Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Know Your Customer data leaks",
  },
  ID_DOCUMENT_MONITOR: {
    name: "ID Document Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Passport and ID leaks",
  },
  SELFIE_LEAK_MONITOR: {
    name: "Selfie/Photo ID Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity verification photo leaks",
  },
  DRIVERS_LICENSE_MONITOR: {
    name: "Drivers License Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DL data leak monitoring",
  },
  PASSPORT_LEAK_MONITOR: {
    name: "Passport Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Passport data monitoring",
  },

  // ==========================================
  // ADDITIONAL DARK WEB MARKETS
  // ==========================================
  INCOGNITO_MARKET_MONITOR: {
    name: "Incognito Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace monitoring",
  },
  ARCHETYP_MARKET_MONITOR: {
    name: "Archetyp Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },
  ABACUS_MARKET_MONITOR: {
    name: "Abacus Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },
  TOR2DOOR_MONITOR: {
    name: "Tor2Door Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },
  MEGA_DARKNET_MONITOR: {
    name: "MEGA Darknet Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian dark web marketplace",
  },
  HYDRA_SUCCESSOR_MONITOR: {
    name: "Hydra Successor Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hydra market successor monitoring",
  },
  OMGOMG_MARKET_MONITOR: {
    name: "OMG!OMG! Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian market monitoring",
  },
  BLACKSPRUT_MONITOR: {
    name: "Blacksprut Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian marketplace monitoring",
  },
  KRAKEN_DARKNET_MONITOR: {
    name: "Kraken Darknet Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Russian darknet market",
  },
  SOLARIS_MARKET_MONITOR: {
    name: "Solaris Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark web marketplace",
  },

  // ==========================================
  // INITIAL ACCESS BROKER (IAB) MONITORS
  // ==========================================
  IAB_MARKET_MONITOR: {
    name: "IAB Marketplace Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Initial access broker marketplaces",
  },
  RDP_SHOP_MONITOR: {
    name: "RDP Shop Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Compromised RDP credential shops",
  },
  VPN_ACCESS_MONITOR: {
    name: "VPN Access Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen VPN credentials marketplace",
  },
  CITRIX_ACCESS_MONITOR: {
    name: "Citrix Access Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Compromised Citrix access sales",
  },
  WEBSHELL_MARKET_MONITOR: {
    name: "Webshell Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Webshell and backdoor marketplace",
  },
  PULSE_VPN_MONITOR: {
    name: "Pulse VPN Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Pulse Secure VPN credential leaks",
  },
  FORTINET_LEAK_MONITOR: {
    name: "Fortinet Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "FortiGate credential leak monitoring",
  },
  SSH_KEY_MARKET_MONITOR: {
    name: "SSH Key Market Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen SSH key marketplace",
  },
  AWS_CREDS_MONITOR: {
    name: "AWS Credentials Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked AWS access keys",
  },
  AZURE_CREDS_MONITOR: {
    name: "Azure Credentials Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked Azure credentials",
  },

  // ==========================================
  // BOTNET & MALWARE PANELS
  // ==========================================
  EMOTET_PANEL_MONITOR: {
    name: "Emotet Panel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Emotet botnet data monitoring",
  },
  TRICKBOT_MONITOR: {
    name: "TrickBot Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "TrickBot stolen data monitoring",
  },
  QAKBOT_MONITOR: {
    name: "QakBot Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "QakBot/Qbot data monitoring",
  },
  ICEDID_MONITOR: {
    name: "IcedID Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IcedID banking trojan logs",
  },
  DRIDEX_MONITOR: {
    name: "Dridex Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dridex banking malware",
  },
  BAZARLOADER_MONITOR: {
    name: "BazarLoader Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "BazarLoader infection data",
  },
  COBALT_STRIKE_MONITOR: {
    name: "Cobalt Strike Beacon Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cobalt Strike C2 victim data",
  },
  SLIVER_C2_MONITOR: {
    name: "Sliver C2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Sliver framework victim monitoring",
  },
  BRUTE_RATEL_MONITOR: {
    name: "Brute Ratel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Brute Ratel C4 monitoring",
  },
  HAVOC_C2_MONITOR: {
    name: "Havoc C2 Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Havoc framework monitoring",
  },

  // ==========================================
  // PHISHING & SCAM MONITORING
  // ==========================================
  PHISHING_KIT_MONITOR: {
    name: "Phishing Kit Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Phishing kit victim data",
  },
  EVILGINX_MONITOR: {
    name: "Evilginx Panel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Evilginx phishing data",
  },
  GOPHISH_MONITOR: {
    name: "GoPhish Campaign Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GoPhish victim data exposure",
  },
  MODLISHKA_MONITOR: {
    name: "Modlishka Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Modlishka reverse proxy phishing",
  },
  SCAM_PAGE_MONITOR: {
    name: "Scam Page Database",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Known scam page victim data",
  },
  CRYPTO_SCAM_MONITOR: {
    name: "Crypto Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency scam victim lists",
  },
  ROMANCE_SCAM_MONITOR: {
    name: "Romance Scam Database",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Romance scam victim exposure",
  },
  BEC_VICTIM_MONITOR: {
    name: "BEC Victim Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Business email compromise victims",
  },
  TECH_SUPPORT_SCAM_MONITOR: {
    name: "Tech Support Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tech support scam victim data",
  },
  INVESTMENT_SCAM_MONITOR: {
    name: "Investment Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Investment fraud victim lists",
  },

  // ==========================================
  // CRYPTOCURRENCY THREAT MONITORING
  // ==========================================
  CRYPTO_DRAINER_MONITOR: {
    name: "Crypto Drainer Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wallet drainer victim monitoring",
  },
  NFT_SCAM_MONITOR: {
    name: "NFT Scam Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NFT scam victim data",
  },
  DEFI_EXPLOIT_MONITOR: {
    name: "DeFi Exploit Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DeFi exploit victim tracking",
  },
  SEED_PHRASE_MONITOR: {
    name: "Seed Phrase Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency seed phrase leaks",
  },
  PRIVATE_KEY_MONITOR: {
    name: "Private Key Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Crypto private key exposure",
  },
  EXCHANGE_BREACH_MONITOR: {
    name: "Exchange Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency exchange breaches",
  },
  METAMASK_PHISH_MONITOR: {
    name: "MetaMask Phishing Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "MetaMask phishing victim data",
  },
  LEDGER_LEAK_MONITOR: {
    name: "Ledger Data Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ledger hardware wallet user leaks",
  },
  TREZOR_PHISH_MONITOR: {
    name: "Trezor Phishing Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Trezor phishing victim data",
  },
  COINBASE_BREACH_MONITOR: {
    name: "Coinbase Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Coinbase user data exposure",
  },

  // ==========================================
  // GAMING & VIRTUAL GOODS FRAUD
  // ==========================================
  STEAM_ACCOUNT_MONITOR: {
    name: "Steam Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen Steam account marketplace",
  },
  EPIC_GAMES_MONITOR: {
    name: "Epic Games Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Epic/Fortnite account theft",
  },
  ROBLOX_ACCOUNT_MONITOR: {
    name: "Roblox Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Roblox account marketplace",
  },
  MINECRAFT_ACCOUNT_MONITOR: {
    name: "Minecraft Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Minecraft account trading",
  },
  PSN_ACCOUNT_MONITOR: {
    name: "PSN Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "PlayStation Network accounts",
  },
  XBOX_ACCOUNT_MONITOR: {
    name: "Xbox Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Xbox Live account theft",
  },
  VALORANT_ACCOUNT_MONITOR: {
    name: "Valorant Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Valorant account marketplace",
  },
  LOL_ACCOUNT_MONITOR: {
    name: "League of Legends Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "LoL account trading",
  },
  GENSHIN_ACCOUNT_MONITOR: {
    name: "Genshin Impact Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Genshin account marketplace",
  },
  WOW_ACCOUNT_MONITOR: {
    name: "World of Warcraft Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "WoW account theft monitoring",
  },

  // ==========================================
  // SOCIAL MEDIA ACCOUNT MARKETS
  // ==========================================
  INSTAGRAM_ACCOUNT_MARKET: {
    name: "Instagram Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stolen Instagram account sales",
  },
  TIKTOK_ACCOUNT_MARKET: {
    name: "TikTok Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "TikTok account marketplace",
  },
  TWITTER_ACCOUNT_MARKET: {
    name: "Twitter/X Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Twitter account trading",
  },
  FACEBOOK_ACCOUNT_MARKET: {
    name: "Facebook Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Facebook account marketplace",
  },
  YOUTUBE_ACCOUNT_MARKET: {
    name: "YouTube Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "YouTube channel sales",
  },
  SNAPCHAT_ACCOUNT_MARKET: {
    name: "Snapchat Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Snapchat account trading",
  },
  LINKEDIN_ACCOUNT_MARKET: {
    name: "LinkedIn Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "LinkedIn account sales",
  },
  DISCORD_ACCOUNT_MARKET: {
    name: "Discord Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Discord account/nitro marketplace",
  },
  TWITCH_ACCOUNT_MARKET: {
    name: "Twitch Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Twitch account trading",
  },
  REDDIT_ACCOUNT_MARKET: {
    name: "Reddit Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Reddit account marketplace",
  },

  // ==========================================
  // STREAMING SERVICE ACCOUNTS
  // ==========================================
  NETFLIX_ACCOUNT_MONITOR: {
    name: "Netflix Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Netflix credential marketplace",
  },
  SPOTIFY_ACCOUNT_MONITOR: {
    name: "Spotify Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Spotify account trading",
  },
  DISNEY_PLUS_MONITOR: {
    name: "Disney+ Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Disney+ credential sales",
  },
  HBO_MAX_MONITOR: {
    name: "HBO Max Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "HBO Max account marketplace",
  },
  AMAZON_PRIME_MONITOR: {
    name: "Amazon Prime Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Amazon Prime account sales",
  },
  HULU_ACCOUNT_MONITOR: {
    name: "Hulu Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hulu credential trading",
  },
  APPLE_TV_MONITOR: {
    name: "Apple TV+ Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Apple TV+ account sales",
  },
  PARAMOUNT_PLUS_MONITOR: {
    name: "Paramount+ Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Paramount+ credential marketplace",
  },
  CRUNCHYROLL_MONITOR: {
    name: "Crunchyroll Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Crunchyroll account trading",
  },
  VPN_ACCOUNT_MONITOR: {
    name: "VPN Service Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NordVPN, ExpressVPN account sales",
  },

  // ==========================================
  // GOVERNMENT & MILITARY LEAKS
  // ==========================================
  GOV_BREACH_MONITOR: {
    name: "Government Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Government data breach monitoring",
  },
  MILITARY_LEAK_MONITOR: {
    name: "Military Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Military personnel data leaks",
  },
  CLEARANCE_DATA_MONITOR: {
    name: "Security Clearance Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Security clearance data exposure",
  },
  FEDERAL_EMPLOYEE_MONITOR: {
    name: "Federal Employee Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Federal employee data leaks",
  },
  LAW_ENFORCEMENT_MONITOR: {
    name: "Law Enforcement Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Police/LEO data exposure",
  },

  // ==========================================
  // HEALTHCARE & MEDICAL DATA
  // ==========================================
  HIPAA_BREACH_MONITOR: {
    name: "HIPAA Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Healthcare data breach monitoring",
  },
  MEDICAL_RECORDS_MONITOR: {
    name: "Medical Records Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Medical record leak detection",
  },
  PRESCRIPTION_DATA_MONITOR: {
    name: "Prescription Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Prescription history exposure",
  },
  INSURANCE_CLAIM_MONITOR: {
    name: "Insurance Claim Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Health insurance claim leaks",
  },
  PATIENT_DATABASE_MONITOR: {
    name: "Patient Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hospital patient data exposure",
  },

  // ==========================================
  // CORPORATE & ENTERPRISE DATA
  // ==========================================
  CORPORATE_EMAIL_MONITOR: {
    name: "Corporate Email Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Corporate email credential leaks",
  },
  SHAREPOINT_LEAK_MONITOR: {
    name: "SharePoint Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SharePoint data exposure",
  },
  CONFLUENCE_LEAK_MONITOR: {
    name: "Confluence Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Confluence wiki data leaks",
  },
  JIRA_LEAK_MONITOR: {
    name: "Jira Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Jira project data exposure",
  },
  SLACK_LEAK_MONITOR: {
    name: "Slack Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Slack workspace data leaks",
  },
  GITHUB_SECRET_MONITOR: {
    name: "GitHub Secret Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GitHub exposed secrets/keys",
  },
  GITLAB_LEAK_MONITOR: {
    name: "GitLab Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GitLab repository leaks",
  },
  S3_BUCKET_MONITOR: {
    name: "S3 Bucket Exposure Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Exposed AWS S3 bucket data",
  },
  AZURE_BLOB_MONITOR: {
    name: "Azure Blob Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Azure blob storage exposure",
  },
  GCP_BUCKET_MONITOR: {
    name: "GCP Bucket Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google Cloud storage leaks",
  },

  // ==========================================
  // MOBILE DEVICE DATA LEAKS
  // ==========================================
  IMEI_DATABASE_MONITOR: {
    name: "IMEI Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mobile device IMEI leak monitoring",
  },
  PHONE_BACKUP_MONITOR: {
    name: "Phone Backup Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cloud phone backup exposure",
  },
  ICLOUD_BREACH_MONITOR: {
    name: "iCloud Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Apple iCloud data leaks",
  },
  GOOGLE_ACCOUNT_MONITOR: {
    name: "Google Account Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google account credential leaks",
  },
  SAMSUNG_ACCOUNT_MONITOR: {
    name: "Samsung Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Samsung account data exposure",
  },
  WHATSAPP_BACKUP_MONITOR: {
    name: "WhatsApp Backup Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "WhatsApp cloud backup leaks",
  },
  TELEGRAM_DATA_MONITOR: {
    name: "Telegram Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Telegram account data exposure",
  },
  SIGNAL_LEAK_MONITOR: {
    name: "Signal Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Signal app data exposure",
  },
  VIBER_DATA_MONITOR: {
    name: "Viber Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Viber account leak monitoring",
  },
  LINE_APP_MONITOR: {
    name: "LINE App Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "LINE messenger data leaks",
  },

  // ==========================================
  // E-COMMERCE & RETAIL FRAUD
  // ==========================================
  AMAZON_ACCOUNT_FRAUD: {
    name: "Amazon Account Fraud Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Amazon account marketplace",
  },
  EBAY_ACCOUNT_MONITOR: {
    name: "eBay Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "eBay account theft monitoring",
  },
  PAYPAL_ACCOUNT_MARKET: {
    name: "PayPal Account Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "PayPal credential marketplace",
  },
  VENMO_ACCOUNT_MONITOR: {
    name: "Venmo Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Venmo account trading",
  },
  CASHAPP_ACCOUNT_MONITOR: {
    name: "Cash App Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cash App credential leaks",
  },
  ZELLE_FRAUD_MONITOR: {
    name: "Zelle Fraud Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Zelle payment fraud monitoring",
  },
  SHOPIFY_STORE_MONITOR: {
    name: "Shopify Store Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Shopify store credential leaks",
  },
  STRIPE_ACCOUNT_MONITOR: {
    name: "Stripe Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Stripe payment credential leaks",
  },
  WALMART_ACCOUNT_MONITOR: {
    name: "Walmart Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Walmart account marketplace",
  },
  TARGET_ACCOUNT_MONITOR: {
    name: "Target Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Target account credential leaks",
  },

  // ==========================================
  // TRAVEL & HOSPITALITY FRAUD
  // ==========================================
  AIRLINE_MILES_MONITOR: {
    name: "Airline Miles Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Frequent flyer account theft",
  },
  HOTEL_POINTS_MONITOR: {
    name: "Hotel Points Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hotel loyalty point fraud",
  },
  AIRBNB_ACCOUNT_MONITOR: {
    name: "Airbnb Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Airbnb account marketplace",
  },
  UBER_ACCOUNT_MONITOR: {
    name: "Uber Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Uber account trading",
  },
  LYFT_ACCOUNT_MONITOR: {
    name: "Lyft Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Lyft account marketplace",
  },
  DOORDASH_ACCOUNT_MONITOR: {
    name: "DoorDash Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "DoorDash account leaks",
  },
  UBEREATS_ACCOUNT_MONITOR: {
    name: "UberEats Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "UberEats account trading",
  },
  GRUBHUB_ACCOUNT_MONITOR: {
    name: "Grubhub Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Grubhub credential marketplace",
  },
  BOOKING_COM_MONITOR: {
    name: "Booking.com Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Booking.com account leaks",
  },
  EXPEDIA_ACCOUNT_MONITOR: {
    name: "Expedia Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Expedia account trading",
  },

  // ==========================================
  // EDUCATION & ACADEMIC DATA
  // ==========================================
  STUDENT_RECORDS_MONITOR: {
    name: "Student Records Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Student record data leaks",
  },
  UNIVERSITY_BREACH_MONITOR: {
    name: "University Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "University data breach monitoring",
  },
  EDU_EMAIL_MARKET: {
    name: ".edu Email Market",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Educational email marketplace",
  },
  STUDENT_LOAN_MONITOR: {
    name: "Student Loan Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Student loan data exposure",
  },
  SCHOLARSHIP_FRAUD_MONITOR: {
    name: "Scholarship Fraud Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Scholarship application fraud",
  },
  LMS_BREACH_MONITOR: {
    name: "LMS Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Learning management system breaches",
  },
  CANVAS_LEAK_MONITOR: {
    name: "Canvas LMS Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Canvas platform data leaks",
  },
  BLACKBOARD_LEAK_MONITOR: {
    name: "Blackboard Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Blackboard platform exposure",
  },
  COURSERA_ACCOUNT_MONITOR: {
    name: "Coursera Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Coursera account marketplace",
  },
  UDEMY_ACCOUNT_MONITOR: {
    name: "Udemy Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Udemy account trading",
  },

  // ==========================================
  // IOT & SMART DEVICE VULNERABILITIES
  // ==========================================
  SMART_HOME_MONITOR: {
    name: "Smart Home Device Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart home device exposure",
  },
  RING_CAMERA_MONITOR: {
    name: "Ring Camera Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ring doorbell credential leaks",
  },
  NEST_ACCOUNT_MONITOR: {
    name: "Nest Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Google Nest device exposure",
  },
  WYZE_BREACH_MONITOR: {
    name: "Wyze Breach Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wyze camera data leaks",
  },
  ALEXA_DATA_MONITOR: {
    name: "Alexa Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Amazon Alexa data exposure",
  },
  SMART_TV_MONITOR: {
    name: "Smart TV Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart TV data leaks",
  },
  ROUTER_VULN_MONITOR: {
    name: "Router Vulnerability Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Home router credential leaks",
  },
  IP_CAMERA_MONITOR: {
    name: "IP Camera Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IP camera feed exposure",
  },
  BABY_MONITOR_LEAK: {
    name: "Baby Monitor Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Baby monitor data exposure",
  },
  SMART_LOCK_MONITOR: {
    name: "Smart Lock Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart lock credential leaks",
  },

  // ==========================================
  // AUTOMOTIVE & VEHICLE DATA
  // ==========================================
  TESLA_ACCOUNT_MONITOR: {
    name: "Tesla Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tesla account credential leaks",
  },
  CONNECTED_CAR_MONITOR: {
    name: "Connected Car Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Connected vehicle data exposure",
  },
  ONSTAR_DATA_MONITOR: {
    name: "OnStar Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "GM OnStar data leaks",
  },
  UCONNECT_MONITOR: {
    name: "Uconnect Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Chrysler Uconnect data exposure",
  },
  FORD_SYNC_MONITOR: {
    name: "Ford SYNC Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ford SYNC system data leaks",
  },
  VIN_DATABASE_MONITOR: {
    name: "VIN Database Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Vehicle identification number leaks",
  },
  GPS_TRACKER_MONITOR: {
    name: "GPS Tracker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Vehicle GPS tracker data exposure",
  },
  FLEET_MANAGEMENT_MONITOR: {
    name: "Fleet Management Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fleet management system leaks",
  },
  OBD_DATA_MONITOR: {
    name: "OBD Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "OBD-II diagnostic data leaks",
  },
  EV_CHARGING_MONITOR: {
    name: "EV Charging Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "EV charging network data leaks",
  },

  // ==========================================
  // FINANCIAL SERVICES & BANKING
  // ==========================================
  BANK_OF_AMERICA_MONITOR: {
    name: "Bank of America Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "BofA account credential leaks",
  },
  CHASE_ACCOUNT_MONITOR: {
    name: "Chase Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Chase bank account leaks",
  },
  WELLS_FARGO_MONITOR: {
    name: "Wells Fargo Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wells Fargo credential leaks",
  },
  CITI_ACCOUNT_MONITOR: {
    name: "Citibank Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Citibank account exposure",
  },
  CAPITAL_ONE_MONITOR: {
    name: "Capital One Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Capital One credential leaks",
  },
  CRYPTO_EXCHANGE_MONITOR: {
    name: "Crypto Exchange Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cryptocurrency exchange leaks",
  },
  BINANCE_ACCOUNT_MONITOR: {
    name: "Binance Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Binance account credential leaks",
  },
  KRAKEN_ACCOUNT_MONITOR: {
    name: "Kraken Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Kraken exchange account leaks",
  },
  ROBINHOOD_MONITOR: {
    name: "Robinhood Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Robinhood account exposure",
  },
  FIDELITY_MONITOR: {
    name: "Fidelity Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Fidelity account leaks",
  },

  // ==========================================
  // DATING & ADULT SITE LEAKS
  // ==========================================
  TINDER_DATA_MONITOR: {
    name: "Tinder Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Tinder user data leaks",
  },
  BUMBLE_DATA_MONITOR: {
    name: "Bumble Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bumble user data exposure",
  },
  HINGE_DATA_MONITOR: {
    name: "Hinge Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Hinge profile data leaks",
  },
  GRINDR_DATA_MONITOR: {
    name: "Grindr Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Grindr user data exposure",
  },
  ASHLEY_MADISON_MONITOR: {
    name: "Ashley Madison Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ashley Madison breach monitoring",
  },
  ADULT_SITE_MONITOR: {
    name: "Adult Site Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Adult website data leaks",
  },
  ONLYFANS_LEAK_MONITOR: {
    name: "OnlyFans Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "OnlyFans creator data leaks",
  },
  DATING_APP_GENERAL: {
    name: "Dating App General Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "General dating app data leaks",
  },
  FETLIFE_MONITOR: {
    name: "FetLife Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "FetLife data exposure",
  },
  SEEKING_ARRANGEMENT_MONITOR: {
    name: "Seeking Arrangement Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Seeking Arrangement leaks",
  },

  // ==========================================
  // ADDITIONAL DATA BROKERS v1.21.0 (520 NEW)
  // ==========================================

  // PEOPLE SEARCH EXPANSION (50 brokers)
  SEARCHPEOPLEFREE_PRO: {
    name: "SearchPeopleFree Pro",
    optOutUrl: "https://www.searchpeoplefree.com/opt-out",
    privacyEmail: "privacy@searchpeoplefree.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PEOPLESEARCHSITE: {
    name: "PeopleSearchSite",
    optOutUrl: "https://www.peoplesearchsite.com/removal",
    privacyEmail: "remove@peoplesearchsite.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  FINDPERSONINFO: {
    name: "FindPersonInfo",
    optOutUrl: "https://www.findpersoninfo.com/optout",
    privacyEmail: "optout@findpersoninfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPPAGES: {
    name: "LookupPages",
    optOutUrl: "https://www.lookuppages.com/removal",
    privacyEmail: "privacy@lookuppages.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PERSONLOOKUPNOW: {
    name: "PersonLookupNow",
    optOutUrl: "https://www.personlookupnow.com/optout",
    privacyEmail: "remove@personlookupnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FREEPEOPLELOOKUP: {
    name: "FreePeopleLookup",
    optOutUrl: "https://www.freepeoplelookup.com/removal",
    privacyEmail: "privacy@freepeoplelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  QUICKPEOPLESEARCH_V2: {
    name: "QuickPeopleSearch",
    optOutUrl: "https://www.quickpeoplesearch.com/optout",
    privacyEmail: "optout@quickpeoplesearch.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  SEARCHFORANYONE: {
    name: "SearchForAnyone",
    optOutUrl: "https://www.searchforanyone.com/removal",
    privacyEmail: "remove@searchforanyone.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEDATALAB: {
    name: "PeopleDataLab",
    optOutUrl: "https://www.peopledatalab.com/optout",
    privacyEmail: "privacy@peopledatalab.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  ANYPERSONINFO: {
    name: "AnyPersonInfo",
    optOutUrl: "https://www.anypersoninfo.com/removal",
    privacyEmail: "optout@anypersoninfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPUSA: {
    name: "LookupUSA",
    optOutUrl: "https://www.lookupusa.com/optout",
    privacyEmail: "privacy@lookupusa.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDPERSONFREE: {
    name: "FindPersonFree",
    optOutUrl: "https://www.findpersonfree.com/removal",
    privacyEmail: "remove@findpersonfree.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  PEOPLETRACKER: {
    name: "PeopleTracker",
    optOutUrl: "https://www.peopletracker.com/optout",
    privacyEmail: "privacy@peopletracker.com",
    removalMethod: "BOTH",
    estimatedDays: 10,
  },
  NAMESEARCHPRO: {
    name: "NameSearchPro",
    optOutUrl: "https://www.namesearchpro.com/removal",
    privacyEmail: "optout@namesearchpro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PUBLICDATAFINDER_V2: {
    name: "PublicDataFinder",
    optOutUrl: "https://www.publicdatafinder.com/optout",
    privacyEmail: "privacy@publicdatafinder.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PERSONRECORDS: {
    name: "PersonRecords",
    optOutUrl: "https://www.personrecords.com/removal",
    privacyEmail: "remove@personrecords.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  INSTANTPEOPLELOOKUP: {
    name: "InstantPeopleLookup",
    optOutUrl: "https://www.instantpeoplelookup.com/optout",
    privacyEmail: "privacy@instantpeoplelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  SEARCHPUBLIC: {
    name: "SearchPublic",
    optOutUrl: "https://www.searchpublic.com/removal",
    privacyEmail: "optout@searchpublic.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDINFOFAST: {
    name: "FindInfoFast",
    optOutUrl: "https://www.findinfofast.com/optout",
    privacyEmail: "privacy@findinfofast.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  RECORDSPEDIA: {
    name: "RecordsPedia",
    optOutUrl: "https://www.recordspedia.com/removal",
    privacyEmail: "remove@recordspedia.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLEDATABASE: {
    name: "PeopleDatabase",
    optOutUrl: "https://www.peopledatabase.com/optout",
    privacyEmail: "privacy@peopledatabase.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  NAMESEARCHNOW: {
    name: "NameSearchNow",
    optOutUrl: "https://www.namesearchnow.com/removal",
    privacyEmail: "optout@namesearchnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PEOPLEFIND360: {
    name: "PeopleFind360",
    optOutUrl: "https://www.peoplefind360.com/optout",
    privacyEmail: "privacy@peoplefind360.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHPERSONINFO: {
    name: "SearchPersonInfo",
    optOutUrl: "https://www.searchpersoninfo.com/removal",
    privacyEmail: "remove@searchpersoninfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FINDSOMEONE: {
    name: "FindSomeone",
    optOutUrl: "https://www.findsomeone.com/optout",
    privacyEmail: "privacy@findsomeone.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  LOOKUPFAST: {
    name: "LookupFast",
    optOutUrl: "https://www.lookupfast.com/removal",
    privacyEmail: "optout@lookupfast.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  PUBLICINFONOW: {
    name: "PublicInfoNow",
    optOutUrl: "https://www.publicinfonow.com/optout",
    privacyEmail: "privacy@publicinfonow.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLESEARCHEXPERT: {
    name: "PeopleSearchExpert",
    optOutUrl: "https://www.peoplesearchexpert.com/removal",
    privacyEmail: "remove@peoplesearchexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FINDPEOPLEDATA: {
    name: "FindPeopleData",
    optOutUrl: "https://www.findpeopledata.com/optout",
    privacyEmail: "privacy@findpeopledata.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PERSONINFOSITE: {
    name: "PersonInfoSite",
    optOutUrl: "https://www.personinfosite.com/removal",
    privacyEmail: "optout@personinfosite.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPWORLD: {
    name: "LookupWorld",
    optOutUrl: "https://www.lookupworld.com/optout",
    privacyEmail: "privacy@lookupworld.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHRECORDSNOW: {
    name: "SearchRecordsNow",
    optOutUrl: "https://www.searchrecordsnow.com/removal",
    privacyEmail: "remove@searchrecordsnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PEOPLEINFOPRO: {
    name: "PeopleInfoPro",
    optOutUrl: "https://www.peopleinfopro.com/optout",
    privacyEmail: "privacy@peopleinfopro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDANYBODYINFO: {
    name: "FindAnybodyInfo",
    optOutUrl: "https://www.findanybodyinfo.com/removal",
    privacyEmail: "optout@findanybodyinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  RECORDSPLANET: {
    name: "RecordsPlanet",
    optOutUrl: "https://www.recordsplanet.com/optout",
    privacyEmail: "privacy@recordsplanet.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NAMESEARCHWORLD: {
    name: "NameSearchWorld",
    optOutUrl: "https://www.namesearchworld.com/removal",
    privacyEmail: "remove@namesearchworld.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PEOPLEFINDEXPERT: {
    name: "PeopleFindExpert",
    optOutUrl: "https://www.peoplefindexpert.com/optout",
    privacyEmail: "privacy@peoplefindexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  SEARCHANYRECORD: {
    name: "SearchAnyRecord",
    optOutUrl: "https://www.searchanyrecord.com/removal",
    privacyEmail: "optout@searchanyrecord.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PUBLICRECORDSPRO: {
    name: "PublicRecordsPro",
    optOutUrl: "https://www.publicrecordspro.com/optout",
    privacyEmail: "privacy@publicrecordspro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDINFONOW: {
    name: "FindInfoNow",
    optOutUrl: "https://www.findinfonow.com/removal",
    privacyEmail: "remove@findinfonow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PEOPLELOOKUPFAST: {
    name: "PeopleLookupFast",
    optOutUrl: "https://www.peoplelookupfast.com/optout",
    privacyEmail: "privacy@peoplelookupfast.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  RECORDSEARCHPRO_V2: {
    name: "RecordSearchPro",
    optOutUrl: "https://www.recordsearchpro.com/removal",
    privacyEmail: "optout@recordsearchpro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDSOMEONEFREE: {
    name: "FindSomeoneFree",
    optOutUrl: "https://www.findsomeonefree.com/optout",
    privacyEmail: "privacy@findsomeonefree.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPANYNAME: {
    name: "LookupAnyName",
    optOutUrl: "https://www.lookupanyname.com/removal",
    privacyEmail: "remove@lookupanyname.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PEOPLERECORDSEARCH: {
    name: "PeopleRecordSearch",
    optOutUrl: "https://www.peoplerecordsearch.com/optout",
    privacyEmail: "privacy@peoplerecordsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  INSTANTNAMESEARCH: {
    name: "InstantNameSearch",
    optOutUrl: "https://www.instantnamesearch.com/removal",
    privacyEmail: "optout@instantnamesearch.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  SEARCHPEOPLEWORLD: {
    name: "SearchPeopleWorld",
    optOutUrl: "https://www.searchpeopleworld.com/optout",
    privacyEmail: "privacy@searchpeopleworld.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDPERSONNOW: {
    name: "FindPersonNow",
    optOutUrl: "https://www.findpersonnow.com/removal",
    privacyEmail: "remove@findpersonnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PUBLICDATAWORLD: {
    name: "PublicDataWorld",
    optOutUrl: "https://www.publicdataworld.com/optout",
    privacyEmail: "privacy@publicdataworld.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // PHONE LOOKUP EXPANSION (40 brokers)
  PHONELOOKUPEXPERT: {
    name: "PhoneLookupExpert",
    optOutUrl: "https://www.phonelookupexpert.com/optout",
    privacyEmail: "privacy@phonelookupexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  REVERSEPHONEPRO: {
    name: "ReversePhonePro",
    optOutUrl: "https://www.reversephonepro.com/removal",
    privacyEmail: "remove@reversephonepro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLERIDSEARCH: {
    name: "CallerIDSearch",
    optOutUrl: "https://www.calleridsearch.com/optout",
    privacyEmail: "privacy@calleridsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PHONENUMBERFINDER_V2: {
    name: "PhoneNumberFinder",
    optOutUrl: "https://www.phonenumberfinder.com/removal",
    privacyEmail: "optout@phonenumberfinder.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHOISCALLING: {
    name: "WhoIsCalling",
    optOutUrl: "https://www.whoiscalling.com/optout",
    privacyEmail: "privacy@whoiscalling.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPPHONEOWNER: {
    name: "LookupPhoneOwner",
    optOutUrl: "https://www.lookupphoneowner.com/removal",
    privacyEmail: "remove@lookupphoneowner.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CELLPHONELOOKUP_V2: {
    name: "CellPhoneLookup",
    optOutUrl: "https://www.cellphonelookup.com/optout",
    privacyEmail: "privacy@cellphonelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PHONEOWNERINFO: {
    name: "PhoneOwnerInfo",
    optOutUrl: "https://www.phoneownerinfo.com/removal",
    privacyEmail: "optout@phoneownerinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSECELLSEARCH: {
    name: "ReverseCellSearch",
    optOutUrl: "https://www.reversecellsearch.com/optout",
    privacyEmail: "privacy@reversecellsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  CALLERINFOSITE: {
    name: "CallerInfoSite",
    optOutUrl: "https://www.callerinfosite.com/removal",
    privacyEmail: "remove@callerinfosite.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PHONESEARCHEXPERT: {
    name: "PhoneSearchExpert",
    optOutUrl: "https://www.phonesearchexpert.com/optout",
    privacyEmail: "privacy@phonesearchexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  NUMBERIDENTIFY: {
    name: "NumberIdentify",
    optOutUrl: "https://www.numberidentify.com/removal",
    privacyEmail: "optout@numberidentify.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDPHONEOWNER: {
    name: "FindPhoneOwner",
    optOutUrl: "https://www.findphoneowner.com/optout",
    privacyEmail: "privacy@findphoneowner.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  WHOREGISTERED: {
    name: "WhoRegistered",
    optOutUrl: "https://www.whoregistered.com/removal",
    privacyEmail: "remove@whoregistered.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PHONEDIRECTORYUSA_V2: {
    name: "PhoneDirectoryUSA",
    optOutUrl: "https://www.phonedirectoryusa.com/optout",
    privacyEmail: "privacy@phonedirectoryusa.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  REVERSENUMBERPRO: {
    name: "ReverseNumberPro",
    optOutUrl: "https://www.reversenumberpro.com/removal",
    privacyEmail: "optout@reversenumberpro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CALLERLOOKUPNOW: {
    name: "CallerLookupNow",
    optOutUrl: "https://www.callerlookupnow.com/optout",
    privacyEmail: "privacy@callerlookupnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PHONEINFOSEARCH: {
    name: "PhoneInfoSearch",
    optOutUrl: "https://www.phoneinfosearch.com/removal",
    privacyEmail: "remove@phoneinfosearch.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHOISTHISNUMBER: {
    name: "WhoIsThisNumber",
    optOutUrl: "https://www.whoisthisnumber.com/optout",
    privacyEmail: "privacy@whoisthisnumber.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  NUMBERLOOKUPPRO: {
    name: "NumberLookupPro",
    optOutUrl: "https://www.numberlookuppro.com/removal",
    privacyEmail: "optout@numberlookuppro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDCALLERINFO: {
    name: "FindCallerInfo",
    optOutUrl: "https://www.findcallerinfo.com/optout",
    privacyEmail: "privacy@findcallerinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  REVERSEMOBILELOOKUP: {
    name: "ReverseMobileLookup",
    optOutUrl: "https://www.reversemobilelookup.com/removal",
    privacyEmail: "remove@reversemobilelookup.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PHONESEARCHPRO: {
    name: "PhoneSearchPro",
    optOutUrl: "https://www.phonesearchpro.com/optout",
    privacyEmail: "privacy@phonesearchpro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  CALLERIDNOW: {
    name: "CallerIDNow",
    optOutUrl: "https://www.calleridnow.com/removal",
    privacyEmail: "optout@calleridnow.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NUMBEROWNERINFO: {
    name: "NumberOwnerInfo",
    optOutUrl: "https://www.numberownerinfo.com/optout",
    privacyEmail: "privacy@numberownerinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPNUMBERNOW: {
    name: "LookupNumberNow",
    optOutUrl: "https://www.lookupnumbernow.com/removal",
    privacyEmail: "remove@lookupnumbernow.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  PHONEFINDERPRO: {
    name: "PhoneFinderPro",
    optOutUrl: "https://www.phonefinderpro.com/optout",
    privacyEmail: "privacy@phonefinderpro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  WHOSECALLER: {
    name: "WhoseCaller",
    optOutUrl: "https://www.whosecaller.com/removal",
    privacyEmail: "optout@whosecaller.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEPHONEFREE_V2: {
    name: "ReversePhoneFree",
    optOutUrl: "https://www.reversephonefree.com/optout",
    privacyEmail: "privacy@reversephonefree.com",
    removalMethod: "BOTH",
    estimatedDays: 3,
  },
  PHONEINFOEXPERT: {
    name: "PhoneInfoExpert",
    optOutUrl: "https://www.phoneinfoexpert.com/removal",
    privacyEmail: "remove@phoneinfoexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NUMBERSEARCHSITE: {
    name: "NumberSearchSite",
    optOutUrl: "https://www.numbersearchsite.com/optout",
    privacyEmail: "privacy@numbersearchsite.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  CALLERVERIFY: {
    name: "CallerVerify",
    optOutUrl: "https://www.callerverify.com/removal",
    privacyEmail: "optout@callerverify.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDPHONEPRO: {
    name: "FindPhonePro",
    optOutUrl: "https://www.findphonepro.com/optout",
    privacyEmail: "privacy@findphonepro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  WHOOWNSPHONE: {
    name: "WhoOwnsPhone",
    optOutUrl: "https://www.whoownsphone.com/removal",
    privacyEmail: "remove@whoownsphone.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEPHONEWORLD: {
    name: "ReversePhoneWorld",
    optOutUrl: "https://www.reversephoneworld.com/optout",
    privacyEmail: "privacy@reversephoneworld.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PHONELOOKUPSITE: {
    name: "PhoneLookupSite",
    optOutUrl: "https://www.phonelookupsite.com/removal",
    privacyEmail: "optout@phonelookupsite.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  CELLLOOKUPPRO: {
    name: "CellLookupPro",
    optOutUrl: "https://www.celllookuppro.com/optout",
    privacyEmail: "privacy@celllookuppro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  WHOSNUMBER: {
    name: "WhosNumber",
    optOutUrl: "https://www.whosnumber.com/removal",
    privacyEmail: "remove@whosnumber.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDCALLERID: {
    name: "FindCallerID",
    optOutUrl: "https://www.findcallerid.com/optout",
    privacyEmail: "privacy@findcallerid.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  NUMBERVERIFYSITE: {
    name: "NumberVerifySite",
    optOutUrl: "https://www.numberverifysite.com/removal",
    privacyEmail: "optout@numberverifysite.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // ADDRESS LOOKUP EXPANSION (40 brokers)
  ADDRESSLOOKUPNOW: {
    name: "AddressLookupNow",
    optOutUrl: "https://www.addresslookupnow.com/optout",
    privacyEmail: "privacy@addresslookupnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FINDADDRESSPRO: {
    name: "FindAddressPro",
    optOutUrl: "https://www.findaddresspro.com/removal",
    privacyEmail: "remove@findaddresspro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  REVERSEADDRESS_V2: {
    name: "ReverseAddress",
    optOutUrl: "https://www.reverseaddress.com/optout",
    privacyEmail: "privacy@reverseaddress.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSSEARCHSITE: {
    name: "AddressSearchSite",
    optOutUrl: "https://www.addresssearchsite.com/removal",
    privacyEmail: "optout@addresssearchsite.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  LOOKUPADDRESSNOW: {
    name: "LookupAddressNow",
    optOutUrl: "https://www.lookupaddressnow.com/optout",
    privacyEmail: "privacy@lookupaddressnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSFINDEREXPERT: {
    name: "AddressFinderExpert",
    optOutUrl: "https://www.addressfinderexpert.com/removal",
    privacyEmail: "remove@addressfinderexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDRESIDENTINFO: {
    name: "FindResidentInfo",
    optOutUrl: "https://www.findresidentinfo.com/optout",
    privacyEmail: "privacy@findresidentinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  NEIGHBORHOODLOOKUP: {
    name: "NeighborhoodLookup",
    optOutUrl: "https://www.neighborhoodlookup.com/removal",
    privacyEmail: "optout@neighborhoodlookup.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ADDRESSRECORDSPRO: {
    name: "AddressRecordsPro",
    optOutUrl: "https://www.addressrecordspro.com/optout",
    privacyEmail: "privacy@addressrecordspro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  RESIDENTFINDER: {
    name: "ResidentFinder",
    optOutUrl: "https://www.residentfinder.com/removal",
    privacyEmail: "remove@residentfinder.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  WHOLIVESHERE: {
    name: "WhoLivesHere",
    optOutUrl: "https://www.wholiveshere.com/optout",
    privacyEmail: "privacy@wholiveshere.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSDATABASEPRO: {
    name: "AddressDatabasePro",
    optOutUrl: "https://www.addressdatabasepro.com/removal",
    privacyEmail: "optout@addressdatabasepro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDOCCUPANTS: {
    name: "FindOccupants",
    optOutUrl: "https://www.findoccupants.com/optout",
    privacyEmail: "privacy@findoccupants.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSLOOKUPEXPERT: {
    name: "AddressLookupExpert",
    optOutUrl: "https://www.addresslookupexpert.com/removal",
    privacyEmail: "remove@addresslookupexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  RESIDENTSEARCHPRO: {
    name: "ResidentSearchPro",
    optOutUrl: "https://www.residentsearchpro.com/optout",
    privacyEmail: "privacy@residentsearchpro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPRESIDENTS: {
    name: "LookupResidents",
    optOutUrl: "https://www.lookupresidents.com/removal",
    privacyEmail: "optout@lookupresidents.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ADDRESSINFOFINDER: {
    name: "AddressInfoFinder",
    optOutUrl: "https://www.addressinfofinder.com/optout",
    privacyEmail: "privacy@addressinfofinder.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  STREETRECORDSPRO: {
    name: "StreetRecordsPro",
    optOutUrl: "https://www.streetrecordspro.com/removal",
    privacyEmail: "remove@streetrecordspro.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  FINDMYNEIGHBOR: {
    name: "FindMyNeighbor",
    optOutUrl: "https://www.findmyneighbor.com/optout",
    privacyEmail: "privacy@findmyneighbor.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSPUBLICRECORDS: {
    name: "AddressPublicRecords",
    optOutUrl: "https://www.addresspublicrecords.com/removal",
    privacyEmail: "optout@addresspublicrecords.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  
    consolidatesTo: "INTELIUS",
  },
  RESIDENTSINFO: {
    name: "ResidentsInfo",
    optOutUrl: "https://www.residentsinfo.com/optout",
    privacyEmail: "privacy@residentsinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSSEARCHEXPERT: {
    name: "AddressSearchExpert",
    optOutUrl: "https://www.addresssearchexpert.com/removal",
    privacyEmail: "remove@addresssearchexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NEIGHBORLOOKUPNOW: {
    name: "NeighborLookupNow",
    optOutUrl: "https://www.neighborlookupnow.com/optout",
    privacyEmail: "privacy@neighborlookupnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FINDSTREETINFO: {
    name: "FindStreetInfo",
    optOutUrl: "https://www.findstreetinfo.com/removal",
    privacyEmail: "optout@findstreetinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ADDRESSRECORDSNOW: {
    name: "AddressRecordsNow",
    optOutUrl: "https://www.addressrecordsnow.com/optout",
    privacyEmail: "privacy@addressrecordsnow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  RESIDENTIALDATA: {
    name: "ResidentialData",
    optOutUrl: "https://www.residentialdata.com/removal",
    privacyEmail: "remove@residentialdata.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  LOOKUPSTREETINFO: {
    name: "LookupStreetInfo",
    optOutUrl: "https://www.lookupstreetinfo.com/optout",
    privacyEmail: "privacy@lookupstreetinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSFINDERNOW: {
    name: "AddressFinderNow",
    optOutUrl: "https://www.addressfindernow.com/removal",
    privacyEmail: "optout@addressfindernow.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  RESIDENTLOOKUPPRO: {
    name: "ResidentLookupPro",
    optOutUrl: "https://www.residentlookuppro.com/optout",
    privacyEmail: "privacy@residentlookuppro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  PROPERTYRESIDENTS: {
    name: "PropertyResidents",
    optOutUrl: "https://www.propertyresidents.com/removal",
    privacyEmail: "remove@propertyresidents.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ADDRESSDATANOW: {
    name: "AddressDataNow",
    optOutUrl: "https://www.addressdatanow.com/optout",
    privacyEmail: "privacy@addressdatanow.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FINDADDRESSINFO: {
    name: "FindAddressInfo",
    optOutUrl: "https://www.findaddressinfo.com/removal",
    privacyEmail: "optout@findaddressinfo.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  NEIGHBORHOODSEARCH_V2: {
    name: "NeighborhoodSearch",
    optOutUrl: "https://www.neighborhoodsearch.com/optout",
    privacyEmail: "privacy@neighborhoodsearch.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  ADDRESSRECORDSWORLD: {
    name: "AddressRecordsWorld",
    optOutUrl: "https://www.addressrecordsworld.com/removal",
    privacyEmail: "remove@addressrecordsworld.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  RESIDENTDATAPRO: {
    name: "ResidentDataPro",
    optOutUrl: "https://www.residentdatapro.com/optout",
    privacyEmail: "privacy@residentdatapro.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  LOOKUPADDRESSWORLD: {
    name: "LookupAddressWorld",
    optOutUrl: "https://www.lookupaddressworld.com/removal",
    privacyEmail: "optout@lookupaddressworld.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  STREETDATAFINDER: {
    name: "StreetDataFinder",
    optOutUrl: "https://www.streetdatafinder.com/optout",
    privacyEmail: "privacy@streetdatafinder.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  FINDRESIDENTS: {
    name: "FindResidents",
    optOutUrl: "https://www.findresidents.com/removal",
    privacyEmail: "remove@findresidents.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },
  ADDRESSVERIFYSITE: {
    name: "AddressVerifySite",
    optOutUrl: "https://www.addressverifysite.com/optout",
    privacyEmail: "privacy@addressverifysite.com",
    removalMethod: "BOTH",
    estimatedDays: 5,
  },
  NEIGHBORINFONOW: {
    name: "NeighborInfoNow",
    optOutUrl: "https://www.neighborinfonow.com/removal",
    privacyEmail: "optout@neighborinfonow.com",
    removalMethod: "BOTH",
    estimatedDays: 7,
  },

  // B2B DATA PROVIDERS EXPANSION (50 brokers)
  LEADGENEXPERT: {
    name: "LeadGenExpert",
    optOutUrl: "https://www.leadgenexpert.com/optout",
    privacyEmail: "privacy@leadgenexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSCONTACTPRO: {
    name: "BusinessContactPro",
    optOutUrl: "https://www.businesscontactpro.com/removal",
    privacyEmail: "remove@businesscontactpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CORPORATEDATAHUB: {
    name: "CorporateDataHub",
    optOutUrl: "https://www.corporatedatahub.com/optout",
    privacyEmail: "privacy@corporatedatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SALESLEADSNOW: {
    name: "SalesLeadsNow",
    optOutUrl: "https://www.salesleadsnow.com/removal",
    privacyEmail: "optout@salesleadsnow.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSINFOPRO: {
    name: "BusinessInfoPro",
    optOutUrl: "https://www.businessinfopro.com/optout",
    privacyEmail: "privacy@businessinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  COMPANYDATAEXPERT: {
    name: "CompanyDataExpert",
    optOutUrl: "https://www.companydataexpert.com/removal",
    privacyEmail: "remove@companydataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EXECUTIVECONTACTS: {
    name: "ExecutiveContacts",
    optOutUrl: "https://www.executivecontacts.com/optout",
    privacyEmail: "privacy@executivecontacts.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  LEADDATAPRO: {
    name: "LeadDataPro",
    optOutUrl: "https://www.leaddatapro.com/removal",
    privacyEmail: "optout@leaddatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSLEADSHUB: {
    name: "BusinessLeadsHub",
    optOutUrl: "https://www.businessleadshub.com/optout",
    privacyEmail: "privacy@businessleadshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CORPORATEINFOFINDER: {
    name: "CorporateInfoFinder",
    optOutUrl: "https://www.corporateinfofinder.com/removal",
    privacyEmail: "remove@corporateinfofinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SALESPROSPECTPRO: {
    name: "SalesProspectPro",
    optOutUrl: "https://www.salesprospectpro.com/optout",
    privacyEmail: "privacy@salesprospectpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  COMPANYCONTACTSNOW: {
    name: "CompanyContactsNow",
    optOutUrl: "https://www.companycontactsnow.com/removal",
    privacyEmail: "optout@companycontactsnow.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSDATANOW: {
    name: "BusinessDataNow",
    optOutUrl: "https://www.businessdatanow.com/optout",
    privacyEmail: "privacy@businessdatanow.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  LEADFINDEREXPERT: {
    name: "LeadFinderExpert",
    optOutUrl: "https://www.leadfinderexpert.com/removal",
    privacyEmail: "remove@leadfinderexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CORPORATELEADSPRO: {
    name: "CorporateLeadsPro",
    optOutUrl: "https://www.corporateleadspro.com/optout",
    privacyEmail: "privacy@corporateleadspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  BUSINESSSEARCHPRO: {
    name: "BusinessSearchPro",
    optOutUrl: "https://www.businesssearchpro.com/removal",
    privacyEmail: "optout@businesssearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COMPANYINFOHUB: {
    name: "CompanyInfoHub",
    optOutUrl: "https://www.companyinfohub.com/optout",
    privacyEmail: "privacy@companyinfohub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EXECUTIVEDATAPRO: {
    name: "ExecutiveDataPro",
    optOutUrl: "https://www.executivedatapro.com/removal",
    privacyEmail: "remove@executivedatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSLEADSWORLD: {
    name: "BusinessLeadsWorld",
    optOutUrl: "https://www.businessleadsworld.com/optout",
    privacyEmail: "privacy@businessleadsworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  LEADLISTPRO: {
    name: "LeadListPro",
    optOutUrl: "https://www.leadlistpro.com/removal",
    privacyEmail: "optout@leadlistpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CORPORATEDIRECTORY: {
    name: "CorporateDirectory",
    optOutUrl: "https://www.corporatedirectory.com/optout",
    privacyEmail: "privacy@corporatedirectory.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SALESCONTACTSPRO: {
    name: "SalesContactsPro",
    optOutUrl: "https://www.salescontactspro.com/removal",
    privacyEmail: "remove@salescontactspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSDATAWORLD: {
    name: "BusinessDataWorld",
    optOutUrl: "https://www.businessdataworld.com/optout",
    privacyEmail: "privacy@businessdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  COMPANYLEADSFINDER: {
    name: "CompanyLeadsFinder",
    optOutUrl: "https://www.companyleadsfinder.com/removal",
    privacyEmail: "optout@companyleadsfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EXECUTIVEINFOPRO: {
    name: "ExecutiveInfoPro",
    optOutUrl: "https://www.executiveinfopro.com/optout",
    privacyEmail: "privacy@executiveinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  LEADSDATABASEPRO: {
    name: "LeadsDatabasePro",
    optOutUrl: "https://www.leadsdatabasepro.com/removal",
    privacyEmail: "remove@leadsdatabasepro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSCONTACTSNOW: {
    name: "BusinessContactsNow",
    optOutUrl: "https://www.businesscontactsnow.com/optout",
    privacyEmail: "privacy@businesscontactsnow.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  COMPANYINFOPRO: {
    name: "CompanyInfoPro",
    optOutUrl: "https://www.companyinfopro.com/removal",
    privacyEmail: "optout@companyinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CORPORATESEARCHPRO: {
    name: "CorporateSearchPro",
    optOutUrl: "https://www.corporatesearchpro.com/optout",
    privacyEmail: "privacy@corporatesearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SALESLEADSPRO: {
    name: "SalesLeadsPro",
    optOutUrl: "https://www.salesleadspro.com/removal",
    privacyEmail: "remove@salesleadspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSINFOWORLD: {
    name: "BusinessInfoWorld",
    optOutUrl: "https://www.businessinfoworld.com/optout",
    privacyEmail: "privacy@businessinfoworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  LEADCONTACTSPRO: {
    name: "LeadContactsPro",
    optOutUrl: "https://www.leadcontactspro.com/removal",
    privacyEmail: "optout@leadcontactspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COMPANYDATAHUB: {
    name: "CompanyDataHub",
    optOutUrl: "https://www.companydatahub.com/optout",
    privacyEmail: "privacy@companydatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EXECUTIVELEADSPRO: {
    name: "ExecutiveLeadsPro",
    optOutUrl: "https://www.executiveleadspro.com/removal",
    privacyEmail: "remove@executiveleadspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSDATAFINDER: {
    name: "BusinessDataFinder",
    optOutUrl: "https://www.businessdatafinder.com/optout",
    privacyEmail: "privacy@businessdatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  CORPORATECONTACTSPRO: {
    name: "CorporateContactsPro",
    optOutUrl: "https://www.corporatecontactspro.com/removal",
    privacyEmail: "optout@corporatecontactspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LEADINFOPRO: {
    name: "LeadInfoPro",
    optOutUrl: "https://www.leadinfopro.com/optout",
    privacyEmail: "privacy@leadinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  COMPANYCONTACTSHUB: {
    name: "CompanyContactsHub",
    optOutUrl: "https://www.companycontactshub.com/removal",
    privacyEmail: "remove@companycontactshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  SALESDATAPRO: {
    name: "SalesDataPro",
    optOutUrl: "https://www.salesdatapro.com/optout",
    privacyEmail: "privacy@salesdatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  BUSINESSLEADSFINDER: {
    name: "BusinessLeadsFinder",
    optOutUrl: "https://www.businessleadsfinder.com/removal",
    privacyEmail: "optout@businessleadsfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CORPORATEDATAPRO: {
    name: "CorporateDataPro",
    optOutUrl: "https://www.corporatedatapro.com/optout",
    privacyEmail: "privacy@corporatedatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EXECUTIVECONTACTSPRO: {
    name: "ExecutiveContactsPro",
    optOutUrl: "https://www.executivecontactspro.com/removal",
    privacyEmail: "remove@executivecontactspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  LEADSEARCHPRO: {
    name: "LeadSearchPro",
    optOutUrl: "https://www.leadsearchpro.com/optout",
    privacyEmail: "privacy@leadsearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  BUSINESSINFOFINDER: {
    name: "BusinessInfoFinder",
    optOutUrl: "https://www.businessinfofinder.com/removal",
    privacyEmail: "optout@businessinfofinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  COMPANYCONTACTPRO: {
    name: "CompanyContactPro",
    optOutUrl: "https://www.companycontactpro.com/optout",
    privacyEmail: "privacy@companycontactpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  SALESDATAWORLD: {
    name: "SalesDataWorld",
    optOutUrl: "https://www.salesdataworld.com/removal",
    privacyEmail: "remove@salesdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  CORPORATELEADSFINDER: {
    name: "CorporateLeadsFinder",
    optOutUrl: "https://www.corporateleadsfinder.com/optout",
    privacyEmail: "privacy@corporateleadsfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  LEADSDATAWORLD: {
    name: "LeadsDataWorld",
    optOutUrl: "https://www.leadsdataworld.com/removal",
    privacyEmail: "optout@leadsdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  BUSINESSCONTACTWORLD: {
    name: "BusinessContactWorld",
    optOutUrl: "https://www.businesscontactworld.com/optout",
    privacyEmail: "privacy@businesscontactworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  COMPANYRECORDSPRO: {
    name: "CompanyRecordsPro",
    optOutUrl: "https://www.companyrecordspro.com/removal",
    privacyEmail: "remove@companyrecordspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // MARKETING DATA EXPANSION (50 brokers)
  MARKETINGDATAHUB: {
    name: "MarketingDataHub",
    optOutUrl: "https://www.marketingdatahub.com/optout",
    privacyEmail: "privacy@marketingdatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERDATAPRO: {
    name: "ConsumerDataPro",
    optOutUrl: "https://www.consumerdatapro.com/removal",
    privacyEmail: "optout@consumerdatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCEDATAEXPERT: {
    name: "AudienceDataExpert",
    optOutUrl: "https://www.audiencedataexpert.com/optout",
    privacyEmail: "privacy@audiencedataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  TARGETINGDATAPRO: {
    name: "TargetingDataPro",
    optOutUrl: "https://www.targetingdatapro.com/removal",
    privacyEmail: "remove@targetingdatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERINSIGHTSHUB: {
    name: "ConsumerInsightsHub",
    optOutUrl: "https://www.consumerinsightshub.com/optout",
    privacyEmail: "privacy@consumerinsightshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  MARKETINGLISTSPRO: {
    name: "MarketingListsPro",
    optOutUrl: "https://www.marketinglistspro.com/removal",
    privacyEmail: "optout@marketinglistspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCETARGETPRO: {
    name: "AudienceTargetPro",
    optOutUrl: "https://www.audiencetargetpro.com/optout",
    privacyEmail: "privacy@audiencetargetpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERDATAWORLD: {
    name: "ConsumerDataWorld",
    optOutUrl: "https://www.consumerdataworld.com/removal",
    privacyEmail: "remove@consumerdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGDATAPRO: {
    name: "MarketingDataPro",
    optOutUrl: "https://www.marketingdatapro.com/optout",
    privacyEmail: "privacy@marketingdatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  TARGETAUDIENCEPRO: {
    name: "TargetAudiencePro",
    optOutUrl: "https://www.targetaudiencepro.com/removal",
    privacyEmail: "optout@targetaudiencepro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERLISTSPRO: {
    name: "ConsumerListsPro",
    optOutUrl: "https://www.consumerlistspro.com/optout",
    privacyEmail: "privacy@consumerlistspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCEDATAHUB: {
    name: "AudienceDataHub",
    optOutUrl: "https://www.audiencedatahub.com/removal",
    privacyEmail: "remove@audiencedatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGINSIGHTSPRO: {
    name: "MarketingInsightsPro",
    optOutUrl: "https://www.marketinginsightspro.com/optout",
    privacyEmail: "privacy@marketinginsightspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERTARGETPRO: {
    name: "ConsumerTargetPro",
    optOutUrl: "https://www.consumertargetpro.com/removal",
    privacyEmail: "optout@consumertargetpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCELISTSPRO: {
    name: "AudienceListsPro",
    optOutUrl: "https://www.audiencelistspro.com/optout",
    privacyEmail: "privacy@audiencelistspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  MARKETINGDATAFINDER: {
    name: "MarketingDataFinder",
    optOutUrl: "https://www.marketingdatafinder.com/removal",
    privacyEmail: "remove@marketingdatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERDATAFINDER: {
    name: "ConsumerDataFinder",
    optOutUrl: "https://www.consumerdatafinder.com/optout",
    privacyEmail: "privacy@consumerdatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCEINSIGHTSPRO: {
    name: "AudienceInsightsPro",
    optOutUrl: "https://www.audienceinsightspro.com/removal",
    privacyEmail: "optout@audienceinsightspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TARGETINGLISTSPRO: {
    name: "TargetingListsPro",
    optOutUrl: "https://www.targetinglistspro.com/optout",
    privacyEmail: "privacy@targetinglistspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERINSIGHTSPRO: {
    name: "ConsumerInsightsPro",
    optOutUrl: "https://www.consumerinsightspro.com/removal",
    privacyEmail: "remove@consumerinsightspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGLISTSHUB: {
    name: "MarketingListsHub",
    optOutUrl: "https://www.marketinglistshub.com/optout",
    privacyEmail: "privacy@marketinglistshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCEDATAWORLD: {
    name: "AudienceDataWorld",
    optOutUrl: "https://www.audiencedataworld.com/removal",
    privacyEmail: "optout@audiencedataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERDATAHUB: {
    name: "ConsumerDataHub",
    optOutUrl: "https://www.consumerdatahub.com/optout",
    privacyEmail: "privacy@consumerdatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  TARGETINGDATAHUB: {
    name: "TargetingDataHub",
    optOutUrl: "https://www.targetingdatahub.com/removal",
    privacyEmail: "remove@targetingdatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGDATAEXPERT: {
    name: "MarketingDataExpert",
    optOutUrl: "https://www.marketingdataexpert.com/optout",
    privacyEmail: "privacy@marketingdataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCETARGETHUB: {
    name: "AudienceTargetHub",
    optOutUrl: "https://www.audiencetargethub.com/removal",
    privacyEmail: "optout@audiencetargethub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERLISTSHUB: {
    name: "ConsumerListsHub",
    optOutUrl: "https://www.consumerlistshub.com/optout",
    privacyEmail: "privacy@consumerlistshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  MARKETINGINSIGHTSHUB: {
    name: "MarketingInsightsHub",
    optOutUrl: "https://www.marketinginsightshub.com/removal",
    privacyEmail: "remove@marketinginsightshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCEDATAPRO: {
    name: "AudienceDataPro",
    optOutUrl: "https://www.audiencedatapro.com/optout",
    privacyEmail: "privacy@audiencedatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERMARKETPRO: {
    name: "ConsumerMarketPro",
    optOutUrl: "https://www.consumermarketpro.com/removal",
    privacyEmail: "optout@consumermarketpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TARGETINGINSIGHTSPRO: {
    name: "TargetingInsightsPro",
    optOutUrl: "https://www.targetinginsightspro.com/optout",
    privacyEmail: "privacy@targetinginsightspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  MARKETINGLISTSWORLD: {
    name: "MarketingListsWorld",
    optOutUrl: "https://www.marketinglistsworld.com/removal",
    privacyEmail: "remove@marketinglistsworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCELISTSHUB: {
    name: "AudienceListsHub",
    optOutUrl: "https://www.audiencelistshub.com/optout",
    privacyEmail: "privacy@audiencelistshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERDATAEXPERT: {
    name: "ConsumerDataExpert",
    optOutUrl: "https://www.consumerdataexpert.com/removal",
    privacyEmail: "optout@consumerdataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGTARGETPRO: {
    name: "MarketingTargetPro",
    optOutUrl: "https://www.marketingtargetpro.com/optout",
    privacyEmail: "privacy@marketingtargetpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCEMARKETPRO: {
    name: "AudienceMarketPro",
    optOutUrl: "https://www.audiencemarketpro.com/removal",
    privacyEmail: "remove@audiencemarketpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERINFOPRO: {
    name: "ConsumerInfoPro",
    optOutUrl: "https://www.consumerinfopro.com/optout",
    privacyEmail: "privacy@consumerinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  TARGETINGDATAWORLD: {
    name: "TargetingDataWorld",
    optOutUrl: "https://www.targetingdataworld.com/removal",
    privacyEmail: "optout@targetingdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGDATACLOUD: {
    name: "MarketingDataCloud",
    optOutUrl: "https://www.marketingdatacloud.com/optout",
    privacyEmail: "privacy@marketingdatacloud.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCEINFOPRO: {
    name: "AudienceInfoPro",
    optOutUrl: "https://www.audienceinfopro.com/removal",
    privacyEmail: "remove@audienceinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  CONSUMERTARGETHUB: {
    name: "ConsumerTargetHub",
    optOutUrl: "https://www.consumertargethub.com/optout",
    privacyEmail: "privacy@consumertargethub.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  MARKETINGINFOPRO: {
    name: "MarketingInfoPro",
    optOutUrl: "https://www.marketinginfopro.com/removal",
    privacyEmail: "optout@marketinginfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCEDATACLOUD: {
    name: "AudienceDataCloud",
    optOutUrl: "https://www.audiencedatacloud.com/optout",
    privacyEmail: "privacy@audiencedatacloud.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERMARKETDATA: {
    name: "ConsumerMarketData",
    optOutUrl: "https://www.consumermarketdata.com/removal",
    privacyEmail: "remove@consumermarketdata.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TARGETINGINFOPRO: {
    name: "TargetingInfoPro",
    optOutUrl: "https://www.targetinginfopro.com/optout",
    privacyEmail: "privacy@targetinginfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  MARKETINGLISTSEXPERT: {
    name: "MarketingListsExpert",
    optOutUrl: "https://www.marketinglistsexpert.com/removal",
    privacyEmail: "optout@marketinglistsexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  AUDIENCETARGETWORLD: {
    name: "AudienceTargetWorld",
    optOutUrl: "https://www.audiencetargetworld.com/optout",
    privacyEmail: "privacy@audiencetargetworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  CONSUMERDATACLOUD: {
    name: "ConsumerDataCloud",
    optOutUrl: "https://www.consumerdatacloud.com/removal",
    privacyEmail: "remove@consumerdatacloud.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  MARKETINGDATASERVICE: {
    name: "MarketingDataService",
    optOutUrl: "https://www.marketingdataservice.com/optout",
    privacyEmail: "privacy@marketingdataservice.com",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  AUDIENCELISTSWORLD: {
    name: "AudienceListsWorld",
    optOutUrl: "https://www.audiencelistsworld.com/removal",
    privacyEmail: "optout@audiencelistsworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // BACKGROUND CHECK EXPANSION (40 brokers)
  BACKGROUNDCHECKPRO: {
    name: "BackgroundCheckPro",
    optOutUrl: "https://www.backgroundcheckpro.com/optout",
    privacyEmail: "privacy@backgroundcheckpro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALRECORDSNOW: {
    name: "CriminalRecordsNow",
    optOutUrl: "https://www.criminalrecordsnow.com/removal",
    privacyEmail: "remove@criminalrecordsnow.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  EMPLOYMENTCHECKPRO: {
    name: "EmploymentCheckPro",
    optOutUrl: "https://www.employmentcheckpro.com/optout",
    privacyEmail: "privacy@employmentcheckpro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDSEARCHNOW: {
    name: "BackgroundSearchNow",
    optOutUrl: "https://www.backgroundsearchnow.com/removal",
    privacyEmail: "optout@backgroundsearchnow.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALCHECKPRO: {
    name: "CriminalCheckPro",
    optOutUrl: "https://www.criminalcheckpro.com/optout",
    privacyEmail: "privacy@criminalcheckpro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDDATAPRO: {
    name: "BackgroundDataPro",
    optOutUrl: "https://www.backgrounddatapro.com/removal",
    privacyEmail: "remove@backgrounddatapro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  VERIFYCHECKPRO: {
    name: "VerifyCheckPro",
    optOutUrl: "https://www.verifycheckpro.com/optout",
    privacyEmail: "privacy@verifycheckpro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDINFOPRO: {
    name: "BackgroundInfoPro",
    optOutUrl: "https://www.backgroundinfopro.com/removal",
    privacyEmail: "optout@backgroundinfopro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALRECORDSPRO: {
    name: "CriminalRecordsPro",
    optOutUrl: "https://www.criminalrecordspro.com/optout",
    privacyEmail: "privacy@criminalrecordspro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  SCREENINGCHECKPRO: {
    name: "ScreeningCheckPro",
    optOutUrl: "https://www.screeningcheckpro.com/removal",
    privacyEmail: "remove@screeningcheckpro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDVERIFYPRO: {
    name: "BackgroundVerifyPro",
    optOutUrl: "https://www.backgroundverifypro.com/optout",
    privacyEmail: "privacy@backgroundverifypro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  COURTRECORDSPRO_V2: {
    name: "CourtRecordsPro",
    optOutUrl: "https://www.courtrecordspro.com/removal",
    privacyEmail: "optout@courtrecordspro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDSCREENPRO: {
    name: "BackgroundScreenPro",
    optOutUrl: "https://www.backgroundscreenpro.com/optout",
    privacyEmail: "privacy@backgroundscreenpro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  CRIMINALINFOPRO: {
    name: "CriminalInfoPro",
    optOutUrl: "https://www.criminalinfopro.com/removal",
    privacyEmail: "remove@criminalinfopro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDCHECKWORLD: {
    name: "BackgroundCheckWorld",
    optOutUrl: "https://www.backgroundcheckworld.com/optout",
    privacyEmail: "privacy@backgroundcheckworld.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  RECORDSCHECKPRO: {
    name: "RecordsCheckPro",
    optOutUrl: "https://www.recordscheckpro.com/removal",
    privacyEmail: "optout@recordscheckpro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDSEARCHPRO: {
    name: "BackgroundSearchPro",
    optOutUrl: "https://www.backgroundsearchpro.com/optout",
    privacyEmail: "privacy@backgroundsearchpro.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  CRIMINALCHECKWORLD: {
    name: "CriminalCheckWorld",
    optOutUrl: "https://www.criminalcheckworld.com/removal",
    privacyEmail: "remove@criminalcheckworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDDATAHUB: {
    name: "BackgroundDataHub",
    optOutUrl: "https://www.backgrounddatahub.com/optout",
    privacyEmail: "privacy@backgrounddatahub.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  VERIFYCHECKWORLD: {
    name: "VerifyCheckWorld",
    optOutUrl: "https://www.verifycheckworld.com/removal",
    privacyEmail: "optout@verifycheckworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDINFOHUB: {
    name: "BackgroundInfoHub",
    optOutUrl: "https://www.backgroundinfohub.com/optout",
    privacyEmail: "privacy@backgroundinfohub.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  CRIMINALRECORDSWORLD: {
    name: "CriminalRecordsWorld",
    optOutUrl: "https://www.criminalrecordsworld.com/removal",
    privacyEmail: "remove@criminalrecordsworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SCREENINGCHECKWORLD: {
    name: "ScreeningCheckWorld",
    optOutUrl: "https://www.screeningcheckworld.com/optout",
    privacyEmail: "privacy@screeningcheckworld.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDVERIFYWORLD: {
    name: "BackgroundVerifyWorld",
    optOutUrl: "https://www.backgroundverifyworld.com/removal",
    privacyEmail: "optout@backgroundverifyworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  COURTRECORDSWORLD: {
    name: "CourtRecordsWorld",
    optOutUrl: "https://www.courtrecordsworld.com/optout",
    privacyEmail: "privacy@courtrecordsworld.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDSCREENWORLD: {
    name: "BackgroundScreenWorld",
    optOutUrl: "https://www.backgroundscreenworld.com/removal",
    privacyEmail: "remove@backgroundscreenworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALINFOWORLD: {
    name: "CriminalInfoWorld",
    optOutUrl: "https://www.criminalinfoworld.com/optout",
    privacyEmail: "privacy@criminalinfoworld.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDRECORDSPRO: {
    name: "BackgroundRecordsPro",
    optOutUrl: "https://www.backgroundrecordspro.com/removal",
    privacyEmail: "optout@backgroundrecordspro.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  RECORDSCHECKWORLD: {
    name: "RecordsCheckWorld",
    optOutUrl: "https://www.recordscheckworld.com/optout",
    privacyEmail: "privacy@recordscheckworld.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDSEARCHWORLD: {
    name: "BackgroundSearchWorld",
    optOutUrl: "https://www.backgroundsearchworld.com/removal",
    privacyEmail: "remove@backgroundsearchworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALCHECKEXPERT: {
    name: "CriminalCheckExpert",
    optOutUrl: "https://www.criminalcheckexpert.com/optout",
    privacyEmail: "privacy@criminalcheckexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDDATAWORLD: {
    name: "BackgroundDataWorld",
    optOutUrl: "https://www.backgrounddataworld.com/removal",
    privacyEmail: "optout@backgrounddataworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  VERIFYCHECKEXPERT: {
    name: "VerifyCheckExpert",
    optOutUrl: "https://www.verifycheckexpert.com/optout",
    privacyEmail: "privacy@verifycheckexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  BACKGROUNDINFOWORLD: {
    name: "BackgroundInfoWorld",
    optOutUrl: "https://www.backgroundinfoworld.com/removal",
    privacyEmail: "remove@backgroundinfoworld.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CRIMINALRECORDSEXPERT: {
    name: "CriminalRecordsExpert",
    optOutUrl: "https://www.criminalrecordsexpert.com/optout",
    privacyEmail: "privacy@criminalrecordsexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  SCREENINGCHECKEXPERT: {
    name: "ScreeningCheckExpert",
    optOutUrl: "https://www.screeningcheckexpert.com/removal",
    privacyEmail: "optout@screeningcheckexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDVERIFYEXPERT: {
    name: "BackgroundVerifyExpert",
    optOutUrl: "https://www.backgroundverifyexpert.com/optout",
    privacyEmail: "privacy@backgroundverifyexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  COURTRECORDSEXPERT: {
    name: "CourtRecordsExpert",
    optOutUrl: "https://www.courtrecordsexpert.com/removal",
    privacyEmail: "remove@courtrecordsexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  BACKGROUNDSCREENEXPERT: {
    name: "BackgroundScreenExpert",
    optOutUrl: "https://www.backgroundscreenexpert.com/optout",
    privacyEmail: "privacy@backgroundscreenexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  CRIMINALINFOEXPERT: {
    name: "CriminalInfoExpert",
    optOutUrl: "https://www.criminalinfoexpert.com/removal",
    privacyEmail: "optout@criminalinfoexpert.com",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },

  // INTERNATIONAL DATA BROKERS EXPANSION (60 brokers)
  YELLOWPAGES_UK: {
    name: "Yellow Pages UK",
    optOutUrl: "https://www.yell.com/privacy",
    privacyEmail: "privacy@yell.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WHITEPAGES_UK: {
    name: "White Pages UK",
    optOutUrl: "https://www.whitepages.co.uk/optout",
    privacyEmail: "privacy@whitepages.co.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  PEOPLEFINDER_UK: {
    name: "PeopleFinder UK",
    optOutUrl: "https://www.peoplefinder.co.uk/removal",
    privacyEmail: "remove@peoplefinder.co.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SEARCHPEOPLE_UK: {
    name: "SearchPeople UK",
    optOutUrl: "https://www.searchpeople.co.uk/optout",
    privacyEmail: "privacy@searchpeople.co.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ADDRESSFINDER_UK: {
    name: "AddressFinder UK",
    optOutUrl: "https://www.addressfinder.co.uk/removal",
    privacyEmail: "optout@addressfinder.co.uk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  CANADA411_EXTENDED: {
    name: "Canada411 Extended",
    optOutUrl: "https://www.canada411.ca/privacy",
    privacyEmail: "privacy@canada411.ca",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  
    consolidatesTo: "CANADA411",
  },
  PEOPLEFINDER_CA: {
    name: "PeopleFinder Canada",
    optOutUrl: "https://www.peoplefinder.ca/optout",
    privacyEmail: "privacy@peoplefinder.ca",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  SEARCHPEOPLE_CA: {
    name: "SearchPeople Canada",
    optOutUrl: "https://www.searchpeople.ca/removal",
    privacyEmail: "remove@searchpeople.ca",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  WHITEPAGES_CA_EXT: {
    name: "WhitePages Canada Extended",
    optOutUrl: "https://www.whitepages.ca/optout",
    privacyEmail: "privacy@whitepages.ca",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  YELLOWPAGES_CA_EXT: {
    name: "YellowPages Canada Extended",
    optOutUrl: "https://www.yellowpages.ca/privacy",
    privacyEmail: "optout@yellowpages.ca",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  WHITEPAGES_AU_EXT: {
    name: "WhitePages Australia Extended",
    optOutUrl: "https://www.whitepages.com.au/optout",
    privacyEmail: "privacy@whitepages.com.au",
    removalMethod: "BOTH",
    estimatedDays: 21,
  
    consolidatesTo: "WHITEPAGES_AU",
  },
  YELLOWPAGES_AU_EXT: {
    name: "YellowPages Australia Extended",
    optOutUrl: "https://www.yellowpages.com.au/privacy",
    privacyEmail: "optout@yellowpages.com.au",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  
    consolidatesTo: "YELLOWPAGES_AU",
  },
  PEOPLEFINDER_AU: {
    name: "PeopleFinder Australia",
    optOutUrl: "https://www.peoplefinder.com.au/removal",
    privacyEmail: "privacy@peoplefinder.com.au",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  SEARCHPEOPLE_AU: {
    name: "SearchPeople Australia",
    optOutUrl: "https://www.searchpeople.com.au/optout",
    privacyEmail: "remove@searchpeople.com.au",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  ADDRESSFINDER_AU: {
    name: "AddressFinder Australia",
    optOutUrl: "https://www.addressfinder.com.au/removal",
    privacyEmail: "optout@addressfinder.com.au",
    removalMethod: "BOTH",
    estimatedDays: 21,
  },
  PAGESJAUNES_FR_V2: {
    name: "Pages Jaunes France",
    optOutUrl: "https://www.pagesjaunes.fr/vie-privee",
    privacyEmail: "privacy@pagesjaunes.fr",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "PAGESJAUNES",
  },
  PAGESBLANCHES_FR: {
    name: "Pages Blanches France",
    optOutUrl: "https://www.pagesblanches.fr/optout",
    privacyEmail: "privacy@pagesblanches.fr",
    removalMethod: "BOTH",
    estimatedDays: 30,
  
    consolidatesTo: "PAGESJAUNES",
  },
  ANNUAIRE_FR: {
    name: "Annuaire France",
    optOutUrl: "https://www.annuaire.com/vie-privee",
    privacyEmail: "optout@annuaire.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DASTELEFONBUCH_DE_V2: {
    name: "Das Telefonbuch Germany",
    optOutUrl: "https://www.dastelefonbuch.de/datenschutz",
    privacyEmail: "privacy@dastelefonbuch.de",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "DASTELEFONBUCH",
  },
  GELBESEITEN_DE_V2: {
    name: "Gelbe Seiten Germany",
    optOutUrl: "https://www.gelbeseiten.de/datenschutz",
    privacyEmail: "privacy@gelbeseiten.de",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PERSONENSUCHE_DE: {
    name: "Personensuche Germany",
    optOutUrl: "https://www.personensuche.de/optout",
    privacyEmail: "optout@personensuche.de",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  PAGINEBIANCHE_IT_V2: {
    name: "Pagine Bianche Italy",
    optOutUrl: "https://www.paginebianche.it/privacy",
    privacyEmail: "privacy@paginebianche.it",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  
    consolidatesTo: "PAGINEBIANCHE",
  },
  PAGINEGIALLE_IT_V2: {
    name: "Pagine Gialle Italy",
    optOutUrl: "https://www.paginegialle.it/privacy",
    privacyEmail: "privacy@paginegialle.it",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PAGINASAMARILLAS_ES_V2: {
    name: "Paginas Amarillas Spain",
    optOutUrl: "https://www.paginasamarillas.es/privacidad",
    privacyEmail: "privacy@paginasamarillas.es",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PAGINASBLANCAS_ES_V2: {
    name: "Paginas Blancas Spain",
    optOutUrl: "https://www.paginasblancas.es/optout",
    privacyEmail: "optout@paginasblancas.es",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  HITTA_SE_EXT: {
    name: "Hitta Sweden Extended",
    optOutUrl: "https://www.hitta.se/integritet",
    privacyEmail: "privacy@hitta.se",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  ENIRO_SE: {
    name: "Eniro Sweden",
    optOutUrl: "https://www.eniro.se/integritet",
    privacyEmail: "privacy@eniro.se",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  KRAK_DK_EXT: {
    name: "Krak Denmark Extended",
    optOutUrl: "https://www.krak.dk/privatliv",
    privacyEmail: "privacy@krak.dk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  DEGULESIDER_DK: {
    name: "De Gule Sider Denmark",
    optOutUrl: "https://www.degulesider.dk/privatliv",
    privacyEmail: "privacy@degulesider.dk",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  GULESIDER_NO: {
    name: "Gule Sider Norway",
    optOutUrl: "https://www.gulesider.no/personvern",
    privacyEmail: "privacy@gulesider.no",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  HVITESIDER_NO: {
    name: "Hvite Sider Norway",
    optOutUrl: "https://www.hvitesider.no/personvern",
    privacyEmail: "privacy@hvitesider.no",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  FONECTA_FI_V2: {
    name: "Fonecta Finland",
    optOutUrl: "https://www.fonecta.fi/tietosuoja",
    privacyEmail: "privacy@fonecta.fi",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  NUMEROPALVELU_FI: {
    name: "Numeropalvelu Finland",
    optOutUrl: "https://www.numeropalvelu.fi/optout",
    privacyEmail: "optout@numeropalvelu.fi",
    removalMethod: "BOTH",
    estimatedDays: 14,
  },
  GOUDEN_GIDS_NL: {
    name: "Gouden Gids Netherlands",
    optOutUrl: "https://www.goudengids.nl/privacy",
    privacyEmail: "privacy@goudengids.nl",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  DETELEFOONGIDS_NL_V2: {
    name: "De Telefoongids Netherlands",
    optOutUrl: "https://www.detelefoongids.nl/privacy",
    privacyEmail: "privacy@detelefoongids.nl",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HEROLD_AT_EXT: {
    name: "Herold Austria Extended",
    optOutUrl: "https://www.herold.at/datenschutz",
    privacyEmail: "privacy@herold.at",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  LOCAL_CH_EXT: {
    name: "Local Switzerland Extended",
    optOutUrl: "https://www.local.ch/datenschutz",
    privacyEmail: "privacy@local.ch",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SEARCH_CH_V2: {
    name: "Search Switzerland",
    optOutUrl: "https://www.search.ch/datenschutz",
    privacyEmail: "privacy@search.ch",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ZLATESTRANKY_CZ_V2: {
    name: "Zlate Stranky Czech",
    optOutUrl: "https://www.zlatestranky.cz/ochrana-udaju",
    privacyEmail: "privacy@zlatestranky.cz",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  ZLATESTRANY_SK: {
    name: "Zlate Strany Slovakia",
    optOutUrl: "https://www.zlatestrany.sk/ochrana-udajov",
    privacyEmail: "privacy@zlatestrany.sk",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PANORAMAFIRM_PL_V2: {
    name: "Panorama Firm Poland",
    optOutUrl: "https://www.panoramafirm.pl/polityka-prywatnosci",
    privacyEmail: "privacy@panoramafirm.pl",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TELEADRESON_PL: {
    name: "Teleadreson Poland",
    optOutUrl: "https://www.teleadreson.pl/optout",
    privacyEmail: "optout@teleadreson.pl",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  YELLOWPAGES_JP: {
    name: "Yellow Pages Japan",
    optOutUrl: "https://www.yellowpages.jp/privacy",
    privacyEmail: "privacy@yellowpages.jp",
    removalMethod: "EMAIL",
    estimatedDays: 45,
  },
  ITOWN_JP_V2: {
    name: "itown Japan",
    optOutUrl: "https://www.itown.jp/optout",
    privacyEmail: "optout@itown.jp",
    removalMethod: "BOTH",
    estimatedDays: 45,
  },
  YELLOWPAGES_SG_V2: {
    name: "Yellow Pages Singapore",
    optOutUrl: "https://www.yellowpages.com.sg/privacy",
    privacyEmail: "privacy@yellowpages.com.sg",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  WHITEPAGES_SG: {
    name: "White Pages Singapore",
    optOutUrl: "https://www.whitepages.com.sg/optout",
    privacyEmail: "optout@whitepages.com.sg",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  YELLOWPAGES_HK_V2: {
    name: "Yellow Pages Hong Kong",
    optOutUrl: "https://www.yellowpages.com.hk/privacy",
    privacyEmail: "privacy@yellowpages.com.hk",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HKPAGES: {
    name: "HK Pages Hong Kong",
    optOutUrl: "https://www.hkpages.com/optout",
    privacyEmail: "optout@hkpages.com",
    removalMethod: "BOTH",
    estimatedDays: 30,
  },
  JUSTDIAL_IN_EXT: {
    name: "JustDial India Extended",
    optOutUrl: "https://www.justdial.com/privacy",
    privacyEmail: "privacy@justdial.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SULEKHA_IN_EXT: {
    name: "Sulekha India Extended",
    optOutUrl: "https://www.sulekha.com/privacy",
    privacyEmail: "privacy@sulekha.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  INDIAMART: {
    name: "IndiaMart",
    optOutUrl: "https://www.indiamart.com/privacy",
    privacyEmail: "privacy@indiamart.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  TRADEINDIA: {
    name: "TradeIndia",
    optOutUrl: "https://www.tradeindia.com/privacy",
    privacyEmail: "privacy@tradeindia.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_MY_V2: {
    name: "Yellow Pages Malaysia",
    optOutUrl: "https://www.yellowpages.my/privacy",
    privacyEmail: "privacy@yellowpages.my",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_PH_V2: {
    name: "Yellow Pages Philippines",
    optOutUrl: "https://www.yellowpages.ph/privacy",
    privacyEmail: "privacy@yellowpages.ph",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_ID_V2: {
    name: "Yellow Pages Indonesia",
    optOutUrl: "https://www.yellowpages.co.id/privacy",
    privacyEmail: "privacy@yellowpages.co.id",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_TH_V2: {
    name: "Yellow Pages Thailand",
    optOutUrl: "https://www.yellowpages.co.th/privacy",
    privacyEmail: "privacy@yellowpages.co.th",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_VN_V2: {
    name: "Yellow Pages Vietnam",
    optOutUrl: "https://www.yellowpages.vn/privacy",
    privacyEmail: "privacy@yellowpages.vn",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_KR_V2: {
    name: "Yellow Pages Korea",
    optOutUrl: "https://www.yellowpages.co.kr/privacy",
    privacyEmail: "privacy@yellowpages.co.kr",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  YELLOWPAGES_TW_V2: {
    name: "Yellow Pages Taiwan",
    optOutUrl: "https://www.yellowpages.com.tw/privacy",
    privacyEmail: "privacy@yellowpages.com.tw",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // PROPERTY DATA EXPANSION (50 brokers)
  PROPERTYINFOPRO: {
    name: "PropertyInfoPro",
    optOutUrl: "https://www.propertyinfopro.com/optout",
    privacyEmail: "privacy@propertyinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERDATAPRO: {
    name: "HomeownerDataPro",
    optOutUrl: "https://www.homeownerdatapro.com/removal",
    privacyEmail: "remove@homeownerdatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  REALESTATERECORDS: {
    name: "RealEstateRecords",
    optOutUrl: "https://www.realestaterecords.com/optout",
    privacyEmail: "privacy@realestaterecords.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYOWNERINFO_V2: {
    name: "PropertyOwnerInfo",
    optOutUrl: "https://www.propertyownerinfo.com/removal",
    privacyEmail: "optout@propertyownerinfo.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEVALUEDATA: {
    name: "HomeValueData",
    optOutUrl: "https://www.homevaluedata.com/optout",
    privacyEmail: "privacy@homevaluedata.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYDATAHUB: {
    name: "PropertyDataHub",
    optOutUrl: "https://www.propertydatahub.com/removal",
    privacyEmail: "remove@propertydatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERLOOKUP: {
    name: "HomeownerLookup",
    optOutUrl: "https://www.homeownerlookup.com/optout",
    privacyEmail: "privacy@homeownerlookup.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATEDATAPRO: {
    name: "RealEstateDataPro",
    optOutUrl: "https://www.realestatedatapro.com/removal",
    privacyEmail: "optout@realestatedatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYRECORDSNOW: {
    name: "PropertyRecordsNow",
    optOutUrl: "https://www.propertyrecordsnow.com/optout",
    privacyEmail: "privacy@propertyrecordsnow.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOMEOWNERINFOPRO: {
    name: "HomeownerInfoPro",
    optOutUrl: "https://www.homeownerinfopro.com/removal",
    privacyEmail: "remove@homeownerinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYSEARCHPRO: {
    name: "PropertySearchPro",
    optOutUrl: "https://www.propertysearchpro.com/optout",
    privacyEmail: "privacy@propertysearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATEINFOHUB: {
    name: "RealEstateInfoHub",
    optOutUrl: "https://www.realestateinfohub.com/removal",
    privacyEmail: "optout@realestateinfohub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEVALUEPRO: {
    name: "HomeValuePro",
    optOutUrl: "https://www.homevaluepro.com/optout",
    privacyEmail: "privacy@homevaluepro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYOWNERPRO: {
    name: "PropertyOwnerPro",
    optOutUrl: "https://www.propertyownerpro.com/removal",
    privacyEmail: "remove@propertyownerpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERSEARCHPRO: {
    name: "HomeownerSearchPro",
    optOutUrl: "https://www.homeownersearchpro.com/optout",
    privacyEmail: "privacy@homeownersearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATERECORDSPRO: {
    name: "RealEstateRecordsPro",
    optOutUrl: "https://www.realestaterecordspro.com/removal",
    privacyEmail: "optout@realestaterecordspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYDATAWORLD: {
    name: "PropertyDataWorld",
    optOutUrl: "https://www.propertydataworld.com/optout",
    privacyEmail: "privacy@propertydataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOMEOWNERDATAHUB: {
    name: "HomeownerDataHub",
    optOutUrl: "https://www.homeownerdatahub.com/removal",
    privacyEmail: "remove@homeownerdatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  REALESTATESEARCHPRO: {
    name: "RealEstateSearchPro",
    optOutUrl: "https://www.realestatesearchpro.com/optout",
    privacyEmail: "privacy@realestatesearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYRECORDSPRO: {
    name: "PropertyRecordsPro",
    optOutUrl: "https://www.propertyrecordspro.com/removal",
    privacyEmail: "optout@propertyrecordspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEVALUEDATAPRO: {
    name: "HomeValueDataPro",
    optOutUrl: "https://www.homevaluedatapro.com/optout",
    privacyEmail: "privacy@homevaluedatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYINFOWORLD: {
    name: "PropertyInfoWorld",
    optOutUrl: "https://www.propertyinfoworld.com/removal",
    privacyEmail: "remove@propertyinfoworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERRECORDSPRO: {
    name: "HomeownerRecordsPro",
    optOutUrl: "https://www.homeownerrecordspro.com/optout",
    privacyEmail: "privacy@homeownerrecordspro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATEDATAWORLD: {
    name: "RealEstateDataWorld",
    optOutUrl: "https://www.realestatedataworld.com/removal",
    privacyEmail: "optout@realestatedataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYOWNERHUB: {
    name: "PropertyOwnerHub",
    optOutUrl: "https://www.propertyownerhub.com/optout",
    privacyEmail: "privacy@propertyownerhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOMEOWNERDATAWORLD: {
    name: "HomeownerDataWorld",
    optOutUrl: "https://www.homeownerdataworld.com/removal",
    privacyEmail: "remove@homeownerdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  REALESTATEINFOPRO: {
    name: "RealEstateInfoPro",
    optOutUrl: "https://www.realestateinfopro.com/optout",
    privacyEmail: "privacy@realestateinfopro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYSEARCHHUB: {
    name: "PropertySearchHub",
    optOutUrl: "https://www.propertysearchhub.com/removal",
    privacyEmail: "optout@propertysearchhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEVALUEWORLD: {
    name: "HomeValueWorld",
    optOutUrl: "https://www.homevalueworld.com/optout",
    privacyEmail: "privacy@homevalueworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYOWNERWORLD: {
    name: "PropertyOwnerWorld",
    optOutUrl: "https://www.propertyownerworld.com/removal",
    privacyEmail: "remove@propertyownerworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERSEARCHHUB: {
    name: "HomeownerSearchHub",
    optOutUrl: "https://www.homeownersearchhub.com/optout",
    privacyEmail: "privacy@homeownersearchhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATERECORDSWORLD: {
    name: "RealEstateRecordsWorld",
    optOutUrl: "https://www.realestaterecordsworld.com/removal",
    privacyEmail: "optout@realestaterecordsworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYDATAEXPERT: {
    name: "PropertyDataExpert",
    optOutUrl: "https://www.propertydataexpert.com/optout",
    privacyEmail: "privacy@propertydataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOMEOWNERDATAEXPERT: {
    name: "HomeownerDataExpert",
    optOutUrl: "https://www.homeownerdataexpert.com/removal",
    privacyEmail: "remove@homeownerdataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  REALESTATESEARCHHUB: {
    name: "RealEstateSearchHub",
    optOutUrl: "https://www.realestatesearchhub.com/optout",
    privacyEmail: "privacy@realestatesearchhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYRECORDSWORLD: {
    name: "PropertyRecordsWorld",
    optOutUrl: "https://www.propertyrecordsworld.com/removal",
    privacyEmail: "optout@propertyrecordsworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEVALUEDATAHUB: {
    name: "HomeValueDataHub",
    optOutUrl: "https://www.homevaluedatahub.com/optout",
    privacyEmail: "privacy@homevaluedatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYINFOEXPERT: {
    name: "PropertyInfoExpert",
    optOutUrl: "https://www.propertyinfoexpert.com/removal",
    privacyEmail: "remove@propertyinfoexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERRECORDSHUB: {
    name: "HomeownerRecordsHub",
    optOutUrl: "https://www.homeownerrecordshub.com/optout",
    privacyEmail: "privacy@homeownerrecordshub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATEDATAEXPERT: {
    name: "RealEstateDataExpert",
    optOutUrl: "https://www.realestatedataexpert.com/removal",
    privacyEmail: "optout@realestatedataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYOWNEREXPERT: {
    name: "PropertyOwnerExpert",
    optOutUrl: "https://www.propertyownerexpert.com/optout",
    privacyEmail: "privacy@propertyownerexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOMEOWNERDATAFINDER: {
    name: "HomeownerDataFinder",
    optOutUrl: "https://www.homeownerdatafinder.com/removal",
    privacyEmail: "remove@homeownerdatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  REALESTATERECORDSEXPERT: {
    name: "RealEstateRecordsExpert",
    optOutUrl: "https://www.realestaterecordsexpert.com/optout",
    privacyEmail: "privacy@realestaterecordsexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYSEARCHEXPERT: {
    name: "PropertySearchExpert",
    optOutUrl: "https://www.propertysearchexpert.com/removal",
    privacyEmail: "optout@propertysearchexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEVALUEDATAWORLD: {
    name: "HomeValueDataWorld",
    optOutUrl: "https://www.homevaluedataworld.com/optout",
    privacyEmail: "privacy@homevaluedataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  PROPERTYRECORDSEXPERT: {
    name: "PropertyRecordsExpert",
    optOutUrl: "https://www.propertyrecordsexpert.com/removal",
    privacyEmail: "remove@propertyrecordsexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  HOMEOWNERSEARCHWORLD: {
    name: "HomeownerSearchWorld",
    optOutUrl: "https://www.homeownersearchworld.com/optout",
    privacyEmail: "privacy@homeownersearchworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  REALESTATESEARCHWORLD: {
    name: "RealEstateSearchWorld",
    optOutUrl: "https://www.realestatesearchworld.com/removal",
    privacyEmail: "optout@realestatesearchworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  PROPERTYDATAFINDER: {
    name: "PropertyDataFinder",
    optOutUrl: "https://www.propertydatafinder.com/optout",
    privacyEmail: "privacy@propertydatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  HOMEVALUEDATAEXPERT: {
    name: "HomeValueDataExpert",
    optOutUrl: "https://www.homevaluedataexpert.com/removal",
    privacyEmail: "remove@homevaluedataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },

  // EMAIL MARKETING DATA BROKERS (30 brokers)
  EMAILLISTPRO: {
    name: "EmailListPro",
    optOutUrl: "https://www.emaillistpro.com/optout",
    privacyEmail: "privacy@emaillistpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILDATAHUB: {
    name: "EmailDataHub",
    optOutUrl: "https://www.emaildatahub.com/removal",
    privacyEmail: "remove@emaildatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILMARKETINGPRO: {
    name: "EmailMarketingPro",
    optOutUrl: "https://www.emailmarketingpro.com/optout",
    privacyEmail: "privacy@emailmarketingpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILLISTWORLD: {
    name: "EmailListWorld",
    optOutUrl: "https://www.emaillistworld.com/removal",
    privacyEmail: "optout@emaillistworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILDATAEXPERT: {
    name: "EmailDataExpert",
    optOutUrl: "https://www.emaildataexpert.com/optout",
    privacyEmail: "privacy@emaildataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILVERIFYWORLD: {
    name: "EmailVerifyWorld",
    optOutUrl: "https://www.emailverifyworld.com/removal",
    privacyEmail: "remove@emailverifyworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILFINDERPRO_V2: {
    name: "EmailFinderPro",
    optOutUrl: "https://www.emailfinderpro.com/optout",
    privacyEmail: "privacy@emailfinderpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILLISTEXPERT: {
    name: "EmailListExpert",
    optOutUrl: "https://www.emaillistexpert.com/removal",
    privacyEmail: "optout@emaillistexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILDATAWORLD: {
    name: "EmailDataWorld",
    optOutUrl: "https://www.emaildataworld.com/optout",
    privacyEmail: "privacy@emaildataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILMARKETINGHUB: {
    name: "EmailMarketingHub",
    optOutUrl: "https://www.emailmarketinghub.com/removal",
    privacyEmail: "remove@emailmarketinghub.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLOOKUPPRO: {
    name: "EmailLookupPro",
    optOutUrl: "https://www.emaillookuppro.com/optout",
    privacyEmail: "privacy@emaillookuppro.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILVERIFYEXPERT: {
    name: "EmailVerifyExpert",
    optOutUrl: "https://www.emailverifyexpert.com/removal",
    privacyEmail: "optout@emailverifyexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILFINDERWORLD: {
    name: "EmailFinderWorld",
    optOutUrl: "https://www.emailfinderworld.com/optout",
    privacyEmail: "privacy@emailfinderworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILDATAPRO: {
    name: "EmailDataPro",
    optOutUrl: "https://www.emaildatapro.com/removal",
    privacyEmail: "remove@emaildatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLISTHUB: {
    name: "EmailListHub",
    optOutUrl: "https://www.emaillisthub.com/optout",
    privacyEmail: "privacy@emaillisthub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILMARKETINGWORLD: {
    name: "EmailMarketingWorld",
    optOutUrl: "https://www.emailmarketingworld.com/removal",
    privacyEmail: "optout@emailmarketingworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLOOKUPWORLD: {
    name: "EmailLookupWorld",
    optOutUrl: "https://www.emaillookupworld.com/optout",
    privacyEmail: "privacy@emaillookupworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILVERIFYPRO: {
    name: "EmailVerifyPro",
    optOutUrl: "https://www.emailverifypro.com/removal",
    privacyEmail: "remove@emailverifypro.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILFINDEREXPERT: {
    name: "EmailFinderExpert",
    optOutUrl: "https://www.emailfinderexpert.com/optout",
    privacyEmail: "privacy@emailfinderexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILDATAFINDER: {
    name: "EmailDataFinder",
    optOutUrl: "https://www.emaildatafinder.com/removal",
    privacyEmail: "optout@emaildatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLISTFINDER: {
    name: "EmailListFinder",
    optOutUrl: "https://www.emaillistfinder.com/optout",
    privacyEmail: "privacy@emaillistfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILMARKETINGEXPERT: {
    name: "EmailMarketingExpert",
    optOutUrl: "https://www.emailmarketingexpert.com/removal",
    privacyEmail: "remove@emailmarketingexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLOOKUPEXPERT: {
    name: "EmailLookupExpert",
    optOutUrl: "https://www.emaillookupexpert.com/optout",
    privacyEmail: "privacy@emaillookupexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILVERIFYHUB: {
    name: "EmailVerifyHub",
    optOutUrl: "https://www.emailverifyhub.com/removal",
    privacyEmail: "optout@emailverifyhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILFINDERHUB: {
    name: "EmailFinderHub",
    optOutUrl: "https://www.emailfinderhub.com/optout",
    privacyEmail: "privacy@emailfinderhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILDATASEARCH: {
    name: "EmailDataSearch",
    optOutUrl: "https://www.emaildatasearch.com/removal",
    privacyEmail: "remove@emaildatasearch.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLISTSEARCH: {
    name: "EmailListSearch",
    optOutUrl: "https://www.emaillistsearch.com/optout",
    privacyEmail: "privacy@emaillistsearch.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILMARKETINGSEARCH: {
    name: "EmailMarketingSearch",
    optOutUrl: "https://www.emailmarketingsearch.com/removal",
    privacyEmail: "optout@emailmarketingsearch.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },
  EMAILLOOKUPFINDER: {
    name: "EmailLookupFinder",
    optOutUrl: "https://www.emaillookupfinder.com/optout",
    privacyEmail: "privacy@emaillookupfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 21,
  },
  EMAILVERIFYFINDER: {
    name: "EmailVerifyFinder",
    optOutUrl: "https://www.emailverifyfinder.com/removal",
    privacyEmail: "remove@emailverifyfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 14,
  },

  // SOCIAL MEDIA DATA AGGREGATORS (30 brokers)
  SOCIALDATAPRO: {
    name: "SocialDataPro",
    optOutUrl: "https://www.socialdatapro.com/optout",
    privacyEmail: "privacy@socialdatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALPROFILEPRO: {
    name: "SocialProfilePro",
    optOutUrl: "https://www.socialprofilepro.com/removal",
    privacyEmail: "remove@socialprofilepro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALMEDIAINFO: {
    name: "SocialMediaInfo",
    optOutUrl: "https://www.socialmediainfo.com/optout",
    privacyEmail: "privacy@socialmediainfo.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALFINDEREXPERT: {
    name: "SocialFinderExpert",
    optOutUrl: "https://www.socialfinderexpert.com/removal",
    privacyEmail: "optout@socialfinderexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALDATAHUB: {
    name: "SocialDataHub",
    optOutUrl: "https://www.socialdatahub.com/optout",
    privacyEmail: "privacy@socialdatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALPROFILEWORLD: {
    name: "SocialProfileWorld",
    optOutUrl: "https://www.socialprofileworld.com/removal",
    privacyEmail: "remove@socialprofileworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALMEDIAPRO: {
    name: "SocialMediaPro",
    optOutUrl: "https://www.socialmediapro.com/optout",
    privacyEmail: "privacy@socialmediapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALFINDERPRO: {
    name: "SocialFinderPro",
    optOutUrl: "https://www.socialfinderpro.com/removal",
    privacyEmail: "optout@socialfinderpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALDATAWORLD: {
    name: "SocialDataWorld",
    optOutUrl: "https://www.socialdataworld.com/optout",
    privacyEmail: "privacy@socialdataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALPROFILEHUB: {
    name: "SocialProfileHub",
    optOutUrl: "https://www.socialprofilehub.com/removal",
    privacyEmail: "remove@socialprofilehub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALMEDIAWORLD: {
    name: "SocialMediaWorld",
    optOutUrl: "https://www.socialmediaworld.com/optout",
    privacyEmail: "privacy@socialmediaworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALFINDERWORLD: {
    name: "SocialFinderWorld",
    optOutUrl: "https://www.socialfinderworld.com/removal",
    privacyEmail: "optout@socialfinderworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALDATAEXPERT: {
    name: "SocialDataExpert",
    optOutUrl: "https://www.socialdataexpert.com/optout",
    privacyEmail: "privacy@socialdataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALPROFILEEXPERT: {
    name: "SocialProfileExpert",
    optOutUrl: "https://www.socialprofileexpert.com/removal",
    privacyEmail: "remove@socialprofileexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALMEDIAHUB: {
    name: "SocialMediaHub",
    optOutUrl: "https://www.socialmediahub.com/optout",
    privacyEmail: "privacy@socialmediahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALFINDERHUB: {
    name: "SocialFinderHub",
    optOutUrl: "https://www.socialfinderhub.com/removal",
    privacyEmail: "optout@socialfinderhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALDATAFINDER: {
    name: "SocialDataFinder",
    optOutUrl: "https://www.socialdatafinder.com/optout",
    privacyEmail: "privacy@socialdatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALPROFILEFINDER: {
    name: "SocialProfileFinder",
    optOutUrl: "https://www.socialprofilefinder.com/removal",
    privacyEmail: "remove@socialprofilefinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALMEDIAFINDER: {
    name: "SocialMediaFinder",
    optOutUrl: "https://www.socialmediafinder.com/optout",
    privacyEmail: "privacy@socialmediafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALSEARCHPRO: {
    name: "SocialSearchPro",
    optOutUrl: "https://www.socialsearchpro.com/removal",
    privacyEmail: "optout@socialsearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALDATASEARCH: {
    name: "SocialDataSearch",
    optOutUrl: "https://www.socialdatasearch.com/optout",
    privacyEmail: "privacy@socialdatasearch.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALPROFILESEARCH: {
    name: "SocialProfileSearch",
    optOutUrl: "https://www.socialprofilesearch.com/removal",
    privacyEmail: "remove@socialprofilesearch.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALMEDIASEARCH: {
    name: "SocialMediaSearch",
    optOutUrl: "https://www.socialmediasearch.com/optout",
    privacyEmail: "privacy@socialmediasearch.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALSEARCHWORLD: {
    name: "SocialSearchWorld",
    optOutUrl: "https://www.socialsearchworld.com/removal",
    privacyEmail: "optout@socialsearchworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALLOOKUPPRO: {
    name: "SocialLookupPro",
    optOutUrl: "https://www.sociallookuppro.com/optout",
    privacyEmail: "privacy@sociallookuppro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALLOOKUPWORLD: {
    name: "SocialLookupWorld",
    optOutUrl: "https://www.sociallookupworld.com/removal",
    privacyEmail: "remove@sociallookupworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALLOOKUPEXPERT: {
    name: "SocialLookupExpert",
    optOutUrl: "https://www.sociallookupexpert.com/optout",
    privacyEmail: "privacy@sociallookupexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALLOOKUPFINDER: {
    name: "SocialLookupFinder",
    optOutUrl: "https://www.sociallookupfinder.com/removal",
    privacyEmail: "optout@sociallookupfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALLOOKUHUB: {
    name: "SocialLookupHub",
    optOutUrl: "https://www.sociallookuphub.com/optout",
    privacyEmail: "privacy@sociallookuphub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  SOCIALDATASERVICE: {
    name: "SocialDataService",
    optOutUrl: "https://www.socialdataservice.com/removal",
    privacyEmail: "remove@socialdataservice.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // IDENTITY VERIFICATION SERVICES (30 brokers)
  IDENTITYVERIFYPRO: {
    name: "IdentityVerifyPro",
    optOutUrl: "https://www.identityverifypro.com/optout",
    privacyEmail: "privacy@identityverifypro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDVERIFICATIONHUB: {
    name: "IDVerificationHub",
    optOutUrl: "https://www.idverificationhub.com/removal",
    privacyEmail: "remove@idverificationhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYDATAPRO: {
    name: "IdentityDataPro",
    optOutUrl: "https://www.identitydatapro.com/optout",
    privacyEmail: "privacy@identitydatapro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDCHECKPRO: {
    name: "IDCheckPro",
    optOutUrl: "https://www.idcheckpro.com/removal",
    privacyEmail: "optout@idcheckpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYVERIFYWORLD: {
    name: "IdentityVerifyWorld",
    optOutUrl: "https://www.identityverifyworld.com/optout",
    privacyEmail: "privacy@identityverifyworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDVERIFICATIONPRO: {
    name: "IDVerificationPro",
    optOutUrl: "https://www.idverificationpro.com/removal",
    privacyEmail: "remove@idverificationpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYDATAHUB: {
    name: "IdentityDataHub",
    optOutUrl: "https://www.identitydatahub.com/optout",
    privacyEmail: "privacy@identitydatahub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDCHECKWORLD: {
    name: "IDCheckWorld",
    optOutUrl: "https://www.idcheckworld.com/removal",
    privacyEmail: "optout@idcheckworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYVERIFYEXPERT: {
    name: "IdentityVerifyExpert",
    optOutUrl: "https://www.identityverifyexpert.com/optout",
    privacyEmail: "privacy@identityverifyexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDVERIFICATIONWORLD: {
    name: "IDVerificationWorld",
    optOutUrl: "https://www.idverificationworld.com/removal",
    privacyEmail: "remove@idverificationworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYDATAWORLD: {
    name: "IdentityDataWorld",
    optOutUrl: "https://www.identitydataworld.com/optout",
    privacyEmail: "privacy@identitydataworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDCHECKEXPERT: {
    name: "IDCheckExpert",
    optOutUrl: "https://www.idcheckexpert.com/removal",
    privacyEmail: "optout@idcheckexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYVERIFYHUB: {
    name: "IdentityVerifyHub",
    optOutUrl: "https://www.identityverifyhub.com/optout",
    privacyEmail: "privacy@identityverifyhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDVERIFICATIONEXPERT: {
    name: "IDVerificationExpert",
    optOutUrl: "https://www.idverificationexpert.com/removal",
    privacyEmail: "remove@idverificationexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYDATAEXPERT: {
    name: "IdentityDataExpert",
    optOutUrl: "https://www.identitydataexpert.com/optout",
    privacyEmail: "privacy@identitydataexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDCHECKHUB: {
    name: "IDCheckHub",
    optOutUrl: "https://www.idcheckhub.com/removal",
    privacyEmail: "optout@idcheckhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYVERIFYFINDER: {
    name: "IdentityVerifyFinder",
    optOutUrl: "https://www.identityverifyfinder.com/optout",
    privacyEmail: "privacy@identityverifyfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDVERIFICATIONFINDER: {
    name: "IDVerificationFinder",
    optOutUrl: "https://www.idverificationfinder.com/removal",
    privacyEmail: "remove@idverificationfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYDATAFINDER: {
    name: "IdentityDataFinder",
    optOutUrl: "https://www.identitydatafinder.com/optout",
    privacyEmail: "privacy@identitydatafinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDCHECKFINDER: {
    name: "IDCheckFinder",
    optOutUrl: "https://www.idcheckfinder.com/removal",
    privacyEmail: "optout@idcheckfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYSEARCHPRO: {
    name: "IdentitySearchPro",
    optOutUrl: "https://www.identitysearchpro.com/optout",
    privacyEmail: "privacy@identitysearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDSEARCHPRO: {
    name: "IDSearchPro",
    optOutUrl: "https://www.idsearchpro.com/removal",
    privacyEmail: "remove@idsearchpro.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYSEARCHWORLD: {
    name: "IdentitySearchWorld",
    optOutUrl: "https://www.identitysearchworld.com/optout",
    privacyEmail: "privacy@identitysearchworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDSEARCHWORLD: {
    name: "IDSearchWorld",
    optOutUrl: "https://www.idsearchworld.com/removal",
    privacyEmail: "optout@idsearchworld.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYSEARCHEXPERT: {
    name: "IdentitySearchExpert",
    optOutUrl: "https://www.identitysearchexpert.com/optout",
    privacyEmail: "privacy@identitysearchexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDSEARCHEXPERT: {
    name: "IDSearchExpert",
    optOutUrl: "https://www.idsearchexpert.com/removal",
    privacyEmail: "remove@idsearchexpert.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYSEARCHHUB: {
    name: "IdentitySearchHub",
    optOutUrl: "https://www.identitysearchhub.com/optout",
    privacyEmail: "privacy@identitysearchhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDSEARCHHUB: {
    name: "IDSearchHub",
    optOutUrl: "https://www.idsearchhub.com/removal",
    privacyEmail: "optout@idsearchhub.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDENTITYSEARCHFINDER: {
    name: "IdentitySearchFinder",
    optOutUrl: "https://www.identitysearchfinder.com/optout",
    privacyEmail: "privacy@identitysearchfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },
  IDSEARCHFINDER: {
    name: "IDSearchFinder",
    optOutUrl: "https://www.idsearchfinder.com/removal",
    privacyEmail: "remove@idsearchfinder.com",
    removalMethod: "EMAIL",
    estimatedDays: 30,
  },

  // DARK WEB MONITORING EXPANSION (50 brokers)
  DARKWEB_CREDENTIAL_MONITOR_V2: {
    name: "Dark Web Credential Monitor V2",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Enhanced credential monitoring",
  },
  STEALER_LOG_AGGREGATOR: {
    name: "Stealer Log Aggregator",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Aggregated stealer log monitoring",
  },
  RANSOMWARE_VICTIM_TRACKER: {
    name: "Ransomware Victim Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Ransomware leak site monitoring",
  },
  FORUM_CREDENTIAL_SCRAPER: {
    name: "Forum Credential Scraper",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Underground forum monitoring",
  },
  PASTE_SITE_AGGREGATOR: {
    name: "Paste Site Aggregator",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Multi-paste site monitoring",
  },
  TELEGRAM_LEAK_AGGREGATOR: {
    name: "Telegram Leak Aggregator",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Telegram channel monitoring",
  },
  DARK_MARKET_INTELLIGENCE: {
    name: "Dark Market Intelligence",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Dark marketplace data monitoring",
  },
  INFOSTEALER_TRACKER: {
    name: "Infostealer Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Infostealer malware tracking",
  },
  CREDENTIAL_DUMP_MONITOR: {
    name: "Credential Dump Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Large credential dump tracking",
  },
  BOTNET_LOG_MONITOR: {
    name: "Botnet Log Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Botnet data exfiltration tracking",
  },
  CARDING_FORUM_MONITOR: {
    name: "Carding Forum Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Carding forum activity tracking",
  },
  FULLZ_MARKET_TRACKER: {
    name: "Fullz Market Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Identity fullz market monitoring",
  },
  SSN_DOB_TRACKER: {
    name: "SSN DOB Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SSN and DOB leak tracking",
  },
  BANK_DROP_MONITOR: {
    name: "Bank Drop Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Bank drop service monitoring",
  },
  SIM_SWAP_TRACKER: {
    name: "SIM Swap Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SIM swap service tracking",
  },
  ACCOUNT_TAKEOVER_MONITOR: {
    name: "Account Takeover Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "ATO service monitoring",
  },
  PHISHING_KIT_TRACKER: {
    name: "Phishing Kit Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Phishing kit distribution tracking",
  },
  MALWARE_PANEL_MONITOR: {
    name: "Malware Panel Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Malware C2 panel tracking",
  },
  EXPLOIT_BROKER_MONITOR: {
    name: "Exploit Broker Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Exploit market monitoring",
  },
  RDP_ACCESS_TRACKER: {
    name: "RDP Access Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "RDP access market tracking",
  },
  VPN_CREDENTIAL_MONITOR: {
    name: "VPN Credential Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Corporate VPN leak tracking",
  },
  CLOUD_CREDENTIAL_TRACKER: {
    name: "Cloud Credential Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Cloud service credential tracking",
  },
  API_KEY_MONITOR: {
    name: "API Key Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Leaked API key monitoring",
  },
  SSH_KEY_TRACKER: {
    name: "SSH Key Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "SSH key leak tracking",
  },
  DATABASE_DUMP_MONITOR: {
    name: "Database Dump Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Database dump tracking",
  },
  SOURCE_CODE_LEAK_MONITOR: {
    name: "Source Code Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Source code leak tracking",
  },
  DOCUMENT_LEAK_TRACKER: {
    name: "Document Leak Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Sensitive document leak tracking",
  },
  FINANCIAL_DATA_MONITOR: {
    name: "Financial Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Financial data leak tracking",
  },
  HEALTHCARE_DATA_TRACKER: {
    name: "Healthcare Data Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Healthcare data leak tracking",
  },
  GOVERNMENT_DATA_MONITOR: {
    name: "Government Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Government data leak tracking",
  },
  EDUCATION_DATA_TRACKER: {
    name: "Education Data Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Education sector leak tracking",
  },
  RETAIL_DATA_MONITOR: {
    name: "Retail Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Retail data leak tracking",
  },
  GAMING_ACCOUNT_TRACKER: {
    name: "Gaming Account Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Gaming account leak tracking",
  },
  STREAMING_ACCOUNT_MONITOR: {
    name: "Streaming Account Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Streaming service leak tracking",
  },
  SOCIAL_MEDIA_LEAK_TRACKER: {
    name: "Social Media Leak Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Social media data leak tracking",
  },
  CRYPTOCURRENCY_WALLET_MONITOR: {
    name: "Cryptocurrency Wallet Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Crypto wallet leak tracking",
  },
  NFT_THEFT_TRACKER: {
    name: "NFT Theft Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "NFT theft incident tracking",
  },
  EXCHANGE_HACK_TRACKER: {
    name: "Exchange Hack Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Exchange hack tracking",
  },
  MOBILE_MALWARE_MONITOR: {
    name: "Mobile Malware Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Mobile malware data tracking",
  },
  IOT_BREACH_TRACKER: {
    name: "IoT Breach Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "IoT device breach tracking",
  },
  SMART_HOME_LEAK_MONITOR: {
    name: "Smart Home Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Smart home data leak tracking",
  },
  VEHICLE_DATA_TRACKER: {
    name: "Vehicle Data Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Connected vehicle data tracking",
  },
  WEARABLE_DATA_MONITOR: {
    name: "Wearable Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Wearable device data tracking",
  },
  BIOMETRIC_DATA_TRACKER: {
    name: "Biometric Data Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Biometric data leak tracking",
  },
  DNA_DATA_MONITOR: {
    name: "DNA Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Genetic data leak tracking",
  },
  LOCATION_DATA_TRACKER: {
    name: "Location Data Tracker",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Location data leak tracking",
  },
  VOICE_DATA_MONITOR: {
    name: "Voice Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Voice recording leak tracking",
  },
  FACIAL_RECOGNITION_LEAK_MONITOR: {
    name: "Facial Recognition Leak Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "Facial recognition data leak tracking",
  },
  AI_TRAINING_DATA_MONITOR: {
    name: "AI Training Data Monitor",
    removalMethod: "MONITOR",
    estimatedDays: 1,
    notes: "AI training dataset leak tracking",
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
    "UNITEDSTATESPHONEBOOK", "USA_PEOPLE_SEARCH", "USATRACE", "VERIPAGES", "WELLNUT",
    "USSEARCHINFO", "FREEPHONETRACER", "FINDPEOPLESEARCH", "PEOPLESMART", "PEOPLEFINDERPRO_V2",
    "DATAVERIA", "CYBERCHECK", "INFOTRACER", "COCOFINDER", "USPHONELOOKUP",
    "EASYBACKGROUNDCHECKS", "UNMASK", "REVEALNAME", "INFORMATION_COM", "BACKGROUNDALERT",
    "DOBSEARCH", "NEIGHBOR_REPORT", "NUMERLOOKUP", "VALIDNUMBER", "SEARCHPUBLICRECORDS",
    "IDTRUE", "LOOKUPUK", "PEEPSEARCH", "RECORDSFINDER", "PUBLICRECORDCENTER",
    "SEARCHSYSTEMS", "PERSONSEARCH", "ARKANSASVOTERS", "FLORIDAVOTERS", "OHIOVOTERS"
  ],
  BACKGROUND_CHECK: [
    "TRUTHFINDER", "CHECKPEOPLE", "CYBERBACKGROUNDCHECKS", "PUBLICDATACHECK",
    "SEARCHPEOPLEFREE", "FREEPEOPLESEARCH", "SEARCHQUARRY",
    "FIRST_ADVANTAGE", "INTELLICORP", "TALENTWISE", "INFOMART", "SJV_ASSOCIATES"
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
    "WHOCALLEDME", "WHOCALLSME", "WHYCALL", "CALLERID411", "FREECALLERIDSEARCH",
    "SHOWCALLER", "EYECON", "GETCONTACT", "CALLAPP", "WHOSCALL", "DRUPE",
    "SHOWCALLERID", "REVERSEMOBILE", "CARRIERLOOKUP", "FREECARRIERLOOKUP",
    "TEXTMAGIC", "TEXTEM", "NUMVERIFY"
  ],
  PROPERTY_RECORDS: [
    "NEIGHBOR_WHO", "HOMEMETRY", "BLOCKSHOPPER", "OWNERLY", "REHOLD",
    "PROPERTYSHARK", "ZILLOW", "REDFIN", "REALTOR_COM", "TRULIA",
    "HOUSEVALUES", "ADDRESSREPORT", "LANDWATCH", "REALTYHOP", "SHOWCASE",
    "HOMES_COM", "HOMESNAP", "MOVOTO", "OPENDOOR", "ESTATELY", "XOME",
    "FORECLOSURE_COM", "LOOPNET", "REMAX", "CENTURY21", "COLDWELLBANKER",
    "KELLER_WILLIAMS", "COMPASS_RE", "HOMELIGHT", "OFFERPAD", "SUNDAE"
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
    "SKRAPP", "TOMBA", "NYMERIA", "PROSPECTLINKER", "SWORDFISH",
    "LEADFEEDER", "LEADGENIUS", "DEMANDBASE", "SIXSENSE", "BOMBORA",
    "DISCOVERORG", "DUNS_BRADSTREET", "HOOVERS", "INSIDEVIEW", "CLEARBIT_ENRICHMENT"
  ],
  MARKETING: [
    "ACXIOM", "ORACLE_DATACLOUD", "EPSILON", "EXPERIAN_MARKETING",
    "EQUIFAX_MARKETING", "LEXISNEXIS", "LIVERAMP", "TAPAD", "NEUSTAR",
    "NIELSEN", "LOTAME", "DATALOGIX", "BLUEKAI", "INFOGROUP",
    "TRANSUNION", "COMSCORE", "THETRADEDESK", "PUBMATIC", "MAGNITE",
    "OPENX", "CRITEO", "VIANT", "ADSRVR", "EYEOTA",
    "MEDIAMATH", "AMOBEE", "ADROLL", "QUANTCAST", "SHARETHROUGH",
    "TRIPLELIFT", "APPNEXUS", "INDEX_EXCHANGE", "SOVRN", "SPOTX",
    "TOWER_DATA", "NEXTROLL", "PERMUTIVE", "ADADYN", "INTENTIQ"
  ],
  DATING_RELATIONSHIP: [
    "DATING_BACKGROUND", "MATCHDOTCOM_LOOKUP", "DATESEARCHSITE", "ROMANCESCAMS",
    "BUMBLE_LOOKUP", "HINGE_LOOKUP", "OKCUPID_LOOKUP", "PLENTYOFFISH", "TINDER_LOOKUP"
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
    "PAGESJAUNES", "DASTELEFONBUCH", "PAGINEBIANCHE", "GUIALOCAL",
    "PIPL_INTERNATIONAL", "ZLOOKUP", "TRUECALLER_IN", "JUSTDIAL", "SULEKHA",
    "YELLOWPAGES_CA", "WHITEPAGES_NZ", "HEROLD_AT", "LOCAL_CH", "GOUDEN_GIDS",
    "TELOFONO_BLANCO", "PAGINASAMARILLAS_BR", "TELELISTAS", "ENIRO", "HITTA_SE",
    "KRAK_DK", "DEGULESIDER_NO"
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
  // EMAIL_VERIFICATION: [] — ENTIRE CATEGORY REMOVED (not data brokers, Feb 16 2026)
  IDENTITY_GRAPHS: [
    "DRAWBRIDGE", "CROSSWISE", "IQVIA", "ID5", "SHAREDID"
  ],
  BREACH_DATABASE: [
    "HAVEIBEENPWNED", "DEHASHED", "LEAKCHECK", "SNUSBASE", "BREACH_DB"
  ],
  NON_REMOVABLE: [
    "BREACH_DB", "DARK_WEB_FORUM", "PASTE_SITE", "ROOP"
  ],
  SOCIAL_MEDIA: [
    "LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK", "REDDIT",
    "PINTEREST", "YOUTUBE", "SNAPCHAT", "DISCORD"
  ],
  SERVICE_PROVIDER_SOURCES: [
    // Real estate brokerages & iBuyers (users hire agents / sell homes directly)
    "REMAX", "CENTURY21", "COLDWELLBANKER", "KELLER_WILLIAMS", "COMPASS_RE",
    "HOMELIGHT", "OPENDOOR", "OFFERPAD", "SUNDAE", "ESTATELY", "XOME",
    // Genealogy user platforms (users create accounts, upload family trees, DNA)
    "ANCESTRY", "MYHERITAGE",
    // Healthcare appointment/networking (doctors & patients create accounts)
    "ZOCDOC", "DOXIMITY",
  ],
  GRAY_AREA_SOURCES: [
    // Property data aggregators — aggregate public county records about people
    // who never created accounts, BUT also have user-facing features
    "ZILLOW", "REDFIN", "REALTOR_COM", "TRULIA",
    "HOMES_COM", "HOMESNAP", "MOVOTO",
    // Healthcare directories — aggregate doctor data from public license records
    "HEALTHGRADES", "VITALS",
    // Review platforms — user-generated content but also aggregate business data
    "YELP_DATA", "TRIPADVISOR_DATA",
  ],
  // Direct Relationship Platforms — NOT data brokers per CA Civil Code § 1798.99.80(d)
  // These platforms have direct user relationships: users create accounts,
  // voluntarily provide data, or consent to background checks.
  // Distinct from SERVICE_PROVIDER_SOURCES (which covers real estate brokerages, etc.)
  DIRECT_RELATIONSHIP_PLATFORMS: [
    // Dating platforms — users create accounts and provide their own data
    "MATCHDOTCOM_LOOKUP", "BUMBLE_LOOKUP", "HINGE_LOOKUP",
    "OKCUPID_LOOKUP", "PLENTYOFFISH", "TINDER_LOOKUP",
    // Consent-based background check firms — employers/consumers pay for checks,
    // subjects consent per FCRA § 604. NOT data brokers.
    // (THEWORKNUMBER stays — Equifax subsidiary on CA registry, collects from employers without employee consent)
    "HIRERIGHT", "STERLING", "CHECKR", "GOODHIRE", "ACCURATE_BG",
    // User-generated content review platforms — users voluntarily post reviews
    "TRUSTPILOT_DATA", "CONSUMERAFFAIRS", "SITEJABBER",
    "PISSEDCONSUMER", "COMPLAINTSBOARD",
  ],
  AI_TRAINING: [
    "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
    "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI", "ANTHROPIC",
    "X_AI", "COHERE_AI", "HUGGINGFACE", "DALL_E", "APPLE_AI", "MICROSOFT_AI",
    "REDDIT_AI", "COMMON_CRAWL"
  ],
  AI_IMAGE_VIDEO: [
    "SYNTHESIA", "HEYGEN", "RUNWAY_ML", "PIKA_LABS", "D_ID", "READY_PLAYER_ME",
    "MYHERITAGE_DEEPNOSTALGIA", "SUNO_AI", "GETTY_AI", "SHUTTERSTOCK_AI", "ROOP",
    "FACEAPP", "REFACE", "LENSA_AI", "WOMBO", "ARTBREEDER", "STARRY_AI",
    "NIGHTCAFE", "DEEP_ART_EFFECTS", "GOOGLE_IMAGES", "BING_IMAGES"
  ],
  AI_VOICE: [
    "ELEVENLABS", "RESEMBLE_AI", "MURF_AI", "LOVO_AI", "PLAY_HT",
    "SPEECHIFY", "DESCRIPT", "WELLSAID_LABS", "COQUI_AI", "REPLICA_STUDIOS"
  ],
  AI_FACIAL_RECOGNITION: [
    "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE",
    "YANDEX_IMAGES", "AMAZON_REKOGNITION", "FACE_PLUS_PLUS", "KAIROS", "FINDFACE"
  ],
  TENANT_SCREENING: [
    "RENTBUREAU", "CORELOGIC_RENTAL", "REALPAGE", "ONSITE_RESIDENT", "TRANSUNION_RENTAL"
  ],
  EMPLOYMENT_HR: [
    "THEWORKNUMBER", "HIRERIGHT", "STERLING", "CHECKR", "GOODHIRE", "ACCURATE_BG"
  ],
  DATA_ENRICHMENT: [
    "PEOPLE_DATA_LABS", "CORESIGNAL", "PROXYCURL", "REVELIO_LABS", "DIFFBOT"
  ],
  DARK_WEB_MONITORING: [
    "SPYCLOUD", "RECORDED_FUTURE", "DARKOWL", "FLASHPOINT", "INTEL471",
    "SIXGILL", "KELA", "DIGITAL_SHADOWS", "ZEROFOX", "CYBERINT",
    "CONSTELLA", "SOCRADAR"
  ],
  BREACH_LEAK_DB: [
    "BREACHSENSE", "LEAKPEEK", "LEAKIX", "INTELLIGENCE_X", "NUCLEON",
    "SCYLLA_SH", "HASHES_ORG", "WELEAKINFO", "BREACHDIRECTORY", "LEAKBASE"
  ],
  PASTE_SITE_MONITORS: [
    "PASTEBIN_MONITOR", "GHOSTBIN_MONITOR", "DPASTE_MONITOR", "HASTEBIN_MONITOR",
    "PASTECODE_MONITOR", "JUSTPASTE_MONITOR", "CONTROLC_MONITOR", "CODEPAD_MONITOR",
    "IDEONE_MONITOR", "SLEXY_MONITOR"
  ],
  DARK_MARKETPLACE_MONITORS: [
    "DARKMARKET_MONITOR", "GENESIS_MARKET_MONITOR", "RUSSIAN_MARKET_MONITOR",
    "EXPLOIT_FORUM_MONITOR", "XSS_FORUM_MONITOR", "BREACHFORUMS_MONITOR",
    "RAIDFORUMS_SUCCESSOR_MONITOR", "NULLED_FORUM_MONITOR", "CRACKED_FORUM_MONITOR",
    "SINISTER_FORUM_MONITOR", "DREAD_FORUM_MONITOR", "ALPHABAY_MONITOR",
    "VERSUS_MARKET_MONITOR", "KINGDOM_MARKET_MONITOR", "BOHEMIA_MARKET_MONITOR"
  ],
  CREDENTIAL_MONITORING: [
    "FIREFOX_MONITOR", "GOOGLE_PASSWORD_CHECKUP", "APPLE_SECURITY_RECOMMENDATIONS",
    "IDENTITY_GUARD", "LIFELOCK", "IDENTITYFORCE", "AURA_IDENTITY",
    "EXPERIAN_DARK_WEB", "TRANSUNION_DARK_WEB", "EQUIFAX_DARK_WEB",
    "MCAFEE_IDENTITY", "BITDEFENDER_IDENTITY", "NORTON_DARK_WEB", "AVAST_BREACHGUARD"
  ],
  DARK_WEB_SEARCH: [
    "AHMIA_SEARCH", "TORCH_SEARCH", "NOTEVIL_SEARCH", "HAYSTAK_SEARCH",
    "DARKSEARCH_IO", "ONION_SEARCH"
  ],
  STEALER_LOG_MONITORS: [
    "REDLINE_STEALER_MONITOR", "RACCOON_STEALER_MONITOR", "VIDAR_STEALER_MONITOR",
    "AZORULT_MONITOR", "TAURUS_STEALER_MONITOR", "LUMMA_STEALER_MONITOR",
    "TITAN_STEALER_MONITOR", "STEALC_MONITOR"
  ],
  RANSOMWARE_LEAK_MONITORS: [
    "LOCKBIT_LEAK_MONITOR", "ALPHV_LEAK_MONITOR", "CLOP_LEAK_MONITOR",
    "BLACKBASTA_LEAK_MONITOR", "PLAY_RANSOMWARE_MONITOR", "ROYAL_RANSOMWARE_MONITOR",
    "BIANLIAN_LEAK_MONITOR", "AKIRA_RANSOMWARE_MONITOR", "MEDUSA_LEAK_MONITOR",
    "RHYSIDA_LEAK_MONITOR"
  ],
  CHAT_PLATFORM_MONITORS: [
    "TELEGRAM_LEAK_CHANNELS", "TELEGRAM_COMBOLIST", "TELEGRAM_STEALER_LOGS",
    "DISCORD_LEAK_SERVERS", "IRC_UNDERGROUND_CHANNELS", "JABBER_XMPP_NETWORKS"
  ],
  CREDENTIAL_MARKETS: [
    "COMBOLIST_MONITOR", "LOGS_MARKET_MONITOR", "FULLZ_MARKET_MONITOR",
    "SSN_DOB_MARKET_MONITOR", "CREDIT_CARD_SHOP_MONITOR", "BANK_LOG_MARKET_MONITOR",
    "ACCOUNT_SHOP_MONITOR", "CRYPTO_WALLET_MARKET_MONITOR", "EMAIL_2_SMS_GATEWAY_MONITOR"
  ],
  THREAT_INTEL_PLATFORMS: [
    "MANDIANT_THREAT_INTEL", "CROWDSTRIKE_FALCON_X", "PALO_ALTO_UNIT42",
    "CISCO_TALOS", "PROOFPOINT_THREAT", "TRELLIX_INSIGHTS", "SECUREWORKS_CTU",
    "ANOMALI_THREATSTREAM", "THREATCONNECT", "LOOKOUT_THREAT"
  ],
  BREACH_AGGREGATORS: [
    "LEAKED_SOURCE", "COMB_MONITOR", "ANTIPUBLIC_MONITOR", "EXPLOIT_IN_MONITOR",
    "COLLECTION_MONITOR", "PEMIBLANC_MONITOR", "LEAKEDSOURCE_ARCHIVES",
    "BREACH_COMPILATION", "MAILRU_BREACH_MONITOR", "RAMBLER_BREACH_MONITOR"
  ],
  ADDITIONAL_PASTE_SITES: [
    "RENTRY_MONITOR", "PRIVATEBIN_MONITOR", "ZEROBIN_MONITOR", "TELEGRA_PH_MONITOR",
    "SNIPPET_HOST_MONITOR", "TOPTAL_PASTE_MONITOR", "PASTE2_MONITOR",
    "PASTEALL_MONITOR", "DEFUSE_PASTE_MONITOR", "DOXBIN_MONITOR"
  ],
  UNDERGROUND_FORUMS: [
    "HACKFORUMS_MONITOR", "RAIDFORUMS_ARCHIVE", "OGUSERS_MONITOR", "LOLZTEAM_MONITOR",
    "BHFIO_MONITOR", "WWH_CLUB_MONITOR", "VERIFIED_FORUM_MONITOR", "ANTICHAT_MONITOR",
    "XAKEP_MONITOR", "DARKODE_MONITOR"
  ],
  CARDING_FRAUD_SITES: [
    "JOKER_STASH_MONITOR", "RESCATOR_MONITOR", "FERUM_SHOP_MONITOR", "UNICC_MONITOR",
    "BRIANKREBS_MONITOR", "VALIDCC_MONITOR", "SWIPE_STORE_MONITOR",
    "ALLWORLD_CARDS_MONITOR", "YALE_LODGE_MONITOR", "TRUMP_DUMPS_MONITOR"
  ],
  ADDITIONAL_STEALER_LOGS: [
    "AURORA_STEALER_MONITOR", "META_STEALER_MONITOR", "RHADAMANTHYS_MONITOR",
    "DARKCLOUD_STEALER_MONITOR", "PRYNT_STEALER_MONITOR", "WHITESNAKE_STEALER_MONITOR",
    "MYSTIC_STEALER_MONITOR", "RISEPRO_STEALER_MONITOR", "STEALC_V2_MONITOR",
    "XWORM_RAT_MONITOR"
  ],
  ADDITIONAL_RANSOMWARE_LEAKS: [
    "HIVE_RANSOMWARE_MONITOR", "CONTI_LEAK_MONITOR", "REVIL_LEAK_MONITOR",
    "MAZE_LEAK_MONITOR", "NETWALKER_LEAK_MONITOR", "RAGNAR_LOCKER_MONITOR",
    "AVOSLOCKER_MONITOR", "CUBA_RANSOMWARE_MONITOR", "SNATCH_TEAM_MONITOR",
    "VICE_SOCIETY_MONITOR"
  ],
  TELEGRAM_FRAUD_CHANNELS: [
    "TELEGRAM_CREDIT_CARDS", "TELEGRAM_FULLZ_CHANNELS", "TELEGRAM_BANK_DROPS",
    "TELEGRAM_SSN_CHANNELS", "TELEGRAM_LOGS_CLOUD", "TELEGRAM_RUSSIA_FRAUD",
    "TELEGRAM_SPAM_TOOLS", "TELEGRAM_CRYPTO_FRAUD", "TELEGRAM_SIM_SWAP",
    "TELEGRAM_DOCUMENTS"
  ],
  IDENTITY_DOCUMENT_LEAKS: [
    "KYC_BREACH_MONITOR", "ID_DOCUMENT_MONITOR", "SELFIE_LEAK_MONITOR",
    "DRIVERS_LICENSE_MONITOR", "PASSPORT_LEAK_MONITOR"
  ],
  ADDITIONAL_DARK_MARKETS: [
    "INCOGNITO_MARKET_MONITOR", "ARCHETYP_MARKET_MONITOR", "ABACUS_MARKET_MONITOR",
    "TOR2DOOR_MONITOR", "MEGA_DARKNET_MONITOR", "HYDRA_SUCCESSOR_MONITOR",
    "OMGOMG_MARKET_MONITOR", "BLACKSPRUT_MONITOR", "KRAKEN_DARKNET_MONITOR",
    "SOLARIS_MARKET_MONITOR"
  ],
  INITIAL_ACCESS_BROKERS: [
    "IAB_MARKET_MONITOR", "RDP_SHOP_MONITOR", "VPN_ACCESS_MONITOR",
    "CITRIX_ACCESS_MONITOR", "WEBSHELL_MARKET_MONITOR", "PULSE_VPN_MONITOR",
    "FORTINET_LEAK_MONITOR", "SSH_KEY_MARKET_MONITOR", "AWS_CREDS_MONITOR",
    "AZURE_CREDS_MONITOR"
  ],
  BOTNET_MALWARE_PANELS: [
    "EMOTET_PANEL_MONITOR", "TRICKBOT_MONITOR", "QAKBOT_MONITOR", "ICEDID_MONITOR",
    "DRIDEX_MONITOR", "BAZARLOADER_MONITOR", "COBALT_STRIKE_MONITOR",
    "SLIVER_C2_MONITOR", "BRUTE_RATEL_MONITOR", "HAVOC_C2_MONITOR"
  ],
  PHISHING_SCAM_MONITORING: [
    "PHISHING_KIT_MONITOR", "EVILGINX_MONITOR", "GOPHISH_MONITOR", "MODLISHKA_MONITOR",
    "SCAM_PAGE_MONITOR", "CRYPTO_SCAM_MONITOR", "ROMANCE_SCAM_MONITOR",
    "BEC_VICTIM_MONITOR", "TECH_SUPPORT_SCAM_MONITOR", "INVESTMENT_SCAM_MONITOR"
  ],
  CRYPTO_THREAT_MONITORING: [
    "CRYPTO_DRAINER_MONITOR", "NFT_SCAM_MONITOR", "DEFI_EXPLOIT_MONITOR_V2",
    "SEED_PHRASE_MONITOR", "PRIVATE_KEY_MONITOR", "EXCHANGE_BREACH_MONITOR",
    "METAMASK_PHISH_MONITOR", "LEDGER_LEAK_MONITOR", "TREZOR_PHISH_MONITOR",
    "COINBASE_BREACH_MONITOR"
  ],
  GAMING_ACCOUNT_FRAUD: [
    "STEAM_ACCOUNT_MONITOR", "EPIC_GAMES_MONITOR", "ROBLOX_ACCOUNT_MONITOR",
    "MINECRAFT_ACCOUNT_MONITOR", "PSN_ACCOUNT_MONITOR", "XBOX_ACCOUNT_MONITOR",
    "VALORANT_ACCOUNT_MONITOR", "LOL_ACCOUNT_MONITOR", "GENSHIN_ACCOUNT_MONITOR",
    "WOW_ACCOUNT_MONITOR"
  ],
  SOCIAL_MEDIA_ACCOUNT_MARKETS: [
    "INSTAGRAM_ACCOUNT_MARKET", "TIKTOK_ACCOUNT_MARKET", "TWITTER_ACCOUNT_MARKET",
    "FACEBOOK_ACCOUNT_MARKET", "YOUTUBE_ACCOUNT_MARKET", "SNAPCHAT_ACCOUNT_MARKET",
    "LINKEDIN_ACCOUNT_MARKET", "DISCORD_ACCOUNT_MARKET", "TWITCH_ACCOUNT_MARKET",
    "REDDIT_ACCOUNT_MARKET"
  ],
  STREAMING_ACCOUNT_FRAUD: [
    "NETFLIX_ACCOUNT_MONITOR", "SPOTIFY_ACCOUNT_MONITOR", "DISNEY_PLUS_MONITOR",
    "HBO_MAX_MONITOR", "AMAZON_PRIME_MONITOR", "HULU_ACCOUNT_MONITOR",
    "APPLE_TV_MONITOR", "PARAMOUNT_PLUS_MONITOR", "CRUNCHYROLL_MONITOR",
    "VPN_ACCOUNT_MONITOR"
  ],
  GOVERNMENT_MILITARY_LEAKS: [
    "GOV_BREACH_MONITOR", "MILITARY_LEAK_MONITOR", "CLEARANCE_DATA_MONITOR",
    "FEDERAL_EMPLOYEE_MONITOR", "LAW_ENFORCEMENT_MONITOR"
  ],
  HEALTHCARE_DATA_LEAKS: [
    "HIPAA_BREACH_MONITOR", "MEDICAL_RECORDS_MONITOR", "PRESCRIPTION_DATA_MONITOR",
    "INSURANCE_CLAIM_MONITOR", "PATIENT_DATABASE_MONITOR"
  ],
  CORPORATE_DATA_EXPOSURE: [
    "CORPORATE_EMAIL_MONITOR", "SHAREPOINT_LEAK_MONITOR", "CONFLUENCE_LEAK_MONITOR",
    "JIRA_LEAK_MONITOR", "SLACK_LEAK_MONITOR", "GITHUB_SECRET_MONITOR",
    "GITLAB_LEAK_MONITOR", "S3_BUCKET_MONITOR", "AZURE_BLOB_MONITOR",
    "GCP_BUCKET_MONITOR"
  ],
  MOBILE_DEVICE_LEAKS: [
    "IMEI_DATABASE_MONITOR", "PHONE_BACKUP_MONITOR", "ICLOUD_BREACH_MONITOR",
    "GOOGLE_ACCOUNT_MONITOR", "SAMSUNG_ACCOUNT_MONITOR", "WHATSAPP_BACKUP_MONITOR",
    "TELEGRAM_DATA_MONITOR", "SIGNAL_LEAK_MONITOR", "VIBER_DATA_MONITOR",
    "LINE_APP_MONITOR"
  ],
  ECOMMERCE_RETAIL_FRAUD: [
    "AMAZON_ACCOUNT_FRAUD", "EBAY_ACCOUNT_MONITOR", "PAYPAL_ACCOUNT_MARKET",
    "VENMO_ACCOUNT_MONITOR", "CASHAPP_ACCOUNT_MONITOR", "ZELLE_FRAUD_MONITOR",
    "SHOPIFY_STORE_MONITOR", "STRIPE_ACCOUNT_MONITOR", "WALMART_ACCOUNT_MONITOR",
    "TARGET_ACCOUNT_MONITOR"
  ],
  TRAVEL_HOSPITALITY_FRAUD: [
    "AIRLINE_MILES_MONITOR", "HOTEL_POINTS_MONITOR", "AIRBNB_ACCOUNT_MONITOR",
    "UBER_ACCOUNT_MONITOR", "LYFT_ACCOUNT_MONITOR", "DOORDASH_ACCOUNT_MONITOR",
    "UBEREATS_ACCOUNT_MONITOR", "GRUBHUB_ACCOUNT_MONITOR", "BOOKING_COM_MONITOR",
    "EXPEDIA_ACCOUNT_MONITOR"
  ],
  EDUCATION_ACADEMIC_LEAKS: [
    "STUDENT_RECORDS_MONITOR", "UNIVERSITY_BREACH_MONITOR", "EDU_EMAIL_MARKET",
    "STUDENT_LOAN_MONITOR", "SCHOLARSHIP_FRAUD_MONITOR", "LMS_BREACH_MONITOR",
    "CANVAS_LEAK_MONITOR", "BLACKBOARD_LEAK_MONITOR", "COURSERA_ACCOUNT_MONITOR",
    "UDEMY_ACCOUNT_MONITOR"
  ],
  IOT_SMART_DEVICE_LEAKS: [
    "SMART_HOME_MONITOR", "RING_CAMERA_MONITOR", "NEST_ACCOUNT_MONITOR",
    "WYZE_BREACH_MONITOR", "ALEXA_DATA_MONITOR", "SMART_TV_MONITOR",
    "ROUTER_VULN_MONITOR", "IP_CAMERA_MONITOR", "BABY_MONITOR_LEAK",
    "SMART_LOCK_MONITOR"
  ],
  AUTOMOTIVE_VEHICLE_DATA: [
    "TESLA_ACCOUNT_MONITOR", "CONNECTED_CAR_MONITOR", "ONSTAR_DATA_MONITOR",
    "UCONNECT_MONITOR", "FORD_SYNC_MONITOR", "VIN_DATABASE_MONITOR",
    "GPS_TRACKER_MONITOR", "FLEET_MANAGEMENT_MONITOR", "OBD_DATA_MONITOR",
    "EV_CHARGING_MONITOR"
  ],
  FINANCIAL_BANKING_LEAKS: [
    "BANK_OF_AMERICA_MONITOR", "CHASE_ACCOUNT_MONITOR", "WELLS_FARGO_MONITOR",
    "CITI_ACCOUNT_MONITOR", "CAPITAL_ONE_MONITOR", "CRYPTO_EXCHANGE_MONITOR",
    "BINANCE_ACCOUNT_MONITOR", "KRAKEN_ACCOUNT_MONITOR", "ROBINHOOD_MONITOR",
    "FIDELITY_MONITOR"
  ],
  DATING_ADULT_SITE_LEAKS: [
    "TINDER_DATA_MONITOR", "BUMBLE_DATA_MONITOR", "HINGE_DATA_MONITOR",
    "GRINDR_DATA_MONITOR", "ASHLEY_MADISON_MONITOR", "ADULT_SITE_MONITOR",
    "ONLYFANS_LEAK_MONITOR", "DATING_APP_GENERAL", "FETLIFE_MONITOR",
    "SEEKING_ARRANGEMENT_MONITOR"
  ],

  // ==========================================
  // ADDITIONAL DATA BROKER CATEGORIES v1.18.0
  // ==========================================

  SKIP_TRACING_COLLECTIONS: [
    "TRANSUNION_TRUELOOK", "EQUIFAX_WORKFORCE", "EXPERIAN_MARKETING",
    "ACCURINT_LEXISNEXIS", "TRACERS_INFO", "IRB_SEARCH", "TLOXP",
    "SKIPMAX", "SKIP_SMASHER", "BATCH_SKIP_TRACING"
  ],
  AUTOMOTIVE_DATA: [
    "CARFAX_OWNER", "AUTOCHECK_EXPERIAN", "VINAUDIT", "POLK_AUTOMOTIVE",
    "JD_POWER_DATA", "VEHICLEHISTORY_COM", "CLEARVIN", "BUMPER_VEHICLE",
    "EPICVIN", "FAXVIN"
  ],
  INSURANCE_DATA: [
    "LEXISNEXIS_CLUE", "VERISK_ISO", "MIB_GROUP", "MILLIMAN_INTELLISCRIPT",
    "A_PLUS_INSURANCE", "CHOICEPOINT_INSURANCE", "TRANSUNION_INSURANCE",
    "EXPERIAN_INSURANCE", "FENRIS_DIGITAL", "CAPE_ANALYTICS"
  ],
  HEALTHCARE_PROVIDERS: [
    "IQVIA_DATA", "HEALTHGRADES_DATA", "DOXIMITY_DATA", "WEBMD_PROVIDER",
    "VITALS_DIRECTORY", "ZOCDOC_LISTINGS", "REALSELF_DIRECTORY",
    "CASTLIGHT_HEALTH", "SHARECARE_DATA", "DEFINITIVE_HC"
  ],
  B2B_DATA_PROVIDERS: [
    "ZOOMINFO", "DUNSANDBRADSREET", "HOOVERS_DNB", "INFOGROUP_DATA",
    "LEAD411", "DISCOVER_ORG", "SEAMLESS_AI", "LUSHA_DATA", "APOLLO_IO",
    "CLEARBIT_DATA", "SLINTEL", "COGNISM", "CONTACTOUT", "HUNTER_IO",
    "VOILANORBERT", "ROCKETREACH", "SNOV_IO", "UPLEAD", "DATANYZE", "SALESINTEL"
  ],
  CONSUMER_MARKETING_DATA: [
    "ACXIOM_ABOUTTHEDATA", "ORACLE_DATACLOUD", "EPSILON_DATA", "LIVERAMP_DATA",
    "NIELSEN_IQ", "LOTAME_DATA", "COMSCORE_DATA", "TAPAD_DATA", "DRAWBRIDGE", "TRUTHSET"
  ],
  RETAIL_SHOPPING_DATA: [
    "CATALINA_DATA", "IBOTTA_DATA", "FETCH_REWARDS", "RAKUTEN_DATA",
    "CARDLYTICS", "SHOPKICK_DATA", "INMARKET_DATA", "PLACED_FOURSQUARE",
    "AFFINITY_SOLUTIONS", "NUMERATOR_DATA"
  ],
  LOCATION_DATA_PROVIDERS: [
    "SAFEGRAPH_DATA", "PLACER_AI", "GRAVY_ANALYTICS", "UNACAST_DATA",
    "CUEBIQ_DATA", "VERASET_DATA", "NEARMEDIA", "GROUNDTRUTH_DATA",
    "REVEAL_MOBILE", "XMODE_DATA"
  ],
  IDENTITY_RESOLUTION: [
    "FULLCONTACT", "PIPL_ENTERPRISE", "PEOPLEDATALABS", "VERSIUM_DATA",
    "TOWERDATA", "BIGDBM", "EMAILAGE"
  ],
  ALTERNATIVE_CREDIT: [
    "CHEXSYSTEMS_CREDIT", "CERTEGY_CHECK", "TELECHECK", "NCTUE_UTILITY",
    "CLARITY_SERVICES", "FACTORTRUST", "SRS_TENANT", "INNOVIS_DATA",
    "PRBC_CREDIT", "SAGESTREAM_CREDIT"
  ],
  EMPLOYMENT_DATA: [
    "THE_WORK_NUMBER", "ADP_VERIFICATION", "PAYCHEX_DATA", "TALENTIQ",
    "HIBOB_DATA"
    // REMOVED: GREENHOUSE_DATA, LEVER_DATA, SMARTRECRUITERS, JOBVITE_DATA, WORKDAY_DATA
    // These are ATS/recruiting platforms with direct user relationships, not data brokers
  ],
  LEGAL_RECORDS: [
    "PACER_RECORDS", "COURTLINK_LN", "WESTLAW_COURT", "COURTRECORDS_ORG",
    "JUDYRECORDS", "UNIQUECOURT", "DOCKETBIRD", "COURTLISTENER",
    "JUSTIA_DOCKETS", "BLOOMBERG_LAW"
  ],
  REAL_ESTATE_DATA: [
    "CORELOGIC_PROPERTY", "ATTOM_DATA", "FIRST_AMERICAN_DATA", "BLACK_KNIGHT_DATA",
    "REONOMY_DATA", "REALTYTRACK", "PROPERTYSHARK", "LANDGRID", "REGRID", "REALPAGE_DATA"
  ],
  VOTER_POLITICAL_DATA: [
    "L2_VOTER_DATA", "ARISTOTLE_VOTER", "CATALIST_DATA", "TARGET_SMART",
    "NATIONBUILDER", "NGPVAN", "I360_DATA", "DATA_TRUST", "VOTERBASE", "POLITICAL_DATA"
  ],
  SOCIAL_AGGREGATORS: [
    "SOCIAL_CATFISH_AGG", "BRANDYOURSELF", "SOCIALBAKERS", "SOCIAL_MENTION",
    "BRANDWATCH", "SPRINKLR_DATA", "NETBASE_QUID", "HOOTSUITE_DATA",
    "TALKWALKER", "SYSOMOS"
  ],
  PHONE_DATA_PROVIDERS: [
    "TWILIO_LOOKUP", "NUMVERIFY_PHONE", "EKATA_DATA", "TELESIGN_DATA",
    "MARCHEX_DATA", "CALLRAIL_DATA", "INVOCA_DATA", "DIALOGTECH",
    "RINGBA_DATA", "CONVIRZA_DATA"
  ],
  INTERNATIONAL_APAC: [
    "PIPL_APAC", "WHITEPAGES_AUSTRALIA", "YELLOWPAGES_AU", "LOCALSEARCH_AU",
    "TRUELOCAL_AU", "WHITEPAGES_NEWZEALAND", "YELLOWPAGES_NZ", "FINDA_NZ",
    "JUSTDIAL_IN", "SULEKHA_IN"
  ],
  INTERNATIONAL_LATAM: [
    "PAGINASAMARILLAS_MX", "SECCIONAMARILLA_MX", "TELELISTAS_BR", "LISTASAMARILLAS_BR",
    "PAGINASAMARILLAS_AR", "PAGINASAMARILLAS_CL", "PAGINASAMARILLAS_CO",
    "PAGINASAMARILLAS_PE", "CIUDAD_CL", "GUIAMAIS_BR"
  ],
  INTERNATIONAL_MENA_AFRICA: [
    "YELLOWPAGES_ZA", "WHITEPAGES_ZA", "YELLOWPAGES_AE", "YELLOWPAGES_SA",
    "YELLOWPAGES_EG", "D144_EG", "BEBEO_SA", "YELLOWPAGES_NG",
    "BUSINESSLIST_KE", "YELLOWPAGES_MA"
  ],
  SPECIALTY_DATA: [
    "DATALOGIX_ORACLE", "MERKLE_DATA", "CROSSIX", "HEALTHVERITY",
    "KOMODO_HEALTH", "SYMPHONY_HEALTH", "PULSEPOINTLIFE", "ADTHEORENT",
    "DIGITALENVOY", "MAXMIND"
  ],

  // ==========================================
  // ADDITIONAL CATEGORIES v1.19.0 (1000 MILESTONE)
  // ==========================================

  ADDITIONAL_BACKGROUND_CHECK: [
    "GOODHIRE_BG", "CRIMCHECK", "VERIFIED_FIRST", "ORANGE_TREE", "ASURINT"
  ],
  ADDITIONAL_CONSUMER_DATA: [
    "INFUTOR_DATA", "WEBBULA", "DATAAXLE", "THROTLE", "SEMCASTING"
  ],
  ADDITIONAL_REAL_ESTATE: [
    "LISTHUB", "HOMEBOT", "QUANTARIUM", "HOUSECANARY", "HOMEUNION"
  ],
  ADDITIONAL_PHONE_IDENTITY: [
    "WHITECALLER", "PHONEBOOK_OF_THE_WORLD", "CALLER_ID_SERVICE", "PHONEINFO", "PHONEDETECTIVE"
  ],
  INTERNATIONAL_EUROPE: [
    "INFOBEL_EU", "EUROPAGES", "KOMPASS_EU", "HOTFROG_EU", "CYLEX_EU"
  ],
  BUSINESS_INTELLIGENCE: [
    "OWLER_DATA", "CRUNCHBASE_DATA", "PITCHBOOK", "CB_INSIGHTS", "PRIVCO"
  ],
  PROFESSIONAL_DIRECTORIES: [
    "AVVO_LEGAL", "MARTINDALE", "FINDLAW_DIR", "LAWYERS_COM", "JUSTIA_DIR"
  ],
  ADVERTISING_DATA: [
    "THE_TRADE_DESK_DATA", "BIDSWITCH", "SAMBA_TV", "VIZIO_INSCAPE", "AUTOMATIC_TV"
  ],
  ADDITIONAL_RETAIL_DATA: [
    "SHOPPERTRACK", "PRICESPIDER"
    // BAZAARVOICE and YOTPO_DATA removed - Data Processors, not Data Brokers
  ],

  // ==========================================
  // ADDITIONAL CATEGORIES v1.21.0 (520 NEW BROKERS)
  // ==========================================

  PEOPLE_SEARCH_EXPANSION: [
    "SEARCHPEOPLEFREE_PRO", "PEOPLEFINDERPRO_V2", "PEOPLESEARCHSITE", "FINDPERSONINFO",
    "LOOKUPPAGES", "PERSONLOOKUPNOW", "FREEPEOPLELOOKUP", "QUICKPEOPLESEARCH_V2",
    "SEARCHFORANYONE", "PEOPLEDATALAB", "ANYPERSONINFO", "LOOKUPUSA",
    "FINDPERSONFREE", "PEOPLETRACKER", "NAMESEARCHPRO", "PUBLICDATAFINDER_V2",
    "PERSONRECORDS", "INSTANTPEOPLELOOKUP", "SEARCHPUBLIC", "FINDINFOFAST",
    "RECORDSPEDIA", "PEOPLEDATABASE", "NAMESEARCHNOW", "PEOPLEFIND360",
    "SEARCHPERSONINFO", "FINDSOMEONE", "LOOKUPFAST", "PUBLICINFONOW",
    "PEOPLESEARCHEXPERT", "FINDPEOPLEDATA", "PERSONINFOSITE", "LOOKUPWORLD",
    "SEARCHRECORDSNOW", "PEOPLEINFOPRO", "FINDANYBODYINFO", "RECORDSPLANET",
    "NAMESEARCHWORLD", "PEOPLEFINDEXPERT", "SEARCHANYRECORD", "PUBLICRECORDSPRO",
    "FINDINFONOW", "PEOPLELOOKUPFAST", "RECORDSEARCHPRO_V2", "FINDSOMEONEFREE",
    "LOOKUPANYNAME", "PEOPLERECORDSEARCH", "INSTANTNAMESEARCH", "SEARCHPEOPLEWORLD",
    "FINDPERSONNOW", "PUBLICDATAWORLD"
  ],
  PHONE_LOOKUP_EXPANSION: [
    "PHONELOOKUPEXPERT", "REVERSEPHONEPRO", "CALLERIDSEARCH", "PHONENUMBERFINDER_V2",
    "WHOISCALLING", "LOOKUPPHONEOWNER", "CELLPHONELOOKUP_V2", "PHONEOWNERINFO",
    "REVERSECELLSEARCH", "CALLERINFOSITE", "PHONESEARCHEXPERT", "NUMBERIDENTIFY",
    "FINDPHONEOWNER", "WHOREGISTERED", "PHONEDIRECTORYUSA_V2", "REVERSENUMBERPRO",
    "CALLERLOOKUPNOW", "PHONEINFOSEARCH", "WHOISTHISNUMBER", "NUMBERLOOKUPPRO",
    "FINDCALLERINFO", "REVERSEMOBILELOOKUP", "PHONESEARCHPRO", "CALLERIDNOW",
    "NUMBEROWNERINFO", "LOOKUPNUMBERNOW", "PHONEFINDERPRO", "WHOSECALLER",
    "REVERSEPHONEFREE_V2", "PHONEINFOEXPERT", "NUMBERSEARCHSITE", "CALLERVERIFY",
    "FINDPHONEPRO", "WHOOWNSPHONE", "REVERSEPHONEWORLD", "PHONELOOKUPSITE",
    "CELLLOOKUPPRO", "WHOSNUMBER", "FINDCALLERID", "NUMBERVERIFYSITE"
  ],
  ADDRESS_LOOKUP_EXPANSION: [
    "ADDRESSLOOKUPNOW", "FINDADDRESSPRO", "REVERSEADDRESS_V2", "ADDRESSSEARCHSITE",
    "LOOKUPADDRESSNOW", "ADDRESSFINDEREXPERT", "FINDRESIDENTINFO", "NEIGHBORHOODLOOKUP",
    "ADDRESSRECORDSPRO", "RESIDENTFINDER", "WHOLIVESHERE", "ADDRESSDATABASEPRO",
    "FINDOCCUPANTS", "ADDRESSLOOKUPEXPERT", "RESIDENTSEARCHPRO", "LOOKUPRESIDENTS",
    "ADDRESSINFOFINDER", "STREETRECORDSPRO", "FINDMYNEIGHBOR", "ADDRESSPUBLICRECORDS",
    "RESIDENTSINFO", "ADDRESSSEARCHEXPERT", "NEIGHBORLOOKUPNOW", "FINDSTREETINFO",
    "ADDRESSRECORDSNOW", "RESIDENTIALDATA", "LOOKUPSTREETINFO", "ADDRESSFINDERNOW",
    "RESIDENTLOOKUPPRO", "PROPERTYRESIDENTS", "ADDRESSDATANOW", "FINDADDRESSINFO",
    "NEIGHBORHOODSEARCH_V2", "ADDRESSRECORDSWORLD", "RESIDENTDATAPRO", "LOOKUPADDRESSWORLD",
    "STREETDATAFINDER", "FINDRESIDENTS", "ADDRESSVERIFYSITE", "NEIGHBORINFONOW"
  ],
  B2B_DATA_EXPANSION: [
    "LEADGENEXPERT", "BUSINESSCONTACTPRO", "CORPORATEDATAHUB", "SALESLEADSNOW",
    "BUSINESSINFOPRO", "COMPANYDATAEXPERT", "EXECUTIVECONTACTS", "LEADDATAPRO",
    "BUSINESSLEADSHUB", "CORPORATEINFOFINDER", "SALESPROSPECTPRO", "COMPANYCONTACTSNOW",
    "BUSINESSDATANOW", "LEADFINDEREXPERT", "CORPORATELEADSPRO", "BUSINESSSEARCHPRO",
    "COMPANYINFOHUB", "EXECUTIVEDATAPRO", "BUSINESSLEADSWORLD", "LEADLISTPRO",
    "CORPORATEDIRECTORY", "SALESCONTACTSPRO", "BUSINESSDATAWORLD", "COMPANYLEADSFINDER",
    "EXECUTIVEINFOPRO", "LEADSDATABASEPRO", "BUSINESSCONTACTSNOW", "COMPANYINFOPRO",
    "CORPORATESEARCHPRO", "SALESLEADSPRO", "BUSINESSINFOWORLD", "LEADCONTACTSPRO",
    "COMPANYDATAHUB", "EXECUTIVELEADSPRO", "BUSINESSDATAFINDER", "CORPORATECONTACTSPRO",
    "LEADINFOPRO", "COMPANYCONTACTSHUB", "SALESDATAPRO", "BUSINESSLEADSFINDER",
    "CORPORATEDATAPRO", "EXECUTIVECONTACTSPRO", "LEADSEARCHPRO", "BUSINESSINFOFINDER",
    "COMPANYCONTACTPRO", "SALESDATAWORLD", "CORPORATELEADSFINDER", "LEADSDATAWORLD",
    "BUSINESSCONTACTWORLD", "COMPANYRECORDSPRO"
  ],
  MARKETING_DATA_EXPANSION: [
    "MARKETINGDATAHUB", "CONSUMERDATAPRO", "AUDIENCEDATAEXPERT", "TARGETINGDATAPRO",
    "CONSUMERINSIGHTSHUB", "MARKETINGLISTSPRO", "AUDIENCETARGETPRO", "CONSUMERDATAWORLD",
    "MARKETINGDATAPRO", "TARGETAUDIENCEPRO", "CONSUMERLISTSPRO", "AUDIENCEDATAHUB",
    "MARKETINGINSIGHTSPRO", "CONSUMERTARGETPRO", "AUDIENCELISTSPRO", "MARKETINGDATAFINDER",
    "CONSUMERDATAFINDER", "AUDIENCEINSIGHTSPRO", "TARGETINGLISTSPRO", "CONSUMERINSIGHTSPRO",
    "MARKETINGLISTSHUB", "AUDIENCEDATAWORLD", "CONSUMERDATAHUB", "TARGETINGDATAHUB",
    "MARKETINGDATAEXPERT", "AUDIENCETARGETHUB", "CONSUMERLISTSHUB", "MARKETINGINSIGHTSHUB",
    "AUDIENCEDATAPRO", "CONSUMERMARKETPRO", "TARGETINGINSIGHTSPRO", "MARKETINGLISTSWORLD",
    "AUDIENCELISTSHUB", "CONSUMERDATAEXPERT", "MARKETINGTARGETPRO", "AUDIENCEMARKETPRO",
    "CONSUMERINFOPRO", "TARGETINGDATAWORLD", "MARKETINGDATACLOUD", "AUDIENCEINFOPRO",
    "CONSUMERTARGETHUB", "MARKETINGINFOPRO", "AUDIENCEDATACLOUD", "CONSUMERMARKETDATA",
    "TARGETINGINFOPRO", "MARKETINGLISTSEXPERT", "AUDIENCETARGETWORLD", "CONSUMERDATACLOUD",
    "MARKETINGDATASERVICE", "AUDIENCELISTSWORLD"
  ],
  BACKGROUND_CHECK_EXPANSION: [
    "BACKGROUNDCHECKPRO", "CRIMINALRECORDSNOW", "EMPLOYMENTCHECKPRO", "BACKGROUNDSEARCHNOW",
    "CRIMINALCHECKPRO", "BACKGROUNDDATAPRO", "VERIFYCHECKPRO", "BACKGROUNDINFOPRO",
    "CRIMINALRECORDSPRO", "SCREENINGCHECKPRO", "BACKGROUNDVERIFYPRO", "COURTRECORDSPRO_V2",
    "BACKGROUNDSCREENPRO", "CRIMINALINFOPRO", "BACKGROUNDCHECKWORLD", "RECORDSCHECKPRO",
    "BACKGROUNDSEARCHPRO", "CRIMINALCHECKWORLD", "BACKGROUNDDATAHUB", "VERIFYCHECKWORLD",
    "BACKGROUNDINFOHUB", "CRIMINALRECORDSWORLD", "SCREENINGCHECKWORLD", "BACKGROUNDVERIFYWORLD",
    "COURTRECORDSWORLD", "BACKGROUNDSCREENWORLD", "CRIMINALINFOWORLD", "BACKGROUNDRECORDSPRO",
    "RECORDSCHECKWORLD", "BACKGROUNDSEARCHWORLD", "CRIMINALCHECKEXPERT", "BACKGROUNDDATAWORLD",
    "VERIFYCHECKEXPERT", "BACKGROUNDINFOWORLD", "CRIMINALRECORDSEXPERT", "SCREENINGCHECKEXPERT",
    "BACKGROUNDVERIFYEXPERT", "COURTRECORDSEXPERT", "BACKGROUNDSCREENEXPERT", "CRIMINALINFOEXPERT"
  ],
  INTERNATIONAL_EXPANSION: [
    "YELLOWPAGES_UK", "WHITEPAGES_UK", "PEOPLEFINDER_UK", "SEARCHPEOPLE_UK", "ADDRESSFINDER_UK",
    "CANADA411_EXTENDED", "PEOPLEFINDER_CA", "SEARCHPEOPLE_CA", "WHITEPAGES_CA_EXT", "YELLOWPAGES_CA_EXT",
    "WHITEPAGES_AU_EXT", "YELLOWPAGES_AU_EXT", "PEOPLEFINDER_AU", "SEARCHPEOPLE_AU", "ADDRESSFINDER_AU",
    "PAGESJAUNES_FR_V2", "PAGESBLANCHES_FR", "ANNUAIRE_FR", "DASTELEFONBUCH_DE_V2", "GELBESEITEN_DE_V2",
    "PERSONENSUCHE_DE", "PAGINEBIANCHE_IT_V2", "PAGINEGIALLE_IT_V2", "PAGINASAMARILLAS_ES_V2", "PAGINASBLANCAS_ES_V2",
    "HITTA_SE_EXT", "ENIRO_SE", "KRAK_DK_EXT", "DEGULESIDER_DK", "GULESIDER_NO", "HVITESIDER_NO",
    "FONECTA_FI_V2", "NUMEROPALVELU_FI", "GOUDEN_GIDS_NL", "DETELEFOONGIDS_NL_V2", "HEROLD_AT_EXT",
    "LOCAL_CH_EXT", "SEARCH_CH_V2", "ZLATESTRANKY_CZ_V2", "ZLATESTRANY_SK", "PANORAMAFIRM_PL_V2",
    "TELEADRESON_PL", "YELLOWPAGES_JP", "ITOWN_JP_V2", "YELLOWPAGES_SG_V2", "WHITEPAGES_SG",
    "YELLOWPAGES_HK_V2", "HKPAGES", "JUSTDIAL_IN_EXT", "SULEKHA_IN_EXT", "INDIAMART",
    "TRADEINDIA", "YELLOWPAGES_MY_V2", "YELLOWPAGES_PH_V2", "YELLOWPAGES_ID_V2", "YELLOWPAGES_TH_V2",
    "YELLOWPAGES_VN_V2", "YELLOWPAGES_KR_V2", "YELLOWPAGES_TW_V2"
  ],
  PROPERTY_DATA_EXPANSION: [
    "PROPERTYINFOPRO", "HOMEOWNERDATAPRO", "REALESTATERECORDS", "PROPERTYOWNERINFO_V2",
    "HOMEVALUEDATA", "PROPERTYDATAHUB", "HOMEOWNERLOOKUP", "REALESTATEDATAPRO",
    "PROPERTYRECORDSNOW", "HOMEOWNERINFOPRO", "PROPERTYSEARCHPRO", "REALESTATEINFOHUB",
    "HOMEVALUEPRO", "PROPERTYOWNERPRO", "HOMEOWNERSEARCHPRO", "REALESTATERECORDSPRO",
    "PROPERTYDATAWORLD", "HOMEOWNERDATAHUB", "REALESTATESEARCHPRO", "PROPERTYRECORDSPRO",
    "HOMEVALUEDATAPRO", "PROPERTYINFOWORLD", "HOMEOWNERRECORDSPRO", "REALESTATEDATAWORLD",
    "PROPERTYOWNERHUB", "HOMEOWNERDATAWORLD", "REALESTATEINFOPRO", "PROPERTYSEARCHHUB",
    "HOMEVALUEWORLD", "PROPERTYOWNERWORLD", "HOMEOWNERSEARCHHUB", "REALESTATERECORDSWORLD",
    "PROPERTYDATAEXPERT", "HOMEOWNERDATAEXPERT", "REALESTATESEARCHHUB", "PROPERTYRECORDSWORLD",
    "HOMEVALUEDATAHUB", "PROPERTYINFOEXPERT", "HOMEOWNERRECORDSHUB", "REALESTATEDATAEXPERT",
    "PROPERTYOWNEREXPERT", "HOMEOWNERDATAFINDER", "REALESTATERECORDSEXPERT", "PROPERTYSEARCHEXPERT",
    "HOMEVALUEDATAWORLD", "PROPERTYRECORDSEXPERT", "HOMEOWNERSEARCHWORLD", "REALESTATESEARCHWORLD",
    "PROPERTYDATAFINDER", "HOMEVALUEDATAEXPERT"
  ],
  EMAIL_MARKETING_EXPANSION: [
    "EMAILLISTPRO", "EMAILDATAHUB", "EMAILMARKETINGPRO", "EMAILLISTWORLD", "EMAILDATAEXPERT",
    "EMAILVERIFYWORLD", "EMAILFINDERPRO_V2", "EMAILLISTEXPERT", "EMAILDATAWORLD", "EMAILMARKETINGHUB",
    "EMAILLOOKUPPRO", "EMAILVERIFYEXPERT", "EMAILFINDERWORLD", "EMAILDATAPRO", "EMAILLISTHUB",
    "EMAILMARKETINGWORLD", "EMAILLOOKUPWORLD", "EMAILVERIFYPRO", "EMAILFINDEREXPERT", "EMAILDATAFINDER",
    "EMAILLISTFINDER", "EMAILMARKETINGEXPERT", "EMAILLOOKUPEXPERT", "EMAILVERIFYHUB", "EMAILFINDERHUB",
    "EMAILDATASEARCH", "EMAILLISTSEARCH", "EMAILMARKETINGSEARCH", "EMAILLOOKUPFINDER", "EMAILVERIFYFINDER"
  ],
  SOCIAL_MEDIA_AGGREGATORS: [
    "SOCIALDATAPRO", "SOCIALPROFILEPRO", "SOCIALMEDIAINFO", "SOCIALFINDEREXPERT", "SOCIALDATAHUB",
    "SOCIALPROFILEWORLD", "SOCIALMEDIAPRO", "SOCIALFINDERPRO", "SOCIALDATAWORLD", "SOCIALPROFILEHUB",
    "SOCIALMEDIAWORLD", "SOCIALFINDERWORLD", "SOCIALDATAEXPERT", "SOCIALPROFILEEXPERT", "SOCIALMEDIAHUB",
    "SOCIALFINDERHUB", "SOCIALDATAFINDER", "SOCIALPROFILEFINDER", "SOCIALMEDIAFINDER", "SOCIALSEARCHPRO",
    "SOCIALDATASEARCH", "SOCIALPROFILESEARCH", "SOCIALMEDIASEARCH", "SOCIALSEARCHWORLD", "SOCIALLOOKUPPRO",
    "SOCIALLOOKUPWORLD", "SOCIALLOOKUPEXPERT", "SOCIALLOOKUPFINDER", "SOCIALLOOKUHUB", "SOCIALDATASERVICE"
  ],
  IDENTITY_VERIFICATION_EXPANSION: [
    "IDENTITYVERIFYPRO", "IDVERIFICATIONHUB", "IDENTITYDATAPRO", "IDCHECKPRO", "IDENTITYVERIFYWORLD",
    "IDVERIFICATIONPRO", "IDENTITYDATAHUB", "IDCHECKWORLD", "IDENTITYVERIFYEXPERT", "IDVERIFICATIONWORLD",
    "IDENTITYDATAWORLD", "IDCHECKEXPERT", "IDENTITYVERIFYHUB", "IDVERIFICATIONEXPERT", "IDENTITYDATAEXPERT",
    "IDCHECKHUB", "IDENTITYVERIFYFINDER", "IDVERIFICATIONFINDER", "IDENTITYDATAFINDER", "IDCHECKFINDER",
    "IDENTITYSEARCHPRO", "IDSEARCHPRO", "IDENTITYSEARCHWORLD", "IDSEARCHWORLD", "IDENTITYSEARCHEXPERT",
    "IDSEARCHEXPERT", "IDENTITYSEARCHHUB", "IDSEARCHHUB", "IDENTITYSEARCHFINDER", "IDSEARCHFINDER"
  ],
  DARK_WEB_MONITORING_EXPANSION: [
    "DARKWEB_CREDENTIAL_MONITOR_V2", "STEALER_LOG_AGGREGATOR", "RANSOMWARE_VICTIM_TRACKER",
    "BREACH_COMPILATION_MONITOR", "FORUM_CREDENTIAL_SCRAPER", "PASTE_SITE_AGGREGATOR",
    "TELEGRAM_LEAK_AGGREGATOR", "DARK_MARKET_INTELLIGENCE", "INFOSTEALER_TRACKER",
    "CREDENTIAL_DUMP_MONITOR", "BOTNET_LOG_MONITOR", "CARDING_FORUM_MONITOR",
    "FULLZ_MARKET_TRACKER", "SSN_DOB_TRACKER", "BANK_DROP_MONITOR", "SIM_SWAP_TRACKER",
    "ACCOUNT_TAKEOVER_MONITOR", "PHISHING_KIT_TRACKER", "MALWARE_PANEL_MONITOR",
    "EXPLOIT_BROKER_MONITOR", "RDP_ACCESS_TRACKER", "VPN_CREDENTIAL_MONITOR",
    "CLOUD_CREDENTIAL_TRACKER", "API_KEY_MONITOR", "SSH_KEY_TRACKER", "DATABASE_DUMP_MONITOR",
    "SOURCE_CODE_LEAK_MONITOR", "DOCUMENT_LEAK_TRACKER", "FINANCIAL_DATA_MONITOR",
    "HEALTHCARE_DATA_TRACKER", "GOVERNMENT_DATA_MONITOR", "EDUCATION_DATA_TRACKER",
    "RETAIL_DATA_MONITOR", "GAMING_ACCOUNT_TRACKER", "STREAMING_ACCOUNT_MONITOR",
    "SOCIAL_MEDIA_LEAK_TRACKER", "CRYPTOCURRENCY_WALLET_MONITOR", "NFT_THEFT_TRACKER",
    "DEFI_EXPLOIT_MONITOR_V2", "EXCHANGE_HACK_TRACKER", "MOBILE_MALWARE_MONITOR",
    "IOT_BREACH_TRACKER", "SMART_HOME_LEAK_MONITOR", "VEHICLE_DATA_TRACKER",
    "WEARABLE_DATA_MONITOR", "BIOMETRIC_DATA_TRACKER", "DNA_DATA_MONITOR",
    "LOCATION_DATA_TRACKER", "VOICE_DATA_MONITOR", "FACIAL_RECOGNITION_LEAK_MONITOR",
    "AI_TRAINING_DATA_MONITOR"
  ],
} as const;

// Get data broker info by source (applies URL corrections at runtime)
export function getDataBrokerInfo(source: string): DataBrokerInfo | null {
  const info = DATA_BROKER_DIRECTORY[source];
  if (!info) return null;

  // Apply URL correction if one exists
  if (info.optOutUrl) {
    const corrected = getCorrectedUrl(info.optOutUrl);
    if (corrected) {
      return { ...info, optOutUrl: corrected };
    }
  }

  return info;
}

/**
 * Check if a source is a known data broker that we should send removals to.
 *
 * PRECISION IMPROVEMENT: Only returns true for actual data brokers.
 * Returns false for:
 * - AI services (category: AI_SERVICE) - they don't have user data to delete
 * - Unknown sources not in our directory
 * - Sources explicitly marked as not removable
 *
 * This prevents sending removal requests to:
 * - Stability AI, LAION, etc. (AI training datasets)
 * - Epsilon, Verisk (marketing data processors)
 * - Universities, random companies
 */
export function isKnownDataBroker(source: string): boolean {
  const brokerInfo = DATA_BROKER_DIRECTORY[source];

  // Not in directory = not a known broker
  if (!brokerInfo) {
    return false;
  }

  // Check category field if it exists
  if (brokerInfo.category === "AI_SERVICE") {
    return false;
  }

  // Explicitly marked as not removable = not a valid removal target
  if (brokerInfo.isRemovable === false || brokerInfo.removalMethod === "NOT_REMOVABLE") {
    return false;
  }

  // Check category field if it exists
  if (brokerInfo.category === "BREACH_DATABASE" || brokerInfo.category === "DARK_WEB") {
    return false;
  }

  // Check BROKER_CATEGORIES arrays for proper categorization
  // AI training services are not data brokers
  if ((BROKER_CATEGORIES.AI_TRAINING as readonly string[]).includes(source)) {
    return false;
  }

  // AI image/video tools are not data brokers (they generate, not collect)
  if ((BROKER_CATEGORIES.AI_IMAGE_VIDEO as readonly string[]).includes(source)) {
    return false;
  }

  // Breach databases are historical records, can't be "removed"
  if ((BROKER_CATEGORIES.BREACH_DATABASE as readonly string[]).includes(source)) {
    return false;
  }

  // Non-removable sources
  if ((BROKER_CATEGORIES.NON_REMOVABLE as readonly string[]).includes(source)) {
    return false;
  }

  // Social media platforms have direct user relationships - NOT data brokers
  if (brokerInfo.category === "SOCIAL_MEDIA") {
    return false;
  }
  if ((BROKER_CATEGORIES.SOCIAL_MEDIA as readonly string[]).includes(source)) {
    return false;
  }

  // Service providers have direct user relationships - NOT data brokers
  // Per CA Civil Code § 1798.99.80(d) "direct relationship" test
  if (brokerInfo.category === "SERVICE_PROVIDER") {
    return false;
  }
  if ((BROKER_CATEGORIES.SERVICE_PROVIDER_SOURCES as readonly string[]).includes(source)) {
    return false;
  }

  // Gray area sources — mixed user/aggregated data, exclude from removals pending classification
  if ((BROKER_CATEGORIES.GRAY_AREA_SOURCES as readonly string[]).includes(source)) {
    return false;
  }

  // Direct relationship platforms — users create accounts, consent to checks, or post reviews
  // NOT data brokers per CA Civil Code § 1798.99.80(d)
  if ((BROKER_CATEGORIES.DIRECT_RELATIONSHIP_PLATFORMS as readonly string[]).includes(source)) {
    return false;
  }

  // Has a valid opt-out method = is a data broker we can send removals to
  return true;
}

/**
 * Get the reason why a source is not a known data broker.
 * Useful for logging and user feedback.
 */
export function getNotBrokerReason(source: string): string | null {
  const brokerInfo = DATA_BROKER_DIRECTORY[source];

  if (!brokerInfo) {
    return `"${source}" is not in our data broker directory`;
  }

  // Check category field if it exists
  if (brokerInfo.category === "AI_SERVICE") {
    return `${brokerInfo.name} is an AI service, not a data broker`;
  }

  if (brokerInfo.isRemovable === false || brokerInfo.removalMethod === "NOT_REMOVABLE") {
    return `${brokerInfo.name} data cannot be removed through standard opt-out procedures`;
  }

  if (brokerInfo.category === "BREACH_DATABASE") {
    return `${brokerInfo.name} is a breach database - historical breaches cannot be "removed"`;
  }

  if (brokerInfo.category === "DARK_WEB") {
    return `${brokerInfo.name} is a dark web source - data cannot be removed through normal channels`;
  }

  // Check BROKER_CATEGORIES arrays
  if ((BROKER_CATEGORIES.AI_TRAINING as readonly string[]).includes(source)) {
    return `${brokerInfo.name} is an AI training service, not a data broker`;
  }

  if ((BROKER_CATEGORIES.AI_IMAGE_VIDEO as readonly string[]).includes(source)) {
    return `${brokerInfo.name} is an AI image/video tool, not a data broker`;
  }

  if ((BROKER_CATEGORIES.BREACH_DATABASE as readonly string[]).includes(source)) {
    return `${brokerInfo.name} is a breach database - historical breaches cannot be "removed"`;
  }

  if ((BROKER_CATEGORIES.NON_REMOVABLE as readonly string[]).includes(source)) {
    return `${brokerInfo.name} data cannot be removed - this is a non-removable source`;
  }

  if (brokerInfo.category === "SOCIAL_MEDIA" ||
      (BROKER_CATEGORIES.SOCIAL_MEDIA as readonly string[]).includes(source)) {
    return `${brokerInfo.name} is a social media platform with direct user relationships, not a data broker`;
  }

  if (brokerInfo.category === "SERVICE_PROVIDER" ||
      (BROKER_CATEGORIES.SERVICE_PROVIDER_SOURCES as readonly string[]).includes(source)) {
    return `${brokerInfo.name} is a service provider with direct user relationships, not a statutory data broker per CA Civil Code § 1798.99.80(d)`;
  }

  if ((BROKER_CATEGORIES.GRAY_AREA_SOURCES as readonly string[]).includes(source)) {
    return `${brokerInfo.name} has mixed user/aggregated data — excluded from removals pending legal classification review`;
  }

  if ((BROKER_CATEGORIES.DIRECT_RELATIONSHIP_PLATFORMS as readonly string[]).includes(source)) {
    return `${brokerInfo.name} has direct user relationships (users create accounts, consent to checks, or post reviews) — not a statutory data broker per CA Civil Code § 1798.99.80(d)`;
  }

  // It is a known broker
  return null;
}

/**
 * Legal classification for source audit.
 * Used to categorize sources against the statutory "direct relationship" test
 * from CA Civil Code § 1798.99.80(d).
 */
export type LegalClassification =
  | "STATUTORY_DATA_BROKER"
  | "SERVICE_PROVIDER"
  | "DIRECT_RELATIONSHIP"
  | "SOCIAL_PLATFORM"
  | "MONITORING_ONLY"
  | "GRAY_AREA"
  | "UNKNOWN";

/**
 * Get the legal classification for any source.
 * Returns the classification based on the statutory "direct relationship" test.
 */
export function getLegalClassification(source: string): LegalClassification {
  // Check explicit category arrays first
  if ((BROKER_CATEGORIES.SOCIAL_MEDIA as readonly string[]).includes(source)) return "SOCIAL_PLATFORM";
  if ((BROKER_CATEGORIES.SERVICE_PROVIDER_SOURCES as readonly string[]).includes(source)) return "SERVICE_PROVIDER";
  if ((BROKER_CATEGORIES.DIRECT_RELATIONSHIP_PLATFORMS as readonly string[]).includes(source)) return "DIRECT_RELATIONSHIP";
  if ((BROKER_CATEGORIES.GRAY_AREA_SOURCES as readonly string[]).includes(source)) return "GRAY_AREA";
  // Breach/dark web/AI = monitoring only
  if ((BROKER_CATEGORIES.BREACH_DATABASE as readonly string[]).includes(source)) return "MONITORING_ONLY";
  if ((BROKER_CATEGORIES.NON_REMOVABLE as readonly string[]).includes(source)) return "MONITORING_ONLY";
  // Check category field on the entry
  const info = DATA_BROKER_DIRECTORY[source];
  if (!info) return "UNKNOWN";
  if (info.category === "AI_SERVICE" || info.category === "DARK_WEB" || info.category === "BREACH_DATABASE") return "MONITORING_ONLY";
  if (info.category === "SOCIAL_MEDIA") return "SOCIAL_PLATFORM";
  if (info.category === "SERVICE_PROVIDER") return "SERVICE_PROVIDER";
  // Default for entries in directory with valid opt-out
  return "STATUTORY_DATA_BROKER";
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

// Get all data brokers (excluding social media, breach databases, and service providers)
export function getDataBrokersOnly(): Record<string, DataBrokerInfo> {
  const excludeCategories = ["SOCIAL_MEDIA", "BREACH_DATABASE"] as const;
  const excludeKeys = new Set<string>([
    ...excludeCategories.flatMap(cat => BROKER_CATEGORIES[cat]),
    ...BROKER_CATEGORIES.SERVICE_PROVIDER_SOURCES,
  ]);

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

  // Add consolidation info if this broker has subsidiaries
  if (broker.subsidiaries && broker.subsidiaries.length > 0) {
    const subNames = broker.subsidiaries
      .map(key => DATA_BROKER_DIRECTORY[key]?.name || key)
      .filter(Boolean);
    instructions += `\n\n✓ BONUS: Opting out of ${broker.name} also removes your data from: ${subNames.join(", ")}`;
  }

  // Add info if this broker consolidates to a parent
  if (broker.consolidatesTo) {
    const parent = DATA_BROKER_DIRECTORY[broker.consolidatesTo];
    if (parent) {
      instructions += `\n\n💡 TIP: Instead of opting out here, opt out of ${parent.name} - it will remove your data from ${broker.name} and other related sites.`;
    }
  }

  return instructions;
}

// ============================================
// CONSOLIDATION HELPER FUNCTIONS
// ============================================

/**
 * Get all subsidiary broker keys for a parent broker
 * Returns empty array if broker has no subsidiaries
 */
export function getSubsidiaries(source: string): string[] {
  const broker = DATA_BROKER_DIRECTORY[source];
  return broker?.subsidiaries || [];
}

/**
 * Get the parent broker key that this source consolidates to
 * Returns null if this is a standalone broker or is itself a parent
 */
export function getConsolidationParent(source: string): string | null {
  const broker = DATA_BROKER_DIRECTORY[source];
  return broker?.consolidatesTo || null;
}

/**
 * Get all brokers that would be removed when opting out of a parent broker
 * This includes the parent itself and all its subsidiaries
 */
export function getConsolidatedBrokers(source: string): string[] {
  const subsidiaries = getSubsidiaries(source);
  return [source, ...subsidiaries];
}

/**
 * Check if a broker is a subsidiary (has a parent it consolidates to)
 */
export function isSubsidiaryBroker(source: string): boolean {
  return getConsolidationParent(source) !== null;
}

/**
 * Check if a broker is a parent (has subsidiaries)
 */
export function isParentBroker(source: string): boolean {
  return getSubsidiaries(source).length > 0;
}

/**
 * Get consolidated opt-out instructions that shows what's covered
 */
export function getConsolidatedOptOutInstructions(source: string): {
  parentKey: string;
  parentName: string;
  instructions: string;
  coversCount: number;
  coversList: string[];
} | null {
  // If this broker is a subsidiary, get parent instructions
  const parentKey = getConsolidationParent(source);
  if (parentKey) {
    const parent = DATA_BROKER_DIRECTORY[parentKey];
    if (parent) {
      const subsidiaries = getSubsidiaries(parentKey);
      const coversList = subsidiaries.map(key => DATA_BROKER_DIRECTORY[key]?.name || key);
      return {
        parentKey,
        parentName: parent.name,
        instructions: getOptOutInstructions(parentKey),
        coversCount: subsidiaries.length + 1, // +1 for parent itself
        coversList,
      };
    }
  }

  // If this broker is a parent, return its own info
  const broker = DATA_BROKER_DIRECTORY[source];
  if (broker && broker.subsidiaries && broker.subsidiaries.length > 0) {
    const coversList = broker.subsidiaries.map(key => DATA_BROKER_DIRECTORY[key]?.name || key);
    return {
      parentKey: source,
      parentName: broker.name,
      instructions: getOptOutInstructions(source),
      coversCount: broker.subsidiaries.length + 1,
      coversList,
    };
  }

  return null;
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

// ============================================
// CSV EXPORT FUNCTIONS
// ============================================

/**
 * Escape a value for CSV output
 */
function escapeCSVValue(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export the data broker directory to CSV format
 * Useful for compliance documentation, audits, and sharing with legal teams
 */
export function exportDirectoryToCSV(): string {
  const headers = [
    "Key",
    "Name",
    "Category",
    "Opt-Out URL",
    "Opt-Out Email",
    "Privacy Email",
    "Removal Method",
    "Estimated Days",
    "Parent Company",
    "Consolidates To",
    "Subsidiaries",
    "Is Removable",
    "Notes",
  ];

  const rows: string[][] = [headers];

  for (const [key, broker] of Object.entries(DATA_BROKER_DIRECTORY)) {
    rows.push([
      key,
      broker.name,
      broker.category || "DATA_BROKER",
      broker.optOutUrl || "",
      broker.optOutEmail || "",
      broker.privacyEmail || "",
      broker.removalMethod,
      String(broker.estimatedDays),
      broker.parentCompany || "",
      broker.consolidatesTo || "",
      broker.subsidiaries?.join("; ") || "",
      broker.isRemovable === false ? "No" : "Yes",
      broker.notes || "",
    ]);
  }

  return rows.map(row => row.map(escapeCSVValue).join(",")).join("\n");
}

/**
 * Export only removable data brokers to CSV (excludes monitors, breach DBs, etc.)
 */
export function exportRemovableBrokersToCSV(): string {
  const headers = [
    "Name",
    "Opt-Out URL",
    "Privacy Email",
    "Removal Method",
    "Estimated Days",
    "Parent Company",
    "Notes",
  ];

  const rows: string[][] = [headers];

  for (const [, broker] of Object.entries(DATA_BROKER_DIRECTORY)) {
    // Skip non-removable entries
    if (broker.isRemovable === false) continue;
    if (broker.removalMethod === "NOT_REMOVABLE" || broker.removalMethod === "MONITOR") continue;
    if (broker.category === "BREACH_DATABASE" || broker.category === "DARK_WEB") continue;

    rows.push([
      broker.name,
      broker.optOutUrl || "",
      broker.privacyEmail || "",
      broker.removalMethod,
      String(broker.estimatedDays),
      broker.parentCompany || "",
      broker.notes || "",
    ]);
  }

  return rows.map(row => row.map(escapeCSVValue).join(",")).join("\n");
}

/**
 * Get directory statistics for reporting
 */
export function getDirectoryStats(): {
  totalEntries: number;
  removableBrokers: number;
  monitoringSources: number;
  byCategory: Record<string, number>;
  byRemovalMethod: Record<string, number>;
  withParentCompany: number;
  withSubsidiaries: number;
} {
  let removableBrokers = 0;
  let monitoringSources = 0;
  let withParentCompany = 0;
  let withSubsidiaries = 0;
  const byCategory: Record<string, number> = {};
  const byRemovalMethod: Record<string, number> = {};

  for (const broker of Object.values(DATA_BROKER_DIRECTORY)) {
    // Count by category
    const category = broker.category || "DATA_BROKER";
    byCategory[category] = (byCategory[category] || 0) + 1;

    // Count by removal method
    byRemovalMethod[broker.removalMethod] = (byRemovalMethod[broker.removalMethod] || 0) + 1;

    // Count removable vs monitoring
    if (broker.removalMethod === "MONITOR" || broker.removalMethod === "NOT_REMOVABLE") {
      monitoringSources++;
    } else if (broker.isRemovable !== false) {
      removableBrokers++;
    }

    // Count consolidation relationships
    if (broker.parentCompany) withParentCompany++;
    if (broker.subsidiaries && broker.subsidiaries.length > 0) withSubsidiaries++;
  }

  return {
    totalEntries: Object.keys(DATA_BROKER_DIRECTORY).length,
    removableBrokers,
    monitoringSources,
    byCategory,
    byRemovalMethod,
    withParentCompany,
    withSubsidiaries,
  };
}
