import React, { useState } from 'react';
import { getAccounts } from './services/localStorageService';
import { authApi } from './services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await authApi.login(email, password);
      const authData = {
        token: data.token,
        email,
        role: data.role === 'ADMIN' ? 'admin' : 'partner',
        name: data.name || email.split('@')[0].toUpperCase()
      };
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user_info', JSON.stringify(authData));
      return onLoginSuccess(authData);
    } catch (apiErr) {
      // API không khả dụng → fallback localStorage
      console.warn('API login failed, using localStorage fallback:', apiErr);
    }

    const accounts = getAccounts();
    const matchedUser = accounts.find(acc => 
      acc.email.trim().toLowerCase() === email.trim().toLowerCase() && 
      String(acc.password).trim() === password.trim()
    );

    if (matchedUser) {
      if (matchedUser.status === 'Inactive' || matchedUser.status === 'Đã khóa') {
        setError('Tài khoản này hiện đang bị khóa tạm thời bởi Admin!');
        return;
      }
      const localAuthData = {
        token: `local_pvi_token_${matchedUser.role}_${Date.now()}`,
        email: matchedUser.email,
        role: matchedUser.role === 'ADMIN' ? 'admin' : 'partner',
        name: matchedUser.email.split('@')[0].toUpperCase()
      };
      localStorage.setItem('token', localAuthData.token);
      localStorage.setItem('user_info', JSON.stringify(localAuthData));
      onLoginSuccess(localAuthData);
    } else {
      setError('Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
        alt="PVI Building" 
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />
      
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
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg mb-4 text-sm font-medium whitespace-pre-line text-left">
            ⚠️ {error}
          </div>
        )}
        
        <div className="relative">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Email 
            </label>
           <input 
               type="email" 
               value={email} 
               onChange={e => setEmail(e.target.value)} 
               className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 px-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 text-sm"
              required 
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Mật khẩu
            </label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 text-sm"
              
              required 
            />
            
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-0 cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M21 12c0 1.61-.332 3.129-.922 4.5M12 4.5c4.477 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:from-blue-700 hover:to-blue-900 active:scale-[0.98] transition-all duration-150 mt-2 cursor-pointer border-0"
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