const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ✅ Cấu hình CORS tự động - Giúp Frontend (Vercel) kết nối mượt mà không bị chặn
app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = 'PVI_SECRET_KEY_2026';

// ==========================================
// 🔐 DANH SÁCH TÀI KHOẢN & PHÂN QUYỀN
// ==========================================
const users = [
  { email: 'admin@pvi.com.vn', password: bcrypt.hashSync('admin123', 10), role: 'admin', partnerId: 'admin' },
  { email: 'partner_vifo@gmail.com', password: bcrypt.hashSync('vifo123', 10), role: 'partner', partnerId: 'pt-vifo' },
  { email: 'partner_momo@gmail.com', password: bcrypt.hashSync('momo123', 10), role: 'partner', partnerId: 'pt-momo' }
];

// ==========================================
// 📂 CƠ SỞ DỮ LIỆU ĐỒNG BỘ UI MỚI (LƯU TRÊN RAM)
// ==========================================
let documents = [
  {
    id: "auth-api-keys",
    title: "AUTHENTICATION",
    allowedPartners: ["pt-vifo", "pt-momo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/oauth2",
      endpoints: [
        { method: "POST", path: "/token", name: "Khởi tạo Access Token (OAuth2 Client Credentials)", requestSample: { client_id: "PARTNER_ANBIEN_ID", client_secret: "pvi_secret_key_abc123", grant_type: "client_credentials" }, responseFormat: { status: "success", access_token: "eyJhbGciOiJIUzI1Ni...", expires_in: 86400, token_type: "Bearer" } }
      ]
    }
  },
  {
    id: "bao-hiem-xe-may",
    title: "BẢO HIỂM XE MÁY",
    allowedPartners: ["pt-vifo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/insurance",
      endpoints: [
        { method: "POST", path: "/moto/calculate", name: "Tính toán tổng phí bảo hiểm bắt buộc & tự nguyện xe máy", requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "7ac110780f2d5902", loai_xe: "MOTO_01", muc_trachnhiem_laiphu: 20000000, so_nguoi_tgia_laiphu: 2 }, responseFormat: { Status: "00", Message: "Tính phí xe máy thành công", Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } } },
        { method: "POST", path: "/insert-moto", name: "Đăng ký thông tin cấp ấn chỉ bảo hiểm Xe Máy", requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "b2c3d4e5f6g7h8i9", ten_nguoimua_bh: "Trần Thị B", so_dienthoai: "0912345678", TongPhi: 106000, ma_giaodich: "GD_MOTO_992" }, responseFormat: { Status: "00", Message: "Cấp đơn xe máy thành công", TotalFee: 106000, Data: { so_gcn: "GCN/MOTO/2026/002" } } }
      ]
    }
  },
  {
    id: "bao-hiem-xe-o-to",
    title: "BẢO HIỂM XE Ô TÔ",
    allowedPartners: ["pt-vifo", "pt-momo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/insurance",
      endpoints: [
        { method: "POST", path: "/calculate-premium", name: "Tính phí bảo hiểm trách nhiệm dân sự bắt buộc xe ô tô", requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "41d8e12a0f2d5902", ma_loaixe: "X01", so_cho: 5, thamgia_laiphu: true, so_nguoi: 5, mtn_laiphu: 50000000 }, responseFormat: { Status: "00", Message: "Tính phí ô tô thành công", Data: { PhiBHTNDSBB: 437000, PhiBHLaiPhu: 100000, ThueVAT: 53700, TongPhi: 590700 } } },
        { method: "POST", path: "/insert-oto", name: "Đẩy dữ liệu thông tin chủ xe, số khung số máy cấp đơn ô tô", requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "a1b2c3d4e5f6g7h8", TenKH: "Nguyễn Văn A", DienThoai: "0901234567", ChoNgoi: 5, TongPhi: 590700, SoKhung: "RLH43219876", SoMay: "2AZ123456" }, responseFormat: { Status: "00", Message: "Cấp đơn ô tô thành công", TotalFee: 590700, Data: { ma_giaodich: "GD_OTO_2026_01", so_gcn: "GCN/OTO/2026/001", Pr_key: 1256789 } } }
      ]
    }
  },
  {
    id: "ho-tro-boi-thuong",
    title: "HỖ TRỢ BỒI THƯỜNG",
    allowedPartners: ["pt-vifo", "pt-momo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/claim",
      endpoints: [
        { method: "POST", path: "/register", name: "Khai báo tổn thất, gửi yêu cầu duyệt bồi thường trực tuyến", requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "5ab100780f2d5902", so_gcn: "GCN/OTO/2026/001", mo_ta_su_co: "Xe va chạm quẹt vào dải phân cách", hinh_anh_hieng_truong: ["https://image-store.com/claim/img01.jpg"] }, responseFormat: { Status: "00", Message: "Tiếp nhận thành công", Data: { claim_id_str: "CLAIM_2026_9921", status_code: 200 } } }
      ]
    }
  },
  {
    id: "hoa-don-dien-tu",
    title: "HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)",
    allowedPartners: ["pt-vifo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/einvoice",
      endpoints: [
        { method: "POST", path: "/issue", name: "Yêu cầu phát hành hóa đơn tài chính GTGT điện tử", requestSample: { CpId: "PARTNER_ANBIEN_2026", so_gcn: "GCN/OTO/2026/001", MaSoThue: "0101234567", TenDonVi: "Công ty TNHH An Biên", DiaChiHoaDon: "Quận 1, TP. HCM" }, responseFormat: { Status: "00", Message: "Phát hành hóa đơn thành công", MaSoBaoMat: "INV-99281-2026", LinkHoaDon: "https://einvoice.pvi.com.vn/view/inv-99281" } }
      ]
    }
  },
  {
    id: "doi-soat-ke-toan",
    title: "ĐỐI SOÁT & KẾ TOÁN",
    allowedPartners: ["pt-vifo", "pt-momo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/finance",
      endpoints: [
        { method: "POST", path: "/reconciliation", name: "Đối soát danh sách giao dịch định kỳ theo ngày dòng tiền", requestSample: { CpId: "PARTNER_ANBIEN_2026", NgayDoiSoat: "11/06/2026", LoaiAnChi: "OTO" }, responseFormat: { Status: "00", Message: "Trùng khớp dữ liệu đối soát", TongSoDon: 142, TongDoanhThu: 76230000, TrangThaiDoiSoat: "MATCHED" } }
      ]
    }
  },
  {
    id: "quan-ly-dai-ly",
    title: "QUẢN LÝ ĐẠI LÝ KÊNH BÁN",
    allowedPartners: ["pt-vifo"],
    content: {
      baseUrl: "https://api.pvi.com.vn/v1/agent",
      endpoints: [
        { method: "POST", path: "/commission-query", name: "Tra cứu tỷ lệ chiết khấu thương mại của điểm bán hoa hồng", requestSample: { CpId: "PARTNER_ANBIEN_2026", AgentCode: "SUB_AG_HCM_01", MaLoaiAnChi: "MOTO" }, responseFormat: { Status: "00", Message: "Lấy cấu hình thành công", TyleChietKhau: 0.15, PhisauChietKhau: 85000 } }
      ]
    }
  }
];

// ==========================================
// ⚙️ CÁC ROUTE API HỆ THỐNG
// ==========================================

// API Đăng nhập công khai
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
  }
  
  const token = jwt.sign(
    { email: user.email, role: user.role, partnerId: user.partnerId }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
  
  res.json({ token, role: user.role, name: user.email, partnerId: user.partnerId });
});

// Middleware xác thực Token người dùng gửi lên
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Lấy tài liệu (Tự động lọc phân quyền hiển thị)
app.get('/api/documents', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(documents);
  }
  const filteredDocs = documents.filter(doc => doc.allowedPartners.includes(req.user.partnerId));
  res.json(filteredDocs);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend phân quyền đang chạy ổn định tại port ${PORT}...`);
});