import { IsEmail, IsOptional, IsUrl } from 'class-validator';

export class RequestPasswordResetDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsUrl({ require_tld: false }, {
        message: 'redirectUrl must be a valid URL. It will be used to redirect the user to a frontend interface that receives the token and allows them to reset their password.',
    }) redirectUrl?: string;
}
