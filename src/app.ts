import type { AppState, Exchange, InvestmentHorizon, RiskProfile, StockRow } from './types/portfolio.ts';
import { analyzePortfolio } from './api/portfolioApi.ts';
import { renderResults, renderError, renderLoading } from './renderer/resultsRenderer.ts';

// ─── State ────────────────────────────────────────────────────────────────────

let state: AppState = {
  stocks: [{ id: crypto.randomUUID(), symbol: '', avgBuyPrice: '' }],
  exchange: 'NSE',
  horizon: 'MEDIUM_TERM',
  riskProfile: 'MODERATE',
  isLoading: false,
  results: [],
  error: null,
};

// ─── DOM Refs ─────────────────────────────────────────────────────────────────

let stocksContainer: HTMLElement;
let resultsSection: HTMLElement;
let analyzeBtn: HTMLButtonElement;
let exchangeSelect: HTMLSelectElement;
let horizonSelect: HTMLSelectElement;
let riskSelect: HTMLSelectElement;

// ─── Stock Row Management ─────────────────────────────────────────────────────

function createStockRowEl(row: StockRow): HTMLElement {
  const div = document.createElement('div');
  div.className = 'flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] transition-all duration-300';
  div.dataset['id'] = row.id;

  div.innerHTML = `
    <div class="flex flex-1 items-center gap-3 flex-wrap sm:flex-nowrap">
      <div class="flex-1 min-w-0">
        <label class="block text-xs font-medium text-indigo-300/70 mb-1.5 uppercase tracking-wider">Stock Symbol</label>
        <input
          type="text"
          class="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-white placeholder-white/25 text-sm font-mono font-semibold tracking-widest focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200"
          placeholder="e.g., RELIANCE"
          value="${row.symbol}"
          data-field="symbol"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="flex-1 min-w-0">
        <label class="block text-xs font-medium text-indigo-300/70 mb-1.5 uppercase tracking-wider">Avg Buy Price</label>
        <input
          type="number"
          class="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200"
          placeholder="e.g., 1400.50"
          value="${row.avgBuyPrice}"
          data-field="avgBuyPrice"
          min="0"
          step="0.01"
        />
      </div>
    </div>
    <button
      class="remove-stock-btn flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-white/30 disabled:hover:bg-transparent disabled:hover:border-transparent"
      data-id="${row.id}"
      title="Remove stock"
      ${state.stocks.length === 1 ? 'disabled' : ''}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M10 11v6"></path><path d="M14 11v6"></path>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
      </svg>
    </button>`;

  div.querySelectorAll<HTMLInputElement>('[data-field]').forEach((input) => {
    input.addEventListener('input', () => {
      const field = input.dataset['field'] as 'symbol' | 'avgBuyPrice';
      const stock = state.stocks.find((s) => s.id === row.id);
      if (stock) {
        if (field === 'symbol') {
          stock.symbol = input.value.toUpperCase().trim();
          input.value = stock.symbol;
        } else {
          stock.avgBuyPrice = input.value;
        }
      }
      // Dismiss the inline validation error as soon as the user edits any field
      clearInlineError();
    });
  });

  div.querySelector<HTMLButtonElement>('.remove-stock-btn')?.addEventListener('click', () => {
    removeStock(row.id);
  });

  return div;
}

function addStock(): void {
  const newRow: StockRow = { id: crypto.randomUUID(), symbol: '', avgBuyPrice: '' };
  state.stocks.push(newRow);
  const el = createStockRowEl(newRow);
  el.style.opacity = '0';
  el.style.transform = 'translateY(-8px)';
  stocksContainer.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
  updateRemoveButtons();
  el.querySelector<HTMLInputElement>('input[data-field="symbol"]')?.focus();
}

function removeStock(id: string): void {
  if (state.stocks.length === 1) return;
  state.stocks = state.stocks.filter((s) => s.id !== id);
  // Use div[data-id] to unambiguously target the row container,
  // not the remove button inside it which also carries data-id.
  const el = stocksContainer.querySelector<HTMLElement>(`div[data-id="${id}"]`);
  if (el) {
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(10px)';
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }
  updateRemoveButtons();
  setTimeout(updateStocksCount, 250);
}

