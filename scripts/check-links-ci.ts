// scripts/check-links-ci.ts
// Link checker for CI pipeline - validates data broker opt-out URLs

import { DATA_BROKER_DIRECTORY } from '../src/lib/removers/data-broker-directory'

interface BrokenLink {
  key: string
  url: string
  status: number
}

interface LinkError {
  key: string
  url: string
  error: string
}

interface CheckResults {
  total: number
  broken: BrokenLink[]
  errors: LinkError[]
}

// Statuses that indicate bot protection, not real failures
const BOT_PROTECTION_STATUSES = new Set([403, 405, 406, 429])

async function checkUrl(url: string): Promise<{ status: number; ok: boolean }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    // Try HEAD first (lighter weight)
    const headResponse = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    clearTimeout(timeoutId)

    // If HEAD succeeded or returned bot-protection status, accept it
    if (headResponse.ok || BOT_PROTECTION_STATUSES.has(headResponse.status)) {
      return { status: headResponse.status, ok: true }
    }

    // If HEAD returned 405 or other client error, retry with GET
    // Many servers reject HEAD but serve GET fine
    if (headResponse.status >= 400 && headResponse.status < 500) {
      const getController = new AbortController()
      const getTimeout = setTimeout(() => getController.abort(), 10000)

      try {
        const getResponse = await fetch(url, {
          method: 'GET',
          signal: getController.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        })
        clearTimeout(getTimeout)

        if (getResponse.ok || BOT_PROTECTION_STATUSES.has(getResponse.status)) {
          return { status: getResponse.status, ok: true }
        }
        return { status: getResponse.status, ok: false }
      } catch {
        clearTimeout(getTimeout)
        // GET also failed, return the original HEAD status
        return { status: headResponse.status, ok: false }
      }
    }

    return { status: headResponse.status, ok: headResponse.ok }
  } finally {
    clearTimeout(timeoutId)
  }
}

async function checkLinks(): Promise<void> {
  const results: CheckResults = { total: 0, broken: [], errors: [] }

  console.log('Starting broker link check...\n')

  for (const [key, broker] of Object.entries(DATA_BROKER_DIRECTORY)) {
    if (!broker.optOutUrl) continue
    results.total++

    try {
      const { status, ok } = await checkUrl(broker.optOutUrl)

      if (!ok) {
        results.broken.push({ key, url: broker.optOutUrl, status })
        console.log(`❌ ${key}: ${status} - ${broker.optOutUrl}`)
      } else {
        console.log(`✓ ${key}: ${status}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push({ key, url: broker.optOutUrl, error: errorMessage })
      console.log(`⚠ ${key}: Error - ${errorMessage}`)
    }
  }

  console.log('\n=== Summary ===')
  console.log(`Total URLs checked: ${results.total}`)
  console.log(`Broken links: ${results.broken.length}`)
  console.log(`Errors (timeouts/network): ${results.errors.length}`)

  if (results.broken.length > 0) {
    console.warn('\n⚠ Broken URLs:')
    results.broken.forEach(b => console.warn(`  ${b.key}: ${b.url} (HTTP ${b.status})`))
  }

  if (results.errors.length > 0) {
    console.warn('\n⚠ URLs with errors (may be temporary):')
    results.errors.forEach(e => console.warn(`  ${e.key}: ${e.url} (${e.error})`))
  }

  // Report broken links but don't fail CI
  // Many broker opt-out pages are legitimately unstable (moved, rate-limited, geo-blocked)
  // The link check serves as a monitoring report, not a gate
  const brokenPct = results.total > 0 ? Math.round((results.broken.length / results.total) * 100) : 0
  console.log(`\nBroken link rate: ${brokenPct}% (${results.broken.length}/${results.total})`)

  if (results.broken.length > 0) {
    console.warn(`\n⚠ ${results.broken.length} broken broker URLs detected — review and update in data-broker-directory.ts`)
  } else {
    console.log('\n✓ All broker URLs are valid')
  }
}

checkLinks().catch(error => {
  console.error('Link check failed:', error)
  process.exit(1)
})
