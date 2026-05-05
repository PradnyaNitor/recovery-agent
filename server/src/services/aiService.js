"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
var generative_ai_1 = require("@google/generative-ai");
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
var AIService = /** @class */ (function () {
    function AIService() {
    }
    AIService.generateDiagnosis = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var model, systemPrompt, userPrompt, result, response, text, diagnosis, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                        systemPrompt = "You are a senior banking recovery case analyst. You analyze customer banking issues and produce a structured diagnosis.\n\nRULES:\n- Be professional, empathetic, and precise \u2014 this is a regulated banking context.\n- NEVER guarantee outcomes. Use phrases like \"likely\", \"typically\", \"based on standard timelines\".\n- NEVER hallucinate regulatory references. Only cite well-known consumer protection norms generically.\n- Keep tone safe, professional, and helpful.\n- Tailor your response ENTIRELY to the user's specific situation \u2014 do NOT give generic advice.\n- Recovery likelihood should be realistic (0-100), not optimistic.\n\nRequired Output Schema (JSON only):\n{\n  \"title\": \"Short assessment title\",\n  \"badge\": \"Short status badge text (2-3 words)\",\n  \"likelihood\": <number 0-100>,\n  \"likelihoodNote\": \"One sentence explaining the likelihood\",\n  \"classificationReason\": \"1-2 sentences explaining WHY this was classified this way\",\n  \"explanation\": \"2-3 sentences explaining the situation in plain language\",\n  \"concern\": \"1-2 sentences on why this situation raises concern\",\n  \"decisionNote\": \"1 sentence on the agent's decision framing\",\n  \"nextActions\": [\"action 1\", \"action 2\", \"action 3\"]\n}";
                        userPrompt = "Analyze this ".concat(input.incidentType, " case:\n\nIssue Type: ").concat(input.incidentType, "\n").concat(input.userDescription ? "User Description: ".concat(input.userDescription) : '', "\n").concat(input.transactionDetails ? "Transaction Details: ".concat(input.transactionDetails) : '', "\n").concat(input.evidenceSummary ? "Evidence Summary: ".concat(input.evidenceSummary) : '', "\n\nProvide a structured diagnosis following the exact output schema.");
                        return [4 /*yield*/, model.generateContent([systemPrompt, userPrompt])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _a.sent();
                        text = response.text();
                        // Try to parse JSON response
                        try {
                            diagnosis = JSON.parse(text.trim());
                            return [2 /*return*/, this.validateDiagnosis(diagnosis)];
                        }
                        catch (parseError) {
                            // Fallback to template-based response if AI fails
                            console.warn('AI response parsing failed, using fallback:', parseError);
                            return [2 /*return*/, this.getFallbackDiagnosis(input.incidentType)];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('AI service error:', error_1);
                        return [2 /*return*/, this.getFallbackDiagnosis(input.incidentType)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AIService.verifyEvidence = function (filename, mimeType, size) {
        return __awaiter(this, void 0, void 0, function () {
            var model, prompt_1, result, response, text, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                        prompt_1 = "Verify if this file appears to be legitimate banking/financial evidence:\n\nFile: ".concat(filename, "\nType: ").concat(mimeType, "\nSize: ").concat(size, " bytes\n\nConsider:\n- Filename relevance to banking documents\n- File type appropriateness (PDFs, images for statements/screenshots)\n- File size reasonableness (not suspiciously small/large)\n\nRespond with only \"VERIFIED\" or \"REJECTED\".");
                        return [4 /*yield*/, model.generateContent(prompt_1)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _a.sent();
                        text = response.text().trim().toUpperCase();
                        return [2 /*return*/, text.includes('VERIFIED')];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Evidence verification error:', error_2);
                        // Default to accepting evidence if AI fails
                        return [2 /*return*/, true];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AIService.validateDiagnosis = function (diagnosis) {
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
    };
    AIService.getFallbackDiagnosis = function (issueType) {
        var templates = {
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
    };
    return AIService;
}());
exports.AIService = AIService;
