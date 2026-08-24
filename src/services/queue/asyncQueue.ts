/**
 * Async Analysis Job Queue Processor with Stage Tracking
 * @license Apache-2.0
 */

export type JobStatus = 'PENDING' | 'PARSING' | 'EXTRACTING' | 'SCORING' | 'REASONING' | 'COMPLETED' | 'FAILED';

export interface AnalysisJob {
  jobId: string;
  userId: string;
  resumeName: string;
  status: JobStatus;
  progressPercent: number;
  stageMessage: string;
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const jobStore: Record<string, AnalysisJob> = {};

export function createAnalysisJob(userId: string, resumeName: string): AnalysisJob {
  const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const job: AnalysisJob = {
    jobId,
    userId,
    resumeName,
    status: 'PENDING',
    progressPercent: 0,
    stageMessage: 'Job queued for ingestion',
    createdAt: new Date().toISOString()
  };
  jobStore[jobId] = job;
  return job;
}

export function updateJobProgress(jobId: string, status: JobStatus, progressPercent: number, stageMessage: string): void {
  if (jobStore[jobId]) {
    jobStore[jobId].status = status;
    jobStore[jobId].progressPercent = progressPercent;
    jobStore[jobId].stageMessage = stageMessage;
  }
}

export function completeAnalysisJob(jobId: string, result: any): void {
  if (jobStore[jobId]) {
    jobStore[jobId].status = 'COMPLETED';
    jobStore[jobId].progressPercent = 100;
    jobStore[jobId].stageMessage = 'Analysis complete';
    jobStore[jobId].result = result;
    jobStore[jobId].completedAt = new Date().toISOString();
  }
}

export function failAnalysisJob(jobId: string, error: string): void {
  if (jobStore[jobId]) {
    jobStore[jobId].status = 'FAILED';
    jobStore[jobId].stageMessage = 'Analysis failed';
    jobStore[jobId].error = error;
    jobStore[jobId].completedAt = new Date().toISOString();
  }
}

export function getJobStatus(jobId: string): AnalysisJob | null {
  return jobStore[jobId] || null;
}
