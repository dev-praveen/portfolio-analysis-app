// ─── Request Types ────────────────────────────────────────────────────────────

export type Exchange = 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
export type InvestmentHorizon = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
export type RiskProfile = 'LOW' | 'MODERATE' | 'HIGH';

export interface SymbolAndPrice {
  symbol: string;
  avgBuyPrice: string;
}

export interface SymbolAndPriceList {
  symbolAndAveragePriceList: SymbolAndPrice[];
}

export interface AnalyzePortfolioParams {
  exchange: Exchange;
  horizon: InvestmentHorizon;
  riskProfile: RiskProfile;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface FundamentalImpact {
  revenue: string;
  margins: string;
  balance_sheet: string;
  long_term_moat: string;
}

export interface TimeHorizonImpact {
  short_term: string;
  long_term: string;
}

export interface PortfolioAnalysisResponse {
  stock: string;
  news_summary: string;
  news_type: string[];
  sentiment: string;
  market_reaction: string;
  fundamental_impact: FundamentalImpact;
  time_horizon_impact: TimeHorizonImpact;
  risk_level: string;
  thesis_changed: boolean;
  valuation_comment: string;
  recommended_action: string;
  action_reason: string;
  invalidation_triggers: string;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export interface StockRow {
  id: string;
  symbol: string;
  avgBuyPrice: string;
}

export interface AppState {
  stocks: StockRow[];
  exchange: Exchange;
  horizon: InvestmentHorizon;
  riskProfile: RiskProfile;
  isLoading: boolean;
  results: PortfolioAnalysisResponse[];
  error: string | null;
}
