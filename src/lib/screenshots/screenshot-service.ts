/**
 * Screenshot Capture Service
 *
 * Captures screenshots of web pages as proof of data exposure
 * before and after removal requests.
 *
 * Uses thum.io free API for screenshot generation.
 * Falls back gracefully if screenshot cannot be captured.
 */

export interface ScreenshotResult {
  success: boolean;
  screenshotUrl?: string;
  capturedAt?: Date;
  error?: string;
}

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  delay?: number; // Seconds to wait before capture
}

const DEFAULT_OPTIONS: ScreenshotOptions = {
  width: 1280,
  height: 800,
  fullPage: false,
  delay: 2,
};

/**
 * Generate a screenshot URL using thum.io free service
 * This returns a URL that will render the screenshot when accessed
 */
export function generateScreenshotUrl(
  targetUrl: string,
  options: ScreenshotOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // thum.io URL format: https://image.thum.io/get/[options]/[url]
  // Options: width/[w], height/[h], wait/[seconds], png, jpg, webp
  const params: string[] = [];

  if (opts.width) {
    params.push(`width/${opts.width}`);
  }

  if (opts.delay) {
    params.push(`wait/${opts.delay}`);
  }

  // Use PNG for quality
  params.push('png');

  const optionsPath = params.length > 0 ? params.join('/') + '/' : '';

  return `https://image.thum.io/get/${optionsPath}${encodeURIComponent(targetUrl)}`;
}
