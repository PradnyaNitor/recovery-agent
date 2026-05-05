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
var express_1 = require("express");
var zod_1 = require("zod");
var caseService_js_1 = require("../services/caseService.js");
var auth_js_1 = require("../middleware/auth.js");
var router = express_1.default.Router();
// All routes require authentication
router.use(auth_js_1.requireAuth);
var createCaseSchema = zod_1.z.object({
    issue_type: zod_1.z.enum(['scam', 'unauthorized', 'duplicate', 'refund', 'freeze']),
    selected_transaction: zod_1.z.string().optional()
});
var updateTransactionSchema = zod_1.z.object({
    selected_transaction: zod_1.z.string()
});
// Get all cases for the authenticated user
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cases, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, caseService_js_1.CaseService.getCasesByUserId(req.user.userId)];
            case 1:
                cases = _a.sent();
                res.json(cases);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch cases' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create a new case
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, issue_type, selected_transaction, caseData, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = createCaseSchema.parse(req.body), issue_type = _a.issue_type, selected_transaction = _a.selected_transaction;
                return [4 /*yield*/, caseService_js_1.CaseService.createCase({
                        user_id: req.user.userId,
                        issue_type: issue_type,
                        selected_transaction: selected_transaction
                    })];
            case 1:
                caseData = _b.sent();
                res.status(201).json(caseData);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                res.status(400).json({ error: error_2.message || 'Failed to create case' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get a specific case
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var caseData, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, caseService_js_1.CaseService.getCaseById(req.params.id, req.user.userId)];
            case 1:
                caseData = _a.sent();
                if (!caseData) {
                    return [2 /*return*/, res.status(404).json({ error: 'Case not found' })];
                }
                res.json(caseData);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch case' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update selected transaction
router.patch('/:id/transaction', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var selected_transaction, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                selected_transaction = updateTransactionSchema.parse(req.body).selected_transaction;
                return [4 /*yield*/, caseService_js_1.CaseService.updateSelectedTransaction(req.params.id, selected_transaction)];
            case 1:
                _a.sent();
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(400).json({ error: error_4.message || 'Failed to update transaction' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update case status
router.patch('/:id/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                status_1 = zod_1.z.object({ status: zod_1.z.string() }).parse(req.body).status;
                return [4 /*yield*/, caseService_js_1.CaseService.updateCaseStatus(req.params.id, status_1)];
            case 1:
                _a.sent();
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(400).json({ error: error_5.message || 'Failed to update status' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get evidence for a case
router.get('/:id/evidence', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var evidence, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, caseService_js_1.CaseService.getEvidenceByCaseId(req.params.id)];
            case 1:
                evidence = _a.sent();
                res.json(evidence);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch evidence' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get diagnosis for a case
router.get('/:id/diagnosis', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var diagnosis, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, caseService_js_1.CaseService.getDiagnosisByCaseId(req.params.id)];
            case 1:
                diagnosis = _a.sent();
                if (!diagnosis) {
                    return [2 /*return*/, res.status(404).json({ error: 'Diagnosis not found' })];
                }
                res.json(diagnosis);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch diagnosis' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get tracker stages for a case
router.get('/:id/tracker', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stages, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, caseService_js_1.CaseService.getTrackerStages(req.params.id)];
            case 1:
                stages = _a.sent();
                res.json(stages);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch tracker stages' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update tracker stage
router.patch('/:id/tracker/:stageIndex', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stageIndex, completed, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                stageIndex = parseInt(req.params.stageIndex);
                completed = zod_1.z.object({ completed: zod_1.z.boolean() }).parse(req.body).completed;
                return [4 /*yield*/, caseService_js_1.CaseService.updateTrackerStage(req.params.id, stageIndex, completed)];
            case 1:
                _a.sent();
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                res.status(400).json({ error: error_9.message || 'Failed to update tracker stage' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
