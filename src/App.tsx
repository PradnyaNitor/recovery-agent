import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle, FilePlus, RefreshCcw, ShieldAlert, ShieldCheck, Sparkles, UploadCloud, BarChart3, FileSpreadsheet, Home, Users, User, LogOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  disputePackets,
  evidenceRequirements,
  issueMetadata,
  issueSteps,
  issueFinalNotes,
  transactionData,
  trackerStages,
  IssueType,
} from './data/appData';
import {
  maskEmail as maskEmailHelper,
  getLikelihoodColor as getLikelihoodColorHelper,
  createUploadId as createUploadIdHelper,
  formatCaseId as formatCaseIdHelper,
  generateDiagnosis as generateDiagnosisHelper,
} from './utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UploadItem {
  id: string;
  file: File;
  status: 'uploading' | 'verifying' | 'verified';
}

interface Case {
  id: string;
  issueType: IssueType;
  status: 'open' | 'escalated' | 'resolved';
  stage: number;
  createdAt: string;
  resolvedAt?: string;
  diagnosis?: any;
  evidenceCount: number;
  reportId?: string | null;
}

type ViewMode = 'flow' | 'dashboard';
type Persona = 'customer' | 'support';

const stepIndices = issueSteps.map((title, index) => ({ title, index }));

