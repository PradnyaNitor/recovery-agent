import { useState, useEffect } from 'react';
import { casesApi, diagnosisApi, evidenceApi } from '../services/api';
import { IssueType } from '../data/appData';

export interface Case {
  id: string;
  user_id: string;
  issue_type: IssueType;
  selected_transaction?: string;
  status: string;
  case_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  status: string;
  verified: boolean;
  created_at: string;
}

export interface Diagnosis {
  id: string;
  case_id: string;
  issue_type: IssueType;
  title: string;
  badge: string;
  likelihood: number;
  likelihood_note: string;
  classification_reason: string;
  explanation: string;
  concern: string;
  decision_note: string;
  next_actions: string[];
  created_at: string;
}

export interface TrackerStage {
  id: string;
  case_id: string;
  stage_index: number;
  stage_name: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await casesApi.getCases();
      setCases(data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (issueType: IssueType, selectedTransaction?: string) => {
    const newCase = await casesApi.createCase({ issue_type: issueType, selected_transaction: selectedTransaction });
    setCases(prev => [newCase, ...prev]);
    return newCase;
  };

  const updateTransaction = async (caseId: string, transaction: string) => {
    await casesApi.updateTransaction(caseId, transaction);
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, selected_transaction: transaction } : c));
  };

  const updateStatus = async (caseId: string, status: string) => {
    await casesApi.updateStatus(caseId, status);
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status } : c));
  };

  return { cases, loading, fetchCases, createCase, updateTransaction, updateStatus };
}

export function useCase(caseId: string) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [tracker, setTracker] = useState<TrackerStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      const [caseInfo, evidenceData, diagnosisData, trackerData] = await Promise.all([
        casesApi.getCase(caseId),
        casesApi.getEvidence(caseId),
        casesApi.getDiagnosis(caseId).catch(() => null),
        casesApi.getTracker(caseId)
      ]);

      setCaseData(caseInfo);
      setEvidence(evidenceData);
      setDiagnosis(diagnosisData);
      setTracker(trackerData);
    } catch (error) {
      console.error('Failed to load case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadEvidence = async (files: FileList) => {
    const result = await evidenceApi.upload(caseId, files);
    setEvidence(prev => [...prev, ...result.evidence]);
    return result;
  };

  const generateDiagnosis = async (data: {
    incidentType: IssueType;
    userDescription?: string;
    transactionDetails?: string;
    evidenceSummary?: string;
  }) => {
    const diagnosisResult = await diagnosisApi.generate(data);
    const savedDiagnosis = await diagnosisApi.save(caseId, diagnosisResult);
    setDiagnosis(savedDiagnosis);
    return savedDiagnosis;
  };

  const updateTrackerStage = async (stageIndex: number, completed: boolean) => {
    await casesApi.updateTrackerStage(caseId, stageIndex, completed);
    setTracker(prev => prev.map(stage =>
      stage.stage_index === stageIndex ? { ...stage, completed, completed_at: completed ? new Date().toISOString() : undefined } : stage
    ));
  };

  return {
    caseData,
    evidence,
    diagnosis,
    tracker,
    loading,
    uploadEvidence,
    generateDiagnosis,
    updateTrackerStage,
    refresh: loadCaseData
  };
}