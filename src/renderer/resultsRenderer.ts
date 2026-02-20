import type { PortfolioAnalysisResponse } from '../types/portfolio.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function sentimentConfig(sentiment: string): { pillStyle: string; icon: string } {
  const s = sentiment.toUpperCase();
  if (s.includes('BULLISH') || s.includes('POSITIVE'))
    return { pillStyle: 'background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.30); color: #34d399;', icon: '▲' };
  if (s.includes('BEARISH') || s.includes('NEGATIVE'))
    return { pillStyle: 'background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.30); color: #f87171;', icon: '▼' };
  return { pillStyle: 'background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.30); color: #fbbf24;', icon: '◆' };
}

function actionConfig(action: string): { pillStyle: string; icon: string } {
  const a = action.toUpperCase();
  if (a.includes('BUY') || a.includes('ACCUMULATE'))
    return { pillStyle: 'background: #10b981; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.30);', icon: '↑' };
  if (a.includes('SELL') || a.includes('EXIT') || a.includes('REDUCE'))
    return { pillStyle: 'background: #ef4444; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.30);', icon: '↓' };
  return { pillStyle: 'background: #f59e0b; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.30);', icon: '→' };
}

function riskConfig(risk: string): { pillStyle: string } {
  const r = risk.toUpperCase();
  if (r.includes('HIGH')) return { pillStyle: 'background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.30); color: #f87171;' };
  if (r.includes('LOW')) return { pillStyle: 'background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.30); color: #34d399;' };
  return { pillStyle: 'background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.30); color: #fbbf24;' };
}

function newsTypeBadges(types: string[]): string {
  return types
    .map(
      (t) =>
        `<span class="inline-flex px-2 py-0.5 rounded-md text-xs font-medium" style="background: var(--indigo-bg-subtle); border: 1px solid var(--indigo-border-subtle); color: var(--indigo-text);">${escHtml(t)}</span>`,
    )
    .join('');
}

// ─── Card Builder ─────────────────────────────────────────────────────────────

