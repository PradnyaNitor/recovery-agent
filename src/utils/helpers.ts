import { IssueType } from '../data/appData';

export function maskEmail(email: string) {
  if (!email || !email.includes('@')) {
    return '●●●●●●●●@example.com';
  }
  const [local, domain] = email.split('@');
  if (!domain) return '●●●●●●●●@example.com';
  const safeLocal = local.length > 2 ? `${local[0]}${'●'.repeat(Math.max(2, local.length - 2))}${local.slice(-1)}` : `${local[0]}●`;
  const [provider, tld] = domain.split('.');
  const safeProvider = provider.length > 3 ? `${provider.slice(0, 2)}${'●'.repeat(provider.length - 3)}${provider.slice(-1)}` : `${provider[0]}●`;
  return `${safeLocal}@${safeProvider}.${tld}`;
}

export function formatCaseId() {
  const random = Math.floor(10000 + Math.random() * 89999);
  return `REC-2026-${random}`;
}

export function getLikelihoodColor(likelihood: number) {
  if (likelihood >= 70) return 'bg-emerald-500';
  if (likelihood >= 40) return 'bg-amber-400';
  return 'bg-rose-500';
}

export function createUploadId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
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

const diagnosisTemplates: Record<IssueType, DiagnosisOutput> = {
  scam: {
    title: 'Containment and Review Recommended',
    badge: 'Likely Recoverable',
    likelihood: 68,
    likelihoodNote: 'Based on the provided details, recovery is likely if evidence is submitted promptly.',
    classificationReason: 'The incident matches a fraudulent payment pattern with clear scam characteristics.',
    explanation: 'The transaction appears to be a scam payment and should be treated as a containment event.',
    concern: 'Scam payments can lead to further unauthorized activity if not contained quickly.',
    decisionNote: 'I am recommending swift containment and evidence submission to maximize recovery potential.',
    nextActions: ['Submit requested evidence', 'Cancel beneficiary access', 'Monitor account alerts'],
  },
  unauthorized: {
    title: 'Security Investigation Advised',
    badge: 'Investigation Needed',
    likelihood: 61,
    likelihoodNote: 'The case is plausible and may be resolved with strong supporting documentation.',
    classificationReason: 'The transaction is flagged as unauthorized with no merchant match in the customer’s history.',
    explanation: 'This looks like an unauthorized transaction and should be escalated for formal investigation.',
    concern: 'Unauthorized charges can indicate compromised credentials and ongoing exposure.',
    decisionNote: 'I recommend immediate security action and formal investigation to protect the account.',
    nextActions: ['Hot-list the card', 'Reset credentials', 'Submit evidence details'],
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
    nextActions: ['Share both charge statements', 'Provide purchase receipt', 'Ask for duplicate reversal'],
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
    nextActions: ['Collect the refund receipt', 'Trace ARN details', 'Escalate the case'],
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
    nextActions: ['Upload photo ID', 'Provide address proof', 'Send freeze notice if available'],
  },
};

export function generateDiagnosis(issueType: IssueType, evidenceCount: number): DiagnosisOutput {
  const template = diagnosisTemplates[issueType];
  const likelihoodReduction = evidenceCount === 0 ? 14 : evidenceCount <= 1 ? 7 : 0;
  const likelihood = Math.max(28, template.likelihood - likelihoodReduction);
  return {
    ...template,
    likelihood,
    likelihoodNote:
      evidenceCount === 0
        ? `${template.likelihoodNote} No evidence has been attached yet, which may delay resolution.`
        : template.likelihoodNote,
  };
}
