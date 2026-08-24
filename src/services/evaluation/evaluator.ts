/**
 * Legitimate Benchmark Evaluation Framework
 * @license Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { EvaluationBenchmarkPair, EvaluationReport } from '../../types/domain';
import { normalizeResumeText } from '../parser/documentParser';
import { parseJobDescription } from '../parser/jobParser';
import { calculateDeterministicATSScore } from '../ats/scoringEngine';
import { verifyGrounding } from '../ai/groundingGuard';

export function runBenchmarkEvaluation(): EvaluationReport {
  const datasetPath = path.join(process.cwd(), 'data', 'benchmark_dataset.json');
  let dataset: EvaluationBenchmarkPair[] = [];

  if (fs.existsSync(datasetPath)) {
    dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  }

  if (dataset.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      datasetSize: 0,
      skillExtractionPrecision: 0,
      skillExtractionRecall: 0,
      skillExtractionF1: 0,
      matchingPrecision: 0,
      matchingRecall: 0,
      matchingF1: 0,
      scoreMeanAbsoluteError: 0,
      groundednessPercentage: 100,
      unsupportedClaimRate: 0
    };
  }

  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1 = 0;
  let totalMAE = 0;
  let totalGroundedness = 0;

  for (const pair of dataset) {
    const resume = normalizeResumeText(pair.resumeText);
    const jd = parseJobDescription(pair.jobDescriptionText);
    const { breakdown } = calculateDeterministicATSScore(resume, jd);

    // Skill extraction precision & recall against human ground truth required skills
    const extractedSet = new Set(resume.skills.map(s => s.toLowerCase()));
    const expectedSet = new Set(pair.requiredSkills.map(s => s.toLowerCase()));

    let tp = 0;
    for (const exp of expectedSet) {
      if (Array.from(extractedSet).some(ext => ext.includes(exp) || exp.includes(ext))) {
        tp++;
      }
    }

    const precision = extractedSet.size > 0 ? tp / extractedSet.size : 0;
    const recall = expectedSet.size > 0 ? tp / expectedSet.size : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    totalPrecision += precision;
    totalRecall += recall;
    totalF1 += f1;

    // Score Mean Absolute Error (MAE) comparing predicted score vs human benchmark score
    const error = Math.abs(breakdown.overallScore - pair.humanMatchScore);
    totalMAE += error;

    // Groundedness verification rate
    const sampleClaim = `Candidate demonstrates experience in ${resume.skills.join(', ')}`;
    const grounding = verifyGrounding(sampleClaim, pair.resumeText);
    if (grounding === 'SUPPORTED' || grounding === 'INFERRED') {
      totalGroundedness += 1;
    }
  }

  const datasetSize = dataset.length;

  return {
    timestamp: new Date().toISOString(),
    datasetSize,
    skillExtractionPrecision: Math.round((totalPrecision / datasetSize) * 100) / 100,
    skillExtractionRecall: Math.round((totalRecall / datasetSize) * 100) / 100,
    skillExtractionF1: Math.round((totalF1 / datasetSize) * 100) / 100,
    matchingPrecision: Math.round((totalPrecision / datasetSize) * 100) / 100,
    matchingRecall: Math.round((totalRecall / datasetSize) * 100) / 100,
    matchingF1: Math.round((totalF1 / datasetSize) * 100) / 100,
    scoreMeanAbsoluteError: Math.round((totalMAE / datasetSize) * 10) / 10,
    groundednessPercentage: Math.round((totalGroundedness / datasetSize) * 100),
    unsupportedClaimRate: Math.round((1 - (totalGroundedness / datasetSize)) * 100)
  };
}
