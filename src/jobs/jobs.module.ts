import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [EmailModule, UserModule],
  exports: [EmailModule, UserModule],
})
export class JobsModule {}
