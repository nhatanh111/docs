import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyAccountPassword } from './services/localStorageService';
import { authApi } from './services/api';

export default function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      if (!data || !data.token) {
        throw new Error(t('auth.error_invalid_response'));
      }
      const authData = {
        token: data.token,
        email,
        role: data.role === 'ADMIN' ? 'admin' : 'partner',
        name: data.name || email.split('@')[0].toUpperCase()
      };
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user_info', JSON.stringify(authData));
      setLoading(false);
      return onLoginSuccess(authData);
    } catch (apiErr) {
      const isNetworkError = apiErr instanceof TypeError;
      if (!isNetworkError) {
        setError(t('auth.error_invalid'));
        setLoading(false);
        return;
      }
      console.error('Login API error (network):', apiErr);
    }

    const matchedUser = await verifyAccountPassword(email, password);

    setLoading(false);

    if (matchedUser) {
      if (matchedUser.status === 'Inactive' || matchedUser.status === 'Đã khóa') {
          setError(t('auth.error_inactive'));
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
      setLoading(false);
      onLoginSuccess(localAuthData);
    } else {
      setError(t('auth.error_invalid'));
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
        className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] w-full max-w-sm border border-white/10 relative z-20"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            PVI API Docs
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
            {t('auth.login_subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl mb-5 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center shrink-0 text-sm">⚠️</span>
            <span className="leading-tight">{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.email_label')}
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 text-sm"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all bg-transparent border-0 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-150 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{t('auth.loading_text')}</span>
              </>
            ) : t('auth.login_button')}
          </button>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-8 pt-4 border-t border-slate-100">
          &copy; 2026 {t('auth.copyright')}
        </p>
      </form>
    </div>
  );
}