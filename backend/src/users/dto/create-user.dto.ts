import { IsEnum, IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  profilePictureUrl?: string;
}
