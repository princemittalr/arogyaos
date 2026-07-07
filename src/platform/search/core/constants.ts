export const SEARCH_SCOPES = [
  'GLOBAL',
  'MODULE',
  'USER',
  'SYSTEM',
  'EXTERNAL'
] as const;

export const SEARCH_PROVIDER_TYPES = [
  'LOCAL',
  'ELASTIC',
  'OPENSEARCH',
  'VECTOR',
  'MOCK'
] as const;

export const ENTITY_TYPES = [
  'PATIENT',
  'PROVIDER',
  'CLINIC',
  'DOCUMENT',
  'APPOINTMENT',
  'BILLING',
  'MEDICATION',
  'KNOWLEDGE_ARTICLE'
] as const;

export const RELATIONSHIP_TYPES = [
  'TREATED_BY',
  'PRESCRIBED_BY',
  'LOCATED_AT',
  'RELATED_TO',
  'DEPENDS_ON'
] as const;

export const RANKING_STRATEGIES = [
  'RELEVANCE',
  'RECENCY',
  'POPULARITY',
  'HYBRID'
] as const;

export const SEARCH_RESULT_TYPES = [
  'STANDARD',
  'HIGHLIGHTED',
  'RECOMMENDED'
] as const;

export const SEARCH_FACETS = [
  'TERMS',
  'RANGE',
  'DATE_HISTOGRAM'
] as const;

export const SUGGESTION_TYPES = [
  'HISTORY',
  'TRENDING',
  'SIMILAR'
] as const;

export const AUTOCOMPLETE_POLICIES = [
  'PREFIX',
  'FUZZY',
  'EXACT'
] as const;

export const DEFAULT_SEARCH_CONFIGURATION = {
  defaultScope: 'GLOBAL',
  maxResults: 20,
  enableAutocomplete: true
};
