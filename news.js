// Renders news cards from news.json (append-only integration)
const container = document.getElementById('news-cards');
if (container) {
  loadNews().catch(err => {
    console.error(err);
    container.innerHTML = `<p>Unable to load news right now.</p>`;
  });
}

async function loadNews() {
  const res = await fetch(`./news.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load news.json (${res.status})`);
  const items = await res.json();

  // Sort newest first if dates exist
  items.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  container.innerHTML = items.map(toCard).join('');
}

function toCard(item) {
  const date = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '';
  const hasImg = Boolean(item.image);
  return `
    <article class="news-card">
      ${hasImg ? `<img src="${escapeHtml(item.image)}" alt="">` : ''}
      <div class="news-meta">
        <span class="news-source">${escapeHtml(item.source || '')}</span>
        <span class="news-date">${escapeHtml(date)}</span>
      </div>
      <h4 class="news-title">
        <a href="${escapeAttr(item.url || '#')}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(item.title || 'Untitled')}
        </a>
      </h4>
    </article>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeAttr(s) {
  // conservative attribute escape (also removes newlines)
  return String(s).replace(/[\n\r"'<>&]/g, c => ({
    '\n':'','\r':'','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;','&':'&amp;'
  }[c]));
}
