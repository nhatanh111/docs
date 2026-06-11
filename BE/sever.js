const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = 'PVI_SECRET_KEY_2026';

// 🔐 DANH SÁCH TÀI KHOẢN HỆ THỐNG
const users = [
  { email: 'admin@pvi.com.vn', password: bcrypt.hashSync('admin123', 10), role: 'admin', partnerId: 'admin' },
  { email: 'partner_vifo@gmail.com', password: bcrypt.hashSync('vifo123', 10), role: 'partner', partnerId: 'pt-vifo' },
  { email: 'partner_momo@gmail.com', password: bcrypt.hashSync('momo123', 10), role: 'partner', partnerId: 'pt-momo' }
];

// =========================================================================
// 📂 CƠ SỞ DỮ LIỆU ĐỘNG: PHÂN QUYỀN THEO PROJECT & ENDPOINT ĐỘC LẬP
// =========================================================================
let projects = [
  {
    projectId: "project-pvi-retail",
    projectName: "Hệ thống Bán lẻ PVI Core",
    allowedPartners: ["pt-vifo", "pt-momo"], // Cấp 1: Đối tác phải có quyền ở Project mới được vào xem
    documents: [
      {
        id: "bao-hiem-xe-may",
        title: "BẢO HIỂM XE MÁY",
        endpoints: [
          { 
            endpointId: "ep-moto-calc",
            method: "POST", 
            path: "/moto/calculate", 
            name: "Tính toán tổng phí bảo hiểm xe máy",
            allowedPartners: ["pt-vifo", "pt-momo"] // Cấp 2: Phân quyền chi tiết từng Endpoint
          },
          { 
            endpointId: "ep-moto-insert",
            method: "POST", 
            path: "/insert-moto", 
            name: "Đăng ký thông tin cấp ấn chỉ bảo hiểm Xe Máy",
            allowedPartners: ["pt-vifo"] // Momo bị chặn endpoint này dù cùng thuộc mục Xe Máy
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
            name: "Tính phí bảo hiểm trách nhiệm dân sự xe ô tô",
            allowedPartners: ["pt-vifo", "pt-momo"]
          },
          { 
            endpointId: "ep-oto-insert",
            method: "POST", 
            path: "/insert-oto", 
            name: "Đẩy dữ liệu cấp đơn ô tô",
            allowedPartners: ["pt-vifo", "pt-momo"]
          }
        ]
      }
    ]
  },
  {
    projectId: "project-pvi-enterprise",
    projectName: "Hệ thống Khách hàng Doanh nghiệp nghiệp vụ lớn",
    allowedPartners: ["pt-vifo"], // Momo không thuộc project này, sẽ ẩn sạch từ đầu
    documents: [
      {
        id: "doi-soat-ke-toan",
        title: "ĐỐI SOÁT & KẾ TOÁN",
        endpoints: [
          { 
            endpointId: "ep-finance-recon",
            method: "POST", 
            path: "/reconciliation", 
            name: "Đối soát danh sách giao dịch định kỳ dòng tiền",
            allowedPartners: ["pt-vifo"]
          }
        ]
      }
    ]
  }
];

// ==========================================
// ⚙️ MIDDLEWARE & ROUTE CORE API
// ==========================================

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

// 1. API Lấy tài liệu: Tự động bóc tách phân quyền sâu 2 cấp (Project -> Endpoint)
app.get('/api/documents', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(projects); // Admin xem được toàn bộ cấu trúc gốc
  }

  const partnerId = req.user.partnerId;
  
  // Tiến hành lọc cấu trúc sâu cho Đối tác (Partner)
  const filteredProjects = projects
    .filter(proj => proj.allowedPartners.includes(partnerId)) // Cấp 1: Thuộc Project mới giữ lại
    .map(proj => {
      // Sao chép sâu Project để lọc các danh mục bên trong
      const cleanDocs = proj.documents.map(doc => {
        // Cấp 2: Chỉ giữ lại các endpoint được quyền truy cập cụ thể cho đối tác này
        const cleanEndpoints = doc.endpoints.filter(ep => ep.allowedPartners.includes(partnerId));
        return { ...doc, endpoints: cleanEndpoints };
      }).filter(doc => doc.endpoints.length > 0); // Nếu mục tài liệu không còn endpoint nào, ẩn luôn mục đó

      return { ...proj, documents: cleanDocs };
    }).filter(proj => proj.documents.length > 0);

  res.json(filteredProjects);
});

// 2. API Admin: Phân quyền đối tác truy cập nguyên một PROJECT lớn
app.post('/api/admin/project-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Yêu cầu quyền Admin' });
  
  const { partnerId, projectId, hasPermission } = req.body;
  const project = projects.find(p => p.projectId === projectId);
  
  if (!project) return res.status(404).json({ message: 'Không tìm thấy Project này' });
  
  if (hasPermission && !project.allowedPartners.includes(partnerId)) {
    project.allowedPartners.push(partnerId);
  } else if (!hasPermission) {
    project.allowedPartners = project.allowedPartners.filter(id => id !== partnerId);
  }
  
  res.json({ success: true, message: "Cập nhật quyền Project thành công", projects });
});

// 3. API Admin: Phân quyền đối tác truy cập một ENDPOINT đơn lẻ cụ thể
app.post('/api/admin/endpoint-permission', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Yêu cầu quyền Admin' });
  
  const { partnerId, endpointId, hasPermission } = req.body;
  let isFound = false;

  // Duyệt sâu để tìm kiếm đúng endpointId nằm bất kì đâu trong hệ thống
  for (let proj of projects) {
    for (let doc of proj.documents) {
      const endpoint = doc.endpoints.find(ep => ep.endpointId === endpointId);
      if (endpoint) {
        isFound = true;
        if (hasPermission && !endpoint.allowedPartners.includes(partnerId)) {
          endpoint.allowedPartners.push(partnerId);
        } else if (!hasPermission) {
          endpoint.allowedPartners = endpoint.allowedPartners.filter(id => id !== partnerId);
        }
        break;
      }
    }
    if (isFound) break;
  }

  if (!isFound) return res.status(404).json({ message: 'Không tìm thấy Endpoint này' });
  res.json({ success: true, message: "Cập nhật quyền Endpoint nghiệp vụ thành công", projects });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Quản lý Phân quyền Phức hợp đang chạy tại port ${PORT}...`);
});