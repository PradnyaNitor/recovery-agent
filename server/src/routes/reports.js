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
var reportService_1 = require("../services/reportService");
var auth_1 = require("../middleware/auth");
var router = express_1.default.Router();
var reportService = new reportService_1.ReportService();
// Generate report after diagnosis
router.post('/generate', auth_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, caseId, caseData, diagnosis, userId, reportId, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, caseId = _a.caseId, caseData = _a.caseData, diagnosis = _a.diagnosis;
                userId = req.userId;
                if (!caseId || !caseData || !diagnosis) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required fields' })];
                }
                return [4 /*yield*/, reportService.generateReport(caseId, userId, caseData, diagnosis)];
            case 1:
                reportId = _b.sent();
                res.json({ reportId: reportId, message: 'Report generated successfully' });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Error generating report:', error_1);
                res.status(500).json({ error: 'Failed to generate report' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get report details
router.get('/:reportId', auth_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reportId, userId, report, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                reportId = req.params.reportId;
                userId = req.userId;
                return [4 /*yield*/, reportService.getReport(reportId, userId)];
            case 1:
                report = _a.sent();
                if (!report) {
                    return [2 /*return*/, res.status(404).json({ error: 'Report not found' })];
                }
                res.json(report);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching report:', error_2);
                res.status(500).json({ error: 'Failed to fetch report' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Download report in different formats
router.get('/:reportId/download', auth_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reportId, _a, format, userId, report, jsonReport, csvReport, htmlReport, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                reportId = req.params.reportId;
                _a = req.query.format, format = _a === void 0 ? 'pdf' : _a;
                userId = req.userId;
                return [4 /*yield*/, reportService.getReport(reportId, userId)];
            case 1:
                report = _b.sent();
                if (!report) {
                    return [2 /*return*/, res.status(404).json({ error: 'Report not found' })];
                }
                // Mark as downloaded
                return [4 /*yield*/, reportService.downloadReport(reportId, userId)];
            case 2:
                // Mark as downloaded
                _b.sent();
                if (format === 'json') {
                    jsonReport = reportService.generateJSONReport(report);
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Disposition', "attachment; filename=\"recovery-report-".concat(reportId, ".json\""));
                    res.send(jsonReport);
                }
                else if (format === 'csv') {
                    csvReport = reportService.generateCSVReport(report);
                    res.set('Content-Type', 'text/csv');
                    res.set('Content-Disposition', "attachment; filename=\"recovery-report-".concat(reportId, ".csv\""));
                    res.send(csvReport);
                }
                else {
                    htmlReport = reportService.generatePDFReport(report);
                    res.set('Content-Type', 'text/html');
                    res.set('Content-Disposition', "attachment; filename=\"recovery-report-".concat(reportId, ".html\""));
                    res.send(htmlReport);
                }
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Error downloading report:', error_3);
                res.status(500).json({ error: 'Failed to download report' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Get all reports for a case
router.get('/case/:caseId', auth_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var caseId, userId, reports, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                caseId = req.params.caseId;
                userId = req.userId;
                return [4 /*yield*/, reportService.getCaseReports(caseId, userId)];
            case 1:
                reports = _a.sent();
                res.json(reports);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error fetching case reports:', error_4);
                res.status(500).json({ error: 'Failed to fetch reports' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
