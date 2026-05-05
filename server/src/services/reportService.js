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
exports.ReportService = void 0;
var database_1 = require("../utils/database");
var uuid_1 = require("uuid");
var ReportService = /** @class */ (function () {
    function ReportService() {
    }
    ReportService.prototype.generateReport = function (caseId, userId, caseData, diagnosis) {
        return __awaiter(this, void 0, void 0, function () {
            var db, reportId, reportData;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        db = (0, database_1.getDatabase)();
                        reportId = (0, uuid_1.v4)();
                        reportData = {
                            caseId: caseId,
                            userId: userId,
                            issueType: caseData.issue_type,
                            selectedTransaction: caseData.selected_transaction,
                            diagnosis: diagnosis,
                            generatedAt: new Date().toISOString(),
                            recoveryLikelihood: diagnosis === null || diagnosis === void 0 ? void 0 : diagnosis.likelihood,
                            recommendedActions: (_a = diagnosis === null || diagnosis === void 0 ? void 0 : diagnosis.next_actions) === null || _a === void 0 ? void 0 : _a.split('\n').filter(function (a) { return a.trim(); }),
                        };
                        return [4 /*yield*/, db.run("INSERT INTO reports (id, case_id, user_id, report_type, report_data, file_format, created_at)\n       VALUES (?, ?, ?, ?, ?, ?, ?)", [
                                reportId,
                                caseId,
                                userId,
                                'recovery_analysis',
                                JSON.stringify(reportData),
                                'json',
                                new Date().toISOString(),
                            ])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, reportId];
                }
            });
        });
    };
    ReportService.prototype.getReport = function (reportId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_1.getDatabase)();
                        return [4 /*yield*/, db.get("SELECT * FROM reports WHERE id = ? AND user_id = ?", [reportId, userId])];
                    case 1:
                        report = _a.sent();
                        if (!report) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, JSON.parse(report.report_data)];
                }
            });
        });
    };
    ReportService.prototype.downloadReport = function (reportId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_1.getDatabase)();
                        return [4 /*yield*/, db.run("UPDATE reports SET is_downloaded = TRUE, downloaded_at = ? WHERE id = ? AND user_id = ?", [new Date().toISOString(), reportId, userId])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ReportService.prototype.getCaseReports = function (caseId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, reports;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_1.getDatabase)();
                        return [4 /*yield*/, db.all("SELECT id, created_at, report_type, is_downloaded FROM reports \n       WHERE case_id = ? AND user_id = ?\n       ORDER BY created_at DESC", [caseId, userId])];
                    case 1:
                        reports = _a.sent();
                        return [2 /*return*/, reports];
                }
            });
        });
    };
    ReportService.prototype.generatePDFReport = function (reportData) {
        var _a, _b, _c, _d;
        // Generate a simple HTML that can be printed to PDF
        return "\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Recovery Analysis Report</title>\n  <style>\n    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }\n    .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }\n    .header h1 { margin: 0; color: #2563eb; }\n    .header p { margin: 5px 0; color: #666; }\n    .section { margin-bottom: 30px; }\n    .section h2 { background: #f3f4f6; padding: 10px; border-left: 4px solid #2563eb; }\n    .field { margin: 10px 0; }\n    .label { font-weight: bold; color: #2563eb; }\n    .value { margin-left: 20px; }\n    .likelihood { font-size: 24px; font-weight: bold; color: #dc2626; }\n    .badge { display: inline-block; background: #fecaca; color: #991b1b; padding: 5px 15px; border-radius: 20px; margin: 5px 0; }\n    .actions { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; }\n    .actions ul { margin: 10px 0; padding-left: 20px; }\n    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; }\n  </style>\n</head>\n<body>\n  <div class=\"header\">\n    <h1>Recovery Analysis Report</h1>\n    <p><strong>Case ID:</strong> ".concat(reportData.caseId, "</p>\n    <p><strong>Generated:</strong> ").concat(new Date(reportData.generatedAt).toLocaleString(), "</p>\n  </div>\n\n  <div class=\"section\">\n    <h2>Issue Details</h2>\n    <div class=\"field\">\n      <span class=\"label\">Issue Type:</span>\n      <div class=\"value\">").concat(reportData.issueType, "</div>\n    </div>\n    <div class=\"field\">\n      <span class=\"label\">Transaction Type:</span>\n      <div class=\"value\">").concat(reportData.selectedTransaction || 'Not specified', "</div>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>AI Analysis Results</h2>\n    <div class=\"field\">\n      <span class=\"label\">Recovery Likelihood:</span>\n      <div class=\"value likelihood\">").concat(((_a = reportData.diagnosis) === null || _a === void 0 ? void 0 : _a.likelihood) || 0, "%</div>\n    </div>\n    <div class=\"field\">\n      <span class=\"label\">Assessment:</span>\n      <div class=\"value\"><span class=\"badge\">").concat(((_b = reportData.diagnosis) === null || _b === void 0 ? void 0 : _b.badge) || 'Analyzing', "</span></div>\n    </div>\n    <div class=\"field\">\n      <span class=\"label\">Classification:</span>\n      <div class=\"value\">").concat(((_c = reportData.diagnosis) === null || _c === void 0 ? void 0 : _c.title) || 'Pending', "</div>\n    </div>\n    <div class=\"field\">\n      <span class=\"label\">Explanation:</span>\n      <div class=\"value\">").concat(((_d = reportData.diagnosis) === null || _d === void 0 ? void 0 : _d.explanation) || 'Analysis in progress', "</div>\n    </div>\n  </div>\n\n  <div class=\"section\">\n    <h2>Recommended Next Steps</h2>\n    <div class=\"actions\">\n      <ul>\n        ").concat((reportData.recommendedActions || [])
            .map(function (action) { return "<li>".concat(action, "</li>"); })
            .join(''), "\n      </ul>\n    </div>\n  </div>\n\n  <div class=\"footer\">\n    <p>This report was generated by Recovery Agent AI Analysis System</p>\n    <p>For support, contact your financial institution</p>\n  </div>\n</body>\n</html>\n    ");
    };
    ReportService.prototype.generateJSONReport = function (reportData) {
        return JSON.stringify(reportData, null, 2);
    };
    ReportService.prototype.generateCSVReport = function (reportData) {
        var _a, _b, _c;
        var headers = [
            'Case ID',
            'Issue Type',
            'Transaction Type',
            'Recovery Likelihood',
            'Assessment',
            'Classification',
            'Generated At',
        ];
        var values = [
            reportData.caseId,
            reportData.issueType,
            reportData.selectedTransaction,
            "".concat(((_a = reportData.diagnosis) === null || _a === void 0 ? void 0 : _a.likelihood) || 0, "%"),
            ((_b = reportData.diagnosis) === null || _b === void 0 ? void 0 : _b.badge) || 'Pending',
            ((_c = reportData.diagnosis) === null || _c === void 0 ? void 0 : _c.title) || 'Pending',
            new Date(reportData.generatedAt).toLocaleString(),
        ];
        return headers.join(',') + '\n' + values.map(function (v) { return "\"".concat(v, "\""); }).join(',');
    };
    return ReportService;
}());
exports.ReportService = ReportService;
