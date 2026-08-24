/**
 * Human-Crafted Executive Recruitment Scorecard & Report Component
 * @license Apache-2.0
 */

import React, { useState } from "react";
import { AnalysisResult, KeywordGap, ImprovementTip, InterviewPrepItem } from "../types/domain";
import { 
  ShieldCheck, AlertTriangle, Copy, Check, Sparkles, 
  MessageSquare, BookOpen, Layers, CheckCircle2, FileText, ChevronRight, Target, Award
} from "lucide-react";

interface AnalysisReportProps {
  report: AnalysisResult;
}

export default function AnalysisReport({ report }: AnalysisReportProps) {
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [selectedTipId, setSelectedTipId] = useState<number | null>(0);
  const [activePrepId, setActivePrepId] = useState<string | null>(
    report.interviewPrep?.[0]?.id || null
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2000);
  };

  const getStatusBadge = (status: 'critical' | 'warning' | 'optimal') => {
    switch (status) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'optimal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const scoreLabels = [
    { key: "skillAlignment", label: "Skill Taxonomy Match", val: report.atsScoreBreakdown?.skillAlignmentScore || (report as any).scoreBreakdowns?.keywordDensity || 75 },
    { key: "semanticMatch", label: "Semantic Vector Alignment", val: report.atsScoreBreakdown?.semanticMatchScore || 70 },
    { key: "experienceImpact", label: "Experience Impact & Tenure", val: report.atsScoreBreakdown?.experienceAlignmentScore || (report as any).scoreBreakdowns?.experienceImpact || 65 },
    { key: "structure", label: "Resume Formatting & Layout", val: report.atsScoreBreakdown?.resumeStructureScore || (report as any).scoreBreakdowns?.structuralClarity || 85 },
    { key: "achievements", label: "Quantified Metrics & Scale", val: report.atsScoreBreakdown?.achievementQualityScore || 60 },
    { key: "education", label: "Education & Credentials", val: report.atsScoreBreakdown?.educationAlignmentScore || (report as any).scoreBreakdowns?.educationAlignment || 80 },
  ];

  const strokeDashoffset = 283 - (283 * (report.atsScore || 75)) / 100;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      
      {/* Executive Score & Recruiter Assessment Hero Panel */}
      <div className="glass-panel p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-gradient-to-br from-zinc-900/90 via-slate-900/80 to-zinc-950/90">
        
        {/* Circular SVG Gauge Score Indicator */}
        <div className="md:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-zinc-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold tracking-tight font-heading text-white">{report.atsScore}%</span>
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase mt-0.5">Match Fit</span>
            </div>
          </div>
          
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-mono">ATS Audit Status</h4>
          <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider border inline-block ${
            report.atsScore >= 80 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : report.atsScore >= 60 
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {report.atsScore >= 80 ? "Executive Approved" : report.atsScore >= 60 ? "Requires Indexing Optimization" : "Fails Initial Screen"}
          </span>

          <div className="mt-6 w-full space-y-1 text-left font-mono text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-4">
            <p>TARGET ROLE: {report.jobTitle}</p>
            <p>INGESTED FILE: {report.resumeName}</p>
            <p>ENGINE: DETERMINISTIC HYBRID ATS</p>
          </div>
        </div>

        {/* Overall Executive Verdict & Strengths */}
        <div className="md:col-span-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Grounded Recruiter Analysis</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
              {report.jobTitle} Candidate Alignment Audit
            </h2>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed">
            {report.overallSummary}
          </p>

          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Verified Candidate Competitive Strengths:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.strengths?.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-800 text-xs text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: ATS Breakdown Dimensions & Improvement Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Dimensions Progress Bars Card */}
        <div className="glass-panel p-8 space-y-6">
          <h3 className="text-base font-bold font-heading text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Deterministic ATS Dimensions</span>
          </h3>

          <div className="space-y-5">
            {scoreLabels.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-zinc-300">{item.label}</span>
                  <span className="text-white font-bold font-mono">{item.val}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-zinc-900/60 p-4 border border-zinc-800 text-xs text-zinc-400 leading-relaxed font-mono">
            CALIBRATION: Weighted mathematical score combining exact skill match density (30%), vector cosine similarity (20%), tenure (15%), layout (10%), completeness (10%), metrics (10%), education (5%).
          </div>
        </div>

        {/* Actionable Recommendations Log */}
        <div className="glass-panel p-8 space-y-6">
          <h3 className="text-base font-bold font-heading text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span>Grounded Actionable Optimization Log</span>
          </h3>

          {report.improvements?.length === 0 ? (
            <p className="text-zinc-500 text-xs py-12 text-center">No structural optimizations required. Excellent layout!</p>
          ) : (
            <div className="space-y-3">
              {report.improvements?.map((tip, idx) => {
                const isActive = selectedTipId === idx;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedTipId(idx)}
                    className={`rounded-xl border transition-all p-4 cursor-pointer text-xs ${
                      isActive 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-white" 
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1.5">
                      <span className="font-heading">{tip.section}</span>
                      <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${getStatusBadge(tip.status)}`}>
                        {tip.status}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-zinc-300">
                      {tip.critique}
                    </p>

                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-zinc-800 text-xs space-y-2 text-zinc-200">
                        <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Step-by-Step Resolution Path:</p>
                        <p className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-white font-mono text-[11px] leading-relaxed">
                          {tip.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Keyword Gaps Matrix Table */}
      <div className="glass-panel p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold font-heading text-white">
            Keyword Taxonomy & Skill Gap Matrix
          </h3>
          <span className="text-xs text-zinc-400 font-mono">TARGET BENCHMARKS</span>
        </div>

        {report.gaps?.length === 0 ? (
          <p className="text-zinc-500 text-xs py-10 text-center font-mono">Optimal keyword density detected! Your resume possesses all standard technical keywords listed in the job description.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase">
                  <th className="pb-3 font-semibold">Target Skill / Keyword</th>
                  <th className="pb-3 text-center font-semibold">Requirement Importance</th>
                  <th className="pb-3 text-center font-semibold">Audit Detection</th>
                  <th className="pb-3 font-semibold">Grounded Integration Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {report.gaps.map((gap, idx) => (
                  <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 font-mono">
                    <td className="py-3.5 font-bold text-white text-sm">{gap.keyword}</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        gap.importance === 'required' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {gap.importance}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        gap.foundInResume 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {gap.foundInResume ? "DETECTED" : "MISSING"}
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-300 leading-relaxed font-sans text-xs max-w-md">
                      {gap.replacementSuggestion || `Incorporate '${gap.keyword}' into your Experience section bullet.`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STAR Interview Preparation Coach & Cover Letter Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* STAR Coach System */}
        <div className="lg:col-span-6 glass-panel p-8 space-y-6">
          <h3 className="text-base font-bold font-heading text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span>Grounded STAR Interview Preparation Coach</span>
          </h3>

          <div className="space-y-3">
            {report.interviewPrep?.map((item) => {
              const isOpen = activePrepId === item.id;
              return (
                <div key={item.id} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
                  <button
                    onClick={() => setActivePrepId(isOpen ? null : item.id)}
                    className="w-full text-left p-4 flex justify-between items-start gap-3 focus:outline-none hover:bg-zinc-900/80 transition-all cursor-pointer rounded-xl"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                        [{item.category || 'Technical'}] Question
                      </span>
                      <p className="text-xs font-semibold text-white leading-relaxed">{item.question}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-zinc-400 shrink-0 mt-1 transition-transform ${isOpen ? "transform rotate-90 text-white" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 border-t border-zinc-800 text-xs space-y-3 font-sans text-zinc-300 animate-fadeIn">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Interviewer Rationale:</span>
                        <p className="text-zinc-300 text-xs mt-0.5">{item.rationale}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Recommended STAR Script:</span>
                        <div className="rounded-xl bg-zinc-950 p-3.5 border border-zinc-800 text-zinc-100 whitespace-pre-wrap font-mono text-[11px] leading-relaxed mt-1 select-all">
                          {item.sampleAnswer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tailored Cover Letter Generator */}
        <div className="lg:col-span-6 glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>Tailored Cover Letter Outline</span>
            </h3>
            
            <button
              onClick={() => copyToClipboard(report.coverLetter || "")}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold px-3 py-1.5 transition-all cursor-pointer shadow-sm"
            >
              {copiedCoverLetter ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Letter</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl bg-zinc-950 p-6 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap select-all max-h-[460px] overflow-y-auto border border-zinc-800/80">
            {report.coverLetter || "No cover letter template was supplied for this run."}
          </div>
        </div>

      </div>

    </div>
  );
}
