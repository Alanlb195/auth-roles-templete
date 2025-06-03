import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class SendResetPasswordEmailUseCase {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async execute(user: User, token: string, redirectUrl?: string) {
        const { email, fullName } = user;

        const baseRedirect = redirectUrl ?? this.configService.get<string>('FRONTEND_BASE_URL');
        const cleanBase = baseRedirect.replace(/\/$/, '');
        const resetLink = `${cleanBase}/reset-password?token=${token}`;

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
