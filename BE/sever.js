const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sử dụng DATABASE_URL từ biến môi trường
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Quan trọng với Render
    }
  }
});

// Kiểm tra kết nối
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối PostgreSQL thành công.');
    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ model thành công.');
  } catch (error) {
    console.error('❌ Lỗi kết nối PostgreSQL:', error);
  }
})();

const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'PVI_SECRET_KEY_2026';

// ===== KẾT NỐI DATABASE =====
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pvi_db', {
  dialect: 'postgres',
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

// ===== KHỞI TẠO DỮ LIỆU MẪU (nếu bảng trống) =====
const seedData = async () => {
  const userCount = await User.count();
  if (userCount === 0) {
    await User.bulkCreate([
      { email: 'admin.pvi@pvi.com.vn', password: bcrypt.hashSync('admin', 10), role: 'ADMIN', status: 'Active', description: 'Quản trị viên tối cao' },
      { email: 'momo.integration@pvi.com.vn', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản Ví MoMo' },
      { email: 'vifo.tech@pvi.com.vn', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản VIFO' },
      { email: 'zalopay.portal@pvi.com.vn', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Inactive', description: 'Tài khoản ZaloPay' },
      { email: 'vnpay.gateway@pvi.com.vn', password: bcrypt.hashSync('123', 10), role: 'ĐỐI TÁC', status: 'Active', description: 'Tài khoản VNPay' }
    ]);
    console.log('✅ Seeded users.');
  }

  const partnerCount = await Partner.count();
  if (partnerCount === 0) {
    await Partner.bulkCreate([
      { id: 'pt-1', name: 'Ví Điện Tử MoMo', email: 'momo.integration@pvi.com.vn', clientId: 'MOMO_PVI_2026', status: 'active', accountId: 2 },
      { id: 'pt-2', name: 'Nền tảng VIFO', email: 'vifo.tech@pvi.com.vn', clientId: 'VIFO_INSURTECH', status: 'active', accountId: 3 },
      { id: 'pt-3', name: 'Ví Điện Tử ZaloPay', email: 'zalopay.portal@pvi.com.vn', clientId: 'ZALOPAY_GATEWAY', status: 'inactive', accountId: 4 },
      { id: 'pt-4', name: 'Cổng VNPay', email: 'vnpay.gateway@pvi.com.vn', clientId: 'VNPAY_BANKING', status: 'active', accountId: 5 },
      { id: 'pt-5', name: 'Công ty Bảo hiểm XYZ', email: null, clientId: 'XYZ_INSURANCE', status: 'active', accountId: null }
    ]);
    console.log('✅ Seeded partners.');
  }
};

// ===== KẾT NỐI DB & ĐỒNG BỘ =====
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
    return sequelize.sync({ alter: true });
  })
  .then(() => seedData())
  .catch(err => console.error('❌ DB error:', err));

// ===== API ĐĂNG NHẬP =====
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

// ===== MIDDLEWARE XÁC THỰC =====
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

// ===== CRUD TÀI KHOẢN =====
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

// ===== CRUD ĐỐI TÁC =====
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

// ===== API DOCUMENTS (giữ nguyên nếu có) =====
// ... (giữ nguyên)

// ===== CHẠY SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));