function buildStockCard(item: PortfolioAnalysisResponse, index: number): string {
  const sentiment = sentimentConfig(item.sentiment);
  const action = actionConfig(item.recommended_action);
  const risk = riskConfig(item.risk_level);
  const cardId = `card-${index}`;
  const bodyId = `card-body-${index}`;

  return `
  <article
    id="${cardId}"
    class="stock-card rounded-2xl overflow-hidden"
    style="animation-delay:${index * 80}ms; background: var(--bg-secondary); border: 1px solid var(--border-primary); box-shadow: 0 20px 25px -5px var(--shadow-black);"
    data-card-index="${index}"
  >
    <!-- Card top bar accent -->
    <div class="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>

    <!-- Accordion Header (clickable) -->
    <button
      type="button"
      class="card-toggle w-full text-left flex items-center justify-between gap-4 px-6 py-5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      style="background: transparent;"
      onmouseover="this.style.background='var(--bg-hover)'"
      onmouseout="this.style.background='transparent'"
      aria-expanded="false"
      aria-controls="${bodyId}"
    >
      <!-- Left: stock name + badges -->
      <div class="space-y-2 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xl font-black tracking-tight font-mono" style="color: var(--text-primary);">${escHtml(item.stock)}</span>
          ${item.thesis_changed ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.30); color: #fb923c;">⚠ Thesis Changed</span>` : ''}
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold" style="${sentiment.pillStyle}">
            ${sentiment.icon} ${escHtml(item.sentiment)}
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold" style="${risk.pillStyle}">
            ${escHtml(item.risk_level)} Risk
          </span>
        </div>
      </div>

      <!-- Right: action pill + chevron -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm" style="${action.pillStyle}">
          <span>${action.icon}</span>
          <span>${escHtml(item.recommended_action)}</span>
        </div>
        <!-- Chevron rotates when expanded -->
        <span class="card-chevron transition-transform duration-300" style="color: var(--text-chevron);">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    </button>

    <!-- Accordion Body (collapsed by default) -->
    <div
      id="${bodyId}"
      class="card-body overflow-hidden"
      style="max-height: 0; opacity: 0; transition: max-height 0.35s ease, opacity 0.25s ease;"
    >
      <!-- Divider -->
      <div style="border-top: 1px solid var(--border-secondary);"></div>

      <div class="p-6 space-y-5">

        <!-- News Summary -->
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">📰 News Summary</p>
          <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">${escHtml(item.news_summary)}</p>
          ${item.news_type.length > 0 ? `<div class="flex flex-wrap gap-1.5 pt-1">${newsTypeBadges(item.news_type)}</div>` : ''}
        </div>

        <!-- Market Reaction -->
        <div class="space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">📊 Market Reaction</p>
          <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">${escHtml(item.market_reaction)}</p>
        </div>

        <!-- Fundamentals -->
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">🏦 Fundamental Impact</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-3 rounded-xl space-y-1" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary);">
              <span class="block text-xs font-medium" style="color: var(--text-subtle);">Revenue</span>
              <span class="block text-xs leading-snug" style="color: var(--text-secondary);">${escHtml(item.fundamental_impact.revenue)}</span>
            </div>
            <div class="p-3 rounded-xl space-y-1" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary);">
              <span class="block text-xs font-medium" style="color: var(--text-subtle);">Margins</span>
              <span class="block text-xs leading-snug" style="color: var(--text-secondary);">${escHtml(item.fundamental_impact.margins)}</span>
            </div>
            <div class="p-3 rounded-xl space-y-1" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary);">
              <span class="block text-xs font-medium" style="color: var(--text-subtle);">Balance Sheet</span>
              <span class="block text-xs leading-snug" style="color: var(--text-secondary);">${escHtml(item.fundamental_impact.balance_sheet)}</span>
            </div>
            <div class="p-3 rounded-xl space-y-1" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary);">
              <span class="block text-xs font-medium" style="color: var(--text-subtle);">Long-term Moat</span>
              <span class="block text-xs leading-snug" style="color: var(--text-secondary);">${escHtml(item.fundamental_impact.long_term_moat)}</span>
            </div>
          </div>
        </div>

        <!-- Time Horizon -->
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">⏱ Time Horizon Impact</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="p-3 rounded-xl space-y-1" style="background: var(--indigo-bg-subtle); border: 1px solid var(--indigo-border-subtle);">
              <span class="block text-xs font-semibold uppercase tracking-wider" style="color: var(--indigo-text-muted);">Short Term</span>
              <span class="block text-xs leading-snug" style="color: var(--text-secondary);">${escHtml(item.time_horizon_impact.short_term)}</span>
            </div>
            <div class="p-3 rounded-xl space-y-1" style="background: var(--violet-bg-subtle); border: 1px solid var(--violet-border-subtle);">
              <span class="block text-xs font-semibold uppercase tracking-wider" style="color: var(--violet-text-muted);">Long Term</span>
              <span class="block text-xs leading-snug" style="color: var(--text-secondary);">${escHtml(item.time_horizon_impact.long_term)}</span>
            </div>
          </div>
        </div>

        <!-- Valuation + Action Reason -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <p class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">💰 Valuation</p>
            <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">${escHtml(item.valuation_comment)}</p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">🎯 Action Reason</p>
            <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">${escHtml(item.action_reason)}</p>
          </div>
        </div>

        <!-- Invalidation Triggers -->
        <div class="p-4 rounded-xl space-y-1.5" style="background: rgba(249, 115, 22, 0.05); border: 1px solid rgba(249, 115, 22, 0.15);">
          <p class="text-xs font-semibold uppercase tracking-widest" style="color: rgba(251, 146, 60, 0.80);">⚡ Invalidation Triggers</p>
          <p class="text-sm leading-relaxed" style="color: var(--text-tertiary);">${escHtml(item.invalidation_triggers)}</p>
        </div>

      </div>
    </div>
  </article>`;
}

// ─── Accordion Logic ──────────────────────────────────────────────────────────

function collapseCard(article: Element): void {
  const body = article.querySelector<HTMLElement>('.card-body');
  const toggle = article.querySelector<HTMLButtonElement>('.card-toggle');
  const chevron = article.querySelector<HTMLElement>('.card-chevron');
  if (body) {
    body.style.maxHeight = '0';
    body.style.opacity = '0';
  }
  toggle?.setAttribute('aria-expanded', 'false');
  if (chevron) chevron.style.transform = 'rotate(0deg)';
}

function expandCard(article: Element): void {
  const body = article.querySelector<HTMLElement>('.card-body');
  const toggle = article.querySelector<HTMLButtonElement>('.card-toggle');
  const chevron = article.querySelector<HTMLElement>('.card-chevron');
  if (body) {
    // Use scrollHeight to animate to the natural height
    body.style.maxHeight = `${body.scrollHeight}px`;
    body.style.opacity = '1';
  }
  toggle?.setAttribute('aria-expanded', 'true');
  if (chevron) chevron.style.transform = 'rotate(180deg)';
}

function wireAccordion(container: HTMLElement): void {
  const cards = Array.from(container.querySelectorAll<HTMLElement>('article[data-card-index]'));

  cards.forEach((card) => {
    const toggle = card.querySelector<HTMLButtonElement>('.card-toggle');
    toggle?.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      // Collapse all cards first
      cards.forEach(collapseCard);
      // If this card was collapsed, expand it; if it was already open, leave all closed
      if (!isExpanded) {
        expandCard(card);
        // Wait for the expand animation to finish (350ms), then scroll so the
        // full card body is visible — using 'start' so the card header stays
        // anchored at the top of the viewport and the content scrolls into view.
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 360);
      }
    });
  });
}

// ─── Public Render Functions ──────────────────────────────────────────────────

export function renderResults(
  container: HTMLElement,
  results: PortfolioAnalysisResponse[],
  onClear: () => void,
): void {
  container.innerHTML = `
    <div class="space-y-4">
      <!-- Results header -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h2 class="flex items-center gap-2 text-lg font-bold" style="color: var(--text-primary);">
          <span style="color: var(--indigo-text);">✦</span>
          Analysis Results
        </h2>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background: var(--indigo-bg); border: 1px solid var(--indigo-border); color: var(--indigo-text);">
            ${results.length} stock${results.length !== 1 ? 's' : ''}
          </span>
          <button
            id="clear-results-btn"
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style="background: var(--bg-input); border: 1px solid var(--border-input); color: var(--text-muted);"
            onmouseover="this.style.color='var(--text-primary)'; this.style.background='var(--bg-hover)'; this.style.borderColor='var(--border-input)'"
            onmouseout="this.style.color='var(--text-muted)'; this.style.background='var(--bg-input)'; this.style.borderColor='var(--border-input)'"
            title="Clear results and start over"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 .49-3.51"></path>
            </svg>
            Start Over
          </button>
        </div>
      </div>

      <!-- Hint text -->
      <p class="text-xs -mt-1" style="color: var(--text-placeholder);">Click a stock to expand its full analysis.</p>

      <!-- Cards -->
      <div id="results-cards" class="space-y-3">
        ${results.map((item, i) => buildStockCard(item, i)).join('')}
      </div>
    </div>`;

  // Wire accordion interactions
  const cardsContainer = container.querySelector<HTMLElement>('#results-cards');
  if (cardsContainer) wireAccordion(cardsContainer);

  // Wire clear button
  container.querySelector<HTMLButtonElement>('#clear-results-btn')?.addEventListener('click', onClear);
}

export function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl text-center" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.20);">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171;">⚠</div>
      <div class="space-y-1">
        <h3 class="text-base font-bold" style="color: var(--text-primary);">Analysis Failed</h3>
        <p class="text-sm max-w-md" style="color: var(--text-muted);">${escHtml(message)}</p>
      </div>
    </div>`;
}

export function renderLoading(container: HTMLElement): void {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-5 py-20 px-6 rounded-2xl text-center" style="background: var(--bg-tertiary); border: 1px solid var(--border-secondary);">
      <div class="relative w-14 h-14">
        <div class="absolute inset-0 rounded-full border-2" style="border-color: rgba(99, 102, 241, 0.20);"></div>
        <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 spin-icon"></div>
        <div class="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400" style="animation: spin 1.5s linear infinite reverse"></div>
      </div>
      <div class="space-y-1">
        <p class="text-base font-semibold" style="color: var(--text-primary);">Analysing your portfolio with AI…</p>
        <p class="text-sm" style="color: var(--text-muted);">Fetching latest market news and generating insights</p>
      </div>
      <div class="flex gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" style="animation: pulse-dot 1.4s ease-in-out infinite 0ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" style="animation: pulse-dot 1.4s ease-in-out infinite 200ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" style="animation: pulse-dot 1.4s ease-in-out infinite 400ms"></span>
      </div>
    </div>`;
}
