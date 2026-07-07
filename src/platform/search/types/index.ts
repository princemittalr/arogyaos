export type SearchScope = 'GLOBAL' | 'MODULE' | 'USER' | 'SYSTEM' | 'EXTERNAL';
export type SearchProviderType = 'LOCAL' | 'ELASTIC' | 'OPENSEARCH' | 'VECTOR' | 'MOCK';
export type EntityType = 'PATIENT' | 'PROVIDER' | 'CLINIC' | 'DOCUMENT' | 'APPOINTMENT' | 'BILLING' | 'MEDICATION' | 'KNOWLEDGE_ARTICLE';
export type RelationshipType = 'TREATED_BY' | 'PRESCRIBED_BY' | 'LOCATED_AT' | 'RELATED_TO' | 'DEPENDS_ON';
export type RankingStrategy = 'RELEVANCE' | 'RECENCY' | 'POPULARITY' | 'HYBRID';

export interface SearchQuery {
  id: string;
  term: string;
  scope: SearchScope;
  filters: SearchFilter[];
  facets: SearchFacet[];
  pagination: { offset: number; limit: number };
}

export interface SearchFilter {
  field: string;
  operator: 'EQUALS' | 'CONTAINS' | 'GT' | 'LT' | 'IN' | 'RANGE';
  value: unknown;
}

export interface SearchFacet {
  field: string;
  type: 'TERMS' | 'RANGE' | 'DATE_HISTOGRAM';
}

export interface SearchResultItem {
  id: string;
  entityType: EntityType;
  title: string;
  snippet: string;
  url: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface SearchAggregation {
  field: string;
  buckets: Array<{ key: string; docCount: number }>;
}

export interface SearchResult {
  queryId: string;
  items: SearchResultItem[];
  totalHits: number;
  aggregations: SearchAggregation[];
  executionTimeMs: number;
}

export interface SearchIndex {
  id: string;
  name: string;
  schemaVersion: string;
  providerId: string;
}

export interface SearchIndexConfiguration {
  id: string;
  indexId: string;
  mappingConfig: Record<string, unknown>;
  settingsConfig: Record<string, unknown>;
}

export interface SearchProvider {
  id: string;
  name: string;
  type: SearchProviderType;
  endpointUrl: string;
}

export interface SearchEngine {
  id: string;
  providerId: string;
  defaultIndexId: string;
  rankingPolicyId: string;
}

export interface SearchSuggestion {
  term: string;
  score: number;
  type: 'HISTORY' | 'TRENDING' | 'SIMILAR';
}

export interface AutocompleteSuggestion {
  prefix: string;
  suggestions: SearchSuggestion[];
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  queryConfig: Record<string, unknown>;
  createdAt: string;
}

export interface RecentSearch {
  id: string;
  userId: string;
  term: string;
  timestamp: string;
}

export interface SearchHistory {
  userId: string;
  recentSearches: RecentSearch[];
}

export interface SearchSession {
  id: string;
  userId: string;
  queries: string[];
  clickedResults: string[];
  startedAt: string;
}

export interface SearchAnalytics {
  id: string;
  totalQueries: number;
  zeroResultQueries: number;
  clickThroughRate: number;
  timestamp: string;
}

export interface SearchAuditEntry {
  id: string;
  userId: string;
  queryTerm: string;
  executionTimeMs: number;
  timestamp: string;
}

export interface KnowledgeEntity {
  id: string;
  type: EntityType;
  name: string;
  attributes: EntityAttribute[];
  tags: EntityTag[];
  category: EntityCategory;
}

export interface KnowledgeRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  strength: number;
}

export interface KnowledgeGraph {
  id: string;
  entities: string[];
  relationships: string[];
  version: string;
}

export interface EntityReference {
  id: string;
  entityId: string;
  referenceType: string;
  referenceUrl: string;
}

export interface EntityAttribute {
  key: string;
  value: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';
}

export interface EntityTag {
  id: string;
  name: string;
}

export interface EntityCategory {
  id: string;
  name: string;
  parentCategoryId: string | null;
}

export interface EntityAlias {
  entityId: string;
  alias: string;
}

export interface Synonym {
  id: string;
  term: string;
  synonyms: string[];
}

export interface SearchRankingPolicy {
  id: string;
  strategy: RankingStrategy;
  rules: string[];
}

export interface SearchRankingRule {
  id: string;
  policyId: string;
  field: string;
  weight: number;
}

export interface SearchBoostRule {
  id: string;
  ruleId: string;
  condition: string;
  boostFactor: number;
}

export interface SearchConfiguration {
  id: string;
  defaultScope: SearchScope;
  maxResults: number;
  enableAutocomplete: boolean;
}

export interface GlobalSearchConfiguration {
  version: string;
  activeConfigurationId: string;
  globalProviders: string[];
}
