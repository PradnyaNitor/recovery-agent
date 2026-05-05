import { GoogleGenerativeAI } from '@google/generative-ai';
import { IssueType } from '../models/Case.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface DiagnosisInput {
  incidentType: IssueType;
  userDescription?: string;
  transactionDetails?: string;
  evidenceSummary?: string;
}

interface DiagnosisOutput {
  title: string;
  badge: string;
  likelihood: number;
  likelihoodNote: string;
  classificationReason: string;
  explanation: string;
  concern: string;
  decisionNote: string;
  nextActions: string[];
}

export class AIService {
  static async generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are a senior banking recovery case analyst. You analyze customer banking issues and produce a structured diagnosis.

RULES:
- Be professional, empathetic, and precise — this is a regulated banking context.
- NEVER guarantee outcomes. Use phrases like "likely", "typically", "based on standard timelines".
- NEVER hallucinate regulatory references. Only cite well-known consumer protection norms generically.
- Keep tone safe, professional, and helpful.
- Tailor your response ENTIRELY to the user's specific situation — do NOT give generic advice.
- Recovery likelihood should be realistic (0-100), not optimistic.

Required Output Schema (JSON only):
{
  "title": "Short assessment title",
  "badge": "Short status badge text (2-3 words)",
  "likelihood": <number 0-100>,
  "likelihoodNote": "One sentence explaining the likelihood",
  "classificationReason": "1-2 sentences explaining WHY this was classified this way",
  "explanation": "2-3 sentences explaining the situation in plain language",
  "concern": "1-2 sentences on why this situation raises concern",
  "decisionNote": "1 sentence on the agent's decision framing",
  "nextActions": ["action 1", "action 2", "action 3"]
}`;

      const userPrompt = `Analyze this ${input.incidentType} case:

Issue Type: ${input.incidentType}
${input.userDescription ? `User Description: ${input.userDescription}` : ''}
${input.transactionDetails ? `Transaction Details: ${input.transactionDetails}` : ''}
${input.evidenceSummary ? `Evidence Summary: ${input.evidenceSummary}` : ''}

Provide a structured diagnosis following the exact output schema.`;

      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const diagnosis = JSON.parse(text.trim());
        return this.validateDiagnosis(diagnosis);
      } catch (parseError) {
        // Fallback to template-based response if AI fails
        console.warn('AI response parsing failed, using fallback:', parseError);
        return this.getFallbackDiagnosis(input.incidentType);
      }
    } catch (error) {
      console.error('AI service error:', error);
      return this.getFallbackDiagnosis(input.incidentType);
    }
  }

  static async verifyEvidence(filename: string, mimeType: string, size: number): Promise<boolean> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Verify if this file appears to be legitimate banking/financial evidence:

File: ${filename}
Type: ${mimeType}
Size: ${size} bytes

Consider:
- Filename relevance to banking documents
- File type appropriateness (PDFs, images for statements/screenshots)
- File size reasonableness (not suspiciously small/large)

Respond with only "VERIFIED" or "REJECTED".`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toUpperCase();

      return text.includes('VERIFIED');
    } catch (error) {
      console.error('Evidence verification error:', error);
      // Default to accepting evidence if AI fails
      return true;
    }
  }

  private static validateDiagnosis(diagnosis: any): DiagnosisOutput {
    if (!diagnosis || typeof diagnosis !== 'object') {
      throw new Error('Invalid diagnosis format');
    }

    return {
      title: diagnosis.title || 'Assessment Pending',
      badge: diagnosis.badge || 'Under Review',
      likelihood: Math.max(0, Math.min(100, diagnosis.likelihood || 50)),
      likelihoodNote: diagnosis.likelihoodNote || 'Assessment in progress',
      classificationReason: diagnosis.classificationReason || 'Case under review',
      explanation: diagnosis.explanation || 'Situation being analyzed',
      concern: diagnosis.concern || 'Standard banking protocols apply',
      decisionNote: diagnosis.decisionNote || 'Next steps will be determined',
      nextActions: Array.isArray(diagnosis.nextActions) ? diagnosis.nextActions : ['Review case details', 'Gather evidence', 'Contact bank support']
    };
  }

  private static getFallbackDiagnosis(issueType: IssueType): DiagnosisOutput {
    const templates: Record<IssueType, DiagnosisOutput> = {
      scam: {
        title: 'Containment and Review Recommended',
        badge: 'Likely Recoverable',
        likelihood: 68,
        likelihoodNote: 'Based on the provided details, recovery is likely if evidence is submitted promptly.',
        classificationReason: 'The incident matches a fraudulent payment pattern with clear scam characteristics.',
        explanation: 'The transaction appears to be a scam payment and should be treated as a containment event.',
        concern: 'Scam payments can lead to further unauthorized activity if not contained quickly.',
        decisionNote: 'I am recommending swift containment and evidence submission to maximize recovery potential.',
        nextActions: ['Submit requested evidence', 'Cancel beneficiary access', 'Monitor account alerts']
      },
      unauthorized: {
        title: 'Security Investigation Advised',
        badge: 'Investigation Needed',
        likelihood: 61,
        likelihoodNote: 'The case is plausible and may be resolved with strong supporting documentation.',
        classificationReason: 'The transaction is flagged as unauthorized with no merchant match in the customer\'s history.',
        explanation: 'This looks like an unauthorized transaction and should be escalated for formal investigation.',
        concern: 'Unauthorized charges can indicate compromised credentials and ongoing exposure.',
        decisionNote: 'I recommend immediate security action and formal investigation to protect the account.',
        nextActions: ['Hot-list the card', 'Reset credentials', 'Submit evidence details']
      },
      duplicate: {
        title: 'Reconciliation Path Suggested',
        badge: 'Pending Validation',
        likelihood: 74,
        likelihoodNote: 'Duplicate charges are often reversed when supported by the right documentation.',
        classificationReason: 'Two identical charges suggest a duplicate posting rather than a legitimate second purchase.',
        explanation: 'The case appears to be a duplicate charge that should be reconciled through the merchant and bank.',
        concern: 'Duplicate postings can create payment confusion and may affect available balance.',
        decisionNote: 'I am recommending a reconciliation request with clear transaction evidence.',
        nextActions: ['Share both charge statements', 'Provide purchase receipt', 'Ask for duplicate reversal']
      },
      refund: {
        title: 'Refund Follow-up Recommended',
        badge: 'Timeline Exceeded',
        likelihood: 66,
        likelihoodNote: 'A refund delay is likely recoverable once the merchant and bank process are reviewed.',
        classificationReason: 'The refund SLA has passed and the merchant response appears delayed.',
        explanation: 'This issue is consistent with a failed refund that needs escalation and ARN tracing.',
        concern: 'Delayed refunds can affect cash flow and require escalation for final closure.',
        decisionNote: 'I am recommending escalation and refund trace steps to resolve the issue.',
        nextActions: ['Collect the refund receipt', 'Trace ARN details', 'Escalate the case']
      },
      freeze: {
        title: 'Compliance Restore Path',
        badge: 'Documentation Required',
        likelihood: 79,
        likelihoodNote: 'Account restoration is likely once required KYC documents are submitted.',
        classificationReason: 'The freeze is driven by compliance requirements and can be resolved with valid documents.',
        explanation: 'The account is frozen due to missing KYC, and restoration depends on updated verification.',
        concern: 'An account freeze prevents normal banking operations until compliance is satisfied.',
        decisionNote: 'I am recommending prompt submission of KYC and proof documents to restore access.',
        nextActions: ['Upload photo ID', 'Provide address proof', 'Send freeze notice if available']
      }
    };

    return templates[issueType];
  }
}