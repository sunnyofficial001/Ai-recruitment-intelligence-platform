/**
 * Domain Models for AI Recruitment Intelligence & ATS Optimization Platform
 * @license Apache-2.0
 */

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  description: string[];
  skillsMentioned: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  gpa?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface NormalizedResume {
  rawText: string;
  contact: ContactInfo;
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
  languages: string[];
}

export interface ParsedJobDescription {
  rawText: string;
  title: string;
  company?: string;
  seniority?: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  requiredSkills: string[];
  preferredSkills: string[];
  yearsExperienceRequired?: number;
  educationRequired?: string;
  responsibilities: string[];
  domain?: string;
  toolsAndTech: string[];
  softSkills: string[];
  location?: string;
}

export type GroundingStatus = 'SUPPORTED' | 'INFERRED' | 'SUGGESTED' | 'UNSUPPORTED';

export interface KeywordGap {
  keyword: string;
  normalizedCategory: string;
  importance: 'required' | 'preferred';
  frequencyInJob: number;
  foundInResume: boolean;
  contextFound?: string;
  replacementSuggestion: string;
}

export interface ImprovementTip {
  section: string;
  status: 'critical' | 'warning' | 'optimal';
  critique: string;
  suggestion: string;
  grounding: GroundingStatus;
}

export interface InterviewPrepItem {
  id: string;
  category: 'Technical' | 'Behavioral' | 'System Design' | 'Project Deep Dive' | 'Weakness Area';
  question: string;
  rationale: string;
  sampleAnswer: string;
  resumeEvidenceUsed: string;
}

export interface ATSScoreBreakdown {
  overallScore: number;
  skillAlignmentScore: number;       // 30%
  semanticMatchScore: number;        // 20%
  experienceAlignmentScore: number;  // 15%
  resumeStructureScore: number;      // 10%
  sectionCompletenessScore: number;  // 10%
  achievementQualityScore: number;   // 10%
  educationAlignmentScore: number;   // 5%
}

export interface AnalysisResult {
  id: string;
  versionId?: string;
  userId?: string;
  timestamp: string;
  resumeName: string;
  resumeText: string;
  normalizedResume: NormalizedResume;
  jobTitle: string;
  jobDescriptionText: string;
  parsedJobDescription: ParsedJobDescription;
  atsScoreBreakdown: ATSScoreBreakdown;
  atsScore: number; // Overall score 0-100
  overallSummary: string;
  strengths: string[];
  gaps: KeywordGap[];
  improvements: ImprovementTip[];
  interviewPrep: InterviewPrepItem[];
  coverLetter: string;
  modelVersion: string;
  promptVersion: string;
  groundingVerificationRate: number; // % of claims that are supported
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  createdAt: string;
  resumeName: string;
  atsScore: number;
  skillsCount: number;
  gapsCount: number;
  notes?: string;
}

export type ApplicationStatus = 
  | 'Saved'
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobUrl?: string;
  appliedDate: string;
  status: ApplicationStatus;
  atsScore?: number;
  interviewStage?: string;
  notes?: string;
  resumeVersionUsed?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface EvaluationBenchmarkPair {
  id: string;
  resumeId: string;
  jobId: string;
  domain: string;
  candidateRole: string;
  targetRole: string;
  humanMatchCategory: 'STRONG_MATCH' | 'MODERATE_MATCH' | 'WEAK_MATCH';
  humanMatchScore: number;
  requiredSkills: string[];
  preferredSkills: string[];
  resumeText: string;
  jobDescriptionText: string;
}

export interface EvaluationReport {
  timestamp: string;
  datasetSize: number;
  skillExtractionPrecision: number;
  skillExtractionRecall: number;
  skillExtractionF1: number;
  matchingPrecision: number;
  matchingRecall: number;
  matchingF1: number;
  scoreMeanAbsoluteError: number;
  groundednessPercentage: number;
  unsupportedClaimRate: number;
}
