import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ImportUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsIn(['USER', 'ADMIN']) // VALID ROLES
    role: string;
}
