/**
 * Human-Crafted SaaS Recruiter Dashboard & Ingestion Component
 * @license Apache-2.0
 */

import React, { useState } from "react";
import { Upload, FileText, Briefcase, Play, History, Trash2, Calendar, FileDown, AlertTriangle, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { AnalysisResult } from "../types/domain";

interface DashboardProps {
  onAnalyze: (resumeText: string, jobDescription: string, resumeName: string) => Promise<void>;
  loading: boolean;
  history: AnalysisResult[];
  onSelectHistory: (result: AnalysisResult) => void;
  onDeleteHistory: (id: string) => Promise<void>;
  activeAnalysis: AnalysisResult | null;
}

const SAMPLE_RESUMES = {
  software: {
    title: "Senior Backend Developer",
    name: "Alex_Chen_Resume.pdf",
    text: `ALEXANDER CHEN
Email: alex.chen@email.com | Phone: 555-0199 | Location: San Francisco, CA | GitHub: github.com/alexchen

PROFESSIONAL SUMMARY
Senior Backend Engineer with 5+ years of experience designing scalable microservices in Python, FastAPI, and PostgreSQL. Proven track record scaling async pipelines and containerized deployments.

TECHNICAL SKILLS
Languages: Python, TypeScript, SQL, Bash
Frameworks & Databases: FastAPI, Django, PostgreSQL, Redis, SQLAlchemy, Docker, Kubernetes, Git, REST APIs, GraphQL

PROFESSIONAL EXPERIENCE
Senior Backend Engineer - CloudScale Inc. | 2022 - Present
- Architected asynchronous REST microservices using Python 3.11 and FastAPI, handling 5M+ daily requests.
- Optimized PostgreSQL database connection pooling and indexed JSONB columns, reducing query latency by 45%.
- Containerized applications with Docker and automated CI/CD deployment pipelines using GitHub Actions.

Software Engineer - DataTech Solutions | 2020 - 2022
- Developed Python background workers using Celery and Redis message queues for automated document parsing.
- Refactored legacy monolithic services into asynchronous REST APIs.

EDUCATION
B.S. in Computer Science - UC Berkeley, 2020`,
    jd: `Position: Senior Software Backend Engineer (FastAPI & Python focus)
We are seeking an experienced Backend Engineer to scale asynchronous distributed workflows.

REQUIRED SKILLS & QUALIFICATIONS:
- High proficiency in Python 3.10+, FastAPI framework, and SQLAlchemy ORM.
- Database design utilizing PostgreSQL (indexes, connection pooling).
- Proficient in microservices, Docker containers, and async task execution.
- Strong knowledge of Git version control, CI/CD pipelines, and automated testing.`
  },
  marketing: {
    title: "Growth Marketing Lead",
    name: "Sarah_Connor_Marketing.pdf",
    text: `SARAH CONNOR - MARKETING CONSULTANT
Email: s.connor@agency.com | Location: San Francisco, CA | LinkedIn: linkedin.com/in/sarahconnor

PROFESSIONAL SUMMARY
Data-driven Growth Marketing Strategist with 5+ years driving customer acquisition, product positioning, and conversion rate optimization (CRO). Specialized in organic search (SEO), GA4 analytics, and HubSpot automation.

CORE SKILLS
Growth Marketing: Lead Acquisition, Conversion Rate Optimization, A/B Testing, CAC Reduction, Attribution
MarTech Tools: HubSpot CRM, Google Analytics 4, Google Tag Manager, Semrush, Meta Ads, SQL

PROFESSIONAL EXPERIENCE
Growth Marketing Manager - Apex SaaS Corp | 2022 - Present
- Engineered organic growth strategy, scaling web traffic by 140% and increasing product signups by 68%.
- Managed HubSpot automated workflows, boosting outbound lead conversions by 22%.
- Owned $50k monthly advertising budget across Google and Meta, lowering average CAC by 30%.

EDUCATION
B.B.A. in Marketing - UC Berkeley, 2022`,
    jd: `Position: Lead Growth Marketing Manager
Seeking a metric-driven Lead Growth Marketer to own conversion pipelines.

KEY RESPONSIBILITIES & SKILLS:
- Leverage GA4 (Google Analytics) and Tag Manager to optimize conversion funnels.
- Manage automated outbound marketing workflows inside HubSpot.
- Lower CAC by executing rapid A/B testing cycles.
- Experience managing advertising budgets across Google and Meta.`
  }
};

export default function Dashboard({
  onAnalyze,
  loading,
  history,
  onSelectHistory,
  onDeleteHistory,
  activeAnalysis
}: DashboardProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeName, setResumeName] = useState("my_resume.pdf");
  const [dragActive, setDragActive] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");
  const [parsingFile, setParsingFile] = useState(false);

  const handleFileUpload = async (file: File) => {
    setParsingFile(true);
    setResumeName(file.name);
    setErrorLocal("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/resumes/parse-file", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Document parsing failed.");
      }

      const result = await res.json();
      setResumeText(result.rawText);
    } catch (err: any) {
      console.error("File upload error:", err);
      setErrorLocal(`File parsing notice: ${err.message}`);
    } finally {
      setParsingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const loadTemplate = (type: "software" | "marketing") => {
    const sample = SAMPLE_RESUMES[type];
    setResumeText(sample.text);
    setJobDescription(sample.jd);
    setResumeName(sample.name);
    setErrorLocal("");
  };

  const triggerAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      setErrorLocal("Please upload a resume or paste text with at least 20 characters before executing analysis.");
      return;
    }
    setErrorLocal("");
    await onAnalyze(resumeText, jobDescription, resumeName);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100">
      
      {/* Primary Input & Drop Zone Column */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Hero Card with Preset Loaders */}
        <div className="glass-panel p-8 relative overflow-hidden bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-zinc-900/40">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Sandbox Presets</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
              Instant Sample Benchmark Loaders
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Experience deterministic ATS match scoring, skill taxonomy extraction, and grounded AI recommendations instantly with pre-calibrated role profiles.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => loadTemplate("software")}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Load Preset: Senior Backend Developer</span>
              </button>
              <button
                onClick={() => loadTemplate("marketing")}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/20"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Load Preset: Growth Marketing Lead</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input Controls Card */}
        <div className="glass-panel p-8 space-y-8">
          
          {/* File Upload Zone */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Ingest Resume Document</span>
              </h3>
              <span className="text-xs text-zinc-500 font-mono">ACCEPTED: PDF, DOCX, TXT</span>
            </div>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-700/80 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/70"
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload-input" className="w-full cursor-pointer">
                <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Drag & Drop Resume (PDF, DOCX, TXT) or <span className="text-indigo-400 underline font-bold">Browse Disk</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Multi-format server ingestion engine with section normalization
                </p>
              </label>

              {parsingFile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium animate-pulse">
                  <span>Parsing document text on server...</span>
                </div>
              )}

              {resumeName && !parsingFile && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACTIVE FILE: {resumeName}</span>
                </div>
              )}
            </div>

            {/* Resume Content Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Resume Raw Text Stream
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or review raw resume content (work experiences, skills, education)..."
                rows={9}
                className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 text-xs font-code text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Job Description Input */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Target Job Description (Benchmark)</span>
              </h3>
              <span className="text-xs text-zinc-500 font-mono">REQUIREMENTS MAP</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job requirements or responsibilities to benchmark candidate fit against..."
              rows={6}
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 text-xs font-code text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {errorLocal && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex gap-3 text-red-300 text-xs font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              <div>
                <p className="font-bold uppercase text-red-400">Notice</p>
                <p className="mt-0.5">{errorLocal}</p>
              </div>
            </div>
          )}

          {/* Primary Submit CTA */}
          <button
            onClick={triggerAnalyze}
            disabled={loading}
            className={`w-full py-4 text-sm font-semibold rounded-xl btn-primary transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loading ? "opacity-75 cursor-wait" : ""
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Evaluating ATS Match Fit & Skill Taxonomy...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Hybrid ATS Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* History Sidebar Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Scan History</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              {history.length} Scans
            </span>
          </div>

          {history.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 p-4 space-y-3">
              <FileDown className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-xs font-semibold text-zinc-400 uppercase">No Previous Scans Found</p>
              <p className="text-xs text-zinc-500">Your analysis reports will be automatically saved securely in your SQLite database.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {history.map((record) => {
                const isActive = activeAnalysis?.id === record.id;
                return (
                  <div
                    key={record.id}
                    onClick={() => onSelectHistory(record)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex relative ${
                      isActive
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/70"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          record.atsScore >= 80 
                            ? "bg-emerald-400" 
                            : record.atsScore >= 60 
                            ? "bg-amber-400" 
                            : "bg-red-400"
                        }`} />
                        <span className={`text-xs font-bold truncate block ${isActive ? "text-indigo-300" : "text-zinc-200"}`}>
                          {record.jobTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {record.resumeName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-0.5">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase ${
                        record.atsScore >= 80 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : record.atsScore >= 60 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {record.atsScore}% FIT
                      </span>
                      
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await onDeleteHistory(record.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 border border-zinc-700 transition-all cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
