# ADR-001: Hybrid Deterministic ATS Scoring Architecture

## Status
Accepted

## Context
Initial prototypes relied 100% on LLM prompt output to generate numerical ATS compatibility scores. This resulted in nondeterministic scores, score drift between runs, and lack of technical explainability for recruiters and candidates.

## Decision
We implement a hybrid architecture:
1. Numerical ATS scores are calculated 100% deterministically through transparent algorithms (Skill Taxonomy Match, Vector Cosine Similarity, Experience Tenure, Formatting Quality, Achievement Metrics).
2. The LLM (Gemini 3.5) is used exclusively for qualitative reasoning, grounded improvement recommendations, STAR interview prep questions, and custom cover letter generation.

## Consequences
- Guaranteed mathematical reproducibility (identical inputs produce identical scores).
- Full component-level score transparency for auditability.
- Elimination of LLM score hallucination.
