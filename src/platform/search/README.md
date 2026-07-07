# Platform Phase 5: Enterprise Search, Knowledge Graph & Global Discovery Platform

Global architectural Discovery Configuration layer for ArogyaOS.

## Overview
This platform layer functions as the unified metadata orchestrator for defining global search scopes, indexing configuration boundaries, and cross-module knowledge graph relationships across ArogyaOS's 20 isolated clinical domains.

## Architecture
**Constraint Warning**: This module explicitly serves as a **Control Plane**. It does **not** contain an ElasticSearch mapping engine, a Vector DB runtime, an LLM embedding generator, or background crawling scripts. ArogyaOS dictates that the frontend manages the *rules, ranking constraints, and schema shapes*, entirely protecting the system from tightly coupling to specific physical indexing providers. 

## Folder Structure
- `types/` - Strict typing for search configurations (`SearchIndex`, `KnowledgeEntity`, `RankingPolicy`).
- `core/` - Global platform search events, semantic constants (Provider Types, Ranking Strategies), and offline cache queueing mechanisms.
- `utils/` - Intensive Zod schema validations ensuring valid search payloads and graph link formations.
- `repositories/` - Interface boundaries defining structural persistence for search mappings.
- `services/` - Metadata lifecycle orchestrators for queries, indexes, ranking logic, and providers.
- `hooks/` - Abstracted React Query hooks linking services to configuration administration interfaces.
- `components/` - WCAG 2.2 AA compliant IT Administration workspaces to govern indexing behavior globally.

## Extension Guidelines
To execute live indexing and physical semantic retrieval, construct a separate background integration daemon within a domain module. Configure that backend layer to synchronize its query mapping shapes against the strict definitions outputted continuously by this platform's configuration states.
