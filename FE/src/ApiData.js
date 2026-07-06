// src/ApiData.js

// ==========================================
// DANH SÁCH CATEGORIES (Nhóm API)
// ==========================================
export const API_CATEGORIES = [
  { id: 'cat-tnds-oto', name: 'Bảo hiểm TNDS Ô tô', icon: '🚗', expanded: true },
  { id: 'cat-tnds-xemay', name: 'Bảo hiểm TNDS Xe máy', icon: '🏍️', expanded: false },
  { id: 'cat-vcx-oto', name: 'Bảo hiểm Vật chất Xe ô tô', icon: '🚛', expanded: false },
  { id: 'cat-tncn', name: 'Bảo hiểm Tai nạn cá nhân', icon: '👤', expanded: false },
  { id: 'cat-dulich', name: 'Bảo hiểm Du lịch', icon: '✈️', expanded: false },
  { id: 'cat-suckhoe', name: 'Bảo hiểm Sức khỏe', icon: '🏥', expanded: false },
  { id: 'cat-taichinh', name: 'Bảo hiểm Tài sản', icon: '🏠', expanded: false },
  { id: 'cat-khoanvay', name: 'Bảo hiểm Khoản vay (OCH)', icon: '🏦', expanded: false },
  { id: 'cat-danhmuc', name: 'Hệ thống Danh mục', icon: '📋', expanded: false },
  { id: 'cat-callback', name: 'Hỗ trợ & Callback', icon: '🔄', expanded: false }
];

