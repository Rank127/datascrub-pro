/**
 * ClusterBrokerScanner — Base class for cluster-based broker scanning.
 *
 * Many data brokers are white-label instances of the same backend platform.
 * Instead of writing N parsers for N sites, we write 1 parser per cluster
 * and instantiate it with different BrokerConfigs.
 *
 * Usage:
 *   const scanner = new ClusterBrokerScanner(brokerConfig, buildUrl, parseHtml);
 */

import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export type UrlBuilder = (input: ScanInput, config: BrokerConfig) => string | null;
export type HtmlParser = (html: string, input: ScanInput) => BrokerSearchResult;

export class ClusterBrokerScanner extends BaseBrokerScanner {
  config: BrokerConfig;
  private urlBuilder: UrlBuilder;
  private htmlParser: HtmlParser;

  constructor(config: BrokerConfig, urlBuilder: UrlBuilder, htmlParser: HtmlParser) {
    super();
    this.config = config;
    this.urlBuilder = urlBuilder;
    this.htmlParser = htmlParser;
  }

  protected buildSearchUrl(input: ScanInput): string | null {
    return this.urlBuilder(input, this.config);
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    return this.htmlParser(html, input);
  }
}
