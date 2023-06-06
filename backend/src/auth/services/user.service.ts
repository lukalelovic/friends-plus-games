import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { LoginDto, SignupDto } from '../dtos/auth.dto';
import { StatsDto } from 'src/auth/dtos/stats.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ token: string }> {
    const { username, email, password } = signupDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { userName: username }],
    });

    if (existingUser) {
      throw new UnauthorizedException('Username or email already exists.');
    }

    const user = new User();
    user.userName = username;
    user.email = email;
    user.password = await hash(password, 10);

    await this.userRepository.save(user);

    const payload = { username };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { userName: username },
    });

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { username };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { userName: payload.username },
      });

      return !!user;
    } catch (err) {
      return false;
    }
  }

  async getUserByToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { userName: payload.username },
      });

      return user;
    } catch (err) {
      return null;
    }
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    return user;
  }

  async updateStats(stats: StatsDto): Promise<void> {
    const { token, didWin, didLose } = stats;

    const user = await this.getUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token.');
    }

    if (didWin) {
      user.numWins++;
    }

    if (didLose) {
      user.numLosses++;
    }

    await this.userRepository.save(user);
  }
}
