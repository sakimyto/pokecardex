import { Hono } from 'hono'
import { db } from '~/db/index.ts'
import { sets } from '~/db/schema.ts'
import { layout } from '~/views/layout.ts'

const pages = new Hono()

pages.get('/', (c) => {
  const body = layout(
    'Home',
    `
    <h2>JP Pokemon Card Intelligence</h2>
    <p>Track Japanese Pokemon TCG cards, prices, and news — translated to English.</p>
    <div style="margin-top:2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
      <div style="background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <h3>Card Database</h3>
        <p>Every JP set indexed with EN translations, images, and rarity info.</p>
        <a href="/sets" style="color:#4361ee;">Browse Sets &rarr;</a>
      </div>
      <div style="background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <h3>Price Tracker</h3>
        <p>Compare JP vs EN market prices. Spot arbitrage opportunities.</p>
        <a href="/arbitrage" style="color:#4361ee;">View Arbitrage &rarr;</a>
      </div>
      <div style="background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <h3>News Feed</h3>
        <p>Latest JP Pokemon TCG news, translated to English by AI.</p>
        <a href="/news" style="color:#4361ee;">Read News &rarr;</a>
      </div>
    </div>
    `,
  )
  return c.html(body)
})

pages.get('/sets', async (c) => {
  const allSets = await db.select().from(sets)
  const setList =
    allSets.length === 0
      ? '<p>No sets indexed yet. Data will appear once scraping begins.</p>'
      : allSets
          .map(
            (s) => `
      <div style="background:#fff;padding:1rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <h3>${escapeHtml(s.nameJa)}${s.nameEn ? ` / ${escapeHtml(s.nameEn)}` : ''}</h3>
        <p>Code: ${escapeHtml(s.codeJa)}${s.codeEn ? ` / ${escapeHtml(s.codeEn)}` : ''}</p>
        ${s.totalCards ? `<p>${s.totalCards} cards</p>` : ''}
        ${s.releaseDateJa ? `<p>JP Release: ${escapeHtml(s.releaseDateJa)}</p>` : ''}
      </div>
    `,
          )
          .join('')

  const body = layout(
    'Sets',
    `
    <h2>Card Sets</h2>
    <div style="margin-top:1.5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;">
      ${setList}
    </div>
    `,
  )
  return c.html(body)
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export { pages }
