import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomMailerModule } from './mailer/mailer.module';

import { envValidationSchema } from './config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    AuthModule,
    SeedModule,
    PrismaModule,
    CustomMailerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
