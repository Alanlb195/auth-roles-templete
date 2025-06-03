import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { CustomMailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    CustomMailerModule
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService]
})
export class EmailModule { }
