import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from "bcryptjs";
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mailer/mailer.service';


@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) { }


    async createUser(createUserDto: CreateUserDto) {

        const { email, fullName, password } = createUserDto;

        const userExists = await this.prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new BadRequestException('Email already registered');
        }

        const user = await this.prisma.user.create({
            data: {
                fullName: fullName,
                email: email,
                password: bcrypt.hashSync(password, 10),
                role: Role.USER
            }
        });

        if (user) {
            try {
                await this.mailService.sendEmailWithVerificationLink(user, 'verify-password');
            } catch (error) {
                console.error('Error sending welcome email:', error.message);
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

    private getJwt(payload: JwtPayload) {
        const token = this.jwtService.sign(payload);
        return token;
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
