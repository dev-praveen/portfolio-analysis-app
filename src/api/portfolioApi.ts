import type {
  AnalyzePortfolioParams,
  PortfolioAnalysisResponse,
  SymbolAndPriceList,
} from '../types/portfolio.ts';

const BASE_URL = 'http://localhost:8080';

export async function analyzePortfolio(
  params: AnalyzePortfolioParams,
  body: SymbolAndPriceList,
): Promise<PortfolioAnalysisResponse[]> {
  const query = new URLSearchParams({
    exchange: params.exchange,
    horizon: params.horizon,
    riskProfile: params.riskProfile,
  });

  const response = await fetch(`${BASE_URL}/api/portfolio/analyze?${query.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<PortfolioAnalysisResponse[]>;
}
