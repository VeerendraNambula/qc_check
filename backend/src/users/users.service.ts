import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const safeUserSelect = { id: true, name: true, username: true, role: true, email: true, profilePictureUrl: true, createdAt: true } as const;

@Injectable()
export class UsersService {
  constructor(public readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existingUser) throw new ConflictException('User ID already exists');
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({ data: { name: dto.name, username: dto.username, email: dto.email, password, profilePictureUrl: dto.profilePictureUrl, role: 'USER' }, select: safeUserSelect });
  }

  async findAll() { return this.prisma.user.findMany({ select: safeUserSelect }); }
  async findOne(id: string) { return this.prisma.user.findUnique({ where: { id }, select: safeUserSelect }); }
  async findOneByUsername(username: string) { return this.prisma.user.findUnique({ where: { username } }); }
  async findOneByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); }

  async findTokenVersion(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { tokenVersion: true } });
    return user?.tokenVersion ?? null;
  }

  async invalidateTokens(id: string) {
    await this.prisma.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } });
    return { message: 'Logged out successfully' };
  }

  async update(id: string, dto: UpdateUserDto) {
    const { name, username, email, profilePictureUrl, password } = dto;
    const data: Record<string, unknown> = { name, username, email, profilePictureUrl };
    if (password) data.password = await bcrypt.hash(password, 10);
    return this.prisma.user.update({ where: { id }, data, select: safeUserSelect });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const currentMatches = await bcrypt.compare(dto.currentPassword, user.password).catch(() => false);
    if (!currentMatches) throw new UnauthorizedException('Current password is incorrect');
    if (dto.newPassword === dto.currentPassword) throw new UnauthorizedException('New password cannot be the same as the current password');
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.user.update({ where: { id }, data: { password: hashedPassword }, select: safeUserSelect });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findFirst({ where: { resetToken: crypto.createHash('sha256').update(token).digest('hex'), resetTokenExpiry: { gt: new Date() } } });
  }

  remove(id: string) { return this.prisma.user.delete({ where: { id }, select: safeUserSelect }); }
}
