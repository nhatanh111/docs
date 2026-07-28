import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    const secret = this.configService.get<string>('JWT_SECRET', 'PVI_SECRET_KEY_2026');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' },
    );

    return { token, role: user.role, name: user.email };
  }
}
