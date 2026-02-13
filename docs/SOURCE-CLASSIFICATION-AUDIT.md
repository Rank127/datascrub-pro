# Source Classification Audit Report

**Date**: February 13, 2026
**Triggered by**: ZipRecruiter Cease & Desist (February 6, 2026)
**Scope**: All 2,100+ sources in `data-broker-directory.ts`
**Status**: COMPLETE

---

## Audit Methodology

### Statutory Definition
Per **CA Civil Code § 1798.99.80(d)**, a "data broker" is:

> A business that knowingly collects and sells to third parties the personal information
> of a consumer with whom the business does **NOT have a direct relationship**.

### "Direct Relationship" Test
A company has a direct relationship with consumers when:
1. Users create accounts and provide data voluntarily
2. Users engage the company for services (e.g., hiring a real estate agent)
3. Users submit personal content (DNA samples, family trees, medical appointments)
4. The platform's primary function is user-to-user or user-to-provider interaction

Companies that pass this test are **NOT statutory data brokers** and must not receive automated removal requests.

---

## Classification Summary

| Classification | Count | Legal Status | Action |
|---------------|-------|-------------|--------|
| `STATUTORY_DATA_BROKER` | ~2,060 | Confirmed data broker | Send removals |
| `SERVICE_PROVIDER` | 15 | Direct relationship | **BLOCKED** - no removals |
| `SOCIAL_PLATFORM` | 10 | Direct relationship | **BLOCKED** - no removals |
| `MONITORING_ONLY` | ~30 | Breach/dark web/AI | Monitor only |
| `GRAY_AREA` | 11 | Needs legal review | Removals paused pending review |
| Blocklisted (total) | 34 | Various exclusions | **BLOCKED** at email layer |

---

## Sources Reclassified as SERVICE_PROVIDER (15)

These companies have clear direct user relationships and are NOT data brokers:

### Real Estate Brokerages & iBuyers
| Key | Company | Reason |
|-----|---------|--------|
| `REMAX` | RE/MAX | Real estate franchise - clients hire agents directly |
| `CENTURY21` | Century 21 | Real estate franchise - clients hire agents directly |
| `COLDWELLBANKER` | Coldwell Banker | Real estate franchise - clients hire agents directly |
| `KELLER_WILLIAMS` | Keller Williams | Real estate franchise - clients hire agents directly |
| `COMPASS_RE` | Compass | Real estate brokerage - clients hire agents directly |
| `HOMELIGHT` | HomeLight | Agent matching - users request recommendations |
| `OPENDOOR` | Opendoor | iBuyer - sellers sell homes directly to platform |
| `OFFERPAD` | Offerpad | iBuyer - sellers sell homes directly to platform |
| `SUNDAE` | Sundae | iBuyer - sellers sell homes directly to platform |
| `ESTATELY` | Estately | Real estate platform - users search/create accounts |
| `XOME` | Xome | Real estate auction platform - users create accounts |

### Genealogy Platforms
| Key | Company | Reason |
|-----|---------|--------|
| `ANCESTRY` | Ancestry | Users create accounts, upload family trees, submit DNA |
| `MYHERITAGE` | MyHeritage | Users create accounts, upload family trees, submit DNA |

### Healthcare Platforms
| Key | Company | Reason |
|-----|---------|--------|
| `ZOCDOC` | Zocdoc | Patients and doctors create accounts directly |
| `DOXIMITY` | Doximity | Physician networking - doctors create own profiles |

---

## Sources Flagged as GRAY_AREA (11)

These sources have characteristics of both data brokers and direct-relationship platforms. Legal review recommended before sending removal requests.

