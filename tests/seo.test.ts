import { describe, expect, test } from 'bun:test'
import { app } from '~/app.ts'

describe('SEO routes', () => {
  test('GET /robots.txt returns valid robots', async () => {
    const res = await app.request('/robots.txt')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    expect(body).toContain('User-agent: *')
    expect(body).toContain('Allow: /')
    expect(body).toContain('Sitemap:')
    expect(body).toContain('sitemap.xml')
  })

  test('GET /sitemap.xml returns valid XML', async () => {
    const res = await app.request('/sitemap.xml')
    const body = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/xml')
    expect(body).toContain('<?xml version="1.0"')
    expect(body).toContain('<urlset')
    expect(body).toContain('sitemaps.org')
  })

  test('Sitemap includes static pages', async () => {
    const res = await app.request('/sitemap.xml')
    const body = await res.text()

    expect(body).toContain('/sets</loc>')
    expect(body).toContain('/search</loc>')
    expect(body).toContain('/prices</loc>')
    expect(body).toContain('/news</loc>')
  })

  test('Sitemap includes card URLs', async () => {
    const res = await app.request('/sitemap.xml')
    const body = await res.text()

    expect(body).toContain('/cards/')
    expect(body).toContain('/sets/sv')
  })

  test('Pages have canonical URLs', async () => {
    const res = await app.request('/sets')
    const body = await res.text()

    expect(body).toContain('rel="canonical"')
    expect(body).toContain('/sets')
  })

  test('Pages have JSON-LD structured data', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('application/ld+json')
    expect(body).toContain('schema.org')
    expect(body).toContain('WebSite')
  })

  test('Set detail page has BreadcrumbList JSON-LD', async () => {
    const res = await app.request('/sets/sv3pt5')
    const body = await res.text()

    expect(body).toContain('BreadcrumbList')
    expect(body).toContain('ListItem')
  })

  test('Card detail page has Product JSON-LD', async () => {
    const res = await app.request('/cards/sv7-010')
    const body = await res.text()

    expect(body).toContain('Product')
    expect(body).toContain('Trading Card')
  })

  test('Card detail page has OG image from card image', async () => {
    const res = await app.request('/cards/sv6pt5-1')
    const body = await res.text()

    expect(body).toContain('og:image')
    expect(body).toContain('twitter:image')
    expect(body).toContain('summary_large_image')
  })

  test('Pages have OG meta tags', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('og:title')
    expect(body).toContain('og:description')
    expect(body).toContain('og:type')
    expect(body).toContain('og:url')
  })

  test('Pages have Twitter card meta tags', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('twitter:card')
    expect(body).toContain('twitter:title')
  })

  test('HTML pages have cache headers', async () => {
    const res = await app.request('/')

    expect(res.headers.get('cache-control')).toContain('public')
    expect(res.headers.get('cache-control')).toContain('s-maxage')
  })
})
