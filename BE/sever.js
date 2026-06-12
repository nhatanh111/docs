const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ✅ Cấu hình CORS tự động kết nối Frontend mượt mà
app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = 'PVI_SECRET_KEY_2026';

// 🔐 DANH SÁCH ĐỐI TÁC HỆ THỐNG TRONG DATABASE (Mới bổ sung để phục vụ Trang 1 quản trị đối tác)
let partnersDatabase = [
  { 
    id: "pt-vifo", 
    name: "Công ty Cổ phần VIFO Việt Nam", 
    email: "partner_vifo@gmail.com",
    clientId: "PVI_VIFO_CID_9921",
    clientSecret: "pvi_vifo_sec_abc123xyz",
    status: "active",
    createdAt: "2026-01-10 08:30"
  },
  { 
    id: "pt-momo", 
    name: "Ví Điện Tử MoMo (M_Service)", 
    email: "partner_momo@gmail.com",
    clientId: "PVI_MOMO_CID_8812",
    clientSecret: "pvi_momo_sec_993hda721",
    status: "active",
    createdAt: "2026-02-15 14:20"
  }
];

// 🔐 DANH SÁCH TÀI KHOẢN HỆ THỐNG
const users = [
  { email: 'admin@pvi.com.vn', password: bcrypt.hashSync('admin123', 10), role: 'admin', partnerId: 'admin' },
  { email: 'partner_vifo@gmail.com', password: bcrypt.hashSync('vifo123', 10), role: 'partner', partnerId: 'pt-vifo' },
  { email: 'partner_momo@gmail.com', password: bcrypt.hashSync('momo123', 10), role: 'partner', partnerId: 'pt-momo' }
];

