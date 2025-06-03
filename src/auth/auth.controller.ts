import { Body, Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';
import { ValidRoles } from './interfaces';
import { Response, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { EmailService as EmailWorker } from 'src/jobs/email/email.service';
import { UserService as UsersWorker } from 'src/jobs/user/user.service';
import { MassiveEmailDto } from 'src/jobs/email/dtos/massive-email.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly emailWorker: EmailWorker,
        private readonly usersWorker: UsersWorker,
    ) { }


    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User created and token returned' })
    @ApiResponse({ status: 400, description: 'Email already registered' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.createUser(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 201, description: 'User and token returned' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiBody({ type: LoginUserDto })
    auth(@Body() loginUserDto: LoginUserDto) {
        return this.authService.loginUser(loginUserDto);
    }


    @Get('check-status')
    @Auth()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check authentication status' })
    @ApiResponse({ status: 200, description: 'Returns user and token' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    checkAuthStatus(
        @GetUser() user: User
    ) {
        return this.authService.checkAuthStatus(user);
    }


    @Get('verify-email')
    @ApiOperation({ summary: 'Verify email using token sent to user' })
    @ApiQuery({ name: 'token', required: true })
    @ApiQuery({ name: 'successUrl', required: false })
    @ApiQuery({ name: 'failureUrl', required: false })
    @ApiQuery({ name: 'alreadyVerifiedUrl', required: false })
    @ApiResponse({ status: 200, description: 'Redirect based on the url links' })
    async verifyEmail(
        @Res() res: Response,
        @Query('token') token: string,
        @Query('successUrl') successUrl?: string,
        @Query('failureUrl') failureUrl?: string,
        @Query('alreadyVerifiedUrl') alreadyVerifiedUrl?: string,
    ) {
        const redirectUrl = await this.authService.getRedirectAfterVerification({
            token,
            successUrl: decodeURIComponent(successUrl),
            failureUrl: decodeURIComponent(failureUrl),
            alreadyVerifiedUrl: decodeURIComponent(alreadyVerifiedUrl),
        });
        return res.redirect(redirectUrl);
    }


    @Post('request-password-reset')
    @ApiOperation({ summary: 'Request a password reset link' })
    @ApiBody({ type: RequestPasswordResetDto })
    @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
    requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(requestPasswordResetDto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using the reset token' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Get('private')
    @Auth(ValidRoles.admin)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Private route for admin users' })
    @ApiResponse({ status: 200, description: 'Access granted for admin user' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    private(@GetUser() user: User) {
        return {
            message: 'This route needs an admin role',
            user,
        };
    }

    @Get('public')
    @Auth()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Protected route (any valid token)' })
    @ApiResponse({ status: 200, description: 'Access granted with valid token' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    public(@GetUser() user: User) {
        return {
            message: 'This route doesn’t need a specific role but requires a valid auth token',
            user,
        };
    }

    @Post('send-massive-email')
    @ApiOperation({ summary: 'Send massive email' })
    @ApiResponse({ status: 201, description: 'Massive email job successfully enqueued.' })
    sendMassiveEmail(
        @Body() massiveEmailDto: MassiveEmailDto
    ) {
        return this.emailWorker.enqueueMassiveEmailJob(massiveEmailDto);
    }


    @Post('import-users')
    @ApiOperation({ summary: 'Import users massive from excel file (xlsx)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Excel (.xlsx) file with columns: email, fullName, role (USER | ADMIN)',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'File queued correctly to import users bulk from xlsx',
    })
    @UseInterceptors(FileInterceptor('file'))
    async importUsers(@UploadedFile() file: Express.Multer.File) {
        return this.usersWorker.enqueueImportUsersJob(file.buffer);
    }

}
