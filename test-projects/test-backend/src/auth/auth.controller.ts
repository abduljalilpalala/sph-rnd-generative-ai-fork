import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // In a JWT-based system, logout is typically handled client-side by removing the token
    // For server-side logout, you would need to implement token blacklisting
    return { message: 'Logged out successfully' };
  }
}
