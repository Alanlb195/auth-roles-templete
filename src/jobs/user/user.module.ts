import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { BullModule } from '@nestjs/bullmq';
import { UserProcessor } from './user.processor';
import { CustomMailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'user',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    CustomMailerModule
  ],
  providers: [UserService, UserProcessor],
  exports: [UserService]
})
export class UserModule { }
