import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendEmailWithVerificationLink(user: User, template: string) {

        const { email, fullName, } = user;

        return await this.mailerService
            .sendMail({
                to: email,
                subject: 'Welcome!',
                template: template, // filename without extension
                context: {
                    name: fullName,
                    year: new Date().getFullYear(),
                },
            });
    }
}
