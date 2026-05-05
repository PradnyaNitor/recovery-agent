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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackerStageModel = exports.DiagnosisModel = exports.EvidenceModel = exports.CaseModel = void 0;
var uuid_1 = require("uuid");
var CaseModel = /** @class */ (function () {
    function CaseModel() {
    }
    CaseModel.create = function (data) {
        var caseId = "REC-".concat(new Date().getFullYear(), "-").concat(Math.floor(10000 + Math.random() * 89999));
        return {
            id: (0, uuid_1.v4)(),
            user_id: data.user_id,
            issue_type: data.issue_type,
            selected_transaction: data.selected_transaction,
            status: 'draft',
            case_id: caseId
        };
    };
    return CaseModel;
}());
exports.CaseModel = CaseModel;
var EvidenceModel = /** @class */ (function () {
    function EvidenceModel() {
    }
    EvidenceModel.create = function (caseId, file) {
        return {
            id: (0, uuid_1.v4)(),
            case_id: caseId,
            filename: file.filename,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path,
            status: 'uploaded',
            verified: false
        };
    };
    return EvidenceModel;
}());
exports.EvidenceModel = EvidenceModel;
var DiagnosisModel = /** @class */ (function () {
    function DiagnosisModel() {
    }
    DiagnosisModel.create = function (caseId, issueType, diagnosis) {
        return __assign({ id: (0, uuid_1.v4)(), case_id: caseId, issue_type: issueType }, diagnosis);
    };
    return DiagnosisModel;
}());
exports.DiagnosisModel = DiagnosisModel;
var TrackerStageModel = /** @class */ (function () {
    function TrackerStageModel() {
    }
    TrackerStageModel.create = function (caseId, stageIndex, stageName) {
        return {
            id: (0, uuid_1.v4)(),
            case_id: caseId,
            stage_index: stageIndex,
            stage_name: stageName,
            completed: false
        };
    };
    return TrackerStageModel;
}());
exports.TrackerStageModel = TrackerStageModel;
