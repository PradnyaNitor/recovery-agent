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
var aiService_js_1 = require("../services/aiService.js");
var auth_js_1 = require("../middleware/auth.js");
var router = express_1.default.Router();
// All routes require authentication
router.use(auth_js_1.requireAuth);
var diagnosisRequestSchema = zod_1.z.object({
    incidentType: zod_1.z.enum(['scam', 'unauthorized', 'duplicate', 'refund', 'freeze']),
    userDescription: zod_1.z.string().optional(),
    transactionDetails: zod_1.z.string().optional(),
    evidenceSummary: zod_1.z.string().optional()
});
// Generate diagnosis for a case
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, incidentType, userDescription, transactionDetails, evidenceSummary, diagnosis, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = diagnosisRequestSchema.parse(req.body), incidentType = _a.incidentType, userDescription = _a.userDescription, transactionDetails = _a.transactionDetails, evidenceSummary = _a.evidenceSummary;
                return [4 /*yield*/, aiService_js_1.AIService.generateDiagnosis({
                        incidentType: incidentType,
                        userDescription: userDescription,
                        transactionDetails: transactionDetails,
                        evidenceSummary: evidenceSummary
                    })];
            case 1:
                diagnosis = _b.sent();
                res.json(diagnosis);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Diagnosis generation error:', error_1);
                res.status(500).json({ error: 'Failed to generate diagnosis' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Save diagnosis to a case
router.post('/:caseId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var caseId, diagnosisData, caseData, diagnosis, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                caseId = req.params.caseId;
                diagnosisData = req.body;
                return [4 /*yield*/, caseService_js_1.CaseService.getCaseById(caseId, req.user.userId)];
            case 1:
                caseData = _a.sent();
                if (!caseData) {
                    return [2 /*return*/, res.status(404).json({ error: 'Case not found' })];
                }
                return [4 /*yield*/, caseService_js_1.CaseService.saveDiagnosis(caseId, caseData.issue_type, diagnosisData)];
            case 2:
                diagnosis = _a.sent();
                // Update case status
                return [4 /*yield*/, caseService_js_1.CaseService.updateCaseStatus(caseId, 'diagnosed')];
            case 3:
                // Update case status
                _a.sent();
                res.json(diagnosis);
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error('Save diagnosis error:', error_2);
                res.status(500).json({ error: 'Failed to save diagnosis' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
