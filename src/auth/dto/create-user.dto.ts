import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {

    @ApiProperty({
        description: 'User Email',
        example: 'admin@gmail.com'
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'yourSecurePassword_1',
        minLength: 6,
        maxLength: 50
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({
        description: 'User FullName',
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    fullName: string;
}