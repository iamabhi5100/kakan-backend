import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Username must be at least 5 characters long' })
  username: string;

  @IsString()
  @IsNotEmpty()
  handleName: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;
}