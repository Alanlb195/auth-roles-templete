import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomMailerModule } from './mailer/mailer.module';
import { envValidationSchema } from './config';
import configuration from './config/configuration';
import { BullModule } from '@nestjs/bullmq';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),

    // Dynamic connection to BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        if (nodeEnv === 'development') {
          console.log('BullMQ connected to localhost Redis service (redis in docker compose)');
          return {
            connection: {
              host: 'localhost',
              port: 6379,
            },
          };
        }

        // production, staging, test etc.
        console.log('BullMQ connected to hosted Redis service');
        return {
          connection: {
            url: configService.get<string>('REDIS_URL'),
          },
        };
      },
    }),


    AuthModule,
    SeedModule,
    PrismaModule,
    CustomMailerModule,
    JobsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
