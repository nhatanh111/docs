import { Injectable, NotFoundException } from '@nestjs/common';

export interface Endpoint {
  endpointId: string;
  method: string;
  path: string;
  name: string;
  allowedPartners: string[];
  requestSample?: any;
  responseFormat?: any;
  description?: string;
  fields?: any[];
}

export interface Document {
  id: string;
  title: string;
  endpoints: Endpoint[];
}

export interface Project {
  projectId: string;
  projectName: string;
  allowedPartners: string[];
  documents: Document[];
}

@Injectable()
export class DocumentsService {
  private projects: Project[] = [
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
              endpointId: 'ep-auth-token', method: 'POST', path: '/token',
              name: 'Khởi tạo Access Token (OAuth2 Client Credentials)',
              allowedPartners: ['pt-vifo', 'pt-momo'],
              requestSample: { client_id: 'PARTNER_ANBIEN_ID', client_secret: 'pvi_secret_key_abc123', grant_type: 'client_credentials' },
              responseFormat: { status: 'success', access_token: 'eyJhbGciOiJIUzI1Ni...', expires_in: 86400, token_type: 'Bearer' },
            },
          ],
        },
        {
          id: 'bao-hiem-xe-may', title: 'BẢO HIỂM XE MÁY',
          endpoints: [
            {
              endpointId: 'ep-moto-calc', method: 'POST', path: '/moto/calculate',
              name: 'Tính toán tổng phí bảo hiểm bắt buộc & tự nguyện xe máy',
              allowedPartners: ['pt-vifo', 'pt-momo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', Sign: '7ac110780f2d5902', loai_xe: 'MOTO_01', muc_trachnhiem_laiphu: 20000000, so_nguoi_tgia_laiphu: 2 },
              responseFormat: { Status: '00', Message: 'Tính phí xe máy thành công', Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } },
            },
            {
              endpointId: 'ep-moto-insert', method: 'POST', path: '/insert-moto',
              name: 'Đăng ký thông tin cấp ấn chỉ bảo hiểm Xe Máy',
              allowedPartners: ['pt-vifo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', Sign: 'b2c3d4e5f6g7h8i9', ten_nguoimua_bh: 'Trần Thị B', so_dienthoai: '0912345678', TongPhi: 106000, ma_giaodich: 'GD_MOTO_992' },
              responseFormat: { Status: '00', Message: 'Cấp đơn xe máy thành công', TotalFee: 106000, Data: { so_gcn: 'GCN/MOTO/2026/002' } },
            },
          ],
        },
        {
          id: 'bao-hiem-xe-o-to', title: 'BẢO HIỂM XE Ô TÔ',
          endpoints: [
            {
              endpointId: 'ep-oto-calc', method: 'POST', path: '/calculate-premium',
              name: 'Tính phí bảo hiểm trách nhiệm dân sự bắt buộc xe ô tô',
              allowedPartners: ['pt-vifo', 'pt-momo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', Sign: '41d8e12a0f2d5902', ma_loaixe: 'X01', so_cho: 5, thamgia_laiphu: true, so_nguoi: 5, mtn_laiphu: 50000000 },
              responseFormat: { Status: '00', Message: 'Tính phí ô tô thành công', Data: { PhiBHTNDSBB: 437000, PhiBHLaiPhu: 100000, ThueVAT: 53700, TongPhi: 590700 } },
            },
            {
              endpointId: 'ep-oto-insert', method: 'POST', path: '/insert-oto',
              name: 'Đẩy dữ liệu thông tin chủ xe, số khung số máy cấp đơn ô tô',
              allowedPartners: ['pt-vifo', 'pt-momo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', Sign: 'a1b2c3d4e5f6g7h8', TenKH: 'Nguyễn Văn A', DienThoai: '0901234567', ChoNgoi: 5, TongPhi: 590700, SoKhung: 'RLH43219876', SoMay: '2AZ123456' },
              responseFormat: { Status: '00', Message: 'Cấp đơn ô tô thành công', TotalFee: 590700, Data: { ma_giaodich: 'GD_OTO_2026_01', so_gcn: 'GCN/OTO/2026/001', Pr_key: 1256789 } },
            },
          ],
        },
        {
          id: 'ho-tro-boi-thuong', title: 'HỖ TRỢ BỒI THƯỜNG',
          endpoints: [
            {
              endpointId: 'ep-claim-reg', method: 'POST', path: '/register',
              name: 'Khai báo tổn thất, gửi yêu cầu duyệt bồi thường trực tuyến',
              allowedPartners: ['pt-vifo', 'pt-momo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', Sign: '5ab100780f2d5902', so_gcn: 'GCN/OTO/2026/001', mo_ta_su_co: 'Xe va chạm quẹt vào dải phân cách', hinh_anh_hieng_truong: ['https://image-store.com/claim/img01.jpg'] },
              responseFormat: { Status: '00', Message: 'Tiếp nhận thành công', Data: { claim_id_str: 'CLAIM_2026_9921', status_code: 200 } },
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
          id: 'hoa-don-dien-tu', title: 'HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)',
          endpoints: [
            {
              endpointId: 'ep-invoice-issue', method: 'POST', path: '/issue',
              name: 'Yêu cầu phát hành hóa đơn tài chính GTGT điện tử',
              allowedPartners: ['pt-vifo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', so_gcn: 'GCN/OTO/2026/001', MaSoThue: '0101234567', TenDonVi: 'Công ty TNHH A', DiaChiHoaDon: 'Quận 1, TP. HCM' },
              responseFormat: { Status: '00', Message: 'Phát hành hóa đơn thành công', MaSoBaoMat: 'INV-99281-2026', LinkHoaDon: 'https://einvoice.pvi.com.vn/view/inv-99281' },
            },
          ],
        },
        {
          id: 'doi-soat-ke-toan', title: 'ĐỐI SOÁT & KẾ TOÁN',
          endpoints: [
            {
              endpointId: 'ep-finance-recon', method: 'POST', path: '/reconciliation',
              name: 'Đối soát danh sách giao dịch định kỳ theo ngày dòng tiền',
              allowedPartners: ['pt-vifo', 'pt-momo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', NgayDoiSoat: '11/06/2026', LoaiAnChi: 'OTO' },
              responseFormat: { Status: '00', Message: 'Trùng khớp dữ liệu đối soát', TongSoDon: 142, TongDoanhThu: 76230000, TrangThaiDoiSoat: 'MATCHED' },
            },
          ],
        },
        {
          id: 'quan-ly-dai-ly', title: 'QUẢN LÝ ĐẠI LÝ KÊNH BÁN',
          endpoints: [
            {
              endpointId: 'ep-agent-commission', method: 'POST', path: '/commission-query',
              name: 'Tra cứu tỷ lệ chiết khấu thương mại của điểm bán hoa hồng',
              allowedPartners: ['pt-vifo'],
              requestSample: { CpId: 'PARTNER_ANBIEN_2026', AgentCode: 'SUB_AG_HCM_01', MaLoaiAnChi: 'MOTO' },
              responseFormat: { Status: '00', Message: 'Lấy cấu hình thành công', TyleChietKhau: 0.15, PhisauChietKhau: 85000 },
            },
          ],
        },
      ],
    },
  ];

  getDocuments(user?: any) {
    if (!user || user.role === 'ADMIN') return this.projects;

    const partnerId = user.partnerId;
    return this.projects
      .filter(p => p.allowedPartners.includes(partnerId))
      .map(p => ({
        ...p,
        documents: p.documents.map(d => ({
          ...d,
          endpoints: d.endpoints.filter(ep => ep.allowedPartners.includes(partnerId)),
        })).filter(d => d.endpoints.length > 0),
      }))
      .filter(p => p.documents.length > 0);
  }

  setProjectPermission(partnerId: string, projectId: string, hasPermission: boolean) {
    const project = this.projects.find(p => p.projectId === projectId);
    if (!project) throw new NotFoundException('Không tìm thấy Project');

    if (hasPermission && !project.allowedPartners.includes(partnerId)) {
      project.allowedPartners.push(partnerId);
    } else if (!hasPermission) {
      project.allowedPartners = project.allowedPartners.filter(id => id !== partnerId);
    }

    return { success: true, projects: this.projects };
  }

  setEndpointPermission(partnerId: string, endpointId: string, hasPermission: boolean) {
    let isFound = false;
    for (const p of this.projects) {
      for (const d of p.documents) {
        const ep = d.endpoints.find(e => e.endpointId === endpointId);
        if (ep) {
          isFound = true;
          if (hasPermission && !ep.allowedPartners.includes(partnerId)) {
            ep.allowedPartners.push(partnerId);
          } else if (!hasPermission) {
            ep.allowedPartners = ep.allowedPartners.filter(id => id !== partnerId);
          }
          break;
        }
      }
    }

    if (!isFound) throw new NotFoundException('Không tìm thấy Endpoint');
    return { success: true, projects: this.projects };
  }

  uploadEndpoints(endpoints: any[]) {
    const uploadedProjectId = 'project-uploaded';
    let uploadedProject = this.projects.find(p => p.projectId === uploadedProjectId);

    if (!uploadedProject) {
      uploadedProject = {
        projectId: uploadedProjectId,
        projectName: 'APIs từ đối tác',
        allowedPartners: [],
        documents: [],
      };
      this.projects.push(uploadedProject);
    }

    const categoryMap = new Map<string, any[]>();
    endpoints.forEach(ep => {
      const cat = ep.category || 'CHUNG';
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push({
        endpointId: ep.id,
        method: ep.method,
        path: ep.path,
        name: ep.name,
        description: ep.description || '',
        requestSample: ep.requestSample,
        responseFormat: ep.responseFormat,
        fields: ep.fields || [],
        allowedPartners: [],
      });
    });

    categoryMap.forEach((eps, catName) => {
      const docId = `uploaded-doc-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const existingDoc = uploadedProject!.documents.find(d => d.id === docId);
      if (existingDoc) {
        const existingIds = new Set(existingDoc.endpoints.map(e => e.endpointId));
        const newEps = eps.filter((e: any) => !existingIds.has(e.endpointId));
        existingDoc.endpoints.push(...newEps);
      } else {
        uploadedProject!.documents.push({
          id: docId,
          title: catName.toUpperCase(),
          endpoints: eps,
        });
      }
    });

    return { success: true, count: endpoints.length };
  }

  getUploadedEndpoints() {
    const project = this.projects.find(p => p.projectId === 'project-uploaded');
    if (!project) return [];

    const result: any[] = [];
    project.documents.forEach(doc => {
      doc.endpoints.forEach(ep => {
        result.push({
          id: ep.endpointId,
          category: doc.title,
          method: ep.method,
          path: ep.path,
          name: ep.name,
          description: ep.description,
          requestSample: ep.requestSample,
          responseFormat: ep.responseFormat,
          fields: (ep as any).fields || [],
        });
      });
    });
    return result;
  }
}
