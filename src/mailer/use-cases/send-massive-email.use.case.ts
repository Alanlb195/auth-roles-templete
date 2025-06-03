import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SendMassiveEmailUseCase {
    constructor(
        private readonly mailerService: MailerService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(subject: string, body: string, template: string) {

        // users to send the massive email - active only
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
        });

        const year = new Date().getFullYear();

        for (const user of users) {
            await this.mailerService.sendMail({ 
                to: user.email,
                subject,
                template,
                context: {
                    name: user.fullName ?? 'User',
                    subject,
                    body,
                    year,
                },
            });
        }

        return { message: `Emails send to ${users.length} users.` };
    }
}
