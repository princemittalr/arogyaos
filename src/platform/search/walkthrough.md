# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why Search Engines and Indexing are External
Implementing live instances of ElasticSearch, OpenSearch, or vector databases (like Pinecone) within the core React platform violates severe enterprise boundaries. The UI should not perform data tokenization, build graph traversal queries natively, or continuously crawl the database. By strictly defining the **Search Provider Metadata**, the frontend seamlessly re-routes traffic across diverse indexing environments without ever altering its own internal configuration logic.

### Why Search Remains Metadata-Driven
A metadata-driven search layer ensures that global ranking algorithms (e.g., boosting recency over relevance in a clinical setting) and entity boundaries act as mathematical structures rather than implicit backend queries. Using rigorous Zod schemas to define these configuration topologies guarantees flawless compliance and structural alignment across every ArogyaOS domain module before an actual query hits the wire.

## Phase Overview
- **Phase 1**: Established the foundational models (`SearchIndex`, `SearchQuery`, `KnowledgeRelationship`) utilizing exacting Constants and strictly immutable Zod validatons.
- **Phase 2**: Built Service boundary orchestrators to route the creation and modification of ranking policies and search provider credentials cleanly without touching an HTTP database.
- **Phase 3**: Connected React Query hooks to securely expose these configuration endpoints to the frontend, enforcing deterministic cache synchronization strategies.
- **Phase 4**: Generated advanced, WCAG 2.2 AA compliant React workspaces providing IT Administrators dynamic visual panels to update global search constraints, test ranking boosts, and define knowledge graph ontologies.
- **Phase 5**: Sealed the framework via `SearchOfflineService` and precise `SearchAudit` tracing, enabling search configurations to be modified confidently in low-bandwidth settings while remaining entirely auditable.
