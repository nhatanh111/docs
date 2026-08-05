import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from './user.entity';
import { Partner } from '../partners/partner.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Partner) private partnerModel: typeof Partner,
  ) {}

  async findAll() {
    const users = await this.userModel.findAll({
      attributes: { exclude: ['password'] },
    });
    return users;
  }

  async create(body: {
    email: string;
    password: string;
    role?: string;
    status?: string;
    description?: string;
  }) {
    const existing = await this.userModel.findOne({
      where: { email: body.email },
    });
    if (existing) throw new BadRequestException('Email đã tồn tại');

    const hashed = await bcrypt.hash(body.password, 10);
    const newUser = await this.userModel.create({
      email: body.email,
      password: hashed,
      role: body.role || 'ĐỐI TÁC',
      status: body.status || 'Active',
      description: body.description,
    } as any);

    const raw: unknown = (
      newUser as unknown as { toJSON?: () => unknown }
    ).toJSON?.();
    if (typeof raw === 'object' && raw !== null) {
      const userObj = raw as Record<string, unknown>;
      // build a safe object with only allowed fields
      const safe = {
        id: userObj['id'] as number | string | undefined,
        email: userObj['email'] as string | undefined,
        role: userObj['role'] as string | undefined,
        status: userObj['status'] as string | undefined,
        description: userObj['description'] as string | undefined,
        createdAt: userObj['createdAt'] ?? undefined,
        updatedAt: userObj['updatedAt'] ?? undefined,
      };
      return safe;
    }

    return null;
  }

  async update(
    id: number,
    body: {
      email?: string;
      password?: string;
      role?: string;
      status?: string;
      description?: string;
    },
  ) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    if (body.email) {
      const existing = await this.userModel.findOne({
        where: { email: body.email, id: { [Op.ne]: id } },
      });
      if (existing) throw new BadRequestException('Email đã tồn tại');
    }

    user.email = body.email !== undefined ? body.email : user.email;
    if (body.password) user.password = await bcrypt.hash(body.password, 10);
    user.role = body.role !== undefined ? body.role : user.role;
    user.status = body.status !== undefined ? body.status : user.status;
    user.description =
      body.description !== undefined ? body.description : user.description;
    await user.save();

    const raw: unknown = (
      user as unknown as { toJSON?: () => unknown }
    ).toJSON?.();
    if (typeof raw === 'object' && raw !== null) {
      const userObj = raw as Record<string, unknown>;
      const safe = {
        id: userObj['id'] as number | string | undefined,
        email: userObj['email'] as string | undefined,
        role: userObj['role'] as string | undefined,
        status: userObj['status'] as string | undefined,
        description: userObj['description'] as string | undefined,
        createdAt: userObj['createdAt'] ?? undefined,
        updatedAt: userObj['updatedAt'] ?? undefined,
      };
      return safe;
    }

    return null;
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    const adminCount = await this.userModel.count({ where: { role: 'ADMIN' } });
    if (user.role === 'ADMIN' && adminCount <= 1) {
      throw new BadRequestException('Không thể xóa admin cuối cùng');
    }

    const linkedPartner = await this.partnerModel.findOne({ where: { accountId: id } });
    if (linkedPartner) throw new BadRequestException('Không thể xóa tài khoản đang liên kết với đối tác. Vui lòng hủy liên kết trước.');

    await user.destroy();
    return { message: 'Xóa thành công' };
  }
}
