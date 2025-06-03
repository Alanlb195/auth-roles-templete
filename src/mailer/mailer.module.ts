import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { google } from 'googleapis';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { MailService } from './mailer.service';
import { SendMassiveEmailUseCase, SendUserCreatedEmailUseCase, SendResetPasswordEmailUseCase, SendVerificationEmailUseCase } from './use-cases';

const OAuth2 = google.auth.OAuth2;

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {

        const env = configService.get<string>('NODE_ENV');

        if (env === 'development') {
          return {
            transport: {
              host: configService.get<string>('MAIL_HOST', 'localhost'),
              port: configService.get<number>('MAIL_PORT', 1025),
              secure: false,
              auth: null,
            },
            defaults: {
              from: `"Tu App Dev" <noreply@tuapp.com>`,
            },
            template: {
              dir: join(process.cwd(), 'templates', 'mail'),
              adapter: new HandlebarsAdapter(),
              options: { strict: true },
            },
          };
        }

        else {
          // Gmail OAuth config
          const oauth2Client = new OAuth2(
            configService.get<string>('GMAIL_CLIENT_ID'),
            configService.get<string>('GMAIL_CLIENT_SECRET'),
            'https://developers.google.com/oauthplayground'
          );

          oauth2Client.setCredentials({
            refresh_token: configService.get<string>('GMAIL_REFRESH_TOKEN'),
          });

          const accessToken = await oauth2Client.getAccessToken();

          return {
            transport: {
              service: 'gmail',
              auth: {
                type: 'OAuth2',
                user: configService.get<string>('GMAIL_EMAIL'),
                clientId: configService.get<string>('GMAIL_CLIENT_ID'),
                clientSecret: configService.get<string>('GMAIL_CLIENT_SECRET'),
                refreshToken: configService.get<string>('GMAIL_REFRESH_TOKEN'),
                accessToken: accessToken.token,
              },
            },
            defaults: {
              from: `"Tu App" <${configService.get<string>('GMAIL_EMAIL')}>`,
            },
            template: {
              dir: join(process.cwd(), 'templates', 'mail'),
              adapter: new HandlebarsAdapter(),
              options: { strict: true },
            },
          };
        }

      },
    }),
  ],
  providers: [
    MailService,

    // use cases
    SendMassiveEmailUseCase,
    SendUserCreatedEmailUseCase,
    SendResetPasswordEmailUseCase,
    SendVerificationEmailUseCase
  ],
  exports: [MailService],
})
export class CustomMailerModule { }
