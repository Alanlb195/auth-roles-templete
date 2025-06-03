import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { EmailVerificationOptions } from '@shared/interfaces/email-verification-options';
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.use-case';
import { SendResetPasswordEmailUseCase } from './use-cases/send-reset-password-email.use.case';
import { SendUserCreatedEmailUseCase } from './use-cases/send-user-created-email.use-case';
import { SendMassiveEmailUseCase } from './use-cases/send-massive-email.use.case';

@Injectable()
export class MailService {
    constructor(
        private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
        private readonly sendResetPasswordEmailUseCase: SendResetPasswordEmailUseCase,
        private readonly sendUserCreatedByAdminEmaiUseCase: SendUserCreatedEmailUseCase,
        private readonly sendMassiveEmailUseCase: SendMassiveEmailUseCase,
    ) { }

    async sendEmailWithVerificationLink(user: User, options: EmailVerificationOptions) {
        return this.sendVerificationEmailUseCase.execute(user, options);
    }

    async sendEmailWithResetPasswordLink(user: User, token: string, redirectUrl: string) {
        return this.sendResetPasswordEmailUseCase.execute(user, token, redirectUrl);
    }

    async sendUserCreatedByAdminEmail(user: User, rawPassword: string) {
        return this.sendUserCreatedByAdminEmaiUseCase.execute(user, rawPassword);
    }

    async sendMassiveEmail(subject: string, body: string, template: string) {
        return this.sendMassiveEmailUseCase.execute(subject, body, template);
    }
}
