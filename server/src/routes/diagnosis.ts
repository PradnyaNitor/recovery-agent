import express from 'express';
import { z } from 'zod';
import { CaseService } from '../services/caseService.js';
import { AIService } from '../services/aiService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

const diagnosisRequestSchema = z.object({
  incidentType: z.enum(['scam', 'unauthorized', 'duplicate', 'refund', 'freeze']),
  userDescription: z.string().optional(),
  transactionDetails: z.string().optional(),
  evidenceSummary: z.string().optional()
});

// Generate diagnosis for a case
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { incidentType, userDescription, transactionDetails, evidenceSummary } = diagnosisRequestSchema.parse(req.body);

    // Generate diagnosis using AI
    const diagnosis = await AIService.generateDiagnosis({
      incidentType,
      userDescription,
      transactionDetails,
      evidenceSummary
    });

    res.json(diagnosis);
  } catch (error: any) {
    console.error('Diagnosis generation error:', error);
    res.status(500).json({ error: 'Failed to generate diagnosis' });
  }
});

// Save diagnosis to a case
router.post('/:caseId', async (req: AuthenticatedRequest, res) => {
  try {
    const caseId = req.params.caseId;
    const diagnosisData = req.body;

    // Verify case belongs to user
    const caseData = await CaseService.getCaseById(caseId, req.user!.userId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Save diagnosis
    const diagnosis = await CaseService.saveDiagnosis(caseId, caseData.issue_type, diagnosisData);

    // Update case status
    await CaseService.updateCaseStatus(caseId, 'diagnosed');

    res.json(diagnosis);
  } catch (error: any) {
    console.error('Save diagnosis error:', error);
    res.status(500).json({ error: 'Failed to save diagnosis' });
  }
});

export default router;