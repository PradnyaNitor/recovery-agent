import { getDatabase } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface ReportData {
  caseId: string;
  userId: string;
  issueType: string;
  selectedTransaction: string;
  diagnosis?: any;
  generatedAt: string;
  recoveryLikelihood?: number;
  recommendedActions?: string[];
}

export class ReportService {
  async generateReport(
    caseId: string,
    userId: string,
    caseData: any,
    diagnosis: any
  ): Promise<string> {
    const db = getDatabase();
    const reportId = uuidv4();

    const reportData: ReportData = {
      caseId,
      userId,
      issueType: caseData.issue_type,
      selectedTransaction: caseData.selected_transaction,
      diagnosis,
      generatedAt: new Date().toISOString(),
      recoveryLikelihood: diagnosis?.likelihood,
      recommendedActions: diagnosis?.next_actions?.split('\n').filter((a: string) => a.trim()),
    };

    await db.run(
      `INSERT INTO reports (id, case_id, user_id, report_type, report_data, file_format, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reportId,
        caseId,
        userId,
        'recovery_analysis',
        JSON.stringify(reportData),
        'json',
        new Date().toISOString(),
      ]
    );

    return reportId;
  }

  async getReport(reportId: string, userId: string): Promise<ReportData | null> {
    const db = getDatabase();

    const report = await db.get(
      `SELECT * FROM reports WHERE id = ? AND user_id = ?`,
      [reportId, userId]
    );

    if (!report) {
      return null;
    }

    return JSON.parse(report.report_data);
  }

  async downloadReport(reportId: string, userId: string): Promise<void> {
    const db = getDatabase();

    await db.run(
      `UPDATE reports SET is_downloaded = TRUE, downloaded_at = ? WHERE id = ? AND user_id = ?`,
      [new Date().toISOString(), reportId, userId]
    );
  }

  async getCaseReports(caseId: string, userId: string): Promise<any[]> {
    const db = getDatabase();

    const reports = await db.all(
      `SELECT id, created_at, report_type, is_downloaded FROM reports 
       WHERE case_id = ? AND user_id = ?
       ORDER BY created_at DESC`,
      [caseId, userId]
    );

    return reports;
  }

  generatePDFReport(reportData: ReportData): string {
    // Generate a simple HTML that can be printed to PDF
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recovery Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #2563eb; }
    .header p { margin: 5px 0; color: #666; }
    .section { margin-bottom: 30px; }
    .section h2 { background: #f3f4f6; padding: 10px; border-left: 4px solid #2563eb; }
    .field { margin: 10px 0; }
    .label { font-weight: bold; color: #2563eb; }
    .value { margin-left: 20px; }
    .likelihood { font-size: 24px; font-weight: bold; color: #dc2626; }
    .badge { display: inline-block; background: #fecaca; color: #991b1b; padding: 5px 15px; border-radius: 20px; margin: 5px 0; }
    .actions { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; }
    .actions ul { margin: 10px 0; padding-left: 20px; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Recovery Analysis Report</h1>
    <p><strong>Case ID:</strong> ${reportData.caseId}</p>
    <p><strong>Generated:</strong> ${new Date(reportData.generatedAt).toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>Issue Details</h2>
    <div class="field">
      <span class="label">Issue Type:</span>
      <div class="value">${reportData.issueType}</div>
    </div>
    <div class="field">
      <span class="label">Transaction Type:</span>
      <div class="value">${reportData.selectedTransaction || 'Not specified'}</div>
    </div>
  </div>

  <div class="section">
    <h2>AI Analysis Results</h2>
    <div class="field">
      <span class="label">Recovery Likelihood:</span>
      <div class="value likelihood">${reportData.diagnosis?.likelihood || 0}%</div>
    </div>
    <div class="field">
      <span class="label">Assessment:</span>
      <div class="value"><span class="badge">${reportData.diagnosis?.badge || 'Analyzing'}</span></div>
    </div>
    <div class="field">
      <span class="label">Classification:</span>
      <div class="value">${reportData.diagnosis?.title || 'Pending'}</div>
    </div>
    <div class="field">
      <span class="label">Explanation:</span>
      <div class="value">${reportData.diagnosis?.explanation || 'Analysis in progress'}</div>
    </div>
  </div>

  <div class="section">
    <h2>Recommended Next Steps</h2>
    <div class="actions">
      <ul>
        ${(reportData.recommendedActions || [])
          .map((action: string) => `<li>${action}</li>`)
          .join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    <p>This report was generated by Recovery Agent AI Analysis System</p>
    <p>For support, contact your financial institution</p>
  </div>
</body>
</html>
    `;
  }

  generateJSONReport(reportData: ReportData): string {
    return JSON.stringify(reportData, null, 2);
  }

  generateCSVReport(reportData: ReportData): string {
    const headers = [
      'Case ID',
      'Issue Type',
      'Transaction Type',
      'Recovery Likelihood',
      'Assessment',
      'Classification',
      'Generated At',
    ];

    const values = [
      reportData.caseId,
      reportData.issueType,
      reportData.selectedTransaction,
      `${reportData.diagnosis?.likelihood || 0}%`,
      reportData.diagnosis?.badge || 'Pending',
      reportData.diagnosis?.title || 'Pending',
      new Date(reportData.generatedAt).toLocaleString(),
    ];

    return headers.join(',') + '\n' + values.map((v) => `"${v}"`).join(',');
  }
}
