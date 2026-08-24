# AI Recruitment Intelligence & ATS Optimization Platform — Architecture

## Overview
This platform provides an industrial-grade, production-ready recruitment intelligence engine combining multi-format document ingestion, deterministic ATS scoring, vector semantic similarity, skill taxonomy extraction, evidence-grounded AI recommendations, relational database persistence, and an automated benchmark evaluation framework.

## System Topology
```text
                    ┌───────────────────────────┐
                    │        Web Client         │
                    │ React + TypeScript SPA    │
                    │ Light / Dark Theme UI     │
                    └─────────────┬─────────────┘
                                  │
                           HTTPS / REST API
                                  │
                    ┌─────────────▼─────────────┐
                    │       API Layer            │
                    │ Express + Auth + JWT      │
                    │ Rate Limiting & Input Val  │
                    └─────────────┬─────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      Document Parser       Job Parser          Application Tracker
     (PDF/DOCX Ingest)     (Requirement Map)       (Kanban/List)
             │                    │
             └────────────┬───────┘
                          ▼
                 Intelligence Engine
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     Skill Taxonomy   Semantic Matcher   LLM Reasoning
    (Categorized)    (Cosine Vector)   (Gemini 3.5)
          │               │                │
          └───────────────┼────────────────┘
                          ▼
              Deterministic ATS Engine
                          │
                          ▼
               Evidence Grounding Guard
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         SQLite WAL    Audit Log   Evaluation Suite
         Relational   (Security)    (Precision/F1)
```

## Core Subsystems
1. **Document Ingestion Pipeline**: Ingests PDF (`pdf-parse`), DOCX (`mammoth`), and plain text with section heuristic normalization.
2. **Deterministic Hybrid ATS Engine**: Calculates transparent, reproducible component scores (Skill 30%, Semantic 20%, Experience 15%, Structure 10%, Completeness 10%, Achievements 10%, Education 5%).
3. **Evidence Grounding Guard**: Verifies AI generated recommendations against raw candidate text (`SUPPORTED`, `INFERRED`, `SUGGESTED`, `UNSUPPORTED`).
4. **Relational Database Service**: Manages users, resumes, versions, job applications, analyses, and security audit logs in SQLite WAL persistence.
5. **Evaluation Benchmark Suite**: Evaluates extraction F1, matching F1, score MAE, and groundedness % over standard benchmark dataset.
