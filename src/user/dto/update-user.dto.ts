import { IsOptional, IsString, MinLength, ValidateIf, Matches, IsDefined, IsNumberString } from 'class-validator';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsDefined({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @Matches(/\S/, { message: 'Name cannot be empty or spaces only' })
    name?: string;

    @IsDefined({ message: 'Name is required' })
    @IsNumberString()
    @Matches(/^[0-9]+$/, { message: 'Phone number must contain digits only' })
    phone?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ValidateIf(o => o.oldPassword || o.newPassword || o.confirmPassword)
    @IsString()
    oldPassword?: string;

    @ValidateIf(o => o.oldPassword || o.newPassword || o.confirmPassword)
    @IsString()
    @MinLength(6)
    newPassword?: string;

    @ValidateIf(o => o.oldPassword || o.newPassword || o.confirmPassword)
    @IsString()
    confirmPassword?: string;
}