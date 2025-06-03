import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "src/mailer/mailer.service";

@Processor('email')
export class EmailProcessor extends WorkerHost {

    private readonly logger = new Logger(EmailProcessor.name);
    constructor(
        private readonly mailService: MailService,
    ) {
        super();
    }

    process(job: Job, token?: string): Promise<any> {
        switch (job.name) {
            case 'send-massive-email':
                return this.handleMassiveEmailJob(job);
            default:
                this.logger.warn(`Unknown Job ${job.name}`);
        }
    }

    async handleMassiveEmailJob(job: Job) {
        const { subject, body, template } = job.data;

        this.logger.log(`📨 Sending massive email with template: ${template}`);

        return this.mailService.sendMassiveEmail(subject, body, template, );
    }
}
