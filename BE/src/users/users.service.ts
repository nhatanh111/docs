import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async findAll() {
    const users = await this.userModel.findAll({ attributes: { exclude: ['password'] } });
    return users;
  }

  async create(body: { email: string; password: string; role?: string; status?: string; description?: string }) {
    const existing = await this.userModel.findOne({ where: { email: body.email } });
    if (existing) throw new BadRequestException('Email đã tồn tại');

    const hashed = await bcrypt.hash(body.password, 10);
    const newUser = await this.userModel.create({
      email: body.email,
      password: hashed,
      role: body.role || 'ĐỐI TÁC',
      status: body.status || 'Active',
      description: body.description,
    } as any);

    const { password, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  }

  async update(id: number, body: { email?: string; password?: string; role?: string; status?: string; description?: string }) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    if (body.email) {
      const existing = await this.userModel.findOne({ where: { email: body.email, id: { [Op.ne]: id } } });
      if (existing) throw new BadRequestException('Email đã tồn tại');
    }

    user.email = body.email || user.email;
    if (body.password) user.password = await bcrypt.hash(body.password, 10);
    user.role = body.role || user.role;
    user.status = body.status || user.status;
    user.description = body.description !== undefined ? body.description : user.description;
    await user.save();

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    const adminCount = await this.userModel.count({ where: { role: 'ADMIN' } });
    if (user.role === 'ADMIN' && adminCount <= 1) {
      throw new BadRequestException('Không thể xóa admin cuối cùng');
    }

    await user.destroy();
    return { message: 'Xóa thành công' };
  }
}
