import React, { useState } from 'react';

// Đảm bảo lấy đúng URL môi trường, loại bỏ dấu / ở cuối nếu người dùng vô tình nhập thừa
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com').replace(/\/$/, '');

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset lại lỗi cũ trước khi bấm đăng nhập

    // Kiểm tra nếu chưa cấu hình biến môi trường
    if (!BASE_URL) {
      setError('Lỗi hệ thống: Chưa cấu hình địa chỉ API (VITE_API_URL).');
      return;
    }

    try {
      // Gọi API đến đúng endpoint đã format sạch sẽ
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // Kiểm tra xem phản hồi có phải là JSON không để tránh lỗi crash khi parse dữ liệu lỗi (như lỗi 500 html)
      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data);
      } else {
        // Hiển thị tin nhắn lỗi từ Backend, nếu backend không trả về message thì dùng text mặc định
        setError(data.message || `Đăng nhập thất bại (Mã lỗi: ${res.status})`);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Không thể kết nối đến server backend. Vui lòng kiểm tra lại mạng hoặc server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 1. DÙNG LINK ẢNH ONLINE */}
      <img 
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
        alt="PVI Building" 
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />
      
      {/* 3. FORM ĐĂNG NHẬP */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-slate-100 relative z-20"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight mb-1">
             <span className="text-blue-800">PVI API Docs</span>
          </h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Hệ thống phân quyền tài liệu tích hợp
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg mb-4 text-sm font-medium whitespace-pre-line">
            ⚠️ {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Email đối tác
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 pl-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 text-sm"
              placeholder="name@example.com"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Mật khẩu
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 pl-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 text-sm"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:from-blue-700 hover:to-blue-900 active:scale-[0.98] transition-all duration-150 mt-2"
          >
            Đăng nhập hệ thống
          </button>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-8 pt-4 border-t border-slate-100">
          &copy; 2026 Bảo hiểm PVI. All rights reserved.
        </p>
      </form>
    </div>
  );
}