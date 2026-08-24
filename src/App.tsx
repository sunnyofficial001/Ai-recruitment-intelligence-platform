/**
 * Main Application Component Entrypoint
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar, { ActiveTab } from './components/Navbar';
import Dashboard from './components/Dashboard';
import AnalysisReport from './components/AnalysisReport';
import Blueprints from './components/Blueprints';
import ResumeComparer from './features/versioning/ResumeComparer';
import ApplicationTracker from './features/tracker/ApplicationTracker';
import EvaluationDashboard from './features/evaluation/EvaluationDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AnalysisResult } from './types/domain';
import { AlertCircle, Info, Cpu, Database } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('scanner');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKeyProvisioned, setApiKeyProvisioned] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const info = await res.json();
        setApiKeyProvisioned(info.services?.aiProvider?.status !== 'Offline / Fallback');
      }
    } catch (err) {
      console.error('Failed checking server health:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/analyses');
      if (res.ok) {
        const logs = await res.json();
        setHistory(logs);
        if (logs.length > 0 && !activeAnalysis) {
          setActiveAnalysis(logs[0]);
        }
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
    }
  };

  const handleAnalyze = async (resumeText: string, jobDescription: string, resumeName: string) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch('/api/v1/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          resumeName,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || errorData.details || 'Failed processing analysis.');
      }

      const freshResponse: AnalysisResult = await res.json();
      
      setHistory((prev) => [freshResponse, ...prev]);
      setActiveAnalysis(freshResponse);
      
      setCurrentTab('scanner');
      setTimeout(() => {
        const reportEl = document.getElementById('ats-scorecard-section-anchor');
        if (reportEl) {
          reportEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'An unresolved error occurred during ATS calculation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/analyses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updatedLogs = history.filter((record) => record.id !== id);
        setHistory(updatedLogs);
        if (activeAnalysis?.id === id) {
          setActiveAnalysis(updatedLogs[0] || null);
        }
      }
    } catch (err) {
      console.error('Failed removing target scan session:', err);
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen font-sans flex flex-col justify-between selection:bg-white selection:text-black">
          
          {/* Header System */}
          <Navbar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            apiKeyProvisioned={apiKeyProvisioned} 
          />

          {/* Main Layout Grid */}
          <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
            
            {currentTab === 'scanner' && (
              <div className="space-y-12">
                {/* Header Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-8 gap-6">
                  <div className="max-w-2xl space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                      <span>Hybrid ATS Engine & Skill Intelligence</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white tracking-tight">
                      Recruitment Intelligence <br/><span className="text-gradient">& ATS Optimizer</span>
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Multi-format resume ingestion (PDF, DOCX, TXT), taxonomy skill mapping, and deterministic ATS match scoring with evidence grounding.
                    </p>
                  </div>

                  {activeAnalysis && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel bg-indigo-950/20 border-indigo-500/30">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-2xl text-white font-heading shadow-md shadow-indigo-500/30">
                        {activeAnalysis.atsScore}%
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white uppercase block">Active Scorecard Fit</span>
                        <span className="text-xs text-indigo-300 font-mono">{activeAnalysis.jobTitle}</span>
                      </div>
                    </div>
                  )}
                </div>

                {serverError && (
                  <div className="bg-red-950/40 border-2 border-red-900 p-6 flex gap-4 text-red-200">
                    <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                    <div className="text-xs font-mono space-y-2">
                      <p className="font-black uppercase tracking-wider text-sm text-white">ANALYSIS FAULT DETECTED</p>
                      <p className="opacity-90">{serverError}</p>
                    </div>
                  </div>
                )}

                {/* Dashboard Input */}
                <Dashboard 
                  onAnalyze={handleAnalyze} 
                  loading={loading} 
                  history={history} 
                  onSelectHistory={setActiveAnalysis} 
                  onDeleteHistory={handleDeleteHistory}
                  activeAnalysis={activeAnalysis}
                />

                {/* Scorecard Anchor */}
                {activeAnalysis && (
                  <div id="ats-scorecard-section-anchor" className="pt-8 border-t border-zinc-900 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-white" />
                      <h3 className="text-sm font-black tracking-widest uppercase font-mono text-zinc-400">
                        EXPLAINABLE DETERMINISTIC AUDIT SCORECARD
                      </h3>
                    </div>
                    
                    <AnalysisReport report={activeAnalysis} />
                  </div>
                )}
              </div>
            )}

            {currentTab === 'versioning' && (
              <ResumeComparer history={history} />
            )}

            {currentTab === 'tracker' && (
              <ApplicationTracker />
            )}

            {currentTab === 'evaluation' && (
              <EvaluationDashboard />
            )}

            {currentTab === 'blueprints' && (
              <Blueprints />
            )}

          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-900 bg-black py-8 mt-16 font-mono text-[10px] tracking-widest text-zinc-500 font-bold uppercase">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-6 justify-center">
                <span>SQLITE WAL PERSISTENCE</span>
                <span>DETERMINISTIC ATS HYBRID ENGINE</span>
                <span>GROUNDED EVIDENCE GUARD</span>
                <span>AI EVALUATION SUITE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-zinc-400 font-bold tracking-wider">RECRUITMENT INTELLIGENCE ONLINE</span>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
