export type IssueType = 'scam' | 'unauthorized' | 'duplicate' | 'refund' | 'freeze';

export interface TransactionItem {
  label: string;
  amount: string;
  date: string;
  detail?: string;
}

export interface EvidenceRequirement {
  label: string;
  required: boolean;
}

export interface DisputePacketSection {
  title: string;
  details: string[];
}

export const issueMetadata = {
  scam: {
    id: 'scam' as IssueType,
    title: 'Scam Payment',
    subtitle: 'Fraudulent or misrepresented outgoing transfer',
    color: 'from-sky-500 to-indigo-500',
    acknowledgment:
      'Understood — a scam payment case. I’ll prepare a containment assessment and guide you through protecting your accounts from further loss.',
  },
  unauthorized: {
    id: 'unauthorized' as IssueType,
    title: 'Unauthorized Transaction',
    subtitle: 'A transaction you did not initiate',
    color: 'from-amber-500 to-orange-500',
    acknowledgment:
      'Noted — an unauthorized transaction. I’ll walk you through immediate security steps and prepare an investigation file.',
  },
  duplicate: {
    id: 'duplicate' as IssueType,
    title: 'Duplicate Charge',
    subtitle: 'Repeated identical charges from the same merchant',
    color: 'from-emerald-500 to-teal-500',
    acknowledgment:
      'Got it — a duplicate charge. I’ll help you identify whether this is a pending hold or a posted error and outline the reconciliation path.',
  },
  refund: {
    id: 'refund' as IssueType,
    title: 'Failed Refund',
    subtitle: 'Expected refund did not reach your account',
    color: 'from-cyan-500 to-blue-500',
    acknowledgment:
      'Acknowledged — a failed refund. I’ll check the expected timeline and prepare escalation steps if the SLA has passed.',
  },
  freeze: {
    id: 'freeze' as IssueType,
    title: 'Account Freeze',
    subtitle: 'Access restricted due to compliance or KYC review',
    color: 'from-violet-500 to-fuchsia-500',
    acknowledgment:
      'Understood — an account freeze. I’ll guide you through the compliance requirements needed to restore access.',
  },
};

export const issueSteps = [
  'Landing',
  'Incident Intake',
  'Transaction Selection',
  'Evidence Upload',
  'AI Diagnosis',
  'Dispute Packet',
  'Recovery Tracker',
];

export const transactionData: Record<IssueType, TransactionItem[]> = {
  scam: [
    { label: 'UPI Transfer to Unknown', amount: '₹10,000', date: 'Mar 25, 2026' },
    { label: 'IMPS Transfer (Investment Scheme)', amount: '₹25,000', date: 'Mar 23, 2026' },
    { label: 'Wallet Load (Fake Customer Care)', amount: '₹5,000', date: 'Mar 22, 2026' },
  ],
  unauthorized: [
    { label: 'Online Card Payment (Unknown Merchant)', amount: '₹8,500', date: '02:15 AM' },
    { label: 'ATM Withdrawal (Unfamiliar Location)', amount: '₹10,000', date: '11:47 PM' },
    { label: 'POS Transaction (Unknown Store)', amount: '₹3,200', date: '—' },
  ],
  duplicate: [
    { label: 'Swiggy Order #SW4821', amount: '₹450 × 2', date: '—' },
    { label: 'Amazon Order #AZ9103', amount: '₹2,100 × 2', date: '—' },
    { label: 'HP Petrol Pump', amount: '₹1,500 × 2', date: '—' },
  ],
  refund: [
    { label: 'Flipkart Cancelled Order', amount: '₹3,800', date: 'Refund SLA expired' },
    { label: 'MakeMyTrip Cancelled Booking', amount: '₹12,500', date: 'SLA window expired' },
    { label: 'Zomato Quality Complaint', amount: '₹650', date: 'Partial refund not credited' },
  ],
  freeze: [
    { label: 'Account Frozen — All Debits Blocked', amount: '—', date: 'KYC documents expired' },
  ],
};

export const evidenceRequirements: Record<IssueType, EvidenceRequirement[]> = {
  scam: [
    { label: 'Payment Confirmation', required: true },
    { label: 'Scammer Communication', required: true },
    { label: 'Incident Timeline', required: false },
    { label: 'Cyber Cell Report', required: false },
  ],
  unauthorized: [
    { label: 'Transaction Alert', required: true },
    { label: 'Bank Statement', required: true },
    { label: 'Device Confirmation', required: true },
    { label: 'FIR Copy (if > ₹25,000)', required: false },
  ],
  duplicate: [
    { label: 'Statement with Both Charges', required: true },
    { label: 'Original Purchase Receipt', required: true },
    { label: 'Merchant Confirmation', required: false },
  ],
  refund: [
    { label: 'Original Purchase Receipt', required: true },
    { label: 'Merchant Refund Confirmation', required: true },
    { label: 'Statement showing No Credit', required: false },
  ],
  freeze: [
    { label: 'Government Photo ID', required: true },
    { label: 'Address Proof', required: true },
    { label: 'Freeze Notice', required: false },
  ],
};

