# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why AI Providers & Inference are External
Executing physical LLM inference or vector searches within the UI blocks the main thread, incurs heavy cross-origin complexities, and exposes API keys directly to the client bundle. By configuring the parameters abstractly in this platform tier, backend container clusters orchestrate API integrations (OpenAI, Gemini) entirely separated from the React client, scaling horizontally as token demands surge.

### Why Orchestration is Metadata-Driven
Hardcoding clinical workflows or multi-agent pipelines directly in JavaScript limits the agility of hospital administrators. By defining Decision Trees, Agents, and Recommendations as abstract JSON state configurations (governed by zero-any Zod definitions), ArogyaOS allows clinical teams to hot-reload workflows, adjust temperature mappings, and enforce strict governance policies without re-compiling source code.

## Phase Overview
- **Phase 1**: Initialized the foundation through strict domain typologies (`AIAgent`, `AIModel`, `PromptTemplate`), deploying an exhaustive set of Zod verifications.
- **Phase 2**: Built the semantic service orchestration layer to route metadata modifications regarding agent tasks and automation logic cleanly through the application shell.
- **Phase 3**: Developed comprehensive React Query hooks for bridging the complex schema mapping constraints directly into client-side IT monitoring contexts.
- **Phase 4**: Designed WCAG 2.2 AA compliant React workspaces providing IT and clinical executives visual control panels for managing global model usage and enterprise limits.
- **Phase 5**: Locked the domain tightly with an aggressive `AIOfflineService` enabling secure, disjointed configuration edits during low-connectivity scenarios alongside comprehensive Audit tracking.
