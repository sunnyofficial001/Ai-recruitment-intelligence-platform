/**
 * Automated Unit Tests for Hybrid ATS Scoring Engine
 * @license Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateDeterministicATSScore } from '../src/services/ats/scoringEngine';
import { normalizeResumeText } from '../src/services/parser/documentParser';
import { parseJobDescription } from '../src/services/parser/jobParser';

describe('Deterministic ATS Scoring Engine', () => {
  const sampleResumeText = `
ALEXANDER CHEN
Email: alex.chen@email.com | Phone: 555-0199
SUMMARY: Senior Backend Developer with 5 years experience building Python FastAPI microservices and PostgreSQL databases.
SKILLS: Python, FastAPI, PostgreSQL, Docker, Git, REST APIs
EXPERIENCE:
Senior Developer - Tech Corp | 2022 - Present
- Architected REST APIs using FastAPI and PostgreSQL scaling to 1M requests.
- Containerized services using Docker and Git.
EDUCATION:
B.S. in Computer Science - State University, 2020
  `;

  const sampleJobText = `
Position: Senior Software Backend Engineer (FastAPI & Python focus)
REQUIREMENTS:
- High proficiency in Python, FastAPI, PostgreSQL, and Docker.
- Strong Git and REST API design experience.
PREFERRED:
- Redis and Kubernetes experience.
  `;

  it('should calculate reproducible deterministic ATS scores', () => {
    const resume = normalizeResumeText(sampleResumeText);
    const jd = parseJobDescription(sampleJobText);

    const result1 = calculateDeterministicATSScore(resume, jd);
    const result2 = calculateDeterministicATSScore(resume, jd);

    // Reproducibility test: identical inputs MUST produce identical score breakdowns
    expect(result1.breakdown.overallScore).toEqual(result2.breakdown.overallScore);
    expect(result1.breakdown.skillAlignmentScore).toEqual(result2.breakdown.skillAlignmentScore);
    expect(result1.breakdown.overallScore).toBeGreaterThanOrEqual(60);
    expect(result1.breakdown.overallScore).toBeLessThanOrEqual(100);
  });

  it('should identify missing required vs preferred keyword gaps', () => {
    const resume = normalizeResumeText(sampleResumeText);
    const jd = parseJobDescription(sampleJobText);
    const { gaps } = calculateDeterministicATSScore(resume, jd);

    expect(Array.isArray(gaps)).toBe(true);
    // Should flag Redis / Kubernetes as preferred gaps
    const preferredGaps = gaps.filter(g => g.importance === 'preferred');
    expect(preferredGaps.length).toBeGreaterThan(0);
  });
});
