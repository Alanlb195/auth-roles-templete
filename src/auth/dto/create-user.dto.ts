import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

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
        message: 'The password must have an uppercase, lowercase letter, and a number'
    })
    password: string;

    @ApiProperty({
        description: 'User FullName',
        example: 'John Doe',
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    fullName: string;

    @ApiProperty({
        description: 'URL to redirect after successful email verification',
        required: false,
        example: 'https://tuapp.com/verificado'
    })
    @IsOptional()
    @IsString()
    successUrl?: string;

    @ApiProperty({
        description: 'URL to redirect after failed email verification',
        required: false,
        example: 'https://tuapp.com/fallo'
    })
    @IsOptional()
    @IsString()
    failureUrl?: string;

    @ApiProperty({
        description: 'URL to redirect if email is already verified',
        required: false,
        example: 'https://tuapp.com/ya-verificado'
    })
    @IsOptional()
    @IsString()
    alreadyVerifiedUrl?: string;
}
