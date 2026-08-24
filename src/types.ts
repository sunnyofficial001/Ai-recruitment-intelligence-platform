/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeSnippet {
  filename: string;
  language: string;
  code: string;
}

export interface ArchitectureBlueprint {
  title: string;
  description: string;
  diagram: string;
  files: CodeSnippet[];
}

export interface ImprovementTip {
  section: string;
  status: 'critical' | 'warning' | 'optimal';
  critique: string;
  suggestion: string;
}

export interface KeywordGap {
  keyword: string;
  frequencyInJob: number;
  foundInResume: boolean;
  replacementSuggestion?: string;
}

export interface InterviewPrepItem {
  id: string;
  question: string;
  rationale: string;
  sampleAnswer: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  resumeName: string;
  resumeText: string;
  jobTitle: string;
  jobDescription?: string;
  atsScore: number;
  overallSummary: string;
  scoreBreakdowns: {
    keywordDensity: number;
    structuralClarity: number;
    experienceImpact: number;
    educationAlignment: number;
  };
  strengths: string[];
  gaps: KeywordGap[];
  improvements: ImprovementTip[];
  interviewPrep: InterviewPrepItem[];
  coverLetter?: string;
}

export interface APIErrorResponse {
  error: string;
  details?: string;
}
