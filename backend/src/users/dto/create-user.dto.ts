import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() username: string;
  @IsEmail() @IsNotEmpty() @IsOptional() email?: string;
  @IsString() @IsNotEmpty() password: string;
  @IsString() @IsNotEmpty() @IsOptional() profilePictureUrl?: string;
}
