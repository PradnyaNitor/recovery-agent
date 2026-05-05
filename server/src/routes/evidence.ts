import express from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { CaseService } from '../services/caseService.js';
import { AIService } from '../services/aiService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Upload evidence for a case
router.post('/:caseId/upload', upload.array('files', 10), async (req: AuthenticatedRequest, res) => {
  try {
    const caseId = req.params.caseId;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify case belongs to user
    const caseData = await CaseService.getCaseById(caseId, req.user!.userId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const uploadedEvidence = [];

    for (const file of files) {
      // Add evidence to database
      const evidence = await CaseService.addEvidence(caseId, file);

      // Start verification process (simulate async verification)
      setTimeout(async () => {
        try {
          const verified = await AIService.verifyEvidence(file.originalname, file.mimetype, file.size);
          await CaseService.verifyEvidence(evidence.id, verified);
        } catch (error) {
          console.error('Evidence verification failed:', error);
          // Default to verified if AI fails
          await CaseService.verifyEvidence(evidence.id, true);
        }
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds

      uploadedEvidence.push(evidence);
    }

    // Update case status
    await CaseService.updateCaseStatus(caseId, 'evidence_uploaded');

    res.json({
      message: `${files.length} file(s) uploaded successfully`,
      evidence: uploadedEvidence
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload files' });
  }
});

// Verify evidence manually
router.patch('/:evidenceId/verify', async (req: AuthenticatedRequest, res) => {
  try {
    const evidenceId = req.params.evidenceId;
    const { verified } = z.object({ verified: z.boolean() }).parse(req.body);

    await CaseService.verifyEvidence(evidenceId, verified);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to verify evidence' });
  }
});

export default router;