import { getDatabase } from '../utils/database.js';
import { Case, CreateCaseData, Evidence, Diagnosis, TrackerStage, CaseModel, EvidenceModel, DiagnosisModel, TrackerStageModel, IssueType } from '../models/Case.js';

export class CaseService {
  static async createCase(data: CreateCaseData): Promise<Case> {
    const db = getDatabase();
    const caseData = CaseModel.create(data);

    await db.run(
      'INSERT INTO cases (id, user_id, issue_type, selected_transaction, status, case_id) VALUES (?, ?, ?, ?, ?, ?)',
      [caseData.id, caseData.user_id, caseData.issue_type, caseData.selected_transaction, caseData.status, caseData.case_id]
    );

    return {
      ...caseData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }


  static async getCaseById(id: string, userId: string): Promise<Case | null> {
    const db = getDatabase();
    return db.get('SELECT * FROM cases WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async updateCaseStatus(id: string, status: string): Promise<void> {
    const db = getDatabase();
    await db.run(
      'UPDATE cases SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), id]
    );
  }

  static async updateSelectedTransaction(id: string, transaction: string): Promise<void> {
    const db = getDatabase();
    await db.run(
      'UPDATE cases SET selected_transaction = ?, updated_at = ? WHERE id = ?',
      [transaction, new Date().toISOString(), id]
    );
  }

  static async getEvidenceByCaseId(caseId: string): Promise<Evidence[]> {
    const db = getDatabase();
    return db.all('SELECT * FROM evidence WHERE case_id = ? ORDER BY created_at DESC', [caseId]);
  }

  static async addEvidence(caseId: string, file: Express.Multer.File): Promise<Evidence> {
    const db = getDatabase();
    const evidenceData = EvidenceModel.create(caseId, file);

    await db.run(
      'INSERT INTO evidence (id, case_id, filename, original_name, mime_type, size, path, status, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [evidenceData.id, evidenceData.case_id, evidenceData.filename, evidenceData.original_name, evidenceData.mime_type, evidenceData.size, evidenceData.path, evidenceData.status, evidenceData.verified]
    );

    return {
      ...evidenceData,
      created_at: new Date().toISOString()
    };
  }

  static async verifyEvidence(evidenceId: string, verified: boolean): Promise<void> {
    const db = getDatabase();
    await db.run(
      'UPDATE evidence SET verified = ?, status = ? WHERE id = ?',
      [verified, verified ? 'verified' : 'rejected', evidenceId]
    );
  }

  static async getDiagnosisByCaseId(caseId: string): Promise<Diagnosis | null> {
    const db = getDatabase();
    return db.get('SELECT * FROM diagnoses WHERE case_id = ? ORDER BY created_at DESC LIMIT 1', [caseId]);
  }

  static async saveDiagnosis(caseId: string, issueType: IssueType, diagnosis: Omit<Diagnosis, 'id' | 'case_id' | 'issue_type' | 'created_at'>): Promise<Diagnosis> {
    const db = getDatabase();
    const diagnosisData = DiagnosisModel.create(caseId, issueType, diagnosis);

    await db.run(
      'INSERT INTO diagnoses (id, case_id, issue_type, title, badge, likelihood, likelihood_note, classification_reason, explanation, concern, decision_note, next_actions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [diagnosisData.id, diagnosisData.case_id, diagnosisData.issue_type, diagnosisData.title, diagnosisData.badge, diagnosisData.likelihood, diagnosisData.likelihood_note, diagnosisData.classification_reason, diagnosisData.explanation, diagnosisData.concern, diagnosisData.decision_note, JSON.stringify(diagnosisData.next_actions)]
    );

    return {
      ...diagnosisData,
      created_at: new Date().toISOString()
    };
  }

  static async updateTrackerStage(caseId: string, stageIndex: number, completed: boolean): Promise<void> {
    const db = getDatabase();
    const completedAt = completed ? new Date().toISOString() : null;
    await db.run(
      'UPDATE tracker_stages SET completed = ?, completed_at = ? WHERE case_id = ? AND stage_index = ?',
      [completed, completedAt, caseId, stageIndex]
    );
  }

  private static getTrackerStages(issueType: IssueType): string[] {
    const stages: Record<IssueType, string[]> = {
      scam: [
        'Scam Reported',
        'Evidence Gathered',
        'Containment Filed',
        'Channels Blocked',
        'Monitoring Active',
        'Escalated to Cyber Cell',
        'Containment Complete'
      ],
      unauthorized: [
        'Incident Reported',
        'Evidence Collected',
        'Security Report Filed',
        'Card Hot-listed',
        'Under Investigation',
        'Escalated',
        'Charge Reversed'
      ],
      duplicate: [
        'Duplicate Flagged',
        'Statements Compared',
        'Reconciliation Requested',
        'Awaiting Settlement',
        'Under Reconciliation',
        'Escalated to Processor',
        'Duplicate Reversed'
      ],
      refund: [
        'Refund Issue Reported',
        'Receipts Gathered',
        'Refund Trace Filed',
        'Awaiting Merchant Response',
        'ARN Under Review',
        'Escalated to Network',
        'Refund Credited'
      ],
      freeze: [
        'Freeze Reported',
        'Documents Prepared',
        'Restoration Request Filed',
        'KYC Under Verification',
        'Compliance Review',
        'Escalated to Compliance',
        'Access Restored'
      ]
    };
    return stages[issueType];
  }
}