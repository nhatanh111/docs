import React, { useState, useEffect, useRef } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import AdminPermissions from './AdminPermissions';
import PartnerDocs from './PartnerDocs';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('portal'); 
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const menuRef = useRef(null);

  const [endpoints, setEndpoints] = useState(() => {
    const savedEndpoints = localStorage.getItem('pvi_api_endpoints');
    if (savedEndpoints) return JSON.parse(savedEndpoints);
    
    return [
      { id: 'intro', category: 'TÀI LIỆU CHUNG', name: 'Introduction', method: null, path: '/docs/v1/welcome' },
      { id: 'auth', category: 'TÀI LIỆU CHUNG', name: 'Authentication', method: null, path: '/docs/v1/auth' },
      { id: 'ref', category: 'TÀI LIỆU CHUNG', name: 'Reference Center', method: null, path: '/docs/v1/ref' },
      { id: 'change', category: 'TÀI LIỆU CHUNG', name: 'Changelog v1.3.0', method: null, path: '/docs/v1/change' },
      { id: 'moto-fee', category: 'BẢO HIỂM XE MÁY', name: 'Tính phí Bảo hiểm bắt buộc', method: 'POST', path: '/API_cp/ManagerApplication/Get_TongPhi_Moto_TNDS' },
      { id: 'moto-issue', category: 'BẢO HIỂM XE MÁY', name: 'Đăng ký thông tin cấp ấn chỉ bảo hiểm', method: 'POST', path: '/API_cp/ManagerApplication/Insert_Moto_Issue' },
      { id: 'auto-fee', category: 'BẢO HIỂM XE Ô TÔ', name: 'Tính phí bảo hiểm trách nhiệm dân sự bắt buộc ô tô', method: 'POST', path: '/API_cp/ManagerApplication/Get_TongPhi_Auto_TNDS' },
      { id: 'auto-issue', category: 'BẢO HIỂM XE Ô TÔ', name: 'Đẩy dữ liệu thông tin chủ xe, số khung, số máy', method: 'POST', path: '/API_cp/ManagerApplication/Insert_Oto_Issue' },
      { id: 'claim', category: 'HỖ TRỢ BỒI THƯỜNG', name: 'Khai báo bồi thường & Hiện trường tổn thất', method: 'POST', path: '/API_cp/ManagerApplication/Claim_Register' },
      { id: 'invoice', category: 'HÓA ĐƠN ĐIỆN TỬ', name: 'Xuất hóa đơn điện tử e-Invoice tự động', method: 'POST', path: '/API_cp/ManagerApplication/EInvoice_Issue' },
      { id: 'reconcile', category: 'ĐỐI SOÁT & KẾ TOÁN', name: 'Đối soát tự động dòng tiền đối tác', method: 'POST', path: '/API_cp/ManagerApplication/Finance_Reconcile' },
      { id: 'agent', category: 'QUẢN LÝ ĐẠI LÝ', name: 'Tra cứu Hoa hồng & Chiết khấu đại lý', method: 'GET', path: '/API_cp/ManagerApplication/Agent_Commission' },
      { id: 'crm', category: 'CRM & TÁI TỤC', name: 'Cảnh báo và kiểm tra tái tục đơn cũ', method: 'POST', path: '/API_cp/ManagerApplication/Crm_Renewal_Check' },
      { id: 'risk', category: 'THẨM ĐỊNH RỦI RO', name: 'Đánh giá rủi ro phần cứng & Blacklist', method: 'POST', path: '/API_cp/ManagerApplication/Risk_Assessment' },
      { id: 'reinsurance', category: 'TÁI BẢO HIỂM', name: 'Phân giao rủi ro tài sản lớn sang nhà Tái', method: 'POST', path: '/API_cp/ManagerApplication/Reinsurance_Allocate' },
      { id: 'dir', category: 'HỆ THỐNG DANH MỤC', name: 'Truy vấn các bộ mã danh mục dùng chung', method: 'POST', path: '/API_cp/ManagerApplication/Get_System_Directories' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pvi_api_endpoints', JSON.stringify(endpoints));
  }, [endpoints]);

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

  const filteredEndpoints = endpoints; // Giữ nguyên logic lọc nếu có

 return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      <header className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 fixed w-full top-0 z-50 h-14 shadow-lg">
        {/* Logo và tiêu đề giữ nguyên */}
        <div onClick={() => handleNavigate('portal')} className="flex items-center space-x-2 cursor-pointer group select-none">
          <div className="flex justify-center mb-0">
            <img 
              src="/favicon.ico" // hoặc đường dẫn logo của bạn
              alt="PVI Portal" 
              className="w-6 h-6" // chỉnh con số này: w-8, w-10, w-12, w-16...
            />
          </div>
          <span className="font-bold tracking-wider text-lg transition-colors group-hover:text-blue-400 duration-200">PVI PORTAL</span>
        </div>

        <div className="relative z-50" ref={menuRef}>
          <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 text-sm bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition select-none shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center text-xs font-bold uppercase">
              {user.name?.charAt(0)}
            </div>
            <span>Xin chào, <strong className="text-blue-400">{user.name}</strong></span>
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-700 z-[100] text-xs block">
              <div className="px-4 py-2 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-xl">
                <p className="font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-blue-600 font-bold mt-0.5 uppercase tracking-wider">Quyền: {user.role === 'admin' ? 'Hệ thống Admin' : `Đối tác [${user.role}]`}</p>
              </div>

              {/* MỤC QUẢN TRỊ - CHỈ HIỂN THỊ VỚI ADMIN */}
              {user.role === 'admin' && (
                <div className="border-b border-slate-100 pb-1 mb-1">
                  <button type="button" onClick={() => handleNavigate('dashboard')} className="w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-slate-50 transition text-blue-700 font-semibold">
                    <span>📊</span> <span>Bảng điều khiển (Dashboard)</span>
                  </button>
                  <button type="button" onClick={() => handleNavigate('permissions')} className="w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-slate-50 transition text-blue-700 font-semibold">
                    <span>🔐</span> <span>Quản lý quyền & API</span>
                  </button>
                </div>
              )}

              <button type="button" onClick={() => handleNavigate('portal')} className="w-full text-left px-4 py-2.5 flex items-center space-x-2 hover:bg-slate-50 transition">
                <span>📄</span> <span>Xem giao diện Portal</span>
              </button>
              <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center space-x-2 font-semibold">
                <span>🚪</span> <span>Đăng xuất hệ thống</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 pt-14 flex flex-col relative z-10">
        {isPageLoading ? (
          <div className="flex-1 bg-white p-8 flex flex-col justify-center items-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-400 font-medium animate-pulse">Đang đồng bộ danh mục API Core Hub...</div>
          </div>
        ) : (
          <>
            {viewMode === 'portal' && <PartnerDocs endpoints={filteredEndpoints} />}
            {viewMode === 'dashboard' && user.role === 'admin' && <AdminDashboard endpoints={endpoints} />}
            {viewMode === 'permissions' && user.role === 'admin' && <AdminPermissions endpoints={endpoints} setEndpoints={setEndpoints} />}
          </>
        )}
      </div>
    </div>
  );
}