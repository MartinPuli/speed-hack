// Contrato nuevo para adaptar el catálogo de speed-hack a la interfaz extraída de GrowthX.
// Conserva IDs y procedencia originales; nunca fabrica revisiones o validaciones humanas.
export type TemporalStatus = 'upcoming' | 'today' | 'past' | 'undated';
export type SearchScope = 'upcoming' | 'history' | 'all';

export interface SourceRecord {
  id: string;
  url: string | null;
  title: string | null;
  publisher: string | null;
  observedAt: string | null;
  reuseStatus: string | null;
}

export interface EventLocation {
  latitude: number | null;
  longitude: number | null;
  precision: string | null;
  method: string | null;
  sourceUrl: string | null;
}

export interface EventSummary {
  id: string;
  title: string;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  timezone: string | null;
  status: string | null;
  temporalStatus: TemporalStatus;
  city: string | null;
  country: string | null;
  modality: string | null;
  category: string | null;
  topics: string[];
  location: EventLocation;
  source: SourceRecord | null;
  sponsorCount: number;
  missing: string[];
}

export interface EvidenceRecord {
  id: string;
  field: string;
  value: unknown;
  text: string | null;
  locator: string | null;
  evidenceClass: string | null;
  conflictStatus: string | null;
  observedAt: string | null;
  source: SourceRecord | null;
}

export interface CompanyRole {
  id: string;
  companyId: string;
  name: string;
  domain: string | null;
  role: string;
  level: string | null;
  status: string | null;
  source: SourceRecord | null;
}

export interface EventCost {
  id: string;
  category: string | null;
  amountMin: string | null;
  amountMax: string | null;
  currency: string | null;
  unit: string | null;
  status: string | null;
  source: SourceRecord | null;
}

export interface EventDetail extends EventSummary {
  evidence: EvidenceRecord[];
  evidenceTotal: number;
  roles: CompanyRole[];
  costs: EventCost[];
  relatedEditions: EventSummary[];
}

export interface SearchFilters {
  q: string;
  from: string;
  to: string;
  country: string;
  city: string;
  scope: SearchScope;
  sector: 'tech' | 'all';
  page: number;
  pageSize: number;
}

export interface CatalogStats {
  total: number;
  upcoming: number;
  sponsorRelations: number;
  sponsorCompanies: number;
  cutoff: string;
}

export interface SearchResponse {
  events: EventSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  evaluatedAt: string;
  countries: string[];
  stats: CatalogStats;
}

export interface ResearchBrief {
  preferences?: import('./event-brief').EventPreferences;
  company: string;
  website: string;
  objective: 'adoption' | 'feedback' | 'awareness' | 'partnerships';
  audience: string;
  topics: string;
  geography: string;
  from: string;
  to: string;
  budget: string;
  currency: string;
  constraints: string;
}
