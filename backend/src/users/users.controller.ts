import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public, Roles } from '../auth/auth.decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  @Roles('ADMIN')
  @Get()
  findAll() { return this.usersService.findAll(); }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== id) throw new ForbiddenException('You can only view your own profile');
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== id) throw new ForbiddenException('You can only update your own profile');
    if (req.user.role !== 'ADMIN' && ('role' in (dto as any) || 'password' in (dto as any) || 'username' in (dto as any))) {
      throw new ForbiddenException('You cannot change privileged account fields');
    }
    return this.usersService.update(id, dto);
  }

  @Patch(':id/change-password')
  async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== id) throw new ForbiddenException('You can only change your own password');
    return this.usersService.changePassword(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.usersService.remove(id); }
}
