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
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
var sqlite3_1 = require("sqlite3");
var util_1 = require("util");
var db = null;
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    var dbAsync = {
        get: (0, util_1.promisify)(db.get.bind(db)),
        all: (0, util_1.promisify)(db.all.bind(db)),
        run: (0, util_1.promisify)(db.run.bind(db)),
        close: (0, util_1.promisify)(db.close.bind(db))
    };
    return dbAsync;
}
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db = new sqlite3_1.default.Database(process.env.DATABASE_URL || './database.sqlite', function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        // Create tables
                        var tables = [
                            "CREATE TABLE IF NOT EXISTS users (\n          id TEXT PRIMARY KEY,\n          email TEXT UNIQUE NOT NULL,\n          password_hash TEXT NOT NULL,\n          name TEXT,\n          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n        )",
                            "CREATE TABLE IF NOT EXISTS cases (\n          id TEXT PRIMARY KEY,\n          user_id TEXT NOT NULL,\n          issue_type TEXT NOT NULL,\n          selected_transaction TEXT,\n          status TEXT DEFAULT 'draft',\n          case_id TEXT UNIQUE,\n          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          FOREIGN KEY (user_id) REFERENCES users (id)\n        )",
                            "CREATE TABLE IF NOT EXISTS evidence (\n          id TEXT PRIMARY KEY,\n          case_id TEXT NOT NULL,\n          filename TEXT NOT NULL,\n          original_name TEXT NOT NULL,\n          mime_type TEXT NOT NULL,\n          size INTEGER NOT NULL,\n          path TEXT NOT NULL,\n          status TEXT DEFAULT 'uploaded',\n          verified BOOLEAN DEFAULT FALSE,\n          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          FOREIGN KEY (case_id) REFERENCES cases (id)\n        )",
                            "CREATE TABLE IF NOT EXISTS diagnoses (\n          id TEXT PRIMARY KEY,\n          case_id TEXT NOT NULL,\n          issue_type TEXT NOT NULL,\n          title TEXT NOT NULL,\n          badge TEXT NOT NULL,\n          likelihood INTEGER NOT NULL,\n          likelihood_note TEXT NOT NULL,\n          classification_reason TEXT NOT NULL,\n          explanation TEXT NOT NULL,\n          concern TEXT NOT NULL,\n          decision_note TEXT NOT NULL,\n          next_actions TEXT NOT NULL,\n          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          FOREIGN KEY (case_id) REFERENCES cases (id)\n        )",
                            "CREATE TABLE IF NOT EXISTS tracker_stages (\n          id TEXT PRIMARY KEY,\n          case_id TEXT NOT NULL,\n          stage_index INTEGER NOT NULL,\n          stage_name TEXT NOT NULL,\n          completed BOOLEAN DEFAULT FALSE,\n          completed_at DATETIME,\n          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          FOREIGN KEY (case_id) REFERENCES cases (id)\n        )",
                            "CREATE TABLE IF NOT EXISTS reports (\n          id TEXT PRIMARY KEY,\n          case_id TEXT NOT NULL,\n          user_id TEXT NOT NULL,\n          report_type TEXT NOT NULL,\n          report_data TEXT NOT NULL,\n          file_format TEXT DEFAULT 'json',\n          is_downloaded BOOLEAN DEFAULT FALSE,\n          downloaded_at DATETIME,\n          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n          FOREIGN KEY (case_id) REFERENCES cases (id),\n          FOREIGN KEY (user_id) REFERENCES users (id)\n        )"
                        ];
                        var completed = 0;
                        tables.forEach(function (sql) {
                            db.run(sql, function (err) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                completed++;
                                if (completed === tables.length) {
                                    resolve();
                                }
                            });
                        });
                    });
                })];
        });
    });
}
