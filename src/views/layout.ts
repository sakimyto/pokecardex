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
  <meta name="color-scheme" content="light dark">
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
    :root {
      --color-bg: #f8f9fa;
      --color-surface: #fff;
      --color-text: #1a1a2e;
      --color-text-muted: #666;
      --color-accent: #4361ee;
      --color-accent-hover: #3b50d6;
      --color-header-bg: #1a1a2e;
      --color-header-text: #fff;
      --color-header-link: #e0e0e0;
      --color-border: #e5e7eb;
      --color-input-border: #d1d5db;
      --color-card-img-bg: #f1f5f9;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.18);
      --shadow-card-detail: 0 2px 8px rgba(0,0,0,0.15);
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --space-xs: 0.25rem;
      --space-sm: 0.5rem;
      --space-md: 1rem;
      --space-lg: 1.5rem;
      --space-xl: 2rem;
      --font-sm: 0.75rem;
      --font-base: 1rem;
      --font-lg: 1.5rem;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg: #0f111a;
        --color-surface: #1a1d2e;
        --color-text: #e2e8f0;
        --color-text-muted: #94a3b8;
        --color-accent: #818cf8;
        --color-accent-hover: #6366f1;
        --color-header-bg: #0b0d14;
        --color-header-text: #f1f5f9;
        --color-header-link: #cbd5e1;
        --color-border: #334155;
        --color-input-border: #475569;
        --color-card-img-bg: #1e293b;
        --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
        --shadow-card-detail: 0 2px 8px rgba(0,0,0,0.3);
      }
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: var(--color-text); background: var(--color-bg); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-md); }
    .skip-link { position: absolute; top: -100%; left: var(--space-md); padding: var(--space-sm) var(--space-md); background: var(--color-accent); color: #fff; border-radius: var(--radius-md); z-index: 100; font-weight: 600; }
    .skip-link:focus { top: var(--space-sm); }
    header { background: var(--color-header-bg); color: var(--color-header-text); padding: var(--space-md) 0; }
    header h1 { font-size: var(--font-lg); }
    header h1 a { color: var(--color-header-text); text-decoration: none; }
    header nav a { color: var(--color-header-link); text-decoration: none; margin-left: var(--space-lg); }
    header nav a:hover, header nav a:focus-visible { color: var(--color-header-text); }
    main { padding: var(--space-xl) 0; }
    a { color: var(--color-accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
    .card-grid { margin-top: var(--space-lg); display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-md); }
    .card-item { background: var(--color-surface); padding: 0.75rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s; }
    .card-item:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .card-item h4 { font-size: 0.9rem; margin-bottom: var(--space-xs); }
    .card-item .meta { font-size: var(--font-sm); color: var(--color-text-muted); }
    .card-img { width: 100%; aspect-ratio: 63/88; object-fit: contain; border-radius: var(--radius-md); background: var(--color-card-img-bg); margin-bottom: var(--space-sm); }
    .card-detail-img { max-width: 300px; width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-card-detail); }
    .set-logo { width: 120px; height: auto; margin-bottom: var(--space-sm); }
    @media (max-width: 768px) {
      .card-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; }
      header .container { flex-direction: column; gap: var(--space-sm); }
      header nav a { margin-left: 0; margin-right: var(--space-md); }
      .detail-layout { grid-template-columns: 1fr !important; }
      .price-grid { grid-template-columns: 1fr !important; }
    }
    .rarity { display: inline-block; padding: 0.1rem 0.4rem; border-radius: var(--radius-sm); font-size: var(--font-sm); font-weight: 600; }
    .rarity-C { background: #e2e8f0; color: #475569; }
    .rarity-U { background: #dbeafe; color: #1e40af; }
    .rarity-R { background: #fef3c7; color: #92400e; }
    .rarity-RR { background: #fde68a; color: #78350f; }
    .rarity-SR { background: #fed7aa; color: #9a3412; }
    .rarity-SAR { background: #fecaca; color: #991b1b; }
    .rarity-UR { background: #e9d5ff; color: #6b21a8; }
    .rarity-AR { background: #ccfbf1; color: #065f46; }
    .set-card { background: var(--color-surface); padding: var(--space-lg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
    .set-card h3 { margin-bottom: var(--space-sm); }
    .search-form { margin: var(--space-lg) 0; display: flex; gap: var(--space-sm); }
    .search-form input { flex: 1; padding: var(--space-sm) var(--space-md); border: 1px solid var(--color-input-border); border-radius: var(--radius-md); font-size: var(--font-base); background: var(--color-surface); color: var(--color-text); }
    .search-form button { padding: var(--space-sm) var(--space-lg); background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--font-base); cursor: pointer; }
    .search-form button:hover { background: var(--color-accent-hover); }
    .breadcrumb { margin-bottom: var(--space-md); font-size: 0.9rem; color: var(--color-text-muted); }
    .breadcrumb a { color: var(--color-accent); }
    .detail-table { width: 100%; border-collapse: collapse; margin-top: var(--space-md); }
    .detail-table th, .detail-table td { padding: var(--space-sm) var(--space-md); text-align: left; border-bottom: 1px solid var(--color-border); }
    .detail-table th { width: 140px; color: var(--color-text-muted); font-weight: 500; }
    .type-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 500; color: #fff; }
    .type-grass { background: #4caf50; } .type-fire { background: #f44336; }
    .type-water { background: #2196f3; } .type-lightning { background: #ffc107; color: #333; }
    .type-psychic { background: #9c27b0; } .type-fighting { background: #795548; }
    .type-darkness { background: #424242; } .type-metal { background: #78909c; }
    .type-colorless { background: #bdbdbd; color: #333; }
    .type-trainer { background: #e91e63; } .type-energy { background: #ff9800; }
    footer { background: var(--color-header-bg); color: var(--color-header-link); padding: var(--space-lg) 0; margin-top: var(--space-xl); font-size: var(--font-sm); }
    footer a { color: var(--color-header-link); }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header role="banner">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
      <h1><a href="/">PokeCardex</a></h1>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/sets">Sets</a>
        <a href="/search">Search</a>
        <a href="/prices">Prices</a>
        <a href="/news">News</a>
      </nav>
    </div>
  </header>
  <main id="main-content" role="main">
    <div class="container">
      ${content}
    </div>
  </main>
  <footer role="contentinfo">
    <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-sm);">
      <p>PokeCardex &mdash; JP Pokemon Card Intelligence / \u65e5\u672c\u8a9e\u30dd\u30b1\u30e2\u30f3\u30ab\u30fc\u30c9\u30c7\u30fc\u30bf\u30d9\u30fc\u30b9</p>
      <p>Data sourced from public JP & EN marketplaces</p>
    </div>
  </footer>
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
