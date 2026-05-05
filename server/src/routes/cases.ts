import express from 'express';
import { z } from 'zod';
import { CaseService } from '../services/caseService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

const createCaseSchema = z.object({
  issue_type: z.enum(['scam', 'unauthorized', 'duplicate', 'refund', 'freeze']),
  selected_transaction: z.string().optional()
});

const updateTransactionSchema = z.object({
  selected_transaction: z.string()
});

// Get all cases for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const cases = await CaseService.getCaseById(
  req.params.id,
  req.user!.userId
);
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Create a new case
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { issue_type, selected_transaction } = createCaseSchema.parse(req.body);

    const caseData = await CaseService.createCase({
      user_id: req.user!.userId,
      issue_type,
      selected_transaction
    });

    res.status(201).json(caseData);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create case' });
  }
});

// Get a specific case
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const caseData = await CaseService.getCaseById(req.params.id, req.user!.userId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseData);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// Update selected transaction
router.patch('/:id/transaction', async (req: AuthenticatedRequest, res) => {
  try {
    const { selected_transaction } = updateTransactionSchema.parse(req.body);

    await CaseService.updateSelectedTransaction(req.params.id, selected_transaction);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update transaction' });
  }
});

// Update case status
router.patch('/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = z.object({ status: z.string() }).parse(req.body);

    await CaseService.updateCaseStatus(req.params.id, status);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update status' });
  }
});

// Get evidence for a case
router.get('/:id/evidence', async (req: AuthenticatedRequest, res) => {
  try {
    const evidence = await CaseService.getEvidenceByCaseId(req.params.id);
    res.json(evidence);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// Get diagnosis for a case
router.get('/:id/diagnosis', async (req: AuthenticatedRequest, res) => {
  try {
    const diagnosis = await CaseService.getDiagnosisByCaseId(req.params.id);
    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }
    res.json(diagnosis);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch diagnosis' });
  }
});

// Get tracker stages for a case
router.get('/:id/tracker', async (req: AuthenticatedRequest, res) => {
  try {
     res.json({ message: "Stages endpoint not implemented yet" });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tracker stages' });
  }
});

// Update tracker stage
router.patch('/:id/tracker/:stageIndex', async (req: AuthenticatedRequest, res) => {
  try {
    const stageIndex = parseInt(req.params.stageIndex);
    const { completed } = z.object({ completed: z.boolean() }).parse(req.body);

    await CaseService.updateTrackerStage(req.params.id, stageIndex, completed);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update tracker stage' });
  }
});

export default router;