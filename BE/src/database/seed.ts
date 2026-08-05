import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Partner } from '../partners/partner.entity';
import { ApiDocument } from '../documents/document.entity';
import { ApiEndpoint } from '../documents/endpoint.entity';

const logger = new Logger('Seed');

async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

const SEED_PROJECTS = [
  {
    projectId: 'project-pvi-retail',
    projectName: 'Hệ thống Bán lẻ PVI Core',
    allowedPartners: ['pt-vifo', 'pt-momo'],
    documents: [
      {
        id: 'auth-api-keys',
        title: 'AUTHENTICATION',
        endpoints: [
          {
            endpointId: 'ep-auth-token',
            method: 'POST',
            path: '/token',
            name: 'Khởi tạo Access Token (OAuth2 Client Credentials)',
            allowedPartners: ['pt-vifo', 'pt-momo'],
            requestSample: {
              client_id: 'PARTNER_ANBIEN_ID',
              client_secret: 'pvi_secret_key_abc123',
              grant_type: 'client_credentials',
            },
            responseFormat: {
              status: 'success',
              access_token: 'eyJhbGciOiJIUzI1Ni...',
              expires_in: 86400,
              token_type: 'Bearer',
            },
          },
        ],
      },
      {
        id: 'bao-hiem-xe-may',
        title: 'BẢO HIỂM XE MÁY',
        endpoints: [
          {
            endpointId: 'ep-moto-calc',
            method: 'POST',
            path: '/moto/calculate',
            name: 'Tính toán tổng phí bảo hiểm bắt buộc & tự nguyện xe máy',
            allowedPartners: ['pt-vifo', 'pt-momo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              Sign: '7ac110780f2d5902',
              loai_xe: 'MOTO_01',
              muc_trachnhiem_laiphu: 20000000,
              so_nguoi_tgia_laiphu: 2,
            },
            responseFormat: {
              Status: '00',
              Message: 'Tính phí xe máy thành công',
              Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 },
            },
          },
          {
            endpointId: 'ep-moto-insert',
            method: 'POST',
            path: '/insert-moto',
            name: 'Đăng ký thông tin cấp ấn chỉ bảo hiểm Xe Máy',
            allowedPartners: ['pt-vifo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              Sign: 'b2c3d4e5f6g7h8i9',
              ten_nguoimua_bh: 'Trần Thị B',
              so_dienthoai: '0912345678',
              TongPhi: 106000,
              ma_giaodich: 'GD_MOTO_992',
            },
            responseFormat: {
              Status: '00',
              Message: 'Cấp đơn xe máy thành công',
              TotalFee: 106000,
              Data: { so_gcn: 'GCN/MOTO/2026/002' },
            },
          },
        ],
      },
      {
        id: 'bao-hiem-xe-o-to',
        title: 'BẢO HIỂM XE Ô TÔ',
        endpoints: [
          {
            endpointId: 'ep-oto-calc',
            method: 'POST',
            path: '/calculate-premium',
            name: 'Tính phí bảo hiểm trách nhiệm dân sự bắt buộc xe ô tô',
            allowedPartners: ['pt-vifo', 'pt-momo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              Sign: '41d8e12a0f2d5902',
              ma_loaixe: 'X01',
              so_cho: 5,
              thamgia_laiphu: true,
              so_nguoi: 5,
              mtn_laiphu: 50000000,
            },
            responseFormat: {
              Status: '00',
              Message: 'Tính phí ô tô thành công',
              Data: {
                PhiBHTNDSBB: 437000,
                PhiBHLaiPhu: 100000,
                ThueVAT: 53700,
                TongPhi: 590700,
              },
            },
          },
          {
            endpointId: 'ep-oto-insert',
            method: 'POST',
            path: '/insert-oto',
            name: 'Đẩy dữ liệu thông tin chủ xe, số khung số máy cấp đơn ô tô',
            allowedPartners: ['pt-vifo', 'pt-momo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              Sign: 'a1b2c3d4e5f6g7h8',
              TenKH: 'Nguyễn Văn A',
              DienThoai: '0901234567',
              ChoNgoi: 5,
              TongPhi: 590700,
              SoKhung: 'RLH43219876',
              SoMay: '2AZ123456',
            },
            responseFormat: {
              Status: '00',
              Message: 'Cấp đơn ô tô thành công',
              TotalFee: 590700,
              Data: {
                ma_giaodich: 'GD_OTO_2026_01',
                so_gcn: 'GCN/OTO/2026/001',
                Pr_key: 1256789,
              },
            },
          },
        ],
      },
      {
        id: 'ho-tro-boi-thuong',
        title: 'HỖ TRỢ BỒI THƯỜNG',
        endpoints: [
          {
            endpointId: 'ep-claim-reg',
            method: 'POST',
            path: '/register',
            name: 'Khai báo tổn thất, gửi yêu cầu duyệt bồi thường trực tuyến',
            allowedPartners: ['pt-vifo', 'pt-momo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              Sign: '5ab100780f2d5902',
              so_gcn: 'GCN/OTO/2026/001',
              mo_ta_su_co: 'Xe va chạm quẹt vào dải phân cách',
              hinh_anh_hieng_truong: [
                'https://image-store.com/claim/img01.jpg',
              ],
            },
            responseFormat: {
              Status: '00',
              Message: 'Tiếp nhận thành công',
              Data: { claim_id_str: 'CLAIM_2026_9921', status_code: 200 },
            },
          },
        ],
      },
    ],
  },
  {
    projectId: 'project-pvi-enterprise',
    projectName: 'Hệ thống Nghiệp vụ Doanh nghiệp lớn',
    allowedPartners: ['pt-vifo'],
    documents: [
      {
        id: 'hoa-don-dien-tu',
        title: 'HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)',
        endpoints: [
          {
            endpointId: 'ep-invoice-issue',
            method: 'POST',
            path: '/issue',
            name: 'Yêu cầu phát hành hóa đơn tài chính GTGT điện tử',
            allowedPartners: ['pt-vifo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              so_gcn: 'GCN/OTO/2026/001',
              MaSoThue: '0101234567',
              TenDonVi: 'Công ty TNHH A',
              DiaChiHoaDon: 'Quận 1, TP. HCM',
            },
            responseFormat: {
              Status: '00',
              Message: 'Phát hành hóa đơn thành công',
              MaSoBaoMat: 'INV-99281-2026',
              LinkHoaDon: 'https://einvoice.pvi.com.vn/view/inv-99281',
            },
          },
        ],
      },
      {
        id: 'doi-soat-ke-toan',
        title: 'ĐỐI SOÁT & KẾ TOÁN',
        endpoints: [
          {
            endpointId: 'ep-finance-recon',
            method: 'POST',
            path: '/reconciliation',
            name: 'Đối soát danh sách giao dịch định kỳ theo ngày dòng tiền',
            allowedPartners: ['pt-vifo', 'pt-momo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              NgayDoiSoat: '11/06/2026',
              LoaiAnChi: 'OTO',
            },
            responseFormat: {
              Status: '00',
              Message: 'Trùng khớp dữ liệu đối soát',
              TongSoDon: 142,
              TongDoanhThu: 76230000,
              TrangThaiDoiSoat: 'MATCHED',
            },
          },
        ],
      },
      {
        id: 'quan-ly-dai-ly',
        title: 'QUẢN LÝ ĐẠI LÝ KÊNH BÁN',
        endpoints: [
          {
            endpointId: 'ep-agent-commission',
            method: 'POST',
            path: '/commission-query',
            name: 'Tra cứu tỷ lệ chiết khấu thương mại của điểm bán hoa hồng',
            allowedPartners: ['pt-vifo'],
            requestSample: {
              CpId: 'PARTNER_ANBIEN_2026',
              AgentCode: 'SUB_AG_HCM_01',
              MaLoaiAnChi: 'MOTO',
            },
            responseFormat: {
              Status: '00',
              Message: 'Lấy cấu hình thành công',
              TyleChietKhau: 0.15,
              PhisauChietKhau: 85000,
            },
          },
        ],
      },
    ],
  },
];

