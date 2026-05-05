"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.CaseService = void 0;
var database_js_1 = require("../utils/database.js");
var Case_js_1 = require("../models/Case.js");
var CaseService = /** @class */ (function () {
    function CaseService() {
    }
    CaseService.createCase = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var db, caseData, trackerStages, i, stage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        caseData = Case_js_1.CaseModel.create(data);
                        return [4 /*yield*/, db.run('INSERT INTO cases (id, user_id, issue_type, selected_transaction, status, case_id) VALUES (?, ?, ?, ?, ?, ?)', [caseData.id, caseData.user_id, caseData.issue_type, caseData.selected_transaction, caseData.status, caseData.case_id])];
                    case 1:
                        _a.sent();
                        trackerStages = this.getTrackerStages(caseData.issue_type);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < trackerStages.length)) return [3 /*break*/, 5];
                        stage = Case_js_1.TrackerStageModel.create(caseData.id, i, trackerStages[i]);
                        return [4 /*yield*/, db.run('INSERT INTO tracker_stages (id, case_id, stage_index, stage_name, completed) VALUES (?, ?, ?, ?, ?)', [stage.id, stage.case_id, stage.stage_index, stage.stage_name, stage.completed])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, __assign(__assign({}, caseData), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() })];
                }
            });
        });
    };
    CaseService.getCasesByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, database_js_1.getDatabase)();
                return [2 /*return*/, db.all('SELECT * FROM cases WHERE user_id = ? ORDER BY created_at DESC', [userId])];
            });
        });
    };
    CaseService.getCaseById = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, database_js_1.getDatabase)();
                return [2 /*return*/, db.get('SELECT * FROM cases WHERE id = ? AND user_id = ?', [id, userId])];
            });
        });
    };
    CaseService.updateCaseStatus = function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        return [4 /*yield*/, db.run('UPDATE cases SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CaseService.updateSelectedTransaction = function (id, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        return [4 /*yield*/, db.run('UPDATE cases SET selected_transaction = ?, updated_at = ? WHERE id = ?', [transaction, new Date().toISOString(), id])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CaseService.getEvidenceByCaseId = function (caseId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, database_js_1.getDatabase)();
                return [2 /*return*/, db.all('SELECT * FROM evidence WHERE case_id = ? ORDER BY created_at DESC', [caseId])];
            });
        });
    };
    CaseService.addEvidence = function (caseId, file) {
        return __awaiter(this, void 0, void 0, function () {
            var db, evidenceData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        evidenceData = Case_js_1.EvidenceModel.create(caseId, file);
                        return [4 /*yield*/, db.run('INSERT INTO evidence (id, case_id, filename, original_name, mime_type, size, path, status, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [evidenceData.id, evidenceData.case_id, evidenceData.filename, evidenceData.original_name, evidenceData.mime_type, evidenceData.size, evidenceData.path, evidenceData.status, evidenceData.verified])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, evidenceData), { created_at: new Date().toISOString() })];
                }
            });
        });
    };
    CaseService.verifyEvidence = function (evidenceId, verified) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        return [4 /*yield*/, db.run('UPDATE evidence SET verified = ?, status = ? WHERE id = ?', [verified, verified ? 'verified' : 'rejected', evidenceId])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CaseService.getDiagnosisByCaseId = function (caseId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, database_js_1.getDatabase)();
                return [2 /*return*/, db.get('SELECT * FROM diagnoses WHERE case_id = ? ORDER BY created_at DESC LIMIT 1', [caseId])];
            });
        });
    };
    CaseService.saveDiagnosis = function (caseId, issueType, diagnosis) {
        return __awaiter(this, void 0, void 0, function () {
            var db, diagnosisData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        diagnosisData = Case_js_1.DiagnosisModel.create(caseId, issueType, diagnosis);
                        return [4 /*yield*/, db.run('INSERT INTO diagnoses (id, case_id, issue_type, title, badge, likelihood, likelihood_note, classification_reason, explanation, concern, decision_note, next_actions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [diagnosisData.id, diagnosisData.case_id, diagnosisData.issue_type, diagnosisData.title, diagnosisData.badge, diagnosisData.likelihood, diagnosisData.likelihood_note, diagnosisData.classification_reason, diagnosisData.explanation, diagnosisData.concern, diagnosisData.decision_note, JSON.stringify(diagnosisData.next_actions)])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, diagnosisData), { created_at: new Date().toISOString() })];
                }
            });
        });
    };
    CaseService.getTrackerStages = function (caseId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, database_js_1.getDatabase)();
                return [2 /*return*/, db.all('SELECT * FROM tracker_stages WHERE case_id = ? ORDER BY stage_index', [caseId])];
            });
        });
    };
    CaseService.updateTrackerStage = function (caseId, stageIndex, completed) {
        return __awaiter(this, void 0, void 0, function () {
            var db, completedAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        completedAt = completed ? new Date().toISOString() : null;
                        return [4 /*yield*/, db.run('UPDATE tracker_stages SET completed = ?, completed_at = ? WHERE case_id = ? AND stage_index = ?', [completed, completedAt, caseId, stageIndex])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CaseService.getTrackerStages = function (issueType) {
        var stages = {
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
    };
    return CaseService;
}());
exports.CaseService = CaseService;
