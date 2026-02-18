import type { PortfolioAnalysisResponse } from '../types/portfolio.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sentimentConfig(sentiment: string): { pillCls: string; icon: string } {
  const s = sentiment.toUpperCase();
  if (s.includes('BULLISH') || s.includes('POSITIVE'))
    return { pillCls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', icon: '▲' };
  if (s.includes('BEARISH') || s.includes('NEGATIVE'))
    return { pillCls: 'bg-red-500/15 border-red-500/30 text-red-300', icon: '▼' };
  return { pillCls: 'bg-amber-500/15 border-amber-500/30 text-amber-300', icon: '◆' };
}

function actionConfig(action: string): { pillCls: string; icon: string } {
  const a = action.toUpperCase();
  if (a.includes('BUY') || a.includes('ACCUMULATE'))
    return { pillCls: 'bg-emerald-500 text-white shadow-emerald-500/30', icon: '↑' };
  if (a.includes('SELL') || a.includes('EXIT') || a.includes('REDUCE'))
    return { pillCls: 'bg-red-500 text-white shadow-red-500/30', icon: '↓' };
  return { pillCls: 'bg-amber-500 text-white shadow-amber-500/30', icon: '→' };
}

function riskConfig(risk: string): { pillCls: string } {
  const r = risk.toUpperCase();
  if (r.includes('HIGH')) return { pillCls: 'bg-red-500/15 border-red-500/30 text-red-300' };
  if (r.includes('LOW')) return { pillCls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
  return { pillCls: 'bg-amber-500/15 border-amber-500/30 text-amber-300' };
}

function newsTypeBadges(types: string[]): string {
  return types
    .map(
      (t) =>
        `<span class="inline-flex px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">${escHtml(t)}</span>`,
    )
    .join('');
}

// ─── Card Builder ─────────────────────────────────────────────────────────────

function buildStockCard(item: PortfolioAnalysisResponse, index: number): string {
  const sentiment = sentimentConfig(item.sentiment);
  const action = actionConfig(item.recommended_action);
  const risk = riskConfig(item.risk_level);

  return `
  <article class="stock-card rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-hidden shadow-xl shadow-black/30" style="animation-delay:${index * 80}ms">

    <!-- Card top bar accent -->
    <div class="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>

    <!-- Header -->
    <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.06]">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl font-black tracking-tight text-white font-mono">${escHtml(item.stock)}</span>
          ${item.thesis_changed ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold">⚠ Thesis Changed</span>` : ''}
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${sentiment.pillCls}">
            ${sentiment.icon} ${escHtml(item.sentiment)}
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${risk.pillCls}">
            ${escHtml(item.risk_level)} Risk
          </span>
        </div>
      </div>
      <div class="flex-shrink-0">
        <div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm shadow-lg ${action.pillCls}">
          <span>${action.icon}</span>
          <span>${escHtml(item.recommended_action)}</span>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="p-6 space-y-5">

      <!-- News Summary -->
      <div class="space-y-2">
        <p class="text-xs font-semibold text-white/40 uppercase tracking-widest">📰 News Summary</p>
        <p class="text-sm text-white/75 leading-relaxed">${escHtml(item.news_summary)}</p>
        ${item.news_type.length > 0 ? `<div class="flex flex-wrap gap-1.5 pt-1">${newsTypeBadges(item.news_type)}</div>` : ''}
      </div>

      <!-- Market Reaction -->
      <div class="space-y-1.5">
        <p class="text-xs font-semibold text-white/40 uppercase tracking-widest">📊 Market Reaction</p>
        <p class="text-sm text-white/75 leading-relaxed">${escHtml(item.market_reaction)}</p>
      </div>

      <!-- Fundamentals -->
      <div class="space-y-2">
        <p class="text-xs font-semibold text-white/40 uppercase tracking-widest">🏦 Fundamental Impact</p>
        <div class="grid grid-cols-2 gap-2">
          <div class="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span class="block text-xs text-white/35 font-medium">Revenue</span>
            <span class="block text-xs text-white/80 leading-snug">${escHtml(item.fundamental_impact.revenue)}</span>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span class="block text-xs text-white/35 font-medium">Margins</span>
            <span class="block text-xs text-white/80 leading-snug">${escHtml(item.fundamental_impact.margins)}</span>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span class="block text-xs text-white/35 font-medium">Balance Sheet</span>
            <span class="block text-xs text-white/80 leading-snug">${escHtml(item.fundamental_impact.balance_sheet)}</span>
          </div>
          <div class="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span class="block text-xs text-white/35 font-medium">Long-term Moat</span>
            <span class="block text-xs text-white/80 leading-snug">${escHtml(item.fundamental_impact.long_term_moat)}</span>
          </div>
        </div>
      </div>

      <!-- Time Horizon -->
      <div class="space-y-2">
        <p class="text-xs font-semibold text-white/40 uppercase tracking-widest">⏱ Time Horizon Impact</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div class="p-3 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/15 space-y-1">
            <span class="block text-xs font-semibold text-indigo-400/80 uppercase tracking-wider">Short Term</span>
            <span class="block text-xs text-white/75 leading-snug">${escHtml(item.time_horizon_impact.short_term)}</span>
          </div>
          <div class="p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15 space-y-1">
            <span class="block text-xs font-semibold text-violet-400/80 uppercase tracking-wider">Long Term</span>
            <span class="block text-xs text-white/75 leading-snug">${escHtml(item.time_horizon_impact.long_term)}</span>
          </div>
        </div>
      </div>

      <!-- Valuation + Action Reason -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <p class="text-xs font-semibold text-white/40 uppercase tracking-widest">💰 Valuation</p>
          <p class="text-sm text-white/75 leading-relaxed">${escHtml(item.valuation_comment)}</p>
        </div>
        <div class="space-y-1.5">
          <p class="text-xs font-semibold text-white/40 uppercase tracking-widest">🎯 Action Reason</p>
          <p class="text-sm text-white/75 leading-relaxed">${escHtml(item.action_reason)}</p>
        </div>
      </div>

      <!-- Invalidation Triggers -->
      <div class="p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/15 space-y-1.5">
        <p class="text-xs font-semibold text-orange-400/80 uppercase tracking-widest">⚡ Invalidation Triggers</p>
        <p class="text-sm text-white/65 leading-relaxed">${escHtml(item.invalidation_triggers)}</p>
      </div>

    </div>
  </article>`;
}

// ─── Public Render Functions ──────────────────────────────────────────────────

export function renderResults(container: HTMLElement, results: PortfolioAnalysisResponse[]): void {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-lg font-bold text-white">
          <span class="text-indigo-400">✦</span>
          Analysis Results
        </h2>
        <span class="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
          ${results.length} stock${results.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div class="space-y-4">
        ${results.map((item, i) => buildStockCard(item, i)).join('')}
      </div>
    </div>`;
}

export function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl bg-red-500/[0.05] border border-red-500/20 text-center">
      <div class="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 text-2xl">⚠</div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-white">Analysis Failed</h3>
        <p class="text-sm text-white/50 max-w-md">${escHtml(message)}</p>
      </div>
    </div>`;
}

export function renderLoading(container: HTMLElement): void {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-5 py-20 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
      <div class="relative w-14 h-14">
        <div class="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
        <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 spin-icon"></div>
        <div class="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400" style="animation: spin 1.5s linear infinite reverse"></div>
      </div>
      <div class="space-y-1">
        <p class="text-base font-semibold text-white">Analysing your portfolio with AI…</p>
        <p class="text-sm text-white/40">Fetching latest market news and generating insights</p>
      </div>
      <div class="flex gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" style="animation: pulse-dot 1.4s ease-in-out infinite 0ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" style="animation: pulse-dot 1.4s ease-in-out infinite 200ms"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" style="animation: pulse-dot 1.4s ease-in-out infinite 400ms"></span>
      </div>
    </div>`;
}
