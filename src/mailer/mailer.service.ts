import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationOptions } from '@shared/interfaces/email-verification-options';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async sendEmailWithVerificationLink(
        user: User,
        template: string,
        emailLinkOptions: EmailVerificationOptions,
    ) {

        const { email, fullName: name } = user;

        const queryParams = new URLSearchParams({ token: emailLinkOptions.token });

        for (const key of ['successUrl', 'failureUrl', 'alreadyVerifiedUrl'] as const) {
            if (emailLinkOptions[key]) queryParams.append(key, emailLinkOptions[key]!);
        }

        const verificationLink = `${this.configService.get<string>('HOST_API')}/auth/verify-email?${queryParams.toString()}`;

        return await this.mailerService
            .sendMail({
                to: email,
                subject: 'Welcome!',
                template: template, // filename without extension
                context: {
                    name,
                    verificationLink,
                    token: emailLinkOptions.token,
                    year: new Date().getFullYear(),
                },
            });
    }


    async sendEmailWithResetPasswordLink(user: User, token: string, redirectUrl: string) {
        const { email, fullName } = user;

        const baseRedirect = redirectUrl ?? this.configService.get('FRONTEND_BASE_URL');
        const resetLink = `${baseRedirect.replace(/\/$/, '')}/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Change password',
            template: 'request-password-reset',
            context: {
                name: fullName,
                resetLink,
                year: new Date().getFullYear(),
            },
        });
    }

}