// ==========================================
// DANH SÁCH API GROUPS (RÚT GỌN ĐỂ DEMO)
// ==========================================
export const API_GROUPS = [
  // 1. BẢO HIỂM TNDS Ô TÔ
  {
    categoryId: 'cat-tnds-oto',
    name: 'Bảo hiểm TNDS Ô tô',
    apis: [
      {
        id: 'api-tnds-oto-fee',
        method: 'POST',
        path: '/API_cp/ManagerApplication/Get_TongPhi_Auto_TNDS',
        name: 'Tính phí TNDS bắt buộc ô tô',
        description: 'Tính phí bảo hiểm trách nhiệm dân sự bắt buộc xe ô tô',
        requestSample: {
          ma_trongtai: '',
          so_cho: 5,
          ma_mdsd: '1',
          giodau: '00:00',
          giocuoi: '23:59',
          ngaydau: '17/12/2025',
          ngaycuoi: '16/12/2026',
          mtn_laiphu: 50000000,
          so_nguoi: 5,
          thamgia_laiphu: true,
          thamgia_tndsbb: true,
          ma_loaixe: '3001',
          MayKeo: false,
          XeChuyenDung: false,
          XeChoTien: false,
          XePickUp: false,
          XeTapLai: false,
          XeTaiVan: false,
          XeCuuThuong: false,
          XeBus: false,
          Xetaxi: false,
          XeDauKeo: false,
          CpId: 'nguyễn văn a',
          Sign: '7ac110780f2d5902'
        },
        responseFormat: {
          Status: '00',
          Message: 'Thanh cong',
          TotalFee: '510700',
          phi_tndsbb: '437000',
          phi_lpx: '73700',
          ma_loaixe: '3001'
        },
        allowedPartners: []
      },
      {
        id: 'api-tnds-oto-create',
        method: 'POST',
        path: '/API_CP/ManagerApplication/TaoDon_Auto',
        name: 'Tạo đơn TNDS bắt buộc ô tô',
        description: 'Đẩy dữ liệu tạo đơn bảo hiểm TNDS bắt buộc ô tô',
        requestSample: {
          ma_giaodich: 'test_001',
          TenKH: 'Nguyễn Văn A',
          DiaChiKH: '1 Lê Duẩn, Q1, HCM',
          TenChuXe: 'Nguyễn Văn A',
          DiaChiChuXe: '1 Lê Duẩn, Q1, HCM',
          EmailKH: 'khachhang@gmail.com',
          LoaiXe: '30051',
          BienKiemSoat: '45F1-58055',
          SoKhung: '0AHBH039727',
          SoMay: 'S1E8AH039727',
          NgayDau: '24/12/2025',
          NgayCuoi: '23/12/2026',
          GioDau: '00:00',
          GioCuoi: '23:59',
          ChoNgoi: 5,
          PhiBHTNDSBB: '437000',
          ThamGiaLaiPhu: true,
          MTNLaiPhu: '50000000',
          SoNguoiToiDa: '5',
          PhiBHLaiPhu: '100000',
          TongPhi: '537000',
          MaMucDichSD: '1',
          AnBKS: false,
          AnPhi: false,
          CpId: 'nguyễn văn a',
          Sign: '7ac110780f2d5902'
        },
        responseFormat: {
          Status: '00',
          Message: 'Tạo đơn thành công',
          Pr_key: 123456
        },
        allowedPartners: []
      },
      {
        id: 'api-tnds-oto-get-maloaixe',
        method: 'POST',
        path: '/API_CP/ManagerApplication/GetMaLoaiXe_Auto',
        name: 'Lấy mã loại xe ô tô',
        description: 'Lấy danh sách mã loại xe cho TNDS bắt buộc ô tô',
        requestSample: {
          SoChoNgoi: 5,
          Ma_MDSD: '1',
          LoaiHinh: '',
          TrongTai: 0,
          CpId: 'nguyễn văn a',
          Sign: '7ac110780f2d5902'
        },
        responseFormat: {
          Status: '00',
          Message: 'Thành công',
          Data: [
            { Value: '3001', Text: 'Xe ô tô dưới 6 chỗ không KDVT' },
            { Value: '3002', Text: 'Xe ô tô dưới 6 chỗ KDVT' }
          ]
        },
        allowedPartners: []
      }
    ]
  },
  // 2. BẢO HIỂM TNDS XE MÁY
  {
    categoryId: 'cat-tnds-xemay',
    name: 'Bảo hiểm TNDS Xe máy',
    apis: [
      {
        id: 'api-tnds-moto-fee',
        method: 'POST',
        path: '/API_CP/ManagerApplication/Get_Phi_XeMay',
        name: 'Tính phí TNDS xe máy',
        description: 'Tính phí bảo hiểm TNDS bắt buộc xe máy',
        requestSample: {
          ngay_dau: '23/12/2025 15:00',
          ngay_cuoi: '23/12/2026 14:59',
          loai_xe: '1002',
          thamgia_laiphu: true,
          muc_trachnhiem_laiphu: 5000000,
          so_nguoi_tgia_laiphu: 2,
          tyle_phi_laiphu: '',
          CpId: 'nguyễn văn a',
          Sign: '7ac110780f2d5902'
        },
        responseFormat: {
          Status: '00',
          Message: 'Thanh cong',
          phi_moto: 66000,
          phi_laiphu: 10000,
          TotalFee: 76000
        },
        allowedPartners: []
      },
      {
        id: 'api-tnds-moto-create',
        method: 'POST',
        path: '/API_CP/ManagerApplication/TaoDon_XeMay',
        name: 'Tạo đơn TNDS xe máy',
        description: 'Đẩy dữ liệu tạo đơn bảo hiểm TNDS bắt buộc xe máy',
        requestSample: {
          ma_giaodich: 'moto_test_001',
          ten_nguoimua_bh: 'Nguyễn Văn A',
          diachi_nguoimua_bh: '1 Lê Duẩn, Q1, HCM',
          ngay_dau: '23/12/2025 15:00',
          ngay_cuoi: '23/12/2026 14:59',
          bien_kiemsoat: '60B131095',
          so_may: 'S1E8A H039727',
          so_khung: '0AHBH 039727',
          loai_xe: '1002',
          nhan_hieu: '201',
          nam_sanxuat: '2022',
          ten_chuxe: 'Nguyễn Văn A',
          email: 'khachhang@gmail.com',
          so_dienthoai: '0933269812',
          dia_chi: '1 Lê Duẩn, Q1, HCM',
          thamgia_laiphu: true,
          muc_trachnhiem_laiphu: 50000000,
          so_nguoi_tgia_laiphu: 2,
          an_bien_ks: false,
          CpId: 'nguyễn văn a',
          Sign: '7ac110780f2d5902'
        },
        responseFormat: {
          Status: '00',
          Message: 'Tạo đơn thành công',
          Pr_key: 123456
        },
        allowedPartners: []
      }
    ]
  }
  // Có thể thêm các danh mục khác nếu cần
];