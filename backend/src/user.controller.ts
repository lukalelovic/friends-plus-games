import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto, SignupDto } from './dtos/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getAuthenticatedUser(@Request() req) {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);
    return user;
  }
}
