import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Email must be valid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Phone is required' })
    @Matches(/^[0-9]+$/, { message: 'Phone number must contain digits only' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'Position is required' })
    position: string;

    @IsString()
    @IsNotEmpty({ message: 'Photo URL is required' })
    photoUrl: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    address?: string;
}