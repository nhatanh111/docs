import React, { useState, useEffect, useRef, useCallback } from 'react';

// =========================================================================
// 1. TỪ ĐIỂN ĐỊNH NGHĨA RÀNG BUỘC CÁC TRƯỜNG DỮ LIỆU ĐẶC THÙ (VALIDATION LIMITS)
// =========================================================================
const VALIDATION_LIMITS = {
  so_cho: { min: 1, max: 50, label: "1 đến 50 chỗ" },
  ChoNgoi: { min: 1, max: 50, label: "1 đến 50 chỗ" },
  SoNguoiToiDa: { min: 1, max: 50, label: "1 đến 50 người" },
  so_nguoi: { min: 1, max: 50, label: "1 đến 50 người" },
  so_nguoi_tgia_laiphu: { min: 1, max: 50, label: "1 đến 50 người" },
  mtn_laiphu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  MTNLaiPhu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  muc_trachnhiem_laiphu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  PhiBHLaiPhu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  PhiBHTNDSBB: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_tndsbb: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_lpx: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_moto: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_laiphu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  TongPhi: { min: 1, max: 500000000, label: "1 đến 500M VNĐ" },
  TotalFee: { min: 1, max: 500000000, label: "1 đến 500M VNĐ" }
};

// =========================================================================
// 2. DANH SÁCH TOÀN BỘ ENDPOINTS MẶC ĐỊNH
// =========================================================================
const DEFAULT_ENDPOINTS = [
  {
    id: "info-overview",
    category: "INTRODUCTION",
    method: "INFO",
    path: "Môi trường: Sandbox & Production",
    description: "Tổng quan hệ thống tài liệu An Biên Hub kết nối Core PVI",
    isCustomPage: true,
    pageType: "overview"
  },
  {
    id: "auth-api-keys",
    category: "AUTHENTICATION",
    method: "POST",
    path: "/api/pvi/v1/oauth2/token",
    description: "Khởi tạo Access Token (OAuth2 Client Credentials)",
    requestSample: { client_id: "PARTNER_ANBIEN_ID", client_secret: "pvi_secret_key_abc123", grant_type: "client_credentials" },
    responseFormat: { status: "success", access_token: "eyJhbGciOiJIUzI1Ni...", expires_in: 86400, token_type: "Bearer" }
  },
  {
    id: "auth-signature",
    category: "AUTHENTICATION",
    method: "HASH",
    path: "Thuật toán băm: MD5",
    description: "Quy tắc ký chữ ký bảo mật dữ liệu giao dịch (Sign)",
    isCustomPage: true,
    pageType: "signature"
  },
  {
    id: "auth-headers",
    category: "AUTHENTICATION",
    method: "INFO",
    path: "HTTP Headers bắt buộc kèm theo",
    description: "Cấu hình HTTP Headers truyền tải thông tin định danh",
    isCustomPage: true,
    pageType: "headers"
  },
  {
    id: "api-calculate-premium-moto",
    category: "BẢO HIỂM XE MÁY",
    method: "POST",
    path: "/api/pvi/v1/insurance/moto/calculate",
    description: "Tính toán tổng phí bảo hiểm bắt buộc & tự nguyện xe máy",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "7ac110780f2d5902", loai_xe: "MOTO_01", muc_trachnhiem_laiphu: 20000000, so_nguoi_tgia_laiphu: 2 },
    responseFormat: { Status: "00", Message: "Tính phí xe máy thành công", Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } }
  },
  {
    id: "api-insert-moto",
    category: "BẢO HIỂM XE MÁY",
    method: "POST",
    path: "/api/pvi/v1/insurance/insert-moto",
    description: "Đăng ký thông tin cấp ấn chỉ bảo hiểm Xe Máy",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "b2c3d4e5f6g7h8i9", ten_nguoimua_bh: "Trần Thị B", so_dienthoai: "0912345678", TongPhi: 106000, ma_giaodich: "GD_MOTO_992" },
    responseFormat: { Status: "00", Message: "Cấp đơn xe máy thành công", TotalFee: 106000, Data: { so_gcn: "GCN/MOTO/2026/002" } }
  },
  {
    id: "api-calculate-premium-oto",
    category: "BẢO HIỂM XE Ô TÔ",
    method: "POST",
    path: "/api/pvi/v1/insurance/calculate-premium",
    description: "Tính phí bảo hiểm trách nhiệm dân sự bắt buộc xe ô tô",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "41d8e12a0f2d5902", ma_loaixe: "X01", so_cho: 5, thamgia_laiphu: true, so_nguoi: 5, mtn_laiphu: 50000000 },
    responseFormat: { Status: "00", Message: "Tính phí ô tô thành công", Data: { PhiBHTNDSBB: 437000, PhiBHLaiPhu: 100000, ThueVAT: 53700, TongPhi: 590700 } }
  },
  {
    id: "api-insert-oto",
    category: "BẢO HIỂM XE Ô TÔ",
    method: "POST",
    path: "/api/pvi/v1/insurance/insert-oto",
    description: "Đẩy dữ liệu thông tin chủ xe, số khung số máy cấp đơn ô tô",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "a1b2c3d4e5f6g7h8", TenKH: "Nguyễn Văn A", DienThoai: "0901234567", ChoNgoi: 5, TongPhi: 590700, SoKhung: "RLH43219876", SoMay: "2AZ123456" },
    responseFormat: { Status: "00", Message: "Cấp đơn ô tô thành công", TotalFee: 590700, Data: { ma_giaodich: "GD_OTO_2026_01", so_gcn: "GCN/OTO/2026/001", Pr_key: 1256789 } }
  },
  {
    id: "api-get-car-categories",
    category: "HỆ THỐNG DANH MỤC",
    method: "POST",
    path: "/api/pvi/v1/categories/vehicle",
    description: "Truy vấn các bộ mã danh mục dùng chung (Loại xe, Mục đích sử dụng)",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "9cb100780f2d5902", type: "OTO" },
    responseFormat: { Status: "00", Message: "Lấy dữ liệu danh mục thành công", Data: [{ Value: "X01", Text: "Xe ô tô dưới 6 chỗ không kinh doanh vận tải" }] }
  },
  {
    id: "api-query-order",
    category: "QUẢN LÝ ĐƠN HÀNG & SAU BÁN",
    method: "POST",
    path: "/api/pvi/v1/insurance/query-order",
    description: "Tra cứu trạng thái phát hành và tiến độ xử lý đơn hàng",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "8eb100780f2d5902", ma_giaodich: "GD_OTO_2026_01" },
    responseFormat: { Status: "00", Message: "Thành công", Data: { ma_giaodich: "GD_OTO_2026_01", so_gcn: "GCN/OTO/2026/001", trang_thai: "ACTIVATED", ngay_phathanh: "11/06/2026 10:30" } }
  },
  {
    id: "api-download-pdf",
    category: "QUẢN LÝ ĐƠN HÀNG & SAU BÁN",
    method: "POST",
    path: "/api/pvi/v1/insurance/download-pdf",
    description: "Lấy đường dẫn URL tải file Giấy chứng nhận điện tử (PDF)",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "1cb100780f2d5902", so_gcn: "GCN/OTO/2026/001" },
    responseFormat: { Status: "00", Message: "Thành công", link: "https://e-cert.pvi.com.vn/download/pdf/GCN-OTO-2026.pdf", media_type: "application/pdf" }
  },
  {
    id: "api-submit-claim",
    category: "HỖ TRỢ BỒI THƯỜNG",
    method: "POST",
    path: "/api/pvi/v1/claim/register",
    description: "Khai báo tổn thất, gửi yêu cầu duyệt bồi thường trực tuyến",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "5ab100780f2d5902", so_gcn: "GCN/OTO/2026/001", mo_ta_su_co: "Xe va chạm quẹt vào dải phân cách", hinh_anh_hieng_truong: ["https://image-store.com/claim/img01.jpg"] },
    responseFormat: { Status: "00", Message: "Tiếp nhận thành công", Data: { claim_id_str: "CLAIM_2026_9921", status_code: 200 } }
  },
  {
    id: "api-einvoice-issue",
    category: "HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)",
    method: "POST",
    path: "/api/pvi/v1/einvoice/issue",
    description: "Yêu cầu phát hành hóa đơn tài chính GTGT điện tử",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", so_gcn: "GCN/OTO/2026/001", MaSoThue: "0101234567", TenDonVi: "Công ty TNHH An Biên", DiaChiHoaDon: "Quận 1, TP. HCM" },
    responseFormat: { Status: "00", Message: "Phát hành hóa đơn thành công", MaSoBaoMat: "INV-99281-2026", LinkHoaDon: "https://einvoice.pvi.com.vn/view/inv-99281" }
  },
  {
    id: "api-recon-daily",
    category: "ĐỐI SOÁT & KẾ TOÁN",
    method: "POST",
    path: "/api/pvi/v1/finance/reconciliation",
    description: "Đối soát danh sách giao dịch định kỳ theo ngày dòng tiền",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", NgayDoiSoat: "11/06/2026", LoaiAnChi: "OTO" },
    responseFormat: { Status: "00", Message: "Trùng khớp dữ liệu đối soát", TongSoDon: 142, TongDoanhThu: 76230000, TrangThaiDoiSoat: "MATCHED" }
  },
  {
    id: "api-agent-commission",
    category: "QUẢN LÝ ĐẠI LÝ KÊNH BÁN",
    method: "POST",
    path: "/api/pvi/v1/agent/commission-query",
    description: "Tra cứu tỷ lệ chiết khấu thương mại của điểm bán hoa hồng",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", AgentCode: "SUB_AG_HCM_01", MaLoaiAnChi: "MOTO" },
    responseFormat: { Status: "00", Message: "Lấy cấu hình thành công", TyleChietKhau: 0.15, PhisauChietKhau: 85000 }
  },
  {
    id: "ref-dictionary",
    category: "REFERENCE CENTER",
    method: "DATA",
    path: "Từ điển dữ liệu toàn bộ hệ thống",
    description: "Data Dictionary - Tra cứu giải nghĩa định nghĩa tham số",
    isCustomPage: true,
    pageType: "dictionary"
  },
  {
    id: "ref-status-codes",
    category: "REFERENCE CENTER",
    method: "CODE",
    path: "Mã lỗi quy ước hệ thống Core PVI",
    description: "Status & Error Codes - Bảng tra cứu mã phản hồi hệ thống",
    isCustomPage: true,
    pageType: "error-codes"
  },
  {
    id: "changelog-versions",
    category: "CHANGELOG",
    method: "VER",
    path: "Nhật ký nâng cấp phiên bản",
    description: "Versions - Thông tin cập nhật hệ thống cổng kết nối",
    isCustomPage: true,
    pageType: "changelog"
  }
];

const ERROR_CODES_DATA = [
  ["00", "Success - Giao dịch thành công hoàn tất cấp ấn chỉ"],
  ["01", "Invalid Signature - Chữ ký bảo mật không hợp lệ hoặc sai thuật toán băm"],
  ["02", "Missing CpId - Thiếu mã định danh duy nhất của Đối tác (Partner ID)"],
  ["03", "Missing Parameter - Thiếu các trường dữ liệu bắt buộc trong Request Payload JSON"],
  ["04", "Policy Not Found - Không tìm thấy Số giấy chứng nhận bảo hiểm trên Core"],
  ["05", "Internal Error - Hệ thống Core PVI gặp sự cố xử lý gián đoạn dịch vụ"]
];

const FIELD_DICTIONARY = {
  client_id: "ID cổng ứng dụng phục vụ lấy Access Token OAuth2 bảo mật kết nối",
  client_secret: "Mật khẩu ứng dụng bí mật kết nối an toàn cấp cao hệ thống",
  grant_type: "Phương thức cấp quyền xác thực tài khoản (Mặc định: client_credentials)",
  access_token: "Chuỗi Access Token đại diện cho phiên kết nối hợp lệ của đối tác",
  expires_in: "Thời gian hiệu lực của Access Token tính bằng giây (Mặc định: 86400s = 24h)",
  token_type: "Loại Token định dạng cấu trúc mã hóa xác thực (Bearer token)",
  Sign: "Chữ ký bảo mật kết nối mã hóa dạng chuỗi băm MD5",
  CpId: "Mã định danh duy nhất của Đối tác được PVI cấp phát",
  TenKH: "Họ và tên khách hàng đại diện mua đơn ấn chỉ",
  so_cho: "Số chỗ ngồi đăng ký chính thức của phương tiện xe",
  mtn_laiphu: "Mức trách nhiệm bảo hiểm tai nạn lái phụ xe lựa chọn",
  so_nguoi: "Số người tham gia bảo hiểm tai nạn ngồi trên xe",
  TongPhi: "Tổng số tiền phí bảo hiểm đối tác cần gạch nợ thanh toán",
  Status: "Mã trạng thái phản hồi kết quả (Mặc định 00 là thành công)",
  Message: "Thông báo mô tả chi tiết kết quả xử lý giao dịch hệ thống",
  TotalFee: "Tổng phí bảo hiểm cuối cùng đã bao gồm thuế VAT",
  Data: "Dữ liệu hoặc danh sách mảng chứa các đối tượng nghiệp vụ trả về",
  so_gcn: "Số Giấy chứng nhận bảo hiểm chính thức do hệ thống PVI cấp phát",
  ma_giaodich: "Mã đối tác tự sinh để quản lý đối soát đơn hàng",
  NgayDoiSoat: "Ngày thực hiện đối soát dữ liệu dòng tiền kế toán (DD/MM/YYYY)",
  TongSoDon: "Tổng số lượng đơn hàng bảo hiểm phát sinh trong kỳ đối soát",
  TongDoanhThu: "Tổng số tiền doanh thu phí bảo hiểm tích lũy thu được",
  AgentCode: "Mã quản lý duy nhất của Đại lý hoặc CTV cấp dưới",
  TyleChietKhau: "Tỷ lệ hoa hồng chiết khấu được hưởng thương mại (Ví dụ: 0.15 = 15%)"
};

