const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();

// ===== CORS =====
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'PVI_SECRET_KEY_2026';

// ===== KẾT NỐI DATABASE =====
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pvi_db';
const dialect = dbUrl.startsWith('mysql') ? 'mysql' : 'postgres';
const sequelize = new Sequelize(dbUrl, {
  dialect,
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
  }
});

// ===== ĐỊNH NGHĨA MODEL =====
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'ĐỐI TÁC' },
  status: { type: DataTypes.STRING, defaultValue: 'Active' },
  description: { type: DataTypes.TEXT }
}, { tableName: 'users', timestamps: true });

const Partner = sequelize.define('Partner', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  clientId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  accountId: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'partners', timestamps: true });

// ===== KHỞI TẠO DỮ LIỆU MẪU =====
const seedData = async () => {
  const userCount = await User.count();
  if (userCount === 0) {
    await User.bulkCreate([
      { email: 'admin@pvi.com', password: bcrypt.hashSync('123', 10), role: 'ADMIN', status: 'Active', description: 'Quản trị viên' },
      { email: 'momo@pvi.com', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản Ví MoMo' },
      { email: 'vifo@pvi.com', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản VIFO' },
      { email: 'zalopay@pvi.com', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Inactive', description: 'Tài khoản ZaloPay' },
      { email: 'vnpay@pvi.com', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản VNPay' }
    ]);
    console.log('✅ Seeded users.');
  }

  // Cập nhật partners để khớp với accountId mới (id từ 1-5)
  const partnerCount = await Partner.count();
  if (partnerCount === 0) {
    await Partner.bulkCreate([
      { id: 'pt-1', name: 'Ví Điện Tử MoMo', email: 'momo@pvi.com', clientId: 'MOMO_PVI_2026', status: 'active', accountId: 2 },
      { id: 'pt-2', name: 'Nền tảng VIFO', email: 'vifo@pvi.com', clientId: 'VIFO_INSURTECH', status: 'active', accountId: 3 },
      { id: 'pt-3', name: 'Ví Điện Tử ZaloPay', email: 'zalopay@pvi.com', clientId: 'ZALOPAY_GATEWAY', status: 'inactive', accountId: 4 },
      { id: 'pt-4', name: 'Cổng VNPay', email: 'vnpay@pvi.com', clientId: 'VNPAY_BANKING', status: 'active', accountId: 5 },
      { id: 'pt-5', name: 'Công ty Bảo hiểm XYZ', email: null, clientId: 'XYZ_INSURANCE', status: 'active', accountId: null }
    ]);
    console.log('✅ Seeded partners.');
  }
};

// ===== KẾT NỐI & ĐỒNG BỘ =====
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
    return sequelize.sync({ alter: true });
  })
  .then(() => seedData())
  .catch(err => console.error('❌ DB error:', err));


// PHẦN PROJECTS (dữ liệu tĩnh, có thể để trong DB sau)

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
            requestSample: { CpId: "PARTNER_ANBIEN_2026", so_gcn: "GCN/OTO/2026/001", MaSoThue: "0101234567", TenDonVi: "Công ty TNHH A", DiaChiHoaDon: "Quận 1, TP. HCM" },
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


// API LOGIN

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role, name: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== MIDDLEWARE =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
    req.user = user;
    next();
  });
};


// API QUẢN LÝ TÀI KHOẢN

app.get('/api/admin/accounts', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/admin/accounts', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { email, password, role, status, description } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });
    const hashed = bcrypt.hashSync(password, 10);
    const newUser = await User.create({ email, password: hashed, role, status, description });
    const { password: pwd, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/admin/accounts/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const id = parseInt(req.params.id);
  const { email, password, role, status, description } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    if (email) {
      const existing = await User.findOne({ where: { email, id: { [Sequelize.Op.ne]: id } } });
      if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    user.email = email || user.email;
    if (password) user.password = bcrypt.hashSync(password, 10);
    user.role = role || user.role;
    user.status = status || user.status;
    user.description = description !== undefined ? description : user.description;
    await user.save();
    const { password: pwd, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/accounts/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const id = parseInt(req.params.id);
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    const adminCount = await User.count({ where: { role: 'ADMIN' } });
    if (user.role === 'ADMIN' && adminCount <= 1) {
      return res.status(400).json({ message: 'Không thể xóa admin cuối cùng' });
    }
    await user.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// API QUẢN LÝ ĐỐI TÁC

app.get('/api/admin/partners', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  try {
    const partners = await Partner.findAll();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/admin/partners', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { name, email, clientId, status, accountId } = req.body;
  try {
    const maxId = await Partner.max('id');
    const num = maxId ? parseInt(maxId.split('-')[1]) : 0;
    const newId = `pt-${num + 1}`;
    const newPartner = await Partner.create({
      id: newId,
      name,
      email: email || null,
      clientId: clientId || `PVI_${String(num + 1).padStart(3, '0')}`,
      status: status || 'active',
      accountId: accountId || null
    });
    res.status(201).json(newPartner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/admin/partners/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const id = req.params.id;
  const { name, email, clientId, status, accountId } = req.body;
  try {
    const partner = await Partner.findByPk(id);
    if (!partner) return res.status(404).json({ message: 'Không tìm thấy đối tác' });
    partner.name = name || partner.name;
    partner.email = email !== undefined ? email : partner.email;
    partner.clientId = clientId || partner.clientId;
    partner.status = status || partner.status;
    partner.accountId = accountId !== undefined ? accountId : partner.accountId;
    await partner.save();
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/partners/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const id = req.params.id;
  try {
    const partner = await Partner.findByPk(id);
    if (!partner) return res.status(404).json({ message: 'Không tìm thấy đối tác' });
    await partner.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/admin/partners/update-status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { id, status } = req.body;
  try {
    const partner = await Partner.findByPk(id);
    if (!partner) return res.status(404).json({ message: 'Không tìm thấy đối tác' });
    partner.status = status;
    await partner.save();
    res.json({ success: true, partner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// API DOCUMENTS

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

app.post('/api/admin/project-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { partnerId, projectId, hasPermission } = req.body;
  const project = projects.find(p => p.projectId === projectId);
  if (!project) return res.status(404).json({ message: 'Không tìm thấy Project' });
  if (hasPermission && !project.allowedPartners.includes(partnerId)) {
    project.allowedPartners.push(partnerId);
  } else if (!hasPermission) {
    project.allowedPartners = project.allowedPartners.filter(id => id !== partnerId);
  }
  res.json({ success: true, projects });
});

app.post('/api/admin/endpoint-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối: Yêu cầu quyền Admin' });
  const { partnerId, endpointId, hasPermission } = req.body;
  let isFound = false;
  for (let p of projects) {
    for (let d of p.documents) {
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
  if (!isFound) return res.status(404).json({ message: 'Không tìm thấy Endpoint' });
  res.json({ success: true, projects });
});


// CHẠY SERVER

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));