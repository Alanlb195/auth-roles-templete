import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';
import { ValidRoles } from './interfaces';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }


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
}