export async function seedDatabase(): Promise<void> {
  const userCount = await User.count();
  if (userCount > 0) {
    logger.log('Users already seeded, skipping.');
  } else {
    const hashed123 = await hashPassword('123');

    await User.bulkCreate([
      {
        email: 'admin@pvi.com',
        password: hashed123,
        role: 'ADMIN',
        status: 'Active',
        description: 'Quản trị viên',
      },
      {
        email: 'momo@pvi.com',
        password: hashed123,
        role: 'ĐỐI TÁC',
        status: 'Active',
        description: 'Tài khoản Ví MoMo',
      },
      {
        email: 'vifo@pvi.com',
        password: hashed123,
        role: 'ĐỐI TÁC',
        status: 'Active',
        description: 'Tài khoản VIFO',
      },
      {
        email: 'zalopay@pvi.com',
        password: hashed123,
        role: 'ĐỐI TÁC',
        status: 'Active',
        description: 'Tài khoản ZaloPay',
      },
      {
        email: 'vnpay@pvi.com',
        password: hashed123,
        role: 'ĐỐI TÁC',
        status: 'Active',
        description: 'Tài khoản VNPay',
      },
    ]);
    logger.log('✅ Seeded users.');
  }

  const partnerCount = await Partner.count();
  if (partnerCount > 0) {
    logger.log('Partners already seeded, skipping.');
  } else {
    await Partner.bulkCreate([
      {
        id: 'pt-1',
        name: 'Ví Điện Tử MoMo',
        email: 'momo@pvi.com',
        clientId: 'MOMO_PVI_2026',
        status: 'active',
        accountId: 2,
      },
      {
        id: 'pt-2',
        name: 'Nền tảng VIFO',
        email: 'vifo@pvi.com',
        clientId: 'VIFO_INSURTECH',
        status: 'active',
        accountId: 3,
      },
      {
        id: 'pt-3',
        name: 'Ví Điện Tử ZaloPay',
        email: 'zalopay@pvi.com',
        clientId: 'ZALOPAY_GATEWAY',
        status: 'active',
        accountId: 4,
      },
      {
        id: 'pt-4',
        name: 'Cổng VNPay',
        email: 'vnpay@pvi.com',
        clientId: 'VNPAY_BANKING',
        status: 'active',
        accountId: 5,
      },
      {
        id: 'pt-5',
        name: 'Công ty Bảo hiểm XYZ',
        email: null,
        clientId: 'XYZ_INSURANCE',
        status: 'active',
        accountId: null,
      },
    ]);
    logger.log('✅ Seeded partners.');
  }

  const docCount = await ApiDocument.count();
  if (docCount > 0) {
    logger.log('Documents already seeded, skipping.');
    return;
  }

  for (const project of SEED_PROJECTS) {
    for (const doc of project.documents) {
      await ApiDocument.create({
        id: doc.id,
        projectId: project.projectId,
        projectName: project.projectName,
        title: doc.title,
        allowedPartners: project.allowedPartners,
      } as any);
      for (const ep of doc.endpoints) {
        await ApiEndpoint.create({
          ...ep,
          documentId: doc.id,
        } as any);
      }
    }
  }
  logger.log('✅ Seeded documents & endpoints.');
}
