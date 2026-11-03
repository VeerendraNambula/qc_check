import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto';
import { Public } from './auth.decorators';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body('userId') userId: string, @Body('password') password?: string) {
    return this.authService.login(userId, password);
  }

  @Public(false)
  @Post('logout')
  logout(@Req() request: { user: { id: string } }) {
    return this.authService.logout(request.user.id);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto); }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) { return this.authService.resetPassword(dto); }
}
