export interface CompanyBrand {
  submissionId: string;
  sourceUrl: string;
  status: 'pending' | 'completed' | 'failed';
  name: string;
  logoUrl: string | null;
  imagery?: Array<{ url: string; description: string }>;
  palette: Array<{ name: string; hex: string }>;
  displayFont: string;
  bodyFont: string;
  tone: string[];
  signature: string;
  audience: string[];
  extractedAt: string | null;
  error: string | null;
}

export interface EventDesignBrief {
  submissionId: string;
  enhancedPrompt: string;
  brandName: string;
  sourceUrl: string;
  createdAt: string;
}