export const disputePackets: Record<IssueType, DisputePacketSection[]> = {
  scam: [
    {
      title: 'Scam Incident Summary',
      details: ['Fraudulent transfer confirmed from the user’s account to an unknown payee.'],
    },
    {
      title: 'Incident Timeline',
      details: ['Capture of the date, amount, and communications associated with the scam event.'],
    },
    {
      title: 'Containment Actions',
      details: [
        'Remove payee from beneficiary lists.',
        'Cancel recurring mandates if present.',
        'Enable immediate account alerts.',
        'Advise filing a cyber cell report.',
      ],
    },
    {
      title: 'Monitoring Guidance',
      details: ['Watch for follow-up outreach and verify any additional account access requests.'],
    },
    {
      title: 'Awareness Note',
      details: ['Authorized payments are managed differently from scams and may not be eligible for reversal.'],
    },
  ],
  unauthorized: [
    {
      title: 'Unauthorized Access Summary',
      details: ['The transaction was not initiated by the account holder and requires a formal investigation.'],
    },
    {
      title: 'Security Timeline',
      details: ['Document the event, the detection time, and the initial response actions.'],
    },
    {
      title: 'Immediate Security Actions',
      details: ['Hot-list the card, reset online credentials, and enable multi-factor authentication.'],
    },
    {
      title: 'Evidence for Investigation',
      details: ['Provide transaction alert screenshots, statements, and device confirmation details.'],
    },
    {
      title: 'Formal Investigation Request',
      details: ['Request a formal review under the bank’s investigation process and consumer protection guidelines.'],
    },
  ],
  duplicate: [
    {
      title: 'Duplicate Charge Summary',
      details: ['Two identical charges have been detected for the same merchant and order.'],
    },
    {
      title: 'Processing Timeline',
      details: ['Track when the first and second charges posted and whether one is pending or posted.'],
    },
    {
      title: 'Pending vs Posted Explanation',
      details: ['Clarify whether the second charge is a hold or a settled duplicate posting.'],
    },
    {
      title: 'Reconciliation Evidence',
      details: ['Include receipts, statements, and the merchant confirmation if available.'],
    },
    {
      title: 'Reconciliation Request',
      details: ['Ask the bank to reverse the duplicate entry after validation.'],
    },
  ],
  refund: [
    {
      title: 'Failed Refund Summary',
      details: ['A refund expected by the customer has not been credited within the standard timeline.'],
    },
    {
      title: 'Refund Processing Timeline',
      details: ['Record when the refund was initiated and the current SLA status.'],
    },
    {
      title: 'SLA-Based Next Steps',
      details: ['Trace the ARN, follow up with the merchant, and escalate if the refund remains unresolved.'],
    },
    {
      title: 'Refund Documentation',
      details: ['Attach purchase receipts and merchant refund confirmation evidence.'],
    },
    {
      title: 'Escalation Statement',
      details: ['Request priority handling due to the elapsed SLA.'],
    },
  ],
  freeze: [
    {
      title: 'Account Freeze Summary',
      details: ['Access to the account is blocked pending document verification.'],
    },
    {
      title: 'Freeze Timeline',
      details: ['Capture the date of freeze and KYC expiry triggers.'],
    },
    {
      title: 'Compliance Restoration Steps',
      details: ['Submit updated KYC and address proof documents promptly.'],
    },
    {
      title: 'Required KYC Documents',
      details: ['Provide a government photo ID and valid address verification.'],
    },
    {
      title: 'Restoration Request',
      details: ['Request restoration of account access once the documents are verified.'],
    },
  ],
};

export const trackerStages: Record<IssueType, string[]> = {
  scam: [
    'Scam Reported',
    'Evidence Gathered',
    'Containment Filed',
    'Channels Blocked',
    'Monitoring Active',
    'Escalated to Cyber Cell',
    'Containment Complete',
  ],
  unauthorized: [
    'Incident Reported',
    'Evidence Collected',
    'Security Report Filed',
    'Card Hot-listed',
    'Under Investigation',
    'Escalated',
    'Charge Reversed',
  ],
  duplicate: [
    'Duplicate Flagged',
    'Statements Compared',
    'Reconciliation Requested',
    'Awaiting Settlement',
    'Under Reconciliation',
    'Escalated to Processor',
    'Duplicate Reversed',
  ],
  refund: [
    'Refund Issue Reported',
    'Receipts Gathered',
    'Refund Trace Filed',
    'Awaiting Merchant Response',
    'ARN Under Review',
    'Escalated to Network',
    'Refund Credited',
  ],
  freeze: [
    'Freeze Reported',
    'Documents Prepared',
    'Restoration Request Filed',
    'KYC Under Verification',
    'Compliance Review',
    'Escalated to Compliance',
    'Access Restored',
  ],
};

export const issueFinalNotes: Record<IssueType, string> = {
  scam: 'Containment and monitoring are active; continue reviewing account alerts closely.',
  unauthorized: 'The issue is under investigation and the reversal process is progressing.',
  duplicate: 'The duplicate posting is being resolved through reconciliation with the processor.',
  refund: 'The refund trace is active, and merchant response is being pursued.',
  freeze: 'Restoration steps are underway pending successful KYC verification.',
};
