# Walkthrough: Clinical AI CDSS Lifecycle

## 1. Clinical Decision Context
A physician accesses the `DoctorWorkspace` and initiates a new `ClinicalDecision`. The context (current symptoms, active diagnoses) is encapsulated strictly within the `PromptContext` metadata structure.

## 2. Inference Orchestration
The `InferenceOrchestratorService` intercepts the context. Rather than executing an HTTP call, it validates the structural payload, determines provider capability metadata via the `ProviderRegistryService`, and logs an `InferenceStarted` event. 

## 3. Rule Evaluation & Safety Validation
Before returning outputs, the `ClinicalRuleEngineService` and `ClinicalSafetyService` intercept the proposed metadata. They deterministically check local arrays for drug contraindications and dosage guidelines, overriding external LLM metadata if necessary.

## 4. Human Review Request
If the resulting `ClinicalRecommendation` is flagged as high-risk, a `HumanReview` record is generated. The recommendation status is blocked at `NeedsReview`.

## 5. Explainability & Finalization
The physician opens the `ExplainabilityWorkspace` to view the deterministic `ClinicalExplanation` and confidence matrix. They formally approve the recommendation, triggering the `TimelineIntegrationService` to permanently commit the decision to the patient's Health Vault timeline via the `ClinicalAIAudit` ledger.
