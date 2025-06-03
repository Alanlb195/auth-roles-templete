import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CreateUserDto, LoginUserDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';
import * as bcrypt from "bcryptjs";
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mailer/mailer.service';
import { randomBytes } from 'crypto';
import { EmailVerificationStatus } from './interfaces/email-verification-status';
import { EmailVerificationOptions } from '@shared/interfaces/email-verification-options';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) { }

    async createUser(createUserDto: CreateUserDto) {

        const { email, fullName, password, ...data } = createUserDto;

        const userExists = await this.prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new BadRequestException('Email already registered');
        }

        // Create user
        const user = await this.prisma.user.create({
            data: {
                fullName: fullName,
                email: email,
                password: bcrypt.hashSync(password, 10),
                role: Role.USER
            }
        });

        // Create email verification - register
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        await this.prisma.emailVerification.create({
            data: {
                token,
                expiresAt,
                userId: user.id,
            },
        });

        // Send email verification link
        const emailLinkOptions: EmailVerificationOptions = {
            ...data,
            token
        };

        if (user) {
            try {
                await this.mailService.sendEmailWithVerificationLink(user, emailLinkOptions);
            } catch (error) {
                console.error('Error in sendEmailWithVerificationLink: ', error.message);
            }
        }


        return this.returnJwtUser(user);
    }

    async checkAuthStatus(user: User) {
        return this.returnJwtUser(user);
    }

    async loginUser(loginUserDto: LoginUserDto) {

        const { email, password } = loginUserDto;

        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user)
            throw new UnauthorizedException('Invalid credentials');

        if (!await bcrypt.compare(password, user.password)) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.returnJwtUser(user);
    }

    async verifyEmail(token: string): Promise<EmailVerificationStatus> {

        const record = await this.prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!record || record.expiresAt < new Date()) {
            return EmailVerificationStatus.INVALID_OR_EXPIRED;
        }

        if (record.verifiedAt) {
            return EmailVerificationStatus.ALREADY_VERIFIED;
        }

        try {
            await this.prisma.$transaction([
                this.prisma.emailVerification.update({
                    where: { token },
                    data: { verifiedAt: new Date() },
                }),
                this.prisma.user.update({
                    where: { id: record.userId },
                    data: { isActive: true },
                }),
            ]);

            return EmailVerificationStatus.VERIFIED;

        } catch (error) {
            return EmailVerificationStatus.INVALID_OR_EXPIRED;

        }
    }

    async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {

        const { email, redirectUrl } = requestPasswordResetDto;

        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { message: 'Email send, please check your inbox' };
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

        await this.prisma.passwordReset.create({
            data: {
                token,
                email,
                userId: user.id,
                expiresAt,
            },
        });

        await this.mailService.sendEmailWithResetPasswordLink(user, token, redirectUrl);

        return { message: 'Email send, please check your inbox' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {

        const { newPassword, token } = resetPasswordDto;

        const resetRecord = await this.prisma.passwordReset.findUnique({ where: { token } });

        if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
            throw new BadRequestException('Invalid/Expired Token');
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordReset.update({
                where: { token },
                data: { usedAt: new Date() },
            }),
        ]);

        return { message: 'Password updated correctly' };
    }

    private getJwt(payload: JwtPayload) {
        const token = this.jwtService.sign(payload);
        return token;
    }

    async getRedirectAfterVerification(params: EmailVerificationOptions): Promise<string> {
        const { token, successUrl, failureUrl, alreadyVerifiedUrl } = params;

        const frontBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');

        const finalSuccessUrl = this.isAllowed(successUrl) ? successUrl! : frontBaseUrl;
        const finalFailureUrl = this.isAllowed(failureUrl) ? failureUrl! : frontBaseUrl;
        const finalAlreadyVerifiedUrl = this.isAllowed(alreadyVerifiedUrl) ? alreadyVerifiedUrl! : frontBaseUrl;

        const status = await this.verifyEmail(token);

        switch (status) {
            case EmailVerificationStatus.VERIFIED:
                return finalSuccessUrl;
            case EmailVerificationStatus.ALREADY_VERIFIED:
                return finalAlreadyVerifiedUrl;
            case EmailVerificationStatus.INVALID_OR_EXPIRED:
            default:
                return finalFailureUrl;
        }
    }

    isAllowed(url?: string): boolean {
        if (!url) return false;
        try {
            const { origin, pathname } = new URL(decodeURIComponent(url));
            const normalized = `${origin}${pathname.endsWith('/') ? pathname : pathname + '/'}`;

            const allowedUrl = this.configService.get<string>('FRONTEND_BASE_URL');
            return normalized.includes(allowedUrl);
        } catch {
            return false;
        }
    }

    private async returnJwtUser(user: User) {
        const token = this.getJwt({ id: user.id });
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };

    }

}
