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
  { 
    email: 'admin@pvi.com.vn', 
    password: bcrypt.hashSync('admin123', 10), 
    role: 'admin', 
    partnerId: 'admin' 
  },
  { 
    email: 'partner_vifo@gmail.com', 
    password: bcrypt.hashSync('vifo123', 10), 
    role: 'partner', 
    partnerId: 'pt-vifo' 
  },
  { 
    email: 'partner_momo@gmail.com', 
    password: bcrypt.hashSync('momo123', 10), 
    role: 'partner', 
    partnerId: 'pt-momo' 
  }
];

// ==========================================
// 📂 CƠ SỞ DỮ LIỆU ĐỘNG (LƯU TRÊN RAM)
// ==========================================
let documents = [
  {
    id: 'doc-tnds-oto',
    title: 'PVI - Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô',
    allowedPartners: ['pt-vifo', 'pt-momo'], // Cả 2 đối tác đều xem được
    content: {
      baseUrl: 'https://api.pvi.com.vn/v1/tnds-oto',
      endpoints: [
        { method: 'POST', path: '/calculate-premium', name: '1. Tính phí bảo hiểm ô tô dựa trên số chỗ/tải trọng' },
        { method: 'POST', path: '/create-order', name: '2. Nhập thông tin chủ xe và tạo đơn hàng cấp giấy chứng nhận điện tử' }
      ]
    }
  },
  {
    id: 'doc-tnds-xe-may',
    title: 'PVI - Tài liệu tích hợp API Bảo hiểm TNDS Xe máy',
    allowedPartners: ['pt-vifo'], // Chỉ VIFO xem được, MOMO đăng nhập sẽ bị ẩn mục này
    content: {
      baseUrl: 'https://api.pvi.com.vn/v1/tnds-motor',
      endpoints: [
        { method: 'POST', path: '/issue-certificate', name: '1. Cấp mã giấy chứng nhận bảo hiểm xe máy online tự động' }
      ]
    }
  }
];

// ==========================================
// ⚙️ CÁC ROUTE API HỆ THỐNG
// ==========================================

// 1. API Đăng nhập công khai
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
  }
  
  // Kèm role và partnerId vào Token để Frontend bóc tách dữ liệu
  const token = jwt.sign(
    { email: user.email, role: user.role, partnerId: user.partnerId }, 
    JWT_SECRET, 
    { expiresIn: '3h' }
  );
  
  res.json({ token, role: user.role, name: user.email, partnerId: user.partnerId });
});

// Middleware chặn và xác thực Token người dùng gửi lên
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

// 2. API Lấy tài liệu (Tự động lọc theo quyền)
app.get('/api/documents', authenticateToken, (req, res) => {
  // Nếu là ADMIN, hiển thị TOÀN BỘ không cần lọc
  if (req.user.role === 'admin') {
    return res.json(documents);
  }
  // Nếu là Đối tác (Partner), chỉ lọc ra tài liệu nào chứa partnerId của họ trong mảng allowedPartners
  const filteredDocs = documents.filter(doc => doc.allowedPartners.includes(req.user.partnerId));
  res.json(filteredDocs);
});

// 3. API Dành riêng cho Admin: Tích chọn Ẩn/Hiện tài liệu với từng đối tác
app.post('/api/admin/assign-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối truy cập: Bạn không phải Admin' });
  
  const { partnerId, documentId, hasPermission } = req.body;
  const doc = documents.find(d => d.id === documentId);
  
  if (doc) {
    if (hasPermission && !doc.allowedPartners.includes(partnerId)) {
      doc.allowedPartners.push(partnerId); // Thêm quyền xem
    } else if (!hasPermission) {
      doc.allowedPartners = doc.allowedPartners.filter(id => id !== partnerId); // Tước quyền xem
    }
  }
  res.json({ success: true, documents });
});

// 4. API Dành riêng cho Admin: Thêm Endpoint nghiệp vụ mới vào tài liệu có sẵn
app.post('/api/admin/add-endpoint', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Từ chối truy cập: Bạn không phải Admin' });
  
  const { documentId, method, path, name, signFormula } = req.body;
  const doc = documents.find(d => d.id === documentId);
  
  if (!doc) return res.status(404).json({ message: 'Không tìm thấy mục tài liệu này' });
  if (!method || !path || !name) return res.status(400).json({ message: 'Vui lòng điền đủ Method, Path và Tên Endpoint' });

  doc.content.endpoints.push({ 
    method: method.toUpperCase(), 
    path, 
    name, 
    signFormula: signFormula || '' 
  });
  
  res.json({ success: true, documents });
});

// Lắng nghe cổng khởi chạy
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend phân quyền đang chạy ổn định tại port ${PORT}...`);
});