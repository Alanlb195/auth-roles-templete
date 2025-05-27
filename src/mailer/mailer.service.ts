import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async sendEmailWithVerificationLink(user: User, token: string, template: string) {

        const { email, fullName, } = user;

        return await this.mailerService
            .sendMail({
                to: email,
                subject: 'Welcome!',
                template: template, // filename without extension
                context: {
                    name: fullName,
                    verificationLink: this.configService.get<string>('HOST_API') + `/auth/verify-email?token=${token}`,
                    token: token,
                    year: new Date().getFullYear(),
                },
            });
    }


    async sendEmailWithResetPasswordLink(user: User, token: string) {
        const { email, fullName } = user;

        const resetLink = `${this.configService.get('FRONTEND_BASE_URL')}/reset-password?token=${token}`;

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