export default function PartnerDocs({ endpoints }) {
  // ✅ Tạo State lưu trữ danh sách API thật gọi từ Render về
  const [realEndpoints, setRealEndpoints] = useState([]);
  
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com';
    const token = localStorage.getItem('token'); 

    fetch(`${backendUrl}/api/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        // Biến đổi danh mục động từ Backend thành dạng mảng phẳng khớp UI Component
        const flatList = [
          { id: "info-overview", category: "INTRODUCTION", method: "INFO", path: "Môi trường: Sandbox & Production", description: "Tổng quan hệ thống tài liệu An Biên Hub kết nối Core PVI", isCustomPage: true, pageType: "overview" },
          { id: "auth-signature", category: "AUTHENTICATION", method: "HASH", path: "Thuật toán băm: MD5", description: "Quy tắc ký chữ ký bảo mật dữ liệu giao dịch (Sign)", isCustomPage: true, pageType: "signature" },
          { id: "auth-headers", category: "AUTHENTICATION", method: "INFO", path: "HTTP Headers bắt buộc kèm theo", description: "Cấu hình HTTP Headers truyền tải thông tin định danh", isCustomPage: true, pageType: "headers" }
        ];

        data.forEach(doc => {
          if (doc.content && doc.content.endpoints) {
            doc.content.endpoints.forEach((ep, index) => {
              flatList.push({
                id: `${doc.id}-${index}`,
                category: doc.title,
                method: ep.method,
                path: ep.path,
                description: ep.name,
                requestSample: ep.requestSample || {},
                responseFormat: ep.responseFormat || {}
              });
            });
          }
        });

        // Đẩy thêm các trang Reference Center tĩnh vào cuối menu
        flatList.push(
          { id: "ref-dictionary", category: "REFERENCE CENTER", method: "DATA", path: "Từ điển dữ liệu toàn bộ hệ thống", description: "Data Dictionary - Tra cứu giải nghĩa định nghĩa tham số", isCustomPage: true, pageType: "dictionary" },
          { id: "ref-status-codes", category: "REFERENCE CENTER", method: "CODE", path: "Mã lỗi quy ước hệ thống Core PVI", description: "Status & Error Codes - Bảng tra cứu mã phản hồi hệ thống", isCustomPage: true, pageType: "error-codes" },
          { id: "changelog-versions", category: "CHANGELOG", method: "VER", path: "Nhật ký nâng cấp phiên bản", description: "Versions - Thông tin cập nhật hệ thống cổng kết nối", isCustomPage: true, pageType: "changelog" }
        );

        setRealEndpoints(flatList);
      }
    })
    .catch(err => console.error("Lỗi lấy tài liệu từ Render server:", err));
  }, []);

  // ✅ Nếu gọi từ Render thành công thì lấy realEndpoints, không thì dùng DEFAULT_ENDPOINTS làm dự phòng
  const activeEndpoints = realEndpoints.length > 0 ? realEndpoints : DEFAULT_ENDPOINTS;

  const [activeEpId, setActiveEpId] = useState(null);
  const [authToken, setAuthToken] = useState('pvi_secret_access_key_2026');
  const [requestBodies, setRequestBodies] = useState({});
  const [apiResponses, setApiResponses] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const middleScrollRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const apiRefs = useRef({});
  const isClickScrolling = useRef(false);
  const observerRef = useRef(null);

  // Khởi tạo active ID ban đầu khi data đổ về
  useEffect(() => {
    if (activeEndpoints.length > 0 && !activeEpId) {
      setActiveEpId(activeEndpoints[0].id);
    }
  }, [activeEndpoints, activeEpId]);

  const scrollSidebarToActive = useCallback((id) => {
    const sidebar = sidebarScrollRef.current;
    const btn = document.getElementById(`sidebar-item-${id}`);
    if (!sidebar || !btn) return;
    const btnOffsetTop = btn.offsetTop;
    const targetScroll = btnOffsetTop - (sidebar.clientHeight / 2) + (btn.offsetHeight / 2);
    sidebar.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
  }, []);

  const cleanJsonString = (rawStr) => {
    if (!rawStr) return '{}';
    if (typeof rawStr === 'object') return JSON.stringify(rawStr, null, 2);
    let currentStr = String(rawStr).trim();
    currentStr = currentStr.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
    try { return JSON.stringify(JSON.parse(currentStr), null, 2); } catch (e) { return currentStr; }
  };

  const clampValue = (fieldName, val) => {
    const rule = VALIDATION_LIMITS[fieldName];
    if (!rule) return val;
    if (val === undefined || val === null || val === '') return rule.min;
    let num = parseInt(String(val).replace(/\D/g, ''), 10);
    if (isNaN(num)) num = rule.min;
    return Math.max(rule.min, Math.min(rule.max, num));
  };

  useEffect(() => {
    const initialBodies = {};
    activeEndpoints.forEach(ep => {
      initialBodies[ep.id] = ep.requestSample ? cleanJsonString(ep.requestSample) : '{}';
    });
    setRequestBodies(initialBodies);
  }, [activeEndpoints]);

  useEffect(() => {
    if (activeEndpoints.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length === 0) return;
        const best = visibleEntries.reduce((prev, curr) =>
          Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev
        );
        const id = best.target.dataset.apiId;
        if (id) {
          setActiveEpId(id);
          scrollSidebarToActive(id);
        }
      },
      { root: middleScrollRef.current, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    Object.values(apiRefs.current).forEach(el => {
      if (el) observerRef.current.observe(el);
    });

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [activeEndpoints, scrollSidebarToActive]);

  const handleTextareaChange = (id, rawText) => {
    if (!id) return;
    try {
      const parsed = JSON.parse(rawText);
      let hasChanged = false;
      Object.keys(parsed).forEach(key => {
        if (VALIDATION_LIMITS[key] !== undefined && typeof parsed[key] !== 'object') {
          const validatedValue = clampValue(key, parsed[key]);
          if (parsed[key] !== validatedValue) { parsed[key] = validatedValue; hasChanged = true; }
        }
      });
      setRequestBodies(prev => ({ ...prev, [id]: hasChanged ? JSON.stringify(parsed, null, 2) : rawText }));
    } catch (e) {
      setRequestBodies(prev => ({ ...prev, [id]: rawText }));
    }
  };

  const renderTreeSchema = (dataObj) => {
    if (!dataObj) return null;
    let workingObj = dataObj;
    if (typeof dataObj === 'string') {
      try { workingObj = JSON.parse(cleanJsonString(dataObj)); } catch (e) { return <div className="text-xs font-mono text-slate-600 break-all pl-2">{dataObj}</div>; }
    }
    if (typeof workingObj !== 'object' || workingObj === null) return <div className="text-xs font-mono text-slate-600 break-all pl-2">{String(workingObj)}</div>;
    const keys = Object.keys(workingObj);
    if (keys.length === 0) return <div className="text-xs text-slate-400 italic pl-2">Trống (Rỗng)</div>;

    return keys.map((key, index) => {
      const value = workingObj[key];
      let type = typeof value;
      if (Array.isArray(value)) type = 'array';
      else if (value === null) type = 'null';

      const isRequired = ['client_id', 'client_secret', 'grant_type', 'CpId', 'Sign', 'so_gcn', 'MaSoThue', 'NgayDoiSoat', 'type', 'ma_giaodich'].includes(key);
      const description = FIELD_DICTIONARY[key] || "Trường dữ liệu tích hợp thuộc nghiệp vụ logic Core Insurance PVI.";
      const hasLimitRule = VALIDATION_LIMITS[key];

      return (
        <div key={index} className="relative pl-5 pb-3 group font-sans text-left max-w-full overflow-hidden">
          <div className="absolute left-0 top-3 w-3 border-t border-slate-200 group-hover:border-blue-400 transition-colors"></div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs max-w-full">
            <span className="font-mono font-bold text-slate-900 text-[12px] break-all">{key}</span>
            <span className={`text-[11px] font-mono lowercase text-blue-600`}>{type}</span>
            {isRequired && <span className="text-[9px] bg-red-50 text-red-500 font-extrabold px-1 py-0.5 rounded border border-red-200 uppercase tracking-tighter">required</span>}
            {hasLimitRule && <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1 rounded border border-amber-200 whitespace-nowrap">{hasLimitRule.label}</span>}
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5 font-medium leading-relaxed max-w-full break-words">{description}</p>
          {type !== 'object' && type !== 'array' && value !== undefined && value !== null && (
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono max-w-full break-all">
              <span className="text-slate-400 font-sans font-medium">Example:</span>{" "}
              <span className="text-slate-700 bg-slate-100 px-1 rounded border border-slate-200/60 font-semibold inline-block max-w-full break-all">
                {hasLimitRule && !isNaN(Number(value)) ? Number(value).toLocaleString('vi-VN') : String(value)}
              </span>
            </div>
          )}
          {type === 'object' && value !== null && <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">{renderTreeSchema(value)}</div>}
        </div>
      );
    });
  };

  const scrollToApi = useCallback((id) => {
    const element = apiRefs.current[id];
    if (!element) return;
    isClickScrolling.current = true;
    setActiveEpId(id);
    scrollSidebarToActive(id);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isClickScrolling.current = false; }, 800);
  }, [scrollSidebarToActive]);

  const handleExecuteSandbox = (id, responseFormat) => {
    if (!id) return;
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    let finalResponse = { Status: "00", Message: "Giao dịch giả lập thành công." };
    if (responseFormat) {
      try { finalResponse = typeof responseFormat === 'string' ? JSON.parse(cleanJsonString(responseFormat)) : { ...responseFormat }; }
      catch (e) { finalResponse = { Status: "00", Message: "Giao dịch thành công.", Data: responseFormat }; }
    }
    setTimeout(() => {
      setApiResponses(prev => ({ ...prev, [id]: finalResponse }));
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 350);
  };

  const renderCustomPageContent = (type) => {
    if (type === "overview") {
      return (
        <div className="space-y-6 text-left">
          <p className="text-sm text-slate-600 leading-relaxed">Chào mừng đối tác đến với tài liệu kỹ thuật bảo hiểm <strong>An Biên Hub</strong> kết nối Core Insurance của PVI.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
              <div className="font-bold text-slate-800 text-xs uppercase mb-1">Môi trường Sandbox</div>
              <code className="text-blue-600 font-mono text-xs break-all block">https://sandbox-api.pvi.vn</code>
            </div>
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
              <div className="font-bold text-slate-800 text-xs uppercase mb-1">Môi trường Production</div>
              <code className="text-emerald-600 font-mono text-xs break-all block">https://api.pvi.vn</code>
            </div>
          </div>
        </div>
      );
    }
    if (type === "signature") {
      return (
        <div className="space-y-4 text-left">
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">Sign = MD5( CpId + "&" + RawPayloadData + "&" + SecretKey )</div>
        </div>
      );
    }
    if (type === "headers") {
      return (
        <pre className="bg-slate-50 border p-4 rounded-xl font-mono text-xs text-slate-700 leading-relaxed text-left">{`{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer eyJhbGciOiJIUzI1Ni...",\n  "CpId": "PARTNER_ID_AN_BIEN"\n}`}</pre>
      );
    }
    if (type === "dictionary") {
      return (
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className="p-3 font-semibold text-slate-700 text-left">Trường (Field Key)</th><th className="p-3 font-semibold text-slate-700 text-left">Ý nghĩa giải nghĩa tham số</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {Object.entries(FIELD_DICTIONARY).map(([key, desc]) => (
                <tr key={key} className="hover:bg-slate-50/40">
                  <td className="p-3 font-mono font-bold text-slate-900">{key}</td>
                  <td className="p-3 text-slate-600 font-medium">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (type === "error-codes") {
      return (
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className="p-3 font-semibold text-slate-700 w-24 text-center">Mã Code</th><th className="p-3 font-semibold text-slate-700 text-left">Định nghĩa chi tiết lỗi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ERROR_CODES_DATA.map(([code, desc]) => (
                <tr key={code} className="hover:bg-slate-50/40">
                  <td className="p-3 font-mono font-bold text-red-600 text-center bg-slate-50/30">{code}</td>
                  <td className="p-3 font-medium text-slate-600 text-left">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (type === "changelog") {
      return (
        <div className="border rounded-xl p-4 bg-slate-50/50 text-left">
          <div className="font-bold text-slate-900 text-sm mb-2">v1.3.0 Stable Release</div>
          <p className="text-xs text-slate-600">Đồng bộ cơ chế phân quyền bảo mật API lõi tự động từ hệ thống Render Portal.</p>
        </div>
      );
    }
    return null;
  };

  const categories = Array.from(new Set(activeEndpoints.map(e => e.category || "CHUNG")));
  const currentActiveEp = activeEndpoints.find(e => e.id === activeEpId) || activeEndpoints[0];

  return (
    <div className="flex h-[calc(100vh-56px)] w-full bg-white text-slate-800 text-sm overflow-hidden select-text">
      {/* CỘT 1: SIDEBAR */}
      <div ref={sidebarScrollRef} className="w-80 shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto space-y-4 text-xs select-none">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-700 font-semibold text-left">🚀 PVI Developer Portal Hub v1.3.0</div>
        {categories.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-1">
            <div className="text-slate-400 uppercase font-black tracking-wider text-[10px] pt-2 px-1 text-left">{cat}</div>
            <div className="space-y-0.5">
              {activeEndpoints.filter(e => (e.category || "CHUNG") === cat).map((ep) => (
                <div key={ep.id} id={`sidebar-item-${ep.id}`} onClick={() => scrollToApi(ep.id)} className={`flex items-center space-x-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${activeEpId === ep.id ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}>
                  <span className={`text-[8px] px-1 py-0.5 rounded font-black text-white shrink-0 ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-500'}`}>{ep.method}</span>
                  <span className="truncate flex-1 font-medium text-left">{ep.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CỘT 2: MAIN CONTENT */}
      <div ref={middleScrollRef} className="flex-1 p-6 overflow-y-auto space-y-24 scroll-smooth min-w-0">
        {activeEndpoints.map((ep) => (
          <div key={ep.id} data-api-id={ep.id} ref={el => apiRefs.current[ep.id] = el} className="pt-4 border-b border-slate-100 pb-16 last:border-0 scroll-mt-6 max-w-full">
            <div className="text-left max-w-full">
              <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-slate-200 inline-block">{ep.category}</span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{ep.description}</h1>
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <span className={`text-white font-black px-2 py-1 rounded shrink-0 ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{ep.method}</span>
                <code className="bg-slate-100 text-slate-700 px-3 py-1 rounded font-mono border border-slate-200 break-all flex-1 font-bold text-left">{ep.path}</code>
              </div>
            </div>
            {ep.isCustomPage ? <div className="mt-6">{renderCustomPageContent(ep.pageType)}</div> : (
              <>
                <div className="mt-8 text-left"><h2 className="text-base font-bold text-slate-900">Request Body Schema</h2><div className="pl-2 border-l border-slate-200 mt-2">{renderTreeSchema(ep.requestSample)}</div></div>
                <div className="mt-8 text-left"><h2 className="text-base font-bold text-slate-900">Response JSON Format</h2><div className="pl-2 border-l border-slate-200 mt-2">{renderTreeSchema(ep.responseFormat)}</div></div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* CỘT 3: SANDBOX */}
      <div className="w-96 shrink-0 bg-slate-900 text-slate-200 p-4 flex flex-col space-y-4 border-l border-slate-800 font-mono text-xs overflow-y-auto select-none">
        <div className="text-left"><div className="text-[9px] uppercase text-slate-400 font-bold mb-1">API ĐANG CHỌN</div><div className="bg-slate-800 text-blue-400 font-bold px-2 py-1.5 rounded truncate">{currentActiveEp?.description}</div></div>
        <div><div className="text-[9px] uppercase text-slate-500 font-bold mb-1">SECURE PARTNER KEY</div><input type="text" value={authToken} onChange={(e) => setAuthToken(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none shadow-inner" /></div>
        {currentActiveEp?.isCustomPage && currentActiveEp?.pageType !== "overview" ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-500 font-sans"><p>Mục thông tin tham chiếu tĩnh.<br/>Vui lòng chọn các API nghiệp vụ để trải nghiệm Sandbox.</p></div>
        ) : (
          <>
            <div className="flex flex-col h-56"><div className="text-[9px] uppercase text-slate-500 font-bold mb-1 flex justify-between"><span>REQUEST BODY SAMPLE</span><span className="text-amber-500 font-bold">AUTO-VALIDATED</span></div><textarea value={requestBodies[currentActiveEp?.id] || '{}'} onChange={(e) => handleTextareaChange(currentActiveEp?.id, e.target.value)} className="w-full flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-emerald-400 font-mono text-[11px] resize-none focus:outline-none focus:border-blue-500" /></div>
            <button onClick={() => handleExecuteSandbox(currentActiveEp?.id, currentActiveEp?.responseFormat)} disabled={loadingStates[currentActiveEp?.id]} className={`w-full text-white font-bold py-2.5 px-4 rounded-lg font-sans text-xs flex items-center justify-center space-x-2 ${loadingStates[currentActiveEp?.id] ? 'bg-blue-800/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'}`}>
              {loadingStates[currentActiveEp?.id] ? <span>SENDING SIMULATOR...</span> : <span>⚡ EXECUTE REQUEST (SANDBOX)</span>}
            </button>
            <div className="flex-1 flex flex-col min-h-[160px] overflow-hidden">
              <div className="text-[9px] uppercase text-slate-500 font-bold mb-1 text-left">RESPONSE LOGIC OBJECT</div>
              <div className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sky-400 font-mono text-[11px] overflow-y-auto text-left break-all">
                {apiResponses[currentActiveEp?.id] ? <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponses[currentActiveEp?.id], null, 2)}</pre> : <span className="text-slate-600 italic">// Click nút Execute phía trên để nhận dữ liệu...</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}