import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { LoginDto, SignupDto } from '../dtos/auth.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    const token = await this.userService.signup(signupDto);
    return { token };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.userService.login(loginDto);
    return { token };
  }

  @Post('validate')
  async validate(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    const isValid = await this.userService.validateToken(token);
    return { isValid };
  }

  @Get('me')
  async getAuthenticatedUser(@Request() req) {
    const user = await this.userService.getUserByToken(
      req.headers.authorization.split(' ')[1],
    );
    return user;
  }
}
