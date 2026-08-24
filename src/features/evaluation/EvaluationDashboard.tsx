/**
 * Human-Crafted AI Benchmark Evaluation Dashboard Component
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EvaluationReport } from '../../types/domain';
import { Play, CheckCircle2, AlertCircle, BarChart3, Database, ShieldCheck, Sparkles } from 'lucide-react';

export default function EvaluationDashboard() {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runEvaluation();
  }, []);

  const runEvaluation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/evaluations/run');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to run benchmark evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Intro Header */}
      <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Benchmark Suite & Accuracy Metrics</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
            AI Accuracy, Precision & Groundedness Metrics
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Evaluate skill extraction precision, candidate-job matching recall, score MAE, and evidence grounding against a documented 50+ resume-job dataset.
          </p>
        </div>

        <button
          onClick={runEvaluation}
          disabled={loading}
          className="btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
        >
          {loading ? (
            <span>Running Suite...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Benchmark Eval</span>
            </>
          )}
        </button>
      </div>

      {report && (
        <div className="space-y-8">
          {/* Key Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block">Skill Extraction F1</span>
              <p className="text-4xl font-extrabold font-heading text-emerald-400">{(report.skillExtractionF1 * 100).toFixed(0)}%</p>
              <div className="text-xs text-zinc-400 flex justify-between font-mono pt-1 border-t border-zinc-800">
                <span>Precision: {(report.skillExtractionPrecision * 100).toFixed(0)}%</span>
                <span>Recall: {(report.skillExtractionRecall * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block">Matching Accuracy F1</span>
              <p className="text-4xl font-extrabold font-heading text-white">{(report.matchingF1 * 100).toFixed(0)}%</p>
              <div className="text-xs text-zinc-400 font-mono pt-1 border-t border-zinc-800">
                <span>Harmonic Precision & Recall</span>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block">Score MAE (Mean Error)</span>
              <p className="text-4xl font-extrabold font-heading text-amber-400">{report.scoreMeanAbsoluteError} pts</p>
              <div className="text-xs text-zinc-400 font-mono pt-1 border-t border-zinc-800">
                <span>Vs Labeled Recruiter Score</span>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block">Groundedness Rate</span>
              <p className="text-4xl font-extrabold font-heading text-emerald-400">{report.groundednessPercentage}%</p>
              <div className="text-xs text-zinc-400 font-mono pt-1 border-t border-zinc-800">
                <span>Unsupported Claim Rate: {report.unsupportedClaimRate}%</span>
              </div>
            </div>
          </div>

          {/* Dataset Provenance Details */}
          <div className="glass-panel p-8 space-y-4">
            <h3 className="text-base font-bold font-heading text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Benchmark Dataset Provenance & Methodology</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300">
              <div className="space-y-2">
                <p className="font-bold text-white uppercase font-heading">Dataset Structure:</p>
                <p className="text-zinc-300 leading-relaxed">
                  The dataset (<code className="text-indigo-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-mono">data/benchmark_dataset.json</code>) contains 50+ anonymized real-world candidate resumes cross-audited against verified enterprise Job Descriptions across Backend Engineering, Frontend Development, DevOps/Cloud, and Growth Marketing.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white uppercase font-heading">Reproducibility & Zero Fabrication:</p>
                <p className="text-zinc-300 leading-relaxed">
                  Evaluations execute real parsing, skill extraction, deterministic scoring, and evidence verification. MAE is calculated by comparing predicted deterministic ATS scores against labeled human match scores.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
