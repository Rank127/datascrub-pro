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

/**
 * Capture a screenshot of a URL
 * Returns a URL to the screenshot image
 */
export async function captureScreenshot(
  targetUrl: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  try {
    // Validate URL
    if (!targetUrl || !isValidUrl(targetUrl)) {
      return {
        success: false,
        error: 'Invalid URL provided',
      };
    }

    // Skip screenshots for certain URL types
    if (shouldSkipScreenshot(targetUrl)) {
      return {
        success: false,
        error: 'URL type not suitable for screenshot',
      };
    }

    // Generate the screenshot URL
    const screenshotUrl = generateScreenshotUrl(targetUrl, options);

    // Verify the screenshot service is reachable (optional health check)
    // For thum.io, the URL itself is the screenshot - no verification needed

    return {
      success: true,
      screenshotUrl,
      capturedAt: new Date(),
    };
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Capture screenshot and convert to base64
 * Useful for storing directly in database
 */
export async function captureScreenshotAsBase64(
  targetUrl: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  try {
    const screenshotUrl = generateScreenshotUrl(targetUrl, options);

    // Fetch the screenshot image
    const response = await fetch(screenshotUrl, {
      headers: {
        'User-Agent': 'GhostMyData/1.0 (Screenshot Service)',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch screenshot: ${response.status}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return {
      success: true,
      screenshotUrl: dataUrl,
      capturedAt: new Date(),
    };
  } catch (error) {
    console.error('Screenshot base64 capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if URL should be skipped for screenshots
 * Some URLs can't or shouldn't be screenshotted
 */
function shouldSkipScreenshot(url: string): boolean {
  const skipPatterns = [
    /^mailto:/i,
    /^tel:/i,
    /^javascript:/i,
    /haveibeenpwned\.com/i, // API-based, not visual
    /api\./i, // API endpoints
    /\.json$/i, // JSON responses
    /\.xml$/i, // XML responses
  ];

  return skipPatterns.some(pattern => pattern.test(url));
}

/**
 * Capture proof of exposure for a data broker URL
 * Specifically optimized for data broker result pages
 */
export async function captureExposureProof(
  sourceUrl: string,
  sourceName: string
): Promise<ScreenshotResult> {
  // Some data brokers need longer delays for page load
  const delayMap: Record<string, number> = {
    'Spokeo': 3,
    'WhitePages': 3,
    'BeenVerified': 4,
    'Radaris': 3,
    'TruePeopleSearch': 2,
    'FastPeopleSearch': 2,
    'Intelius': 4,
    'PeopleFinders': 3,
  };

  const delay = delayMap[sourceName] || 2;

  return captureScreenshot(sourceUrl, {
    width: 1280,
    height: 900,
    delay,
  });
}

/**
 * Capture verification proof showing data is no longer present
 */
export async function captureVerificationProof(
  sourceUrl: string,
  sourceName: string
): Promise<ScreenshotResult> {
  // Use same settings as exposure proof
  return captureExposureProof(sourceUrl, sourceName);
}

/**
 * Get a placeholder/fallback screenshot URL for unsupported sources
 */
export function getPlaceholderScreenshot(reason: string): string {
  // Return a data URL with a simple placeholder indicating why screenshot isn't available
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#1e293b" width="400" height="300"/>
      <text fill="#64748b" font-family="system-ui" font-size="14" text-anchor="middle" x="200" y="140">
        Screenshot not available
      </text>
      <text fill="#475569" font-family="system-ui" font-size="12" text-anchor="middle" x="200" y="165">
        ${reason}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
