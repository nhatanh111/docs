const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'PVI_SECRET_KEY_2026';

// Dữ liệu giả lập danh sách tài khoản
const users = [
  { email: 'admin@pvi.com.vn', password: bcrypt.hashSync('admin123', 10), role: 'admin', partnerId: 'admin' },
  { email: 'partner_vifo@gmail.com', password: bcrypt.hashSync('vifo123', 10), role: 'partner', partnerId: 'pt-vifo' },
  { email: 'partner_momo@gmail.com', password: bcrypt.hashSync('momo123', 10), role: 'partner', partnerId: 'pt-momo' }
];

// Cấu trúc dữ liệu bóc tách từ file Word PVI của bạn
let documents = [
  {
    id: 'doc-tnds-oto',
    title: 'PVI - Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô',
    allowedPartners: ['pt-vifo', 'pt-momo'], // Mặc định cho phép cả 2 xem trước
    content: {
      baseUrl: 'https://api.pvi.com.vn/v1/tnds-oto',
      endpoints: [
        { method: 'POST', path: '/calculate-premium', name: '1. Tính phí bảo hiểm ô tô dựa trên số chỗ/tải trọng' },
        { method: 'POST', path: '/create-order', name: '2. Nhập thông tin chủ xe và tạo đơn hàng cấp giấy chứng nhận điện tử', signFormula: 'sha256(partnerCode + orderId + amount + secretKey)' }
      ]
    }
  },
  {
    id: 'doc-tnds-xe-may',
    title: 'PVI - Tài liệu tích hợp API Bảo hiểm TNDS Xe máy',
    allowedPartners: ['pt-vifo'], // Chỉ cho phép VIFO xem
    content: {
      baseUrl: 'https://api.pvi.com.vn/v1/tnds-motor',
      endpoints: [
        { method: 'POST', path: '/issue-certificate', name: '1. Cấp mã giấy chứng nhận bảo hiểm xe máy online tự động', signFormula: 'sha256(partnerCode + licensePlate + secretKey)' }
      ]
    }
  }
];

// API Đăng nhập
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
  }
  const token = jwt.sign({ email: user.email, role: user.role, partnerId: user.partnerId }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role, name: user.email });
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

// API Lấy danh sách tài liệu dựa trên phân quyền người dùng
app.get('/api/documents', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(documents);
  }
  // Nếu là đối tác, lọc xem tài liệu nào chứa ID của đối tác đó trong mảng allowedPartners
  const filteredDocs = documents.filter(doc => doc.allowedPartners.includes(req.user.partnerId));
  res.json(filteredDocs);
});

// API Dành riêng cho Admin cấu hình tích chọn phân quyền ẩn/hiện tài liệu
app.post('/api/admin/assign-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { partnerId, documentId, hasPermission } = req.body;
  
  const doc = documents.find(d => d.id === documentId);
  if (doc) {
    if (hasPermission && !doc.allowedPartners.includes(partnerId)) {
      doc.allowedPartners.push(partnerId);
    } else if (!hasPermission) {
      doc.allowedPartners = doc.allowedPartners.filter(id => id !== partnerId);
    }
  }
  res.json({ success: true, documents });
});
// API mới: Cho phép Admin thêm Endpoint vào một tài liệu cụ thể
app.post('/api/admin/add-endpoint', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  const { documentId, method, path, name, signFormula } = req.body;
  
  // Tìm tài liệu bảo hiểm cần thêm endpoint
  const doc = documents.find(d => d.id === documentId);
  if (!doc) {
    return res.status(404).json({ message: 'Không tìm thấy tài liệu bảo hiểm' });
  }

  // Kiểm tra dữ liệu đầu vào bắt buộc
  if (!method || !path || !name) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ Method, Path và Tên Endpoint' });
  }

  // Thêm endpoint mới vào mảng endpoints của tài liệu đó
  const newEndpoint = { 
    method: method.toUpperCase(), 
    path, 
    name, 
    signFormula: signFormula || '' // Công thức chữ ký (nếu có)
  };
  
  doc.content.endpoints.push(newEndpoint);
  
  // Trả về danh sách tài liệu mới cập nhật
  res.json({ success: true, documents });
});
// Kích hoạt cổng lắng nghe cho Backend server
app.listen(5000, () => {
  console.log('Backend API Docs đang chạy tại port 5000...');
});