import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class SendUserCreatedEmailUseCase {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async execute(user: User, rawPassword: string) {
        const { email, fullName: name } = user;
        const loginUrl = `${this.configService.get<string>('FRONTEND_BASE_URL')}/login`;

        await this.mailerService.sendMail({
            to: email,
            subject: '¡Tu cuenta ha sido creada!',
            template: 'user-created-by-admin',
            context: {
                name,
                email,
                password: rawPassword,
                loginUrl,
                year: new Date().getFullYear(),
            },
        });
    }
}