function App() {
  const [persona, setPersona] = useState<Persona | null>(() => {
    const saved = localStorage.getItem('active-persona');
    return (saved as Persona) || null;
  });
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('recovery-cases');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [chatResponse, setChatResponse] = useState('Select an issue type to begin your recovery case.');
  const [selectedTransactionIndex, setSelectedTransactionIndex] = useState<number | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [skippedEvidence, setSkippedEvidence] = useState(false);
  const [diagnosis, setDiagnosis] = useState<ReturnType<typeof generateDiagnosisHelper> | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [caseId] = useState(formatCaseIdHelper());
  const [trackerStage, setTrackerStage] = useState(0);
  const [refineText, setRefineText] = useState('');
  const [reportId, setReportId] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [caseClosed, setCaseClosed] = useState(false);

  // Save cases to localStorage whenever cases change
  useEffect(() => {
    localStorage.setItem('recovery-cases', JSON.stringify(cases));
  }, [cases]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const total = cases.length;
    const open = cases.filter(c => c.status === 'open').length;
    const escalated = cases.filter(c => c.status === 'escalated').length;
    const resolved = cases.filter(c => c.status === 'resolved').length;
    const avgResolutionTime = resolved > 0 
      ? cases
          .filter(c => c.resolvedAt)
          .reduce((acc, c) => {
            const created = new Date(c.createdAt).getTime();
            const resolved = new Date(c.resolvedAt!).getTime();
            return acc + (resolved - created);
          }, 0) / resolved / (1000 * 60 * 60 * 24) // Convert to days
      : 0;
    
    const successRate = total > 0 ? (resolved / total) * 100 : 0;
    
    return { total, open, escalated, resolved, avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, successRate: Math.round(successRate) };
  }, [cases]);

  const currentIssue = selectedIssue ? issueMetadata[selectedIssue] : null;
  const transactions = selectedIssue ? transactionData[selectedIssue] : [];
  const evidenceItems = selectedIssue ? evidenceRequirements[selectedIssue] : [];
  const evidenceCount = uploads.filter((upload) => upload.status === 'verified').length;
  const hasEvidence = uploads.length > 0;
  const warningNoEvidence = skippedEvidence && uploads.length === 0;

  const statusBadge = useMemo(() => {
    if (trackerStage >= 6) return { label: 'Resolved', color: 'bg-emerald-500' };
    if (trackerStage >= 5) return { label: 'Escalated', color: 'bg-rose-500' };
    return { label: 'Under Review', color: 'bg-amber-400' };
  }, [trackerStage]);

  const progressPercent = Math.round(((currentStep + 1) / issueSteps.length) * 100);

  // Save persona to localStorage
  useEffect(() => {
    if (persona) {
      localStorage.setItem('active-persona', persona);
    }
  }, [persona]);

  const switchPersona = (newPersona: Persona) => {
    setPersona(newPersona);
    // Reset flow but keep dashboard data
    setCurrentStep(0);
    setSelectedIssue(null);
    setChatResponse('Select an issue type to begin your recovery case.');
    setSelectedTransactionIndex(null);
    setUploads([]);
    setSkippedEvidence(false);
    setDiagnosis(null);
    setIsDiagnosing(false);
    setTrackerStage(0);
    setRefineText('');
    setReportId(null);
    setIsGeneratingReport(false);
    setReportDownloaded(false);
  };

  useEffect(() => {
    if (currentStep === 4 && selectedIssue && !diagnosis) {
      setIsDiagnosing(true);
      // Generate diagnosis immediately instead of with timeout
      const timer = window.setTimeout(() => {
        setDiagnosis(generateDiagnosisHelper(selectedIssue, evidenceCount));
        setIsDiagnosing(false);
      }, 800); // Reduced timeout
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [currentStep, selectedIssue, evidenceCount, diagnosis]);

  const handleIssueSelect = (issue: IssueType) => {
    setSelectedIssue(issue);
    setSelectedTransactionIndex(null);
    setUploads([]);
    setSkippedEvidence(false);
    setDiagnosis(null);
    setRefineText('');
    setReportId(null);
    setReportDownloaded(false);
    setCurrentStep(1);
    setChatResponse(issueMetadata[issue].acknowledgment);
    window.setTimeout(() => setCurrentStep(2), 1500);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const newItems = Array.from(files).map((file) => ({ id: createUploadIdHelper(), file, status: 'uploading' as const }));
    setUploads((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => {
      window.setTimeout(() => {
        setUploads((prev) => prev.map((upload) => (upload.id === item.id ? { ...upload, status: 'verifying' } : upload)));
        window.setTimeout(() => {
          setUploads((prev) => prev.map((upload) => (upload.id === item.id ? { ...upload, status: 'verified' } : upload)));
        }, 1200);
      }, 800);
    });
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const handleSkipEvidence = () => {
    setSkippedEvidence(true);
    setCurrentStep(4);
  };

  const handleRefine = () => {
    setDiagnosis(null);
    setIsDiagnosing(true);
    if (selectedIssue) {
      window.setTimeout(() => {
        setDiagnosis(generateDiagnosisHelper(selectedIssue, evidenceCount));
        setIsDiagnosing(false);
      }, 1200);
    }
  };

  const resetToLanding = () => {
  setCaseClosed(false);
    // Save current case if it exists
    if (selectedIssue) {
      const caseData: Case = {
        id: caseId,
        issueType: selectedIssue,
        status: trackerStage >= 6 ? 'resolved' : trackerStage >= 5 ? 'escalated' : 'open',
        stage: trackerStage,
        createdAt: new Date().toISOString(),
        resolvedAt: trackerStage >= 6 ? new Date().toISOString() : undefined,
        diagnosis,
        evidenceCount,
        reportId,
      };
      setCases(prev => [...prev, caseData]);
    }
    
    // Reset all state
    setCurrentStep(0);
    setSelectedIssue(null);
    setChatResponse('Select an issue type to begin your recovery case.');
    setSelectedTransactionIndex(null);
    setUploads([]);
    setSkippedEvidence(false);
    setDiagnosis(null);
    setIsDiagnosing(false);
    setTrackerStage(0);
    setRefineText('');
    setReportId(null);
    setIsGeneratingReport(false);
    setReportDownloaded(false);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(cases.map(c => ({
      'Case ID': c.id,
      'Issue Type': c.issueType,
      'Status': c.status,
      'Current Stage': c.stage,
      'Created At': new Date(c.createdAt).toLocaleDateString(),
      'Resolved At': c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'N/A',
      'Evidence Count': c.evidenceCount,
      'Report Generated': c.reportId ? 'Yes' : 'No',
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');
    XLSX.writeFile(workbook, `recovery-cases-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleGenerateReport = async () => {
    if (!selectedIssue || !diagnosis) return;

    setIsGeneratingReport(true);
    try {
      const caseData = {
        case_id: caseId,
        issue_type: selectedIssue,
        selected_transaction: selectedTransactionIndex !== null ? transactions[selectedTransactionIndex]?.label : 'Unknown',
      };

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          caseData,
          diagnosis,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReportId(data.reportId);
        setReportDownloaded(false);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'json' | 'csv' = 'pdf') => {
    if (!reportId) return;

    try {
      const response = await fetch(`/api/reports/${reportId}/download?format=${format}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recovery-report-${reportId}.${format === 'pdf' ? 'html' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setReportDownloaded(true);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const canAdvanceToStep = (targetStep: number) => {
    for (let step = currentStep + 1; step <= targetStep; step++) {
      if (step === 1 && !selectedIssue) return false;
      if (step === 2 && selectedTransactionIndex === null) return false;
      if (step === 3) continue; // Step 3 is always accessible
      if (step === 4 && !diagnosis) return false;
      if (step === 5 && !selectedIssue) return false;
      if (step === 6) continue; // Step 6 is always accessible
    }
    return true;
  };

  const canAdvance = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return !!selectedIssue;
    if (currentStep === 2) return selectedTransactionIndex !== null;
    if (currentStep === 3) return true;
    if (currentStep === 4) return !!diagnosis && !!selectedIssue;
    if (currentStep === 5) return !!selectedIssue;
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-8 flex items-center justify-between gap-6">
                <div>
                  <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">AI-Powered Case Recovery</span>
                  <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">Recovery Agent</h1>
                  <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                    A guided banking recovery case management workflow for scams, unauthorized charges, duplicate transactions,
                    failed refunds, and account freezes.
                  </p>
                </div>
                <div className="hidden h-32 w-32 rounded-3xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 p-4 text-slate-100 md:block">
                  <Sparkles className="h-full w-full opacity-80" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {['AI-powered Analysis', 'Fast Recovery', 'High Success Rate', 'Complete Documentation'].map((feature) => (
                  <div key={feature} className="rounded-3xl border border-slate-800 bg-slate-950/95 p-5">
                    <p className="text-sm text-slate-300">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="intake" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 1</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">Incident Intake</h2>
                  <p className="mt-3 text-slate-400">Choose the issue type and the recovery agent will acknowledge the incident.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/95 px-4 py-2 text-sm text-slate-300">
                  <Circle className="h-4 w-4 text-sky-400" /> AI bot ready
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.values(issueMetadata).map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => handleIssueSelect(issue.id)}
                    className={`group rounded-3xl border px-5 py-6 text-left transition-all duration-200 ${
                      selectedIssue === issue.id ? 'border-sky-400 bg-slate-950 shadow-glow' : 'border-slate-800 bg-slate-900/95 hover:border-slate-600'
                    }`}
                  >
                    <div className={`mb-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300`}>{issue.title}</div>
                    <p className="text-lg font-semibold text-white">{issue.subtitle}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">AI response</p>
                <p className="mt-4 text-base leading-7 text-slate-200">{chatResponse}</p>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="transactions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 2</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Transaction Selection</h2>
                <p className="mt-3 max-w-2xl text-slate-400">Select the transaction that matches your issue. Each workflow shows relevant, issue-specific data only.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {transactions.map((transaction, index) => (
                  <button
                    key={transaction.label}
                    type="button"
                    onClick={() => setSelectedTransactionIndex(index)}
                    className={`rounded-3xl border p-6 text-left transition-all duration-200 ${
                      selectedTransactionIndex === index ? 'border-sky-400 bg-slate-950 shadow-glow' : 'border-slate-800 bg-slate-900/95 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-white">{transaction.label}</p>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{transaction.amount}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{transaction.date}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="evidence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 3</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Evidence Upload</h2>
                <p className="mt-3 max-w-2xl text-slate-400">Upload required documents or skip evidence with a warning that it may delay your resolution.</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <UploadCloud className="h-5 w-5 text-sky-400" />
                    <h3 className="text-xl font-semibold text-white">Required & Optional Docs</h3>
                  </div>
                  <div className="space-y-3">
                    {evidenceItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.required ? 'Required' : 'Optional'}</p>
                        </div>
                        {item.required ? (
                          <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-300">Req</span>
                        ) : (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Opt</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">Upload files</h3>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
                      <FilePlus className="h-4 w-4" />
                      <span>Select Files</span>
                      <input type="file" multiple className="hidden" onChange={(event) => handleFileUpload(event.target.files)} />
                    </label>
                  </div>
                  <div className="space-y-3">
                    {uploads.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-700 px-4 py-8 text-center text-slate-500">
                        No documents uploaded yet.
                      </div>
                    ) : (
                      uploads.map((upload) => (
                        <div key={upload.id} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                          <div>
                            <p className="font-medium text-white">{upload.file.name}</p>
                            <p className="text-sm text-slate-500">{upload.status === 'uploading' ? 'Uploading…' : upload.status === 'verifying' ? 'Verifying…' : 'Verified'}</p>
                          </div>
                          <button type="button" onClick={() => removeUpload(upload.id)} className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700">
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/95 p-4 text-sm text-slate-300">
                    <p>No evidence upload is required to continue, but it may delay your resolution.</p>
                    <button type="button" onClick={handleSkipEvidence} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-700">
                      Skip evidence and continue
                    </button>
                  </div>
                </div>
              </div>
              {warningNoEvidence ? (
                <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
                  <p className="font-semibold">No evidence uploaded — this will delay your resolution.</p>
                  <p className="mt-2 text-sm text-amber-100/90">You will be required to attach evidence in the dispute packet for complete closure from the bank’s side.</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="diagnosis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 4</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">AI Diagnosis</h2>
                  <p className="mt-3 max-w-2xl text-slate-400">A structured, issue-aware diagnosis is generated to guide your next actions.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRefine}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refine Input
                </button>
              </div>
              {isDiagnosing || !diagnosis ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-10 text-center">
                  <p className="text-lg font-semibold text-white">Analyzing your case…</p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 delay-75" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 delay-150" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{currentIssue?.title} assessment</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">{diagnosis.title}</h3>
                      </div>
                      <span className="inline-flex rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{diagnosis.badge}</span>
                    </div>
                    <div className="mt-6">
                      <div className="rounded-3xl bg-slate-900/90 p-4">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Recovery likelihood</p>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                          <div className={`h-3 rounded-full ${getLikelihoodColorHelper(diagnosis.likelihood)}`} style={{ width: `${diagnosis.likelihood}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{diagnosis.likelihood}% — {diagnosis.likelihoodNote}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Why this classification</p>
                      <p className="mt-3 text-slate-200">{diagnosis.classificationReason}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Why this raises concern</p>
                      <p className="mt-3 text-slate-200">{diagnosis.concern}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Explanation</p>
                    <p className="mt-3 text-slate-200">{diagnosis.explanation}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Agent decision</p>
                    <p className="mt-3 text-slate-200">{diagnosis.decisionNote}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recommended next actions</p>
                    <ol className="mt-4 space-y-3 text-slate-200">
                      {diagnosis.nextActions.map((action, index) => (
                        <li key={action} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-sm text-slate-300">{index + 1}</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="packet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 5</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Dispute Packet</h2>
                <p className="mt-3 max-w-2xl text-slate-400">A tailored dispute packet has been generated for your selected issue.</p>
              </div>
              <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Registered email</p>
                  <p className="text-lg text-white">{maskEmailHelper('user@gmail.com')}</p>
                </div>
                <p className="mt-3 text-slate-400">Resolution updates and final case outcome will be sent to your registered email address.</p>
              </div>
              {warningNoEvidence ? (
                <div className="mb-6 rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">
                  <p className="font-semibold">You must attach the required supporting documents along with this dispute packet.</p>
                  <p className="mt-2 text-sm text-rose-100/90">Without evidence, your case resolution will be delayed.</p>
                </div>
              ) : null}
              <div className="space-y-4">
                {(() => {
                  const packetData = selectedIssue && disputePackets[selectedIssue as IssueType];
                  if (!packetData || packetData.length === 0) {
                    return (
                      <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-amber-100">
                        <p className="font-semibold">Unable to load dispute packet</p>
                        <p className="mt-2 text-sm">Please ensure you've selected an issue type and completed the AI diagnosis.</p>
                        <p className="mt-2 text-xs text-amber-200">
                          Issue: {selectedIssue || 'None selected'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(0)}
                          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
                        >
                          Start Over
                        </button>
                      </div>
                    );
                  }
                  return packetData.map((section) => (
                    <div key={section.title} className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                      <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
                        {section.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="tracker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-card">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 6</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">Recovery Tracker</h2>
                  <p className="mt-3 max-w-2xl text-slate-400">Track case progression across all seven recovery stages.</p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-950/95 px-4 py-3 text-sm text-slate-300">
                  <span className={`inline-flex h-3 w-3 rounded-full ${statusBadge.color}`} />
                  {statusBadge.label}
                </div>
              </div>
              <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Case ID</p>
                    <p className="mt-2 text-xl font-semibold text-white">{caseId}</p>
                  </div>
                  <div className="space-y-2 text-right text-slate-300">
                    <p>Current stage</p>
                    <p className="text-lg font-semibold text-white">{selectedIssue ? trackerStages[selectedIssue][trackerStage] : 'Pending selection'}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {selectedIssue && trackerStages[selectedIssue].map((label, index) => (
                  <div key={label} className={`rounded-3xl border px-5 py-5 ${index <= trackerStage ? 'border-slate-700 bg-slate-900' : 'border-slate-800 bg-slate-950/80'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${index <= trackerStage ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{index + 1}</span>
                      <div>
                        <p className={`font-semibold ${index <= trackerStage ? 'text-white' : 'text-slate-300'}`}>{label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
  type="button"
  onClick={() => {
    setTrackerStage((prev) => Math.max(prev, 5));
    setCaseClosed(true);
  }}
  className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
>
  <ShieldAlert className="h-4 w-4" />
  Escalate Case
</button>
                <button
  type="button"
  onClick={() => {
    setTrackerStage(6);
    setCaseClosed(true);
  }}
  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
>
  <ShieldCheck className="h-4 w-4" />
  Mark Resolved
</button>
                <button
  type="button"
  onClick={resetToLanding}
  disabled={!caseClosed}
  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
    caseClosed
      ? 'bg-sky-500 text-white hover:bg-sky-400'
      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
  }`}
>
  <ArrowRight className="h-4 w-4" />
  Start New Case
</button>
              </div>
              <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resolution summary</p>
                <p className="mt-3 text-slate-200">{selectedIssue ? issueFinalNotes[selectedIssue] : 'Awaiting selection'}</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return !persona ? (
    // Persona selection screen
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Recovery Agent</h1>
          <p className="text-slate-400 text-lg">Choose your role to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Persona */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setPersona('customer')}
            className="group relative rounded-3xl border-2 border-slate-800 bg-slate-950/95 p-8 text-left transition hover:border-sky-400 hover:bg-slate-900"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex rounded-2xl bg-sky-500/10 p-3">
                <User className="h-6 w-6 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Customer</h2>
              <p className="text-slate-400 text-sm mb-6">
                File recovery claims and track your cases. Submit evidence and monitor resolution progress.
              </p>
              <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
                Get Started <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>

          {/* Support Persona */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setPersona('support')}
            className="group relative rounded-3xl border-2 border-slate-800 bg-slate-950/95 p-8 text-left transition hover:border-emerald-400 hover:bg-slate-900"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Customer Care</h2>
              <p className="text-slate-400 text-sm mb-6">
                Manage customer cases and provide support. Escalate issues and update case status.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                Access Portal <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  ) : (
    // Main application interface
    <div className="min-h-screen bg-slate-950 pb-12">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Recovery Agent</h1>
              <p className="mt-2 text-slate-400">
                {persona === 'customer' ? 'Customer Portal - Track Your Recovery Cases' : 'Support Portal - Manage Customer Cases'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPersona(null)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Switch Role
            </button>
          </div>

          {/* Persona Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => switchPersona('customer')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                persona === 'customer'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <User className="h-4 w-4" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => switchPersona('support')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                persona === 'support'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="h-4 w-4" />
              Customer Care
            </button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                viewMode === 'flow' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Home className="h-4 w-4" />
              {persona === 'customer' ? 'File Claim' : 'Manage Cases'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                viewMode === 'dashboard' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              {persona === 'customer' ? 'My Cases' : 'Analytics'}
            </button>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          /* Dashboard View */
          <div className="space-y-8">
            {/* Statistics Cards */}
            {persona === 'customer' ? (
              // Customer Dashboard
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-500/10 p-3">
                      <FilePlus className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.total}</p>
                      <p className="text-sm text-slate-400">My Cases</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-amber-500/10 p-3">
                      <RefreshCcw className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.open}</p>
                      <p className="text-sm text-slate-400">In Progress</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-rose-500/10 p-3">
                      <ShieldAlert className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.escalated}</p>
                      <p className="text-sm text-slate-400">Attention Needed</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/10 p-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.resolved}</p>
                      <p className="text-sm text-slate-400">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Support Dashboard
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-purple-500/10 p-3">
                      <FilePlus className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.total}</p>
                      <p className="text-sm text-slate-400">Total Cases</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-yellow-500/10 p-3">
                      <RefreshCcw className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.open}</p>
                      <p className="text-sm text-slate-400">Active Cases</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-orange-500/10 p-3">
                      <ShieldAlert className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.escalated}</p>
                      <p className="text-sm text-slate-400">Escalated</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-teal-500/10 p-3">
                      <ShieldCheck className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dashboardStats.resolved}</p>
                      <p className="text-sm text-slate-400">Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="text-white font-semibold">{dashboardStats.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Resolution Time</span>
                    <span className="text-white font-semibold">{dashboardStats.avgResolutionTime} days</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
                <button
                  type="button"
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export to Excel
                </button>
                <p className="mt-2 text-xs text-slate-400">Download all case data as Excel spreadsheet</p>
              </div>
            </div>

            {/* Recent Cases Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Cases</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-2 text-slate-400">Case ID</th>
                      <th className="text-left py-2 text-slate-400">Issue Type</th>
                      <th className="text-left py-2 text-slate-400">Status</th>
                      <th className="text-left py-2 text-slate-400">Stage</th>
                      <th className="text-left py-2 text-slate-400">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.slice(-10).reverse().map((caseItem) => (
                      <tr key={caseItem.id} className="border-b border-slate-800/50">
                        <td className="py-3 text-white">{caseItem.id}</td>
                        <td className="py-3 text-slate-300">{caseItem.issueType}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            caseItem.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                            caseItem.status === 'escalated' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {caseItem.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">{caseItem.stage}</td>
                        <td className="py-3 text-slate-300">{new Date(caseItem.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cases.length === 0 && (
                  <p className="text-center py-8 text-slate-400">No cases recorded yet. Complete a recovery case to see data here.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-6 shadow-card">
            <div className="mb-8 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recovery workflow</p>
              <h2 className="mt-5 text-3xl font-semibold text-white">Recovery Agent</h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Complete the seven-step recovery case workflow from intake to resolution tracking.
              </p>
            </div>
            <div className="space-y-3">
              {stepIndices.map((step) => {
                const isActive = currentStep === step.index;
                const isComplete = step.index < currentStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => {
                      if (step.index <= currentStep && (step.index === currentStep || canAdvanceToStep(step.index))) setCurrentStep(step.index);
                    }}
                    className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left transition ${
                      isActive ? 'border-sky-400 bg-slate-900 shadow-glow' : 'border-slate-800 bg-slate-950/95 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="text-xs text-slate-500">{step.index === 0 ? 'Landing page' : `Step ${step.index}`}</p>
                    </div>
                    {isComplete ? <CheckCircle2 className="h-5 w-5 text-sky-400" /> : <Circle className="h-5 w-5 text-slate-600" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-sky-500/20 to-indigo-500/10 p-6 text-slate-100 shadow-glow">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Progress</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900">
                <div className="h-3 rounded-full bg-sky-500 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-300">{progressPercent}% complete</p>
            </div>
          </aside>
          <main className="space-y-6 min-h-[500px]">
            <AnimatePresence>{renderStepContent()}</AnimatePresence>
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Current step</p>
                <p className="text-lg font-semibold text-white">{issueSteps[currentStep]}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900"
                  >
                    Back
                  </button>
                ) : null}
               <button
  type="button"
  onClick={() => {
    if (currentStep < 6 && canAdvance()) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  }}
  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
    canAdvance()
      ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
      : 'cursor-not-allowed bg-slate-800 text-slate-500'
  }`}
  disabled={!canAdvance() || currentStep === 6}
>
  Continue
  <ArrowRight className="h-4 w-4" />
</button>
              </div>
            </div>
          </main>
        </div>
        )}
      </div>
    </div>
  );
}

export default App;
