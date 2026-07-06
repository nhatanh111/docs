import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import PartnerDocs from './partnerDocs/PartnerDocs';
import LanguageSwitcher from './components/LanguageSwitcher';

import './index.css';

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('portal');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) setUser(JSON.parse(savedUser));

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (mode) => {
    setIsPageLoading(true);
    setShowUserMenu(false);
    setTimeout(() => {
      setViewMode(mode);
      setIsPageLoading(false);
    }, 300);
  };

  const handleLoginSuccess = (data) => {
    setUser(data);
    localStorage.setItem('user_info', JSON.stringify(data));
    handleNavigate('portal');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    setViewMode('portal');
    setShowUserMenu(false);
  };

  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      <header className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 fixed w-full top-0 z-50 h-14 shadow-lg">
        <div onClick={() => handleNavigate('portal')} className="flex items-center space-x-2 cursor-pointer group select-none">
          <div className="flex justify-center mb-0">
            <img src="/favicon.ico" alt="PVI Portal" className="w-6 h-6" />
          </div>
          <span className="font-bold tracking-wider text-lg transition-colors group-hover:text-blue-400 duration-200">PVI PORTAL</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="relative z-50" ref={menuRef}>
            <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 text-sm bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition select-none shadow-inner">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center text-xs font-bold uppercase">
                {user.name?.charAt(0)}
              </div>
              <span>{t('app.welcome')}, <strong className="text-blue-400">{user.name}</strong></span>
            </div>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-700 z-[100] text-xs block">
                <div className="px-4 py-2 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-xl">
                  <p className="font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-blue-600 font-bold mt-0.5 uppercase tracking-wider whitespace-nowrap">{t('app.role', 'Role')}: {user.role === 'admin' ? t('accounts.role_admin', 'Admin') : `${t('accounts.role_partner', 'Partner')} [${user.role}]`}</p>
                </div>

                {user.role === 'admin' && (
                  <div className="border-b border-slate-100 pb-1 mb-1">
                    <button type="button" onClick={() => handleNavigate('dashboard')} className="w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-slate-50 transition text-blue-700 font-semibold">
                       <span>{t('app.admin')} (Dashboard)</span>
                    </button>
                  </div>
                )}

                <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center space-x-2 font-semibold">
                   <span>{t('app.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 pt-14 flex flex-col relative z-10">
        {isPageLoading ? (
          <div className="flex-1 bg-white p-8 flex flex-col justify-center items-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-400 font-medium animate-pulse">{t('app.loading', 'Đang đồng bộ danh mục API Core Hub...')}</div>
          </div>
        ) : (
          <>
            {viewMode === 'portal' && <PartnerDocs />}
            {viewMode === 'dashboard' && user.role === 'admin' && <AdminDashboard />}
          </>
        )}
      </div>
    </div>
  );
}