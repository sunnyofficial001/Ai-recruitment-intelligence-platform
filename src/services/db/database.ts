/**
 * Relational Database Persistence Service (SQLite / PostgreSQL abstraction)
 * @license Apache-2.0
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  UserAccount, 
  NormalizedResume, 
  ParsedJobDescription, 
  AnalysisResult, 
  JobApplication, 
  ResumeVersion 
} from '../../types/domain';

const DB_PATH = path.join(process.cwd(), '.resume_platform.db');
let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      normalized_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resume_versions (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      ats_score INTEGER NOT NULL,
      skills_count INTEGER NOT NULL,
      gaps_count INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT,
      raw_text TEXT NOT NULL,
      parsed_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resume_id TEXT,
      job_id TEXT,
      resume_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      ats_score INTEGER NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      job_url TEXT,
      applied_date TEXT NOT NULL,
      status TEXT NOT NULL,
      ats_score INTEGER,
      interview_stage TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event TEXT NOT NULL,
      request_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_versions_resume ON resume_versions(resume_id);
  `);

  // Seed default admin/demo user if missing
  const adminCheck = database.prepare('SELECT id FROM users WHERE email = ?').get('demo@platform.ai');
  if (!adminCheck) {
    database.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'usr_demo_admin',
      'demo@platform.ai',
      '$2a$10$wE8Pq4V0s9X.0uU0cW.wuuX6w3yT/R0xXvYq4O.m9f1/Y2N5jZt1a', // password: 'demoPassword123'
      'Demo Recruiter',
      'admin',
      new Date().toISOString()
    );
  }
}

// Data Access Methods

export function saveAnalysisToDB(userId: string, result: AnalysisResult): void {
  const database = getDB();
  database.prepare(`
    INSERT OR REPLACE INTO analyses (id, user_id, resume_name, job_title, ats_score, result_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    result.id,
    userId,
    result.resumeName,
    result.jobTitle,
    result.atsScore,
    JSON.stringify(result),
    result.timestamp
  );
}

export function getAnalysesFromDB(userId: string): AnalysisResult[] {
  const database = getDB();
  const rows = database.prepare('SELECT result_json FROM analyses WHERE user_id = ? ORDER BY created_at DESC').all(userId) as { result_json: string }[];
  return rows.map(r => JSON.parse(r.result_json));
}

export function deleteAnalysisFromDB(userId: string, analysisId: string): void {
  const database = getDB();
  database.prepare('DELETE FROM analyses WHERE id = ? AND user_id = ?').run(analysisId, userId);
}

// Applications Access Methods
export function getApplicationsFromDB(userId: string): JobApplication[] {
  const database = getDB();
  return database.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC').all(userId) as JobApplication[];
}

export function saveApplicationToDB(userId: string, app: JobApplication): JobApplication {
  const database = getDB();
  database.prepare(`
    INSERT OR REPLACE INTO applications (id, user_id, company, role, job_url, applied_date, status, ats_score, interview_stage, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    app.id,
    userId,
    app.company,
    app.role,
    app.jobUrl || '',
    app.appliedDate,
    app.status,
    app.atsScore || 0,
    app.interviewStage || '',
    app.notes || '',
    app.appliedDate || new Date().toISOString()
  );
  return app;
}

export function deleteApplicationFromDB(userId: string, id: string): void {
  const database = getDB();
  database.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?').run(id, userId);
}

// Resume Versions Access Methods
export function getResumeVersionsFromDB(resumeId: string): ResumeVersion[] {
  const database = getDB();
  return database.prepare('SELECT * FROM resume_versions WHERE resume_id = ? ORDER BY version_number DESC').all(resumeId) as ResumeVersion[];
}

export function saveResumeVersionToDB(version: ResumeVersion): void {
  const database = getDB();
  database.prepare(`
    INSERT INTO resume_versions (id, resume_id, version_number, ats_score, skills_count, gaps_count, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    version.id,
    version.resumeId,
    version.versionNumber,
    version.atsScore,
    version.skillsCount,
    version.gapsCount,
    version.notes || '',
    version.createdAt
  );
}

export function logAuditEvent(userId: string | null, event: string, requestId?: string, details?: any): void {
  try {
    const database = getDB();
    database.prepare(`
      INSERT INTO audit_logs (id, user_id, event, request_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId || 'anonymous',
      event,
      requestId || '',
      JSON.stringify(details || {}),
      new Date().toISOString()
    );
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