// 📂 GIỮ NGUYÊN 100% CƠ SỞ DỮ LIỆU GỐC KHÔNG RÚT GỌN CHỮ NÀO
let projects = [
  {
    projectId: "project-pvi-retail",
    projectName: "Hệ thống Bán lẻ PVI Core",
    allowedPartners: ["pt-vifo", "pt-momo"], 
    documents: [
      {
        id: "auth-api-keys",
        title: "AUTHENTICATION",
        endpoints: [
          { 
            endpointId: "ep-auth-token",
            method: "POST", 
            path: "/token", 
            name: "Khởi tạo Access Token (OAuth2 Client Credentials)",
            allowedPartners: ["pt-vifo", "pt-momo"],
            requestSample: { client_id: "PARTNER_ANBIEN_ID", client_secret: "pvi_secret_key_abc123", grant_type: "client_credentials" },
            responseFormat: { status: "success", access_token: "eyJhbGciOiJIUzI1Ni...", expires_in: 86400, token_type: "Bearer" }
          }
        ]
      },
      {
        id: "bao-hiem-xe-may",
        title: "BẢO HIỂM XE MÁY",
        endpoints: [
          { 
            endpointId: "ep-moto-calc",
            method: "POST", 
            path: "/moto/calculate", 
            name: "Tính toán tổng phí bảo hiểm bắt buộc & tự nguyện xe máy",
            allowedPartners: ["pt-vifo", "pt-momo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "7ac110780f2d5902", loai_xe: "MOTO_01", muc_trachnhiem_laiphu: 20000000, so_nguoi_tgia_laiphu: 2 },
            responseFormat: { Status: "00", Message: "Tính phí xe máy thành công", Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } }
          },
          { 
            endpointId: "ep-moto-insert",
            method: "POST", 
            path: "/insert-moto", 
            name: "Đăng ký thông tin cấp ấn chỉ bảo hiểm Xe Máy",
            allowedPartners: ["pt-vifo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "b2c3d4e5f6g7h8i9", ten_nguoimua_bh: "Trần Thị B", so_dienthoai: "0912345678", TongPhi: 106000, ma_giaodich: "GD_MOTO_992" },
            responseFormat: { Status: "00", Message: "Cấp đơn xe máy thành công", TotalFee: 106000, Data: { so_gcn: "GCN/MOTO/2026/002" } }
          }
        ]
      },
      {
        id: "bao-hiem-xe-o-to",
        title: "BẢO HIỂM XE Ô TÔ",
        endpoints: [
          { 
            endpointId: "ep-oto-calc",
            method: "POST", 
            path: "/calculate-premium", 
            name: "Tính phí bảo hiểm trách nhiệm dân sự bắt buộc xe ô tô",
            allowedPartners: ["pt-vifo", "pt-momo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "41d8e12a0f2d5902", ma_loaixe: "X01", so_cho: 5, thamgia_laiphu: true, so_nguoi: 5, mtn_laiphu: 50000000 },
            responseFormat: { Status: "00", Message: "Tính phí ô tô thành công", Data: { PhiBHTNDSBB: 437000, PhiBHLaiPhu: 100000, ThueVAT: 53700, TongPhi: 590700 } }
          },
          { 
            endpointId: "ep-oto-insert",
            method: "POST", 
            path: "/insert-oto", 
            name: "Đẩy dữ liệu thông tin chủ xe, số khung số máy cấp đơn ô tô",
            allowedPartners: ["pt-vifo", "pt-momo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "a1b2c3d4e5f6g7h8", TenKH: "Nguyễn Văn A", DienThoai: "0901234567", ChoNgoi: 5, TongPhi: 590700, SoKhung: "RLH43219876", SoMay: "2AZ123456" },
            responseFormat: { Status: "00", Message: "Cấp đơn ô tô thành công", TotalFee: 590700, Data: { ma_giaodich: "GD_OTO_2026_01", so_gcn: "GCN/OTO/2026/001", Pr_key: 1256789 } }
          }
        ]
      },
      {
        id: "ho-tro-boi-thuong",
        title: "HỖ TRỢ BỒI THƯỜNG",
        endpoints: [
          { 
            endpointId: "ep-claim-reg",
            method: "POST", 
            path: "/register", 
            name: "Khai báo tổn thất, gửi yêu cầu duyệt bồi thường trực tuyến",
            allowedPartners: ["pt-vifo", "pt-momo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", Sign: "5ab100780f2d5902", so_gcn: "GCN/OTO/2026/001", mo_ta_su_co: "Xe va chạm quẹt vào dải phân cách", hinh_anh_hieng_truong: ["https://image-store.com/claim/img01.jpg"] },
            responseFormat: { Status: "00", Message: "Tiếp nhận thành công", Data: { claim_id_str: "CLAIM_2026_9921", status_code: 200 } }
          }
        ]
      }
    ]
  },
  {
    projectId: "project-pvi-enterprise",
    projectName: "Hệ thống Nghiệp vụ Doanh nghiệp lớn",
    allowedPartners: ["pt-vifo"],
    documents: [
      {
        id: "hoa-don-dien-tu",
        title: "HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)",
        endpoints: [
          { 
            endpointId: "ep-invoice-issue",
            method: "POST", 
            path: "/issue", 
            name: "Yêu cầu phát hành hóa đơn tài chính GTGT điện tử",
            allowedPartners: ["pt-vifo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", so_gcn: "GCN/OTO/2026/001", MaSoThue: "0101234567", TenDonVi: "Công ty TNHH An Biên", DiaChiHoaDon: "Quận 1, TP. HCM" },
            responseFormat: { Status: "00", Message: "Phát hành hóa đơn thành công", MaSoBaoMat: "INV-99281-2026", LinkHoaDon: "https://einvoice.pvi.com.vn/view/inv-99281" }
          }
        ]
      },
      {
        id: "doi-soat-ke-toan",
        title: "ĐỐI SOÁT & KẾ TOÁN",
        endpoints: [
          { 
            endpointId: "ep-finance-recon",
            method: "POST", 
            path: "/reconciliation", 
            name: "Đối soát danh sách giao dịch định kỳ theo ngày dòng tiền",
            allowedPartners: ["pt-vifo", "pt-momo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", NgayDoiSoat: "11/06/2026", LoaiAnChi: "OTO" },
            responseFormat: { Status: "00", Message: "Trùng khớp dữ liệu đối soát", TongSoDon: 142, TongDoanhThu: 76230000, TrangThaiDoiSoat: "MATCHED" }
          }
        ]
      },
      {
        id: "quan-ly-dai-ly",
        title: "QUẢN LÝ ĐẠI LÝ KÊNH BÁN",
        endpoints: [
          { 
            endpointId: "ep-agent-commission",
            method: "POST", 
            path: "/commission-query", 
            name: "Tra cứu tỷ lệ chiết khấu thương mại của điểm bán hoa hồng",
            allowedPartners: ["pt-vifo"],
            requestSample: { CpId: "PARTNER_ANBIEN_2026", AgentCode: "SUB_AG_HCM_01", MaLoaiAnChi: "MOTO" },
            responseFormat: { Status: "00", Message: "Lấy cấu hình thành công", TyleChietKhau: 0.15, PhisauChietKhau: 85000 }
          }
        ]
      }
    ]
  }
];

// API Đăng nhập
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
  }
  const token = jwt.sign({ email: user.email, role: user.role, partnerId: user.partnerId }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, role: user.role, name: user.email, partnerId: user.partnerId });
});

