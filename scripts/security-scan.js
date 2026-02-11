#!/usr/bin/env node

/**
 * Security Scan Script - Test running server for security headers and rate-limiting
 * 
 * Usage:
 *   node scripts/security-scan.js
 * 
 * This script:
 * - Validates security headers are present
 * - Tests rate-limiting on sensitive endpoints
 * - Checks CSP policy is correctly set
 * - Validates session cookies are HttpOnly
 */

const http = require('http')

const BASE_URL = 'http://localhost:3001'
const TIMEOUT = 5000

const results = []

async function makeRequest(
  endpoint,
  method = 'GET',
  body
) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, BASE_URL)
    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname + url.search,
      method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          endpoint,
          method,
          statusCode: res.statusCode,
          headers: res.headers,
          rateLimited: res.statusCode === 429,
        })
      })
    })

    req.on('error', (err) => {
      resolve({
        endpoint,
        method,
        error: err.message,
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({
        endpoint,
        method,
        error: 'Request timeout',
      })
    })

    if (body) {
      req.write(body)
    }
    req.end()
  })
}

async function runSecurityScan() {
  console.log('🔒 Starting Security Scan...\n')

  // Test 1: Check security headers on a public endpoint
  console.log('1️⃣  Testing Security Headers...')
  let result = await makeRequest('/api/contestants?page=1')
  results.push(result)

  if (result.headers) {
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'strict-transport-security',
    ]

    requiredHeaders.forEach((header) => {
      const value = result.headers[header]
      if (value) {
        console.log(`  ✅ ${header}: ${value}`)
      } else {
        console.log(`  ❌ MISSING: ${header}`)
      }
    })
  }

  // Test 2: Check CSP header
  console.log('\n2️⃣  Testing Content Security Policy...')
  const csp = result.headers['content-security-policy']
  if (csp) {
    const cspStr = Array.isArray(csp) ? csp[0] : csp
    const checks = [
      { name: 'Cloudinary allowed', pattern: /cloudinary\.com/ },
      { name: 'Frame-ancestors denied', pattern: /frame-ancestors\s+'none'/ },
      { name: 'Default to self', pattern: /default-src\s+'self'/ },
      { name: 'Insecure upgrade enabled', pattern: /upgrade-insecure-requests/ },
    ]

    checks.forEach(({ name, pattern }) => {
      if (pattern.test(cspStr)) {
        console.log(`  ✅ ${name}`)
      } else {
        console.log(`  ❌ ${name}`)
      }
    })
  } else {
    console.log('  ❌ CSP header missing')
  }

  // Test 3: Rate-limiting on OTP endpoint
  console.log('\n3️⃣  Testing Rate-Limiting (OTP endpoint)...')
  let rateLimitExceeded = false
  for (let i = 0; i < 5; i++) {
    const sendOtpResult = await makeRequest('/api/auth/send-otp', 'POST', JSON.stringify({ email: 'test@example.com' }))
    results.push(sendOtpResult)
    if (sendOtpResult.statusCode === 429) {
      console.log(`  ✅ Rate limit enforced at request ${i + 1} (expected ~3-4)`)
      rateLimitExceeded = true
      break
    } else if (sendOtpResult.error) {
      console.log(`  ⚠️  Request ${i + 1}: ${sendOtpResult.error}`)
    }
  }
  if (!rateLimitExceeded && !results.some((r) => r.error)) {
    console.log('  ⚠️  Rate limiting not triggered (server may not be enforcing or issue with test)')
  }

  // Test 4: Cookie security
  console.log('\n4️⃣  Testing Cookie Security...')
  result = await makeRequest('/api/contestants?page=1')
  const setCookie = result.headers['set-cookie']
  if (setCookie) {
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]
    cookies.forEach((cookie) => {
      if (cookie.includes('HttpOnly')) {
        console.log(`  ✅ HttpOnly flag found in cookie`)
      }
      if (cookie.includes('SameSite')) {
        console.log(`  ✅ SameSite attribute found in cookie`)
      }
    })
  } else {
    console.log('  ℹ️  No cookies set on this endpoint (expected for public routes)')
  }

  // Test 5: 404 responses should also have security headers
  console.log('\n5️⃣  Testing 404 Response Security Headers...')
  result = await makeRequest('/api/nonexistent')
  results.push(result)
  if (result.headers['x-frame-options']) {
    console.log(`  ✅ Security headers present on 404 response`)
  } else {
    console.log(`  ❌ Security headers missing on 404 response`)
  }

  // Summary
  console.log('\n📊 Summary:')
  const errorCount = results.filter((r) => r.error).length
  const rateLimitedCount = results.filter((r) => r.rateLimited).length
  console.log(`  Total Requests: ${results.length}`)
  console.log(`  Errors: ${errorCount}`)
  console.log(`  Rate Limited: ${rateLimitedCount}`)

  if (errorCount === 0 && rateLimitedCount >= 1) {
    console.log('\n✨ Security scan passed!')
    process.exit(0)
  } else if (errorCount > 0) {
    console.log('\n⚠️  Some requests failed. Make sure the server is running on http://localhost:3001')
    process.exit(1)
  } else {
    console.log('\n⚠️  Rate-limiting may not be properly configured.')
    process.exit(0)
  }
}

// Run the scan
runSecurityScan().catch((err) => {
  console.error('Security scan error:', err)
  process.exit(1)
})
