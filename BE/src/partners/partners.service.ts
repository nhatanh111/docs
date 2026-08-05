import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Partner } from './partner.entity';

@Injectable()
export class PartnersService {
  constructor(@InjectModel(Partner) private partnerModel: typeof Partner) {}

  async findAll() {
    const partners = await this.partnerModel.findAll();
    return partners.map((p) => ({
      ...p.toJSON(),
      profileIds: (p as any).profileIds || [],
      allowedApis: (p as any).allowedApis || [],
      overrides: (p as any).overrides || { allow: [], deny: [] },
    }));
  }

  async findById(id: string) {
    const partner = await this.partnerModel.findByPk(id);
    if (!partner) return null;
    return {
      ...partner.toJSON(),
      profileIds: (partner as any).profileIds || [],
      allowedApis: (partner as any).allowedApis || [],
      overrides: (partner as any).overrides || { allow: [], deny: [] },
    };
  }

  async findByAccountId(accountId: number) {
    const partner = await this.partnerModel.findOne({ where: { accountId } });
    if (!partner) return null;
    return {
      ...partner.toJSON(),
      profileIds: (partner as any).profileIds || [],
      allowedApis: (partner as any).allowedApis || [],
      overrides: (partner as any).overrides || { allow: [], deny: [] },
    };
  }

  async create(body: {
    name: string;
    email?: string;
    clientId?: string;
    status?: string;
    accountId?: number;
    profileIds?: string[];
    allowedApis?: string[];
    overrides?: { allow?: string[]; deny?: string[] };
  }) {
    const maxIdRaw = await this.partnerModel.max('id');
    const maxIdStr =
      typeof maxIdRaw === 'string'
        ? maxIdRaw
        : typeof maxIdRaw === 'number'
          ? String(maxIdRaw)
          : 'pt-0';
    const parts = maxIdStr.split('-');
    const num = parseInt(parts[1] ?? '0', 10) || 0;
    const newId = `pt-${num + 1}`;

    const newPartner = await this.partnerModel.create({
      id: newId,
      name: body.name,
      email: body.email || null,
      clientId: body.clientId || `PVI_${String(num + 1).padStart(3, '0')}`,
      status: body.status || 'active',
      accountId: body.accountId || null,
      profileIds: body.profileIds || [],
      allowedApis: body.allowedApis || [],
      overrides: body.overrides || { allow: [], deny: [] },
    } as any);

    return newPartner;
  }

  async update(
    id: string,
    body: {
      name?: string;
      email?: string;
      clientId?: string;
      status?: string;
      accountId?: number;
      profileIds?: string[];
      allowedApis?: string[];
      overrides?: { allow?: string[]; deny?: string[] };
    },
  ) {
    const partner = await this.partnerModel.findByPk(id);
    if (!partner) throw new NotFoundException('Không tìm thấy đối tác');

    partner.name = body.name !== undefined ? body.name : partner.name;
    partner.email = body.email !== undefined ? body.email : partner.email;
    partner.clientId =
      body.clientId !== undefined ? body.clientId : partner.clientId;
    partner.status = body.status !== undefined ? body.status : partner.status;
    partner.accountId =
      body.accountId !== undefined ? body.accountId : partner.accountId;
    if (body.profileIds !== undefined)
      (partner as any).profileIds = body.profileIds;
    if (body.allowedApis !== undefined)
      (partner as any).allowedApis = body.allowedApis;
    if (body.overrides !== undefined)
      (partner as any).overrides = body.overrides;
    await partner.save();

    return {
      ...partner.toJSON(),
      profileIds: (partner as any).profileIds || [],
      allowedApis: (partner as any).allowedApis || [],
      overrides: (partner as any).overrides || { allow: [], deny: [] },
    };
  }

  async remove(id: string) {
    const partner = await this.partnerModel.findByPk(id);
    if (!partner) throw new NotFoundException('Không tìm thấy đối tác');

    if (partner.accountId) {
      throw new BadRequestException(
        'Không thể xóa đối tác đã liên kết với tài khoản. Vui lòng hủy liên kết trước.',
      );
    }

    await partner.destroy();
    return { message: 'Xóa thành công' };
  }

  async updateStatus(id: string, status: string) {
    const partner = await this.partnerModel.findByPk(id);
    if (!partner) throw new NotFoundException('Không tìm thấy đối tác');

    partner.status = status;
    await partner.save();

    return { success: true, partner };
  }
}
