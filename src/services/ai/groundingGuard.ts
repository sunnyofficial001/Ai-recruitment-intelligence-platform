/**
 * Evidence Grounding Guard & Hallucination Protection Engine
 * @license Apache-2.0
 */

import { GroundingStatus, ImprovementTip } from '../../types/domain';

/**
 * Verifies whether a generated statement is grounded in candidate raw resume text
 */
export function verifyGrounding(
  statement: string,
  rawResumeText: string
): GroundingStatus {
  if (!statement || !rawResumeText) return 'UNSUPPORTED';

  const lowerRaw = rawResumeText.toLowerCase();
  const lowerStatement = statement.toLowerCase();

  // Check if key nouns or metrics in statement appear in raw resume
  const metricsInStatement = statement.match(/\b\d+(?:%|\$|k|M|x)?\b/g) || [];
  
  if (metricsInStatement.length > 0) {
    let supportedMetrics = 0;
    for (const metric of metricsInStatement) {
      if (lowerRaw.includes(metric.toLowerCase())) {
        supportedMetrics++;
      }
    }
    if (supportedMetrics === metricsInStatement.length) {
      return 'SUPPORTED';
    } else if (supportedMetrics > 0) {
      return 'INFERRED';
    } else {
      return 'UNSUPPORTED';
    }
  }

  // Token word overlap check
  const words = lowerStatement.split(/\s+/).filter(w => w.length > 4);
  let overlapCount = 0;
  for (const w of words) {
    if (lowerRaw.includes(w)) {
      overlapCount++;
    }
  }

  const ratio = words.length > 0 ? overlapCount / words.length : 0;

  if (ratio >= 0.5) {
    return 'SUPPORTED';
  } else if (ratio >= 0.2) {
    return 'INFERRED';
  } else {
    return 'SUGGESTED';
  }
}

/**
 * Filters and tags AI generated improvement recommendations to prevent hallucinations
 */
export function sanitizeAndGuardImprovements(
  tips: ImprovementTip[],
  rawResumeText: string
): ImprovementTip[] {
  return tips.map(tip => {
    const status = verifyGrounding(tip.suggestion, rawResumeText);
    
    // If an improvement invents metric numbers not present in raw resume, sanitize text
    if (status === 'UNSUPPORTED') {
      return {
        ...tip,
        grounding: 'SUGGESTED' as GroundingStatus,
        suggestion: tip.suggestion.replace(/\b\d+%\b/g, '[measurable metric if supported]') + " (Note: Do not invent unverified metrics)."
      };
    }

    return {
      ...tip,
      grounding: status
    };
  });
}
