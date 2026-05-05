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
exports.AuthService = void 0;
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var database_js_1 = require("../utils/database.js");
var JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    AuthService.hashPassword = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var saltRounds;
            return __generator(this, function (_a) {
                saltRounds = 12;
                return [2 /*return*/, bcrypt_1.default.hash(password, saltRounds)];
            });
        });
    };
    AuthService.verifyPassword = function (password, hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, bcrypt_1.default.compare(password, hash)];
            });
        });
    };
    AuthService.generateToken = function (user) {
        return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    };
    AuthService.verifyToken = function (token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    };
    AuthService.createUser = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var db, existingUser, hashedPassword, userData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        return [4 /*yield*/, db.get('SELECT id FROM users WHERE email = ?', [data.email.toLowerCase()])];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new Error('User already exists');
                        }
                        return [4 /*yield*/, this.hashPassword(data.password)];
                    case 2:
                        hashedPassword = _a.sent();
                        userData = {
                            id: data.email.toLowerCase(), // Using email as ID for simplicity
                            email: data.email.toLowerCase(),
                            password_hash: hashedPassword,
                            name: data.name
                        };
                        return [4 /*yield*/, db.run('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)', [userData.id, userData.email, userData.password_hash, userData.name])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, userData), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() })];
                }
            });
        });
    };
    AuthService.authenticateUser = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var db, user, isValidPassword, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = (0, database_js_1.getDatabase)();
                        return [4 /*yield*/, db.get('SELECT * FROM users WHERE email = ?', [data.email.toLowerCase()])];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('Invalid credentials');
                        }
                        return [4 /*yield*/, this.verifyPassword(data.password, user.password_hash)];
                    case 2:
                        isValidPassword = _a.sent();
                        if (!isValidPassword) {
                            throw new Error('Invalid credentials');
                        }
                        token = this.generateToken(user);
                        return [2 /*return*/, { user: user, token: token }];
                }
            });
        });
    };
    AuthService.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = (0, database_js_1.getDatabase)();
                return [2 /*return*/, db.get('SELECT * FROM users WHERE id = ?', [id])];
            });
        });
    };
    return AuthService;
}());
exports.AuthService = AuthService;
