"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const USERS = [
    { id: 1, name: 'ผู้จัดการ', pin: '1234', role: 'admin' },
    { id: 2, name: 'พนักงาน 1', pin: '1111', role: 'staff' },
    { id: 3, name: 'พนักงาน 2', pin: '2222', role: 'staff' },
];
let AuthService = class AuthService {
    login(pin) {
        const user = USERS.find(u => u.pin === pin);
        if (!user)
            throw new common_1.UnauthorizedException('PIN ไม่ถูกต้อง');
        return { id: user.id, name: user.name, role: user.role };
    }
    getUsers() {
        return USERS.map(u => ({ id: u.id, name: u.name, role: u.role }));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map