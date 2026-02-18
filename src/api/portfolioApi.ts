import type {
  AnalyzePortfolioParams,
  PortfolioAnalysisResponse,
  SymbolAndPriceList,
} from '../types/portfolio.ts';

// In development the Vite proxy forwards /api/* to the backend, avoiding CORS.
// In production builds, VITE_API_BASE_URL must be set (e.g. https://api.example.com).
// Fallback to empty string so relative URLs are used when no env var is provided.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 60_000;

export async function analyzePortfolio(
  params: AnalyzePortfolioParams,
  body: SymbolAndPriceList,
): Promise<PortfolioAnalysisResponse[]> {
  const query = new URLSearchParams({
    exchange: params.exchange,
    horizon: params.horizon,
    riskProfile: params.riskProfile,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/api/portfolio/analyze?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    const data: unknown = await response.json();
    return data as PortfolioAnalysisResponse[];
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
