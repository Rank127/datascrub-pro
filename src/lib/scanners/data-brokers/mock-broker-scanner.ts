import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import { DataSource, DataSourceNames } from "@/lib/types";

const DATA_BROKERS: DataSource[] = [
  "SPOKEO",
  "WHITEPAGES",
  "BEENVERIFIED",
  "INTELIUS",
  "PEOPLEFINDER",
  "TRUEPEOPLESEARCH",
  "RADARIS",
  "FASTPEOPLESEARCH",
];

export class MockDataBrokerScanner extends BaseScanner {
  name = "Mock Data Broker Scanner";
  source: DataSource = "OTHER";

  private broker: DataSource;

  constructor(broker: DataSource) {
    super();
    this.broker = broker;
    this.source = broker;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    // Simulate network delay
    await this.delay(Math.random() * 1000 + 500);

    // Randomly determine if this broker has data (70% chance)
    if (Math.random() > 0.3) {
      // Generate mock exposure based on input
      if (input.fullName && input.addresses?.length) {
        const address = input.addresses[0];
        results.push({
          source: this.broker,
          sourceName: DataSourceNames[this.broker],
          sourceUrl: this.getSourceUrl(input.fullName),
          dataType: "COMBINED_PROFILE",
          dataPreview: this.maskData(
            `${input.fullName} - ${address.street}, ${address.city}`,
            "ADDRESS"
          ),
          severity: "HIGH",
          rawData: {
            name: input.fullName,
            address: address,
            foundVia: "name_search",
          },
        });
      }

      // Check for phone exposure (50% chance)
      if (input.phones?.length && Math.random() > 0.5) {
        const phone = input.phones[0];
        results.push({
          source: this.broker,
          sourceName: DataSourceNames[this.broker],
          sourceUrl: this.getSourceUrl(phone),
          dataType: "PHONE",
          dataPreview: this.maskData(phone, "PHONE"),
          severity: "MEDIUM",
          rawData: {
            phone: phone,
            foundVia: "phone_search",
          },
        });
      }

      // Check for email exposure (40% chance)
      if (input.emails?.length && Math.random() > 0.6) {
        const email = input.emails[0];
        results.push({
          source: this.broker,
          sourceName: DataSourceNames[this.broker],
          sourceUrl: this.getSourceUrl(email),
          dataType: "EMAIL",
          dataPreview: this.maskData(email, "EMAIL"),
          severity: "MEDIUM",
          rawData: {
            email: email,
            foundVia: "email_search",
          },
        });
      }
    }

    return results;
  }

  private getSourceUrl(identifier: string): string {
    const baseUrls: Record<string, string> = {
      SPOKEO: "https://www.spokeo.com/search?q=",
      WHITEPAGES: "https://www.whitepages.com/name/",
      BEENVERIFIED: "https://www.beenverified.com/",
      INTELIUS: "https://www.intelius.com/",
      PEOPLEFINDER: "https://www.peoplefinder.com/",
      TRUEPEOPLESEARCH: "https://www.truepeoplesearch.com/",
      RADARIS: "https://radaris.com/",
      FASTPEOPLESEARCH: "https://www.fastpeoplesearch.com/",
    };

    const baseUrl = baseUrls[this.broker] || "https://example.com/";
    return baseUrl + encodeURIComponent(identifier);
  }

  static createAll(): MockDataBrokerScanner[] {
    return DATA_BROKERS.map((broker) => new MockDataBrokerScanner(broker));
  }
}
