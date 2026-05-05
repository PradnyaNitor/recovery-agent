import express, { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const reportService = new ReportService();

// Generate report after diagnosis
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { caseId, caseData, diagnosis } = req.body;
    const userId = (req as any).userId;

    if (!caseId || !caseData || !diagnosis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reportId = await reportService.generateReport(
      caseId,
      userId,
      caseData,
      diagnosis
    );

    res.json({ reportId, message: 'Report generated successfully' });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get report details
router.get('/:reportId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const userId = (req as any).userId;

    const report = await reportService.getReport(reportId, userId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Download report in different formats
router.get('/:reportId/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { format = 'pdf' } = req.query;
    const userId = (req as any).userId;

    const report = await reportService.getReport(reportId, userId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Mark as downloaded
    await reportService.downloadReport(reportId, userId);

    if (format === 'json') {
      const jsonReport = reportService.generateJSONReport(report);
      res.set('Content-Type', 'application/json');
      res.set('Content-Disposition', `attachment; filename="recovery-report-${reportId}.json"`);
      res.send(jsonReport);
    } else if (format === 'csv') {
      const csvReport = reportService.generateCSVReport(report);
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="recovery-report-${reportId}.csv"`);
      res.send(csvReport);
    } else {
      // Default: PDF (as HTML that can be printed to PDF)
      const htmlReport = reportService.generatePDFReport(report);
      res.set('Content-Type', 'text/html');
      res.set('Content-Disposition', `attachment; filename="recovery-report-${reportId}.html"`);
      res.send(htmlReport);
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Get all reports for a case
router.get('/case/:caseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const userId = (req as any).userId;

    const reports = await reportService.getCaseReports(caseId, userId);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching case reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
