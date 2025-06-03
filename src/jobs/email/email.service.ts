import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { MassiveEmailDto } from './dtos/massive-email.dto';

@Injectable()
export class EmailService {

    constructor(
        @InjectQueue('email') private emailQueue: Queue
    ) { }

    async enqueueMassiveEmailJob(massiveEmailDto: MassiveEmailDto) {

        const { subject, body, template } = massiveEmailDto;

        await this.emailQueue.add('send-massive-email', {
            subject,
            body,
            template
        });

        return {
            message: 'Massive email job successfully enqueued.'
        };


    }

}
