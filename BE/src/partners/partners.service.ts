import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Partner } from './partner.entity';

@Injectable()
export class PartnersService {
  constructor(@InjectModel(Partner) private partnerModel: typeof Partner) {}

  async findAll() {
    return this.partnerModel.findAll();
  }

  async create(body: { name: string; email?: string; clientId?: string; status?: string; accountId?: number }) {
    const maxId = await this.partnerModel.max('id') as string;
    const num = maxId ? parseInt(maxId.split('-')[1]) : 0;
    const newId = `pt-${num + 1}`;

    const newPartner = await this.partnerModel.create({
      id: newId,
      name: body.name,
      email: body.email || null,
      clientId: body.clientId || `PVI_${String(num + 1).padStart(3, '0')}`,
      status: body.status || 'active',
      accountId: body.accountId || null,
    } as any);

    return newPartner;
  }

  async update(id: string, body: { name?: string; email?: string; clientId?: string; status?: string; accountId?: number }) {
    const partner = await this.partnerModel.findByPk(id);
    if (!partner) throw new NotFoundException('Không tìm thấy đối tác');

    partner.name = body.name || partner.name;
    partner.email = body.email !== undefined ? body.email : partner.email;
    partner.clientId = body.clientId || partner.clientId;
    partner.status = body.status || partner.status;
    partner.accountId = body.accountId !== undefined ? body.accountId : partner.accountId;
    await partner.save();

    return partner;
  }

  async remove(id: string) {
    const partner = await this.partnerModel.findByPk(id);
    if (!partner) throw new NotFoundException('Không tìm thấy đối tác');

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
