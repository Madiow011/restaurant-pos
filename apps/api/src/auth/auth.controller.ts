import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body('pin') pin: string) { return this.authService.login(pin); }

  @Get('users')
  getUsers() { return this.authService.getUsers(); }
}
