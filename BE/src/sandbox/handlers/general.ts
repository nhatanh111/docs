export const generalHandlers: Record<string, (body: any) => any> = {
  'auth-api-keys': () => ({
    status: 'success',
    data: {
      status: 'success',
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expires_in: 86400,
      token_type: 'Bearer',
    },
  }),
  'api-query-order': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Thành công',
      Data: {
        ma_giaodich: 'GD_OTO_2026_01',
        so_gcn: 'GCN/OTO/2026/001',
        trang_thai: 'ACTIVATED',
        ngay_phathanh: '11/06/2026 10:30',
      },
    },
  }),
  'api-download-pdf': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Thành công',
      link: 'https://e-cert.pvi.com.vn/download/pdf/GCN-OTO-2026.pdf',
      media_type: 'application/pdf',
    },
  }),
  'api-einvoice-issue': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Phát hành hóa đơn thành công',
      MaSoBaoMat: 'INV-99281-2026',
      LinkHoaDon: 'https://einvoice.pvi.com.vn/view/inv-99281',
    },
  }),
  'api-recon-daily': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Trùng khớp dữ liệu đối soát',
      TongSoDon: 142,
      TongDoanhThu: 76230000,
      TrangThaiDoiSoat: 'MATCHED',
    },
  }),
  'api-agent-commission': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Lấy cấu hình thành công',
      TyleChietKhau: 0.15,
      PhisauChietKhau: 85000,
    },
  }),
  'api-endorse-cancel': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Yêu cầu hủy đơn đã được tiếp nhận',
      TrangThaiDon: 'PENDING_CANCELLATION',
      PhiHoanLaiDuKien: 320000,
    },
  }),
  'api-crm-renewal-check': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Tìm thấy dữ liệu tái tục',
      DanhSachSapHetHan: [
        {
          SoGCN: 'GCN/OTO/2025/882',
          TenKhachHang: 'Vũ Văn C',
          NgayHetHan: '12/07/2026',
        },
      ],
    },
  }),
  'api-uw-risk-assess': () => ({
    status: 'success',
    data: {
      Status: '01',
      Message: 'Vượt hạn mức duyệt tự động - Chuyển chuyên viên',
      KquaThamDinh: 'REFER_TO_UW',
      MaHoSoThamDinh: 'UW-OTO-2026-009',
    },
  }),
  'api-reinsurance-share': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Phân bổ thành công',
      TyLeGiuLai: 0.2,
      TyLeTaiPhanGiao: 0.8,
      NhaTaiBaoHiemGoc: 'PVI RE',
    },
  }),
};
