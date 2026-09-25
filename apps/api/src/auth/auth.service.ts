import { Injectable, UnauthorizedException } from '@nestjs/common';

// Simple PIN-based auth (ไม่ต้อง JWT สำหรับ local POS)
const USERS = [
  { id: 1, name: 'ผู้จัดการ', pin: '1234', role: 'admin' },
  { id: 2, name: 'พนักงาน 1', pin: '1111', role: 'staff' },
  { id: 3, name: 'พนักงาน 2', pin: '2222', role: 'staff' },
];

@Injectable()
export class AuthService {
  login(pin: string) {
    const user = USERS.find(u => u.pin === pin);
    if (!user) throw new UnauthorizedException('PIN ไม่ถูกต้อง');
    return { id: user.id, name: user.name, role: user.role };
  }

  getUsers() {
    return USERS.map(u => ({ id: u.id, name: u.name, role: u.role }));
  }
}
