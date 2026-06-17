// MockData.js

export const VALIDATION_LIMITS = {
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

export const DEFAULT_ENDPOINTS = [
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
    id: "api-endorse-cancel",
    category: "SỬA ĐỔI & HỦY BỎ ĐƠN",
    method: "POST",
    path: "/api/pvi/v1/endorsement/cancel-order",
    description: "Gửi yêu cầu hoàn phí hoặc hủy bỏ hiệu lực ấn chỉ",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", so_gcn: "GCN/OTO/2026/001", LyDoHuy: "Khách hàng bán xe, đổi sang đơn vị khác" },
    responseFormat: { Status: "00", Message: "Yêu cầu hủy đơn đã được tiếp nhận", TrangThaiDon: "PENDING_CANCELLATION", PhiHoanLaiDuKien: 320000 }
  },
  {
    id: "api-crm-renewal-check",
    category: "CRM & CHĂM SÓC KHÁCH HÀNG",
    method: "POST",
    path: "/api/pvi/v1/crm/renewal-check",
    description: "Kiểm tra danh sách đơn bảo hiểm sắp hết hạn để tái tục",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", SoNgaySapHetHan: 30, ChiNhanhQuanLy: "HCM" },
    responseFormat: { Status: "00", Message: "Tìm thấy dữ liệu tái tục", DanhSachSapHetHan: [{ SoGCN: "GCN/OTO/2025/882", TenKhachHang: "Vũ Văn C", NgayHetHan: "12/07/2026" }] }
  },
  {
    id: "api-uw-risk-assess",
    category: "THẨM ĐỊNH RỦI RO ĐẶC BIỆT",
    method: "POST",
    path: "/api/pvi/v1/underwriting/risk-assess",
    description: "Đánh giá rủi ro tự động cho phương tiện giá trị lớn",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", GiaTriXe: 6500000000, MụcDichSuDung: "Vận tải hạng nặng chuyên dụng" },
    responseFormat: { Status: "01", Message: "Vượt hạn mức duyệt tự động - Chuyển chuyên viên", KquaThamDinh: "REFER_TO_UW", MaHoSoThamDinh: "UW-OTO-2026-009" }
  },
  {
    id: "api-reinsurance-share",
    category: "QUẢN LÝ TÁI BẢO HIỂM",
    method: "POST",
    path: "/api/pvi/v1/reinsurance/share-assess",
    description: "Tính toán tỷ lệ giữ lại và phân giao tái bảo hiểm",
    requestSample: { CpId: "PARTNER_ANBIEN_2026", TongMucTrachNhiem: 15000000000, MaNghiepVu: "KỸ THUẬT TÀI SẢN XE" },
    responseFormat: { Status: "00", Message: "Phân bổ thành công", TyLeGiuLai: 0.20, TyLeTaiPhanGiao: 0.80, NhaTaiBaoHiemGoc: "PVI RE" }
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

export const ERROR_CODES_DATA = [
  ["00", "Success - Giao dịch thành công hoàn tất cấp ấn chỉ"],
  ["01", "Invalid Signature - Chữ ký bảo mật không hợp lệ hoặc sai thuật toán băm"],
  ["02", "Missing CpId - Thiếu mã định danh duy nhất của Đối tác (Partner ID)"],
  ["03", "Missing Parameter - Thiếu các trường dữ liệu bắt buộc trong Request Payload JSON"],
  ["04", "Policy Not Found - Không tìm thấy Số giấy chứng nhận bảo hiểm trên Core"],
  ["05", "Internal Error - Hệ thống Core PVI gặp sự cố xử lý gián đoạn dịch vụ"]
];

export const FIELD_DICTIONARY = {
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
// Thêm vào cuối file MockData.js

export const SUPPORTED_LANGUAGES = [
  { id: 'curl', name: 'cURL', icon: '💻' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'nodejs', name: 'Node.js', icon: '🟩' },
  { id: 'php', name: 'PHP', icon: '🐘' }
];

export const generateLanguageSnippet = (langId, endpoint, currentBodyText) => {
  if (!endpoint || !endpoint.path) return "";
  const domain = "https://api.pvi.com.vn";
  const fullUrl = `${domain}${endpoint.path}`;
  const method = endpoint.method || 'POST';
  
  // Làm sạch dữ liệu body để đưa vào code mẫu
  let bodyJson = "{}";
  try {
    if (currentBodyText) {
      bodyJson = JSON.stringify(JSON.parse(currentBodyText), null, 2);
    }
  } catch (e) {
    bodyJson = String(currentBodyText);
  }

  switch (langId) {
    case 'curl':
      let curl = `curl --location '${fullUrl}' \\\n`;
      curl += `--method '${method}' \\\n`;
      curl += `--header 'Content-Type: application/json' \\\n`;
      curl += `--header 'Authorization: Bearer YOUR_ACCESS_TOKEN'`;
      if (['POST', 'PUT'].includes(method)) {
        curl += ` \\\n--data '${bodyJson.replace(/\n/g, '\n  ')}'`;
      }
      return curl;

    case 'javascript':
      return `const myHeaders = new Headers();\nmyHeaders.append("Content-Type", "application/json");\nmyHeaders.append("Authorization", "Bearer YOUR_ACCESS_TOKEN");\n\nconst requestOptions = {\n  method: "${method}",\n  headers: myHeaders,\n  body: JSON.stringify(${bodyJson.replace(/\n/g, '\n  ')}),\n  redirect: "follow"\n};\n\nfetch("${fullUrl}", requestOptions)\n  .then(response => response.json())\n  .then(result => console.log(result))\n  .catch(error => console.error('Error:', error));`;

    case 'python':
      return `import requests\nimport json\n\nurl = "${fullUrl}"\n\npayload = ${bodyJson.replace(/true/g, 'True').replace(/false/g, 'False').replace(/\n/g, '\n')}\nheaders = {\n  'Content-Type': 'application/json',\n  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'\n}\n\nresponse = requests.request("${method}", url, headers=headers, json=payload)\n\nprint(response.json())`;

    case 'nodejs':
      return `const axios = require('axios');\n\nlet data = ${bodyJson.replace(/\n/g, '\n')};\n\nlet config = {\n  method: '${method.toLowerCase()}',\n  maxBodyLength: Infinity,\n  url: '${fullUrl}',\n  headers: { \n    'Content-Type': 'application/json', \n    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'\n  },\n  data : data\n};\n\naxios.request(config)\n.then((response) => {\n  console.log(JSON.stringify(response.data));\n})\n.catch((error) => {\n  console.log(error);\n});`;

    case 'php':
      return `<?php\n$client = new Geno\\HttpClient();\n$headers = [\n  'Content-Type' => 'application/json',\n  'Authorization' => 'Bearer YOUR_ACCESS_TOKEN'\n];\n$body = '${bodyJson.replace(/\n/g, '\n  ')}';\n$request = new Geno\\Http\\Request(\n  '${method}',\n  '${fullUrl}',\n  $headers,\n  $body\n);\n$response = $client->send($request);\necho $response->getBody();`;

    default:
      return "";
  }
};