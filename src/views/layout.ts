interface SeoMeta {
  title: string
  description?: string
  path?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export const BASE_URL = process.env.BASE_URL ?? 'https://pokecardex.com'

export function layout(title: string, content: string, seo?: SeoMeta): string {
  const pageTitle = `${escapeHtml(title)} | PokeCardex`
  const description =
    seo?.description ??
    'Japanese Pokemon TCG card database with EN translations, price tracking, and news.'
  const canonicalUrl = seo?.path ? `${BASE_URL}${seo.path}` : BASE_URL
  const jsonLdItems = seo?.jsonLd ? (Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]) : []
  const jsonLdScript = jsonLdItems
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('\n  ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="PokeCardex">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  ${jsonLdScript}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a2e; background: #f8f9fa; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    header { background: #1a1a2e; color: #fff; padding: 1rem 0; }
    header h1 { font-size: 1.5rem; }
    header h1 a { color: #fff; text-decoration: none; }
    header nav a { color: #e0e0e0; text-decoration: none; margin-left: 1.5rem; }
    header nav a:hover { color: #fff; }
    main { padding: 2rem 0; }
    a { color: #4361ee; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .card-grid { margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card-item { background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: box-shadow 0.2s; }
    .card-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .card-item h4 { font-size: 0.95rem; margin-bottom: 0.25rem; }
    .card-item .meta { font-size: 0.8rem; color: #666; }
    .rarity { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .rarity-C { background: #e2e8f0; color: #475569; }
    .rarity-U { background: #dbeafe; color: #1e40af; }
    .rarity-R { background: #fef3c7; color: #92400e; }
    .rarity-RR { background: #fde68a; color: #78350f; }
    .rarity-SR { background: #fed7aa; color: #9a3412; }
    .rarity-SAR { background: #fecaca; color: #991b1b; }
    .rarity-UR { background: #e9d5ff; color: #6b21a8; }
    .rarity-AR { background: #ccfbf1; color: #065f46; }
    .set-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .set-card h3 { margin-bottom: 0.5rem; }
    .search-form { margin: 1.5rem 0; display: flex; gap: 0.5rem; }
    .search-form input { flex: 1; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
    .search-form button { padding: 0.5rem 1.5rem; background: #4361ee; color: #fff; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; }
    .search-form button:hover { background: #3b50d6; }
    .breadcrumb { margin-bottom: 1rem; font-size: 0.9rem; color: #666; }
    .breadcrumb a { color: #4361ee; }
    .detail-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .detail-table th, .detail-table td { padding: 0.5rem 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .detail-table th { width: 140px; color: #666; font-weight: 500; }
    .type-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; color: #fff; }
    .type-grass { background: #4caf50; } .type-fire { background: #f44336; }
    .type-water { background: #2196f3; } .type-lightning { background: #ffc107; color: #333; }
    .type-psychic { background: #9c27b0; } .type-fighting { background: #795548; }
    .type-darkness { background: #424242; } .type-metal { background: #78909c; }
    .type-colorless { background: #bdbdbd; color: #333; }
    .type-trainer { background: #e91e63; } .type-energy { background: #ff9800; }
  </style>
</head>
<body>
  <header>
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
      <h1><a href="/">PokeCardex</a></h1>
      <nav>
        <a href="/">Home</a>
        <a href="/sets">Sets</a>
        <a href="/search">Search</a>
        <a href="/prices">Prices</a>
        <a href="/news">News</a>
      </nav>
    </div>
  </header>
  <main>
    <div class="container">
      ${content}
    </div>
  </main>
</body>
</html>`
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function typeBadge(typeEn: string | null): string {
  if (!typeEn) return ''
  const cls = typeEn.toLowerCase().replace(/\s/g, '-')
  return `<span class="type-badge type-${cls}">${escapeHtml(typeEn)}</span>`
}

export function rarityBadge(rarity: string | null): string {
  if (!rarity) return ''
  return `<span class="rarity rarity-${escapeHtml(rarity)}">${escapeHtml(rarity)}</span>`
}
