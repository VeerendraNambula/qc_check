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

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private usersService: UsersService) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
      process.env;

    // Never fall back to a committed or publicly known SMTP account.
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
    if (!userId || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersService.findOneByUsername(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Only accept bcrypt-hashed passwords; legacy plaintext fallback is unsafe.
    const isMatch = await bcrypt
      .compare(password, user.password)
      .catch(() => false);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Replace this placeholder with a signed, expiring session token
    // and enforce it with authentication/authorization guards on protected routes.
    return {
      access_token: `mock-jwt-token-for-${userId}`,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!this.transporter || !frontendUrl) {
      throw new ServiceUnavailableException(
        'Password recovery email is not configured',
      );
    }

    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );

    // Keep the response the same whether or not the email is registered.
    if (!user) {
      return {
        message:
          'If an account exists for that email, password recovery instructions will be sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.update(user.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: `Use this link to reset your password: ${resetLink}`,
      html: `<p>Use <a href="${resetLink}">this link</a> to reset your password.</p>`,
    });

    return {
      message:
        'If an account exists for that email, password recovery instructions will be sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(
      resetPasswordDto.token,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      10,
    );

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    } as any);

    return { message: 'Password has been reset successfully' };
  }
}
