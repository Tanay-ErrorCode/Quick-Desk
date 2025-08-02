import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const userId = user._id.toString();
    const payload = { email: user.email, sub: userId, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        department: user.department,
        profile_picture: user.profile_picture,
      },
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findByEmail(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginUserDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = user._id.toString();
    await this.usersService.updateLastLogin(userId);

    const payload = { email: user.email, sub: userId, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        department: user.department,
        profile_picture: user.profile_picture,
      },
    };
  }

  async validateUser(payload: any) {
    return this.usersService.findById(payload.sub);
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // TODO: Implement email sending logic
    // 1. Generate a secure reset token
    // 2. Store it with expiration (Redis or database)
    // 3. Send email with reset link
    // 4. Return success

    // For now, we'll just simulate the process
    console.log(`Password reset email would be sent to: ${email}`);

    return true;
  }
}