function updateRemoveButtons(): void {
  stocksContainer.querySelectorAll<HTMLButtonElement>('.remove-stock-btn').forEach((btn) => {
    btn.disabled = state.stocks.length === 1;
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(): string | null {
  for (const stock of state.stocks) {
    if (!stock.symbol.trim()) return 'Please enter a stock symbol for all rows.';
    if (!stock.avgBuyPrice || isNaN(parseFloat(stock.avgBuyPrice)))
      return `Please enter a valid average buy price for ${stock.symbol || 'all stocks'}.`;
    if (parseFloat(stock.avgBuyPrice) <= 0)
      return `Average buy price must be greater than 0 for ${stock.symbol}.`;
  }
  return null;
}

// ─── Form Submit ──────────────────────────────────────────────────────────────

async function handleAnalyze(): Promise<void> {
  const validationError = validate();
  if (validationError) {
    showInlineError(validationError);
    return;
  }
  clearInlineError();
  state.isLoading = true;
  setLoadingState(true);
  renderLoading(resultsSection);
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const results = await analyzePortfolio(
      { exchange: state.exchange, horizon: state.horizon, riskProfile: state.riskProfile },
      { symbolAndAveragePriceList: state.stocks.map((s) => ({ symbol: s.symbol, avgBuyPrice: s.avgBuyPrice })) },
    );
    state.results = results;
    renderResults(resultsSection, results, clearResults);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    state.error = message;
    renderError(resultsSection, message);
  } finally {
    state.isLoading = false;
    setLoadingState(false);
  }
}

function setLoadingState(loading: boolean): void {
  analyzeBtn.disabled = loading;
  const btnText = analyzeBtn.querySelector<HTMLElement>('.btn-text');
  const btnSpinner = analyzeBtn.querySelector<HTMLElement>('.btn-spinner');
  if (btnText) btnText.style.opacity = loading ? '0' : '1';
  if (btnSpinner) btnSpinner.style.opacity = loading ? '1' : '0';
  setFormDisabled(loading);
}

// Disable/enable every interactive control inside the form card and apply a
// visual greyed-out overlay so the user knows the form is locked during analysis.
function setFormDisabled(disabled: boolean): void {
  const fieldset = document.getElementById('form-fieldset') as HTMLFieldSetElement | null;
  const formCard = document.getElementById('form-card');

  if (fieldset) fieldset.disabled = disabled;

  if (formCard) {
    if (disabled) {
      formCard.style.opacity = '0.5';
      formCard.style.pointerEvents = 'none';
      formCard.style.transition = 'opacity 0.3s ease';
    } else {
      formCard.style.opacity = '1';
      formCard.style.pointerEvents = '';
      formCard.style.transition = 'opacity 0.3s ease';
    }
  }
}

function showInlineError(msg: string): void {
  let errEl = document.getElementById('form-error');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = 'form-error';
    errEl.className = 'flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm';
    analyzeBtn.parentElement?.insertBefore(errEl, analyzeBtn);
  }
  // Use textContent for the message to prevent XSS — build the node structure manually
  errEl.innerHTML = '';
  const icon = document.createElement('span');
  icon.className = 'text-red-400';
  icon.textContent = '⚠';
  const text = document.createTextNode(` ${msg}`);
  errEl.appendChild(icon);
  errEl.appendChild(text);
  errEl.style.display = 'flex';
}

function clearInlineError(): void {
  const errEl = document.getElementById('form-error');
  if (errEl) errEl.style.display = 'none';
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function buildAppShell(): string {
  return `
  <!-- Ambient background -->
  <div class="fixed inset-0 -z-10 bg-[#080810]"></div>
  <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]"></div>
  <div class="fixed top-1/3 -left-40 -z-10 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]"></div>
  <div class="fixed bottom-1/4 -right-40 -z-10 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]"></div>

  <!-- Page -->
  <div class="min-h-screen text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">

      <!-- ── Hero ── -->
      <header class="text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold tracking-widest uppercase">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 hero-badge-dot"></span>
          AI-Powered Analysis
        </div>
        <h1 class="text-5xl sm:text-6xl font-black tracking-tight leading-none">
          Portfolio<br/>
          <span class="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span>
        </h1>
        <p class="max-w-xl mx-auto text-white/50 text-base sm:text-lg leading-relaxed">
          Get real-time AI insights and actionable recommendations for your stock portfolio
          based on the latest market news, events, and fundamentals.
        </p>
        <div class="flex items-center justify-center gap-6 pt-2">
          <div class="text-center">
            <div class="text-sm font-bold text-white/80">NSE · BSE</div>
            <div class="text-xs text-white/35 mt-0.5">Indian Markets</div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="text-center">
            <div class="text-sm font-bold text-white/80">NYSE · NASDAQ</div>
            <div class="text-xs text-white/35 mt-0.5">US Markets</div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="text-center">
            <div class="text-sm font-bold text-white/80">AI</div>
            <div class="text-xs text-white/35 mt-0.5">Driven Insights</div>
          </div>
        </div>
      </header>

      <!-- ── Form Card ── -->
      <section id="form-card" class="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">

        <!-- Card header -->
        <div class="flex items-center gap-4 px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-white">Portfolio Configuration</h2>
            <p class="text-xs text-white/40 mt-0.5">Configure your investment parameters</p>
          </div>
        </div>

        <fieldset id="form-fieldset" class="contents">
        <div class="p-6 space-y-6">
          <!-- Selects grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <!-- Exchange -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider" for="exchange-select">Exchange</label>
              <div class="relative">
                <select id="exchange-select" class="w-full appearance-none bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200 cursor-pointer pr-10">
                  <option value="NSE" class="bg-[#1a1a2e]">NSE — National Stock Exchange</option>
                  <option value="BSE" class="bg-[#1a1a2e]">BSE — Bombay Stock Exchange</option>
                  <option value="NYSE" class="bg-[#1a1a2e]">NYSE — New York Stock Exchange</option>
                  <option value="NASDAQ" class="bg-[#1a1a2e]">NASDAQ</option>
                </select>
                <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>

            <!-- Horizon -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider" for="horizon-select">Investment Horizon</label>
              <div class="relative">
                <select id="horizon-select" class="w-full appearance-none bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200 cursor-pointer pr-10">
                  <option value="SHORT_TERM" class="bg-[#1a1a2e]">Short Term</option>
                  <option value="MEDIUM_TERM" selected class="bg-[#1a1a2e]">Medium Term</option>
                  <option value="LONG_TERM" class="bg-[#1a1a2e]">Long Term</option>
                </select>
                <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>

            <!-- Risk Profile -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-white/50 uppercase tracking-wider" for="risk-select">Risk Profile</label>
              <div class="relative">
                <select id="risk-select" class="w-full appearance-none bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all duration-200 cursor-pointer pr-10">
                  <option value="LOW" class="bg-[#1a1a2e]">Low Risk</option>
                  <option value="MODERATE" selected class="bg-[#1a1a2e]">Moderate Risk</option>
                  <option value="HIGH" class="bg-[#1a1a2e]">High Risk</option>
                </select>
                <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-white/[0.06]"></div>

          <!-- Stocks section -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-sm font-bold text-white/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Your Stocks
              </h3>
              <span id="stocks-count" class="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">1 stock</span>
            </div>

            <div id="stocks-container" class="space-y-2"></div>

            <button id="add-stock-btn" type="button"
              class="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 group">
              <span class="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </span>
              Add Another Stock
            </button>
          </div>

          <!-- Analyze button -->
          <div class="pt-2 space-y-3">
            <button id="analyze-btn" type="button"
              class="relative w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden">
              <span class="btn-spinner absolute inset-0 flex items-center justify-center" style="opacity:0">
                <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </span>
              <span class="btn-text flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Analyze Portfolio
              </span>
            </button>
          </div>
        </div>
        </fieldset>
      </section>

      <!-- ── Results ── -->
      <section id="results-section" aria-live="polite" aria-label="Analysis Results"></section>

      <!-- ── Footer ── -->
      <footer class="text-center text-xs text-white/20 pb-4">
        Portfolio Intelligence &middot; AI-powered stock analysis &middot; Data for informational purposes only
      </footer>

    </div>
  </div>`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initApp(root: HTMLElement): void {
  root.innerHTML = buildAppShell();

  stocksContainer = document.getElementById('stocks-container') as HTMLElement;
  resultsSection = document.getElementById('results-section') as HTMLElement;
  analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
  exchangeSelect = document.getElementById('exchange-select') as HTMLSelectElement;
  horizonSelect = document.getElementById('horizon-select') as HTMLSelectElement;
  riskSelect = document.getElementById('risk-select') as HTMLSelectElement;

  state.stocks.forEach((row) => stocksContainer.appendChild(createStockRowEl(row)));

  exchangeSelect.addEventListener('change', () => { state.exchange = exchangeSelect.value as Exchange; });
  horizonSelect.addEventListener('change', () => { state.horizon = horizonSelect.value as InvestmentHorizon; });
  riskSelect.addEventListener('change', () => { state.riskProfile = riskSelect.value as RiskProfile; });

  document.getElementById('add-stock-btn')?.addEventListener('click', () => {
    addStock();
    updateStocksCount();
  });

  analyzeBtn.addEventListener('click', () => { void handleAnalyze(); });

  stocksContainer.addEventListener('click', () => setTimeout(updateStocksCount, 300));
}

function updateStocksCount(): void {
  const badge = document.getElementById('stocks-count');
  if (badge) {
    const n = state.stocks.length;
    badge.textContent = `${n} stock${n !== 1 ? 's' : ''}`;
  }
}

// ─── Clear Results ────────────────────────────────────────────────────────────

function clearResults(): void {
  // Reset results state
  state.results = [];
  state.error = null;

  // Clear the results section
  resultsSection.innerHTML = '';

  // Scroll back up to the form
  const formCard = document.getElementById('form-card');
  formCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
