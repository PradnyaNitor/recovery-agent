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
var multer_1 = require("multer");
var path_1 = require("path");
var zod_1 = require("zod");
var caseService_js_1 = require("../services/caseService.js");
var aiService_js_1 = require("../services/aiService.js");
var auth_js_1 = require("../middleware/auth.js");
var router = express_1.default.Router();
// All routes require authentication
router.use(auth_js_1.requireAuth);
// Configure multer for file uploads
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(process.cwd(), 'uploads'));
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
var upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
    },
    fileFilter: function (req, file, cb) {
        // Allow common document and image types
        var allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
        }
    }
});
// Upload evidence for a case
router.post('/:caseId/upload', upload.array('files', 10), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var caseId, files, caseData, uploadedEvidence, _loop_1, _i, files_1, file, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                caseId = req.params.caseId;
                files = req.files;
                if (!files || files.length === 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'No files uploaded' })];
                }
                return [4 /*yield*/, caseService_js_1.CaseService.getCaseById(caseId, req.user.userId)];
            case 1:
                caseData = _a.sent();
                if (!caseData) {
                    return [2 /*return*/, res.status(404).json({ error: 'Case not found' })];
                }
                uploadedEvidence = [];
                _loop_1 = function (file) {
                    var evidence;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, caseService_js_1.CaseService.addEvidence(caseId, file)];
                            case 1:
                                evidence = _b.sent();
                                // Start verification process (simulate async verification)
                                setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var verified, error_2;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 3, , 5]);
                                                return [4 /*yield*/, aiService_js_1.AIService.verifyEvidence(file.originalname, file.mimetype, file.size)];
                                            case 1:
                                                verified = _a.sent();
                                                return [4 /*yield*/, caseService_js_1.CaseService.verifyEvidence(evidence.id, verified)];
                                            case 2:
                                                _a.sent();
                                                return [3 /*break*/, 5];
                                            case 3:
                                                error_2 = _a.sent();
                                                console.error('Evidence verification failed:', error_2);
                                                // Default to verified if AI fails
                                                return [4 /*yield*/, caseService_js_1.CaseService.verifyEvidence(evidence.id, true)];
                                            case 4:
                                                // Default to verified if AI fails
                                                _a.sent();
                                                return [3 /*break*/, 5];
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
                                uploadedEvidence.push(evidence);
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, files_1 = files;
                _a.label = 2;
            case 2:
                if (!(_i < files_1.length)) return [3 /*break*/, 5];
                file = files_1[_i];
                return [5 /*yield**/, _loop_1(file)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: 
            // Update case status
            return [4 /*yield*/, caseService_js_1.CaseService.updateCaseStatus(caseId, 'evidence_uploaded')];
            case 6:
                // Update case status
                _a.sent();
                res.json({
                    message: "".concat(files.length, " file(s) uploaded successfully"),
                    evidence: uploadedEvidence
                });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.error('File upload error:', error_1);
                res.status(500).json({ error: error_1.message || 'Failed to upload files' });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// Verify evidence manually
router.patch('/:evidenceId/verify', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var evidenceId, verified, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                evidenceId = req.params.evidenceId;
                verified = zod_1.z.object({ verified: zod_1.z.boolean() }).parse(req.body).verified;
                return [4 /*yield*/, caseService_js_1.CaseService.verifyEvidence(evidenceId, verified)];
            case 1:
                _a.sent();
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(400).json({ error: error_3.message || 'Failed to verify evidence' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
