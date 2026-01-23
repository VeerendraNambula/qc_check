import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto';

@Injectable()
export class AuthService {
  private transporter;

  constructor(private usersService: UsersService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'mose.gottlieb@ethereal.email',
        pass: process.env.SMTP_PASS || '6nKjVqBfVQZ4rVvSRE'
      }
    });
  }

  async login(userId: string, password?: string) {
    const user = await this.usersService.findOneByUsername(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid User ID');
    }

    // Validate password
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      // Fallback for plain text passwords (legacy support)
      if (!isMatch && user.password !== password) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Mock JWT generation
    return {
      access_token: `mock-jwt-token-for-${userId}`,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(forgotPasswordDto.email);
    if (!user) {
      // For security, don't reveal if user exists. 
      // But for this demo, we can just return success or throw if we want.
      throw new NotFoundException('User with this email not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.update(user.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    // In a real app, send the email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    console.log('\n' + '='.repeat(60));
    console.log(`DEVELOPMENT RESET LINK FOR: ${user.email}`);
    console.log(resetLink);
    console.log('='.repeat(60) + '\n');

    try {
      await this.transporter.sendMail({
        from: '"QC Support" <support@qccheck.com>',
        to: user.email,
        subject: 'Password Reset Request',
        text: `Click here to reset your password: ${resetLink}`,
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      });
    } catch (err) {
      console.error("SMTP failed (expected in dev without real creds):", err.message);
    }

    return {
      message: 'Reset link generated. In development, check the BACKEND CONSOLE for the link.'
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // @ts-ignore
    const user = await this.usersService.prisma.user.findFirst({
      where: {
        resetToken: resetPasswordDto.token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    } as any);

    return { message: 'Password has been reset successfully' };
  }
}
