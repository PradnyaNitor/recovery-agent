import { v4 as uuidv4 } from 'uuid';

export type IssueType = 'scam' | 'unauthorized' | 'duplicate' | 'refund' | 'freeze';
export type CaseStatus = 'draft' | 'evidence_uploaded' | 'diagnosed' | 'packet_generated' | 'tracking' | 'resolved' | 'escalated';

export interface Case {
  id: string;
  user_id: string;
  issue_type: IssueType;
  selected_transaction?: string;
  status: CaseStatus;
  case_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseData {
  user_id: string;
  issue_type: IssueType;
  selected_transaction?: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  status: 'uploaded' | 'verifying' | 'verified' | 'rejected';
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

export class CaseModel {
  static create(data: CreateCaseData): Omit<Case, 'created_at' | 'updated_at'> {
    const caseId = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
    return {
      id: uuidv4(),
      user_id: data.user_id,
      issue_type: data.issue_type,
      selected_transaction: data.selected_transaction,
      status: 'draft',
      case_id: caseId
    };
  }
}

export class EvidenceModel {
  static create(caseId: string, file: Express.Multer.File): Omit<Evidence, 'created_at'> {
    return {
      id: uuidv4(),
      case_id: caseId,
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      path: file.path,
      status: 'uploaded',
      verified: false
    };
  }
}

export class DiagnosisModel {
  static create(caseId: string, issueType: IssueType, diagnosis: Omit<Diagnosis, 'id' | 'case_id' | 'issue_type' | 'created_at'>): Omit<Diagnosis, 'created_at'> {
    return {
      id: uuidv4(),
      case_id: caseId,
      issue_type: issueType,
      ...diagnosis
    };
  }
}

export class TrackerStageModel {
  static create(caseId: string, stageIndex: number, stageName: string): Omit<TrackerStage, 'created_at'> {
    return {
      id: uuidv4(),
      case_id: caseId,
      stage_index: stageIndex,
      stage_name: stageName,
      completed: false
    };
  }
}