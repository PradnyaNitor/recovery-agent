"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
var uuid_1 = require("uuid");
var UserModel = /** @class */ (function () {
    function UserModel() {
    }
    UserModel.create = function (data) {
        return {
            id: (0, uuid_1.v4)(),
            email: data.email.toLowerCase(),
            password_hash: data.password,
            name: data.name
        };
    };
    return UserModel;
}());
exports.UserModel = UserModel;
