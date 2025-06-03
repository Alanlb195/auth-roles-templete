import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class UserService {

    constructor(
        @InjectQueue('user') private readonly userQueue: Queue
    ) { }


    async enqueueImportUsersJob(fileBuffer: Buffer) {
        
        const job = await this.userQueue.add('import-users', {
            file: { type: 'Buffer', data: fileBuffer }
        });

        return {
            message: 'File queued correctly to import users bulk from xlsx',
            jobId: job.id,
        };
    }

}
