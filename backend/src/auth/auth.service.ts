import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto';
import { signAccessToken } from './jwt.util';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private usersService: UsersService) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number.parseInt(SMTP_PORT || '587', 10),
        secure: SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    }
  }

  async login(userId: string, password?: string) {
    if (!userId || !password) throw new UnauthorizedException('Invalid credentials');
    const user = await this.usersService.findOneByUsername(userId);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    let accessToken: string;
    try {
      accessToken = signAccessToken({ id: user.id, username: user.username, role: user.role });
    } catch {
      throw new ServiceUnavailableException('Authentication is not configured on this server');
    }

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!this.transporter || !frontendUrl) throw new ServiceUnavailableException('Password recovery email is not configured');
    const user = await this.usersService.findOneByEmail(forgotPasswordDto.email);
    if (!user) return { message: 'If an account exists for that email, password recovery instructions will be sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await this.usersService.update(user.id, {
      resetToken: crypto.createHash('sha256').update(token).digest('hex'),
      resetTokenExpiry: expiry,
    } as any);
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email ?? forgotPasswordDto.email,
      subject: 'Password Reset Request',
      text: `Use this link to reset your password: ${resetLink}`,
      html: `<p>Use <a href="${resetLink}">this link</a> to reset your password.</p>`,
    });
    return { message: 'If an account exists for that email, password recovery instructions will be sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    if (!user) throw new UnauthorizedException('Invalid or expired reset token');
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersService.update(user.id, { password: hashedPassword, resetToken: null, resetTokenExpiry: null } as any);
    return { message: 'Password has been reset successfully' };
  }
}