// Middleware xác thực Token
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

// --- API PHÂN HỆ QUẢN LÝ TÀI KHOẢN ĐỐI TÁC (MỚI CHO TRANG 1) ---
app.get('/api/admin/partners', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  res.json(partnersDatabase);
});

app.post('/api/admin/partners/create', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { name, email } = req.body;
  
  const newPartner = {
    id: 'pt-' + Math.random().toString(36).substr(2, 5),
    name,
    email,
    clientId: 'PVI_CID_' + Math.floor(1000 + Math.random() * 9000),
    clientSecret: 'pvi_sec_' + Math.random().toString(36).substr(2, 10),
    status: 'active',
    createdAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
  };
  
  partnersDatabase.push(newPartner);
  res.json({ success: true, partners: partnersDatabase });
});

app.put('/api/admin/partners/update-status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { id, status } = req.body;
  const p = partnersDatabase.find(item => item.id === id);
  if (p) p.status = status;
  res.json({ success: true, partners: partnersDatabase });
});

// Lấy danh sách phân quyền động theo token đăng nhập
app.get('/api/documents', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(projects); 
  }
  const partnerId = req.user.partnerId;
  const filtered = projects
    .filter(p => p.allowedPartners.includes(partnerId))
    .map(p => {
      const cleanDocs = p.documents.map(d => {
        const cleanEps = d.endpoints.filter(ep => ep.allowedPartners.includes(partnerId));
        return { ...d, endpoints: cleanEps };
      }).filter(d => d.endpoints.length > 0);
      return { ...p, documents: cleanDocs };
    }).filter(p => p.documents.length > 0);
  res.json(filtered);
});

// API Admin: Cập nhật quyền trên Project lớn
app.post('/api/admin/project-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { partnerId, projectId, hasPermission } = req.body;
  const project = projects.find(p => p.projectId === projectId);
  if (!project) return res.status(404).json({ message: 'Không tìm thấy Project' });
  
  if (hasPermission && !project.allowedPartners.includes(partnerId)) project.allowedPartners.push(partnerId);
  else if (!hasPermission) project.allowedPartners = project.allowedPartners.filter(id => id !== partnerId);
  res.json({ success: true, projects });
});

// API Admin: Cập nhật quyền trên từng Endpoint độc lập
app.post('/api/admin/endpoint-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { partnerId, endpointId, hasPermission } = req.body;
  let isFound = false;

  for (let p of projects) {
    for (let d of p.documents) {
      const ep = d.endpoints.find(e => e.endpointId === endpointId);
      if (ep) {
        isFound = true;
        if (hasPermission && !ep.allowedPartners.includes(partnerId)) ep.allowedPartners.push(partnerId);
        else if (!hasPermission) ep.allowedPartners = ep.allowedPartners.filter(id => id !== partnerId);
        break;
      }
    }
  }
  if (!isFound) return res.status(404).json({ message: 'Không tìm thấy Endpoint' });
  res.json({ success: true, projects });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Phân quyền Master-Core running on port ${PORT}`));