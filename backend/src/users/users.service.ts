import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(public readonly prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('User ID already exists');
    }

    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }
    // @ts-ignore
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    // @ts-ignore
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    // @ts-ignore
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOneByUsername(username: string) {
    // @ts-ignore
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findOneByEmail(email: string) {
    // @ts-ignore
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    // @ts-ignore
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    // @ts-ignore
    const user = await this.prisma.user.findUnique({ where: { id } });
    console.log('Changing password for user:', id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, user.password).catch(() => false);
    console.log('Comparing passwords. isSamePassword:', isSamePassword);

    // Also check for legacy plain text match
    const isSamePlain = user.password === changePasswordDto.newPassword;

    if (isSamePassword || isSamePlain) {
      throw new UnauthorizedException('New password cannot be the same as the current password');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // @ts-ignore
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async findByResetToken(token: string) {
    // @ts-ignore
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });
  }

  remove(id: string) {
    // @ts-ignore
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

