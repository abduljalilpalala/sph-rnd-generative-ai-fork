import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'The field is not required' })
  @IsString()
  @MaxLength(22, { message: 'The field must contain at least 22 characters' })
  name: string;

  @IsNotEmpty({ message: 'The field is not required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'The field is required' })
  @MaxLength(22, { message: 'The field must contain at least 22 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'The field is required' })
  email?: string;
}