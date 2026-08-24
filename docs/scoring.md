# Deterministic ATS Scoring Methodology

## Scoring Model Breakdown
The ATS Score (0–100) is calculated deterministically through transparent mathematical formulas rather than raw LLM generation.

| Dimension | Weight | Description |
|---|---|---|
| **Skill Alignment** | **30%** | Exact & taxonomy-normalized match against required/preferred skills |
| **Semantic Similarity** | **20%** | Term frequency & cosine vector similarity between candidate experience and job description |
| **Experience Alignment** | **15%** | Career tenure, role titles, and section density |
| **Resume Structure** | **10%** | Layout parsing quality, contact completeness, skills organization |
| **Section Completeness** | **10%** | Presence of core sections (Summary, Skills, Experience, Education) |
| **Achievement Quality** | **10%** | Quantified metric indicators (%, $, numbers, impact scale) |
| **Education Alignment** | **5%** | Degree matching and institutional credentials |

## Formula
$$\text{Overall ATS Score} = \sum_{i=1}^{7} w_i \times S_i$$

Where $w_i$ represents component weight and $S_i$ represents normalized component score (0–100).

## Reproducibility Guarantee
Identical resume text and job description inputs will always produce the exact same numerical ATS score breakdown.
