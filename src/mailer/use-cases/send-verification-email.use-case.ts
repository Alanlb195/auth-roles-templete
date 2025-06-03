import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { EmailVerificationOptions } from '@shared/interfaces/email-verification-options';

@Injectable()
export class SendVerificationEmailUseCase {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async execute(user: User, options: EmailVerificationOptions) {
        const { email, fullName: name } = user;
        const queryParams = new URLSearchParams({ token: options.token });

        for (const key of ['successUrl', 'failureUrl', 'alreadyVerifiedUrl'] as const) {
            if (options[key]) queryParams.append(key, options[key]!);
        }

        const link = `${this.configService.get<string>('HOST_API')}/auth/verify-email?${queryParams.toString()}`;

        return await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome!',
            template: 'verify-email',
            context: {
                name,
                verificationLink: link,
                token: options.token,
                year: new Date().getFullYear(),
            },
        });
    }
}
