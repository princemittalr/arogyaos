# ADR 0001: ArogyaOS Core Architecture Decisions

## Status
Accepted

## Context
ArogyaOS must serve as a scalable, responsive, and robust unified healthcare operating system coordinating multiple stakeholders (citizens, doctors, administrators). We need technology choices that provide:
1. Low latency and high performance.
2. Real-time synchronicity (e.g. bed occupancy, medicine stock).
3. Type-safe validation for health records and inputs.
4. Seamless integration with AI models (Gemini).

## Decision & Rationale

### 1. Next.js 15 App Router
*   **Decision**: Adopt Next.js App Router for frontend framework and API endpoints.
*   **Rationale**: React Server Components (RSC) enable rendering pages on the server, minimizing bundle sizes sent to clients. Middleware allows edge routing and authorization checks.

### 2. Firebase (Auth, Firestore, Storage)
*   **Decision**: Use Firebase as the core persistence and authentication backend.
*   **Rationale**: Firebase Auth handles secure session generation. Firestore provides real-time updates for beds/inventory. Storage securely retains patient files.

### 3. Google Gemini AI Engine
*   **Decision**: Integrate Google Gemini 2.5 Flash.
*   **Rationale**: Gemini offers low latency and excellent context window support for clinical summaries and stock forecasting, with native fallback options for robust operation.

### 4. TanStack Query & Zod
*   **Decision**: Deploy TanStack Query for client state caching and Zod for schema validation.
*   **Rationale**: Query prevents duplicate server fetch calls. Zod guarantees strict type validation for database transactions and API endpoints.

### 5. Vitest
*   **Decision**: Use Vitest for unit and integration testing.
*   **Rationale**: Vitest provides fast execution times, ESM support, and path alias mapping, resulting in excellent developer confidence.
