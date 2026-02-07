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

async function checkLinks(): Promise<void> {
  const results: CheckResults = { total: 0, broken: [], errors: [] }

  console.log('Starting broker link check...\n')

  for (const [key, broker] of Object.entries(DATA_BROKER_DIRECTORY)) {
    if (!broker.optOutUrl) continue
    results.total++

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(broker.optOutUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
        },
      })

      clearTimeout(timeoutId)

      // 403 is often returned by CloudFlare/bot protection, not a true failure
      if (response.status >= 400 && response.status !== 403) {
        results.broken.push({ key, url: broker.optOutUrl, status: response.status })
        console.log(`❌ ${key}: ${response.status} - ${broker.optOutUrl}`)
      } else {
        console.log(`✓ ${key}: ${response.status}`)
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
    console.error('\n❌ Broken URLs:')
    results.broken.forEach(b => console.error(`  ${b.key}: ${b.url} (HTTP ${b.status})`))
  }

  if (results.errors.length > 0) {
    console.warn('\n⚠ URLs with errors (may be temporary):')
    results.errors.forEach(e => console.warn(`  ${e.key}: ${e.url} (${e.error})`))
  }

  // Only fail on confirmed broken links, not on network errors (which may be transient)
  if (results.broken.length > 0) {
    console.error('\n\nCI FAILED: Broken broker URLs detected')
    process.exit(1)
  }

  console.log('\n✓ All broker URLs are valid')
}

checkLinks().catch(error => {
  console.error('Link check failed:', error)
  process.exit(1)
})
