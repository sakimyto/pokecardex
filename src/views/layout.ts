export function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | PokeCardex</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a2e; background: #f8f9fa; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    header { background: #1a1a2e; color: #fff; padding: 1rem 0; }
    header h1 { font-size: 1.5rem; }
    header nav a { color: #e0e0e0; text-decoration: none; margin-left: 1.5rem; }
    header nav a:hover { color: #fff; }
    main { padding: 2rem 0; }
  </style>
</head>
<body>
  <header>
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
      <h1>PokeCardex</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/sets">Sets</a>
        <a href="/news">News</a>
        <a href="/arbitrage">Arbitrage</a>
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
