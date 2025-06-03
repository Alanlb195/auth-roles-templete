import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MinLength } from "class-validator";

export class MassiveEmailDto {

    @ApiProperty({
        description: 'Email subject',
        example: 'Cordial invitation'
    })
    @IsString()
    @MinLength(3, {
        message: 'subject too short'
    })
    subject: string;

    @ApiProperty({
        description: 'Email body',
        example: 'This is the body of the email, it contains the entire message',
        minLength: 10,
    })
    @IsString()
    @MinLength(10, {
        message: 'message too short'
    })
    body: string;

    @ApiProperty({
        description: 'Template to use',
        example: 'global-notice',
        enum: ['global-notice']
    })
    @IsString()
    @IsIn(['global-notice'], {
        message: 'template must be either global-notice or happy-birthday'
    })
    template: string;
}