### Property Data Aggregators
| Key | Company | Issue |
|-----|---------|-------|
| `ZILLOW` | Zillow | Aggregates public county records about non-users, BUT also has user accounts |
| `REDFIN` | Redfin | Aggregates public county records about non-users, BUT also has user accounts |
| `REALTOR_COM` | Realtor.com | Aggregates public county records about non-users, BUT also has user accounts |
| `TRULIA` | Trulia | Aggregates public county records about non-users, BUT also has user accounts |
| `HOMES_COM` | Homes.com | Aggregates public county records about non-users, BUT also has user accounts |
| `HOMESNAP` | Homesnap | Aggregates public county records about non-users, BUT also has user accounts |
| `MOVOTO` | Movoto | Aggregates public county records about non-users, BUT also has user accounts |

### Healthcare Directories
| Key | Company | Issue |
|-----|---------|-------|
| `HEALTHGRADES` | Healthgrades | Aggregates doctor data from public license records, BUT doctors can claim profiles |
| `VITALS` | Vitals | Aggregates doctor data from public license records, BUT doctors can claim profiles |

### Review Platforms
| Key | Company | Issue |
|-----|---------|-------|
| `YELP_DATA` | Yelp Data | User-generated reviews, BUT also aggregates business data about non-users |
| `TRIPADVISOR_DATA` | TripAdvisor Data | User-generated reviews, BUT also aggregates business data about non-users |

**Recommendation**: Engage outside counsel to determine classification for gray area sources. Until resolved, these sources remain in the directory but are flagged for manual review.

---

## Existing Blocklist (22 entries before audit)

Already blocklisted prior to this audit:
- **Job platforms (6)**: ZipRecruiter, Indeed, LinkedIn, TheLadders, Glassdoor, AngelList/Wellfound
- **ATS platforms (5)**: Greenhouse, Lever, SmartRecruiters, Jobvite, Workday
- **Service platforms (7)**: Muck Rack, RateMyProfessors, Apartments.com, Zumper, TheKnot, WeddingWire, Zola
- **Data processors (4)**: Syndigo, PowerReviews, 1WorldSync, Bazaarvoice, Yotpo

---

## New Blocklist Additions (12 entries)

Added as part of this audit:
- **Real estate (8)**: RE/MAX, Century 21, Coldwell Banker, Keller Williams, Compass, Opendoor, Offerpad, HomeLight
- **Genealogy (2)**: Ancestry, MyHeritage
- **Healthcare (2)**: Zocdoc, Doximity

**Total blocklist entries after audit: 34**

---

## Code Changes

### Critical Security Fix: `isKnownDataBroker()`
Previously returned `true` for social media and service provider entries. Now correctly returns `false` for:
- All 10 `SOCIAL_MEDIA` entries (LinkedIn, Facebook, Twitter, etc.)
- All 15 `SERVICE_PROVIDER` entries (RE/MAX, Ancestry, Zocdoc, etc.)

### New Type: `SourceCategory`
Added `SERVICE_PROVIDER` to the union type.

### New Category Lists in `BROKER_CATEGORIES`
- `SERVICE_PROVIDER_SOURCES`: 15 clear-cut service providers
- `GRAY_AREA_SOURCES`: 11 sources requiring legal review

### New Function: `getLegalClassification()`
Returns one of: `STATUTORY_DATA_BROKER`, `SERVICE_PROVIDER`, `SOCIAL_PLATFORM`, `MONITORING_ONLY`, `GRAY_AREA`, `UNKNOWN`

### Updated Functions
- `getNotBrokerReason()`: Returns explanatory text for service provider/social media exclusions
- `getDataBrokersOnly()`: Now excludes `SERVICE_PROVIDER_SOURCES`

---

## Competitive Intelligence

Optery (competitor) still lists ZipRecruiter as a data broker in their directory as of February 2026. This represents a legal liability they have not addressed.

---

## Next Steps

1. **Gray area legal review**: Engage outside counsel to classify the 11 gray area sources
2. **Quarterly re-audit**: Schedule quarterly review of all source classifications
3. **Pre-send validation**: The `isKnownDataBroker()` gate now prevents removals to non-brokers
4. **Monitor competitor actions**: Track whether Optery and others correct their directories
5. **Document classification decisions**: Maintain this audit trail for compliance purposes
