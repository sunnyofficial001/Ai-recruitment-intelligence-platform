/**
 * Automated Unit Tests for Grounding Verification & Hallucination Guard
 * @license Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { verifyGrounding, sanitizeAndGuardImprovements } from '../src/services/ai/groundingGuard';
import { ImprovementTip } from '../src/types/domain';

describe('Evidence Grounding & Hallucination Guard', () => {
  const rawResume = `
SARAH CONNOR
Growth Marketer with experience managing Google Analytics 4 and HubSpot workflows.
Scaled web traffic by 140% and lowered CAC by 30%.
  `;

  it('should mark supported claims as SUPPORTED', () => {
    const status = verifyGrounding('Scaled web traffic by 140%', rawResume);
    expect(status).toBe('SUPPORTED');
  });

  it('should detect unverified metric hallucinations as UNSUPPORTED', () => {
    const status = verifyGrounding('Increased company annual revenue by 95%', rawResume);
    expect(status).toBe('UNSUPPORTED');
  });

  it('should sanitize unsupported recommendations', () => {
    const tips: ImprovementTip[] = [
      {
        section: 'Experience',
        status: 'warning',
        critique: 'Lacks detail',
        suggestion: 'Increased conversion by 85%',
        grounding: 'SUPPORTED'
      }
    ];

    const sanitized = sanitizeAndGuardImprovements(tips, rawResume);
    expect(sanitized[0].grounding).toBe('SUGGESTED');
    expect(sanitized[0].suggestion).toContain('Do not invent unverified metrics');
  });
});
