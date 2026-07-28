import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Partner } from '../partners/partner.entity';

const logger = new Logger('Seed');

async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function seedDatabase(): Promise<void> {
  const userCount = await User.count();
  if (userCount > 0) {
    logger.log('Data already seeded, skipping.');
    return;
  }

  const hashed123 = await hashPassword('123');

  await User.bulkCreate([
    { email: 'admin@pvi.com', password: hashed123, role: 'ADMIN', status: 'Active', description: 'Quản trị viên' },
    { email: 'momo@pvi.com', password: hashed123, role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản Ví MoMo' },
    { email: 'vifo@pvi.com', password: hashed123, role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản VIFO' },
    { email: 'zalopay@pvi.com', password: hashed123, role: 'ĐỐI TÁC', status: 'Inactive', description: 'Tài khoản ZaloPay' },
    { email: 'vnpay@pvi.com', password: hashed123, role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản VNPay' },
  ]);
  logger.log('✅ Seeded users.');

  const partnerCount = await Partner.count();
  if (partnerCount > 0) return;

  await Partner.bulkCreate([
    { id: 'pt-1', name: 'Ví Điện Tử MoMo', email: 'momo@pvi.com', clientId: 'MOMO_PVI_2026', status: 'active', accountId: 2 },
    { id: 'pt-2', name: 'Nền tảng VIFO', email: 'vifo@pvi.com', clientId: 'VIFO_INSURTECH', status: 'active', accountId: 3 },
    { id: 'pt-3', name: 'Ví Điện Tử ZaloPay', email: 'zalopay@pvi.com', clientId: 'ZALOPAY_GATEWAY', status: 'inactive', accountId: 4 },
    { id: 'pt-4', name: 'Cổng VNPay', email: 'vnpay@pvi.com', clientId: 'VNPAY_BANKING', status: 'active', accountId: 5 },
    { id: 'pt-5', name: 'Công ty Bảo hiểm XYZ', email: null, clientId: 'XYZ_INSURANCE', status: 'active', accountId: null },
  ]);
  logger.log('✅ Seeded partners.');
}
