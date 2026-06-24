import React, { useState, useEffect } from 'react';
import AccountsTab from './AccountsTab';
import PartnersTab from './PartnersTab';
import PermissionsTab from './PermissionsTab';

const API_BASE = import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com';

// Dữ liệu mẫu fallback
const FALLBACK_ACCOUNTS = [
  { id: 1, email: "admin.pvi@pvi.com.vn", role: "ADMIN", status: "Active", description: "Quản trị viên tối cao hệ thống Cổng PVI", password: "admin" },
  { id: 2, email: "momo.integration@pvi.com.vn", role: "ĐỐI TÁC", status: "Active", description: "Tài khoản kết nối nghiệp vụ Ví MoMo", password: "123" },
  { id: 3, email: "vifo.tech@pvi.com.vn", role: "ĐỐI TÁC", status: "Active", description: "Cổng kết nối nền tảng Insurtech VIFO", password: "123" },
  { id: 4, email: "zalopay.portal@pvi.com.vn", role: "ĐỐI TÁC", status: "Inactive", description: "Tài khoản Sandbox của ZaloPay", password: "123" },
  { id: 5, email: "vnpay.gateway@pvi.com.vn", role: "ĐỐI TÁC", status: "Active", description: "Tài khoản kết nối cổng VNPay", password: "123" }
];

const FALLBACK_PARTNERS = [
  { id: "pt-1", name: "Ví Điện Tử MoMo", clientId: "MOMO_PVI_2026", status: "active", accountId: 2 },
  { id: "pt-2", name: "Nền tảng VIFO", clientId: "VIFO_INSURTECH", status: "active", accountId: 3 },
  { id: "pt-3", name: "Ví Điện Tử ZaloPay", clientId: "ZALOPAY_GATEWAY", status: "inactive", accountId: 4 },
  { id: "pt-4", name: "Cổng VNPay", clientId: "VNPAY_BANKING", status: "active", accountId: 5 },
  { id: "pt-5", name: "Công ty Bảo hiểm XYZ", clientId: "XYZ_INSURANCE", status: "active", accountId: null }
];

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Lỗi kết nối' }));
    throw new Error(error.message || 'Lỗi không xác định');
  }
  return res.json();
};

export default function AdminDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [permissionCategories, setPermissionCategories] = useState([]);
  const [apiGroups, setApiGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('partners');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let accountsData, partnersData;
        try {
          [accountsData, partnersData] = await Promise.all([
            fetchWithAuth('/api/admin/accounts'),
            fetchWithAuth('/api/admin/partners')
          ]);
        } catch (err) {
          console.warn('Không thể kết nối backend, sử dụng dữ liệu mẫu', err);
          setError('Không thể kết nối server. Dữ liệu hiển thị là mẫu.');
          // Dùng fallback
          accountsData = FALLBACK_ACCOUNTS;
          partnersData = FALLBACK_PARTNERS;
        }
        
        setAccounts(accountsData);
        // Chuyển đổi partners về định dạng phù hợp
        setPartners(partnersData.map(p => ({
          ...p,
          code: p.clientId,
          // Chuyển status thành dạng chuẩn
        })));

        // Khởi tạo permissionCategories và apiGroups (có thể để mặc định)
        setPermissionCategories([
          { id: 'cat-1', name: 'Location', icon: '📍', expanded: true },
          { id: 'cat-2', name: 'Bảo hiểm Xe máy', icon: '🏍️', expanded: false },
          { id: 'cat-3', name: 'Bảo hiểm Ô tô', icon: '🚗', expanded: false },
          { id: 'cat-4', name: 'Bảo hiểm Sức khỏe', icon: '🏥', expanded: false },
          { id: 'cat-5', name: 'Bảo hiểm Tài sản', icon: '🏠', expanded: false },
          { id: 'cat-6', name: 'Bảo hiểm Du lịch', icon: '✈️', expanded: false }
        ]);
        setApiGroups([
          {
            categoryId: 'cat-1',
            name: 'Location',
            apis: [
              { id: 'api-loc-1', method: 'GET', path: '/location/countries', name: 'Lấy danh sách quốc gia', allowedPartners: [1, 2, 4] },
              { id: 'api-loc-2', method: 'GET', path: '/location/provinces', name: 'Lấy danh sách Tỉnh/Thành phố', allowedPartners: [1, 2, 4] },
              { id: 'api-loc-3', method: 'GET', path: '/location/districts', name: 'Lấy danh sách Quận/Huyện', allowedPartners: [1, 2] },
              { id: 'api-loc-4', method: 'GET', path: '/location/wards', name: 'Lấy danh sách Phường/Xã', allowedPartners: [1, 2] },
              { id: 'api-loc-5', method: 'POST', path: '/location/search', name: 'Tìm địa chỉ theo mã thành phố và mã phường', allowedPartners: [1, 2, 4] }
            ]
          },
          {
            categoryId: 'cat-2',
            name: 'Bảo hiểm Xe máy',
            apis: [
              { id: 'api-1', method: 'POST', path: '/moto/calculate', name: 'Tính phí bảo hiểm xe máy', allowedPartners: [1, 2] },
              { id: 'api-2', method: 'POST', path: '/moto/insert', name: 'Đăng ký cấp ấn chỉ xe máy', allowedPartners: [1] },
              { id: 'api-3', method: 'GET', path: '/moto/query', name: 'Tra cứu thông tin xe máy', allowedPartners: [1, 2] }
            ]
          },
          {
            categoryId: 'cat-3',
            name: 'Bảo hiểm Ô tô',
            apis: [
              { id: 'api-4', method: 'POST', path: '/oto/calculate', name: 'Tính phí bảo hiểm ô tô', allowedPartners: [2, 4] },
              { id: 'api-5', method: 'POST', path: '/oto/insert', name: 'Đăng ký cấp ấn chỉ ô tô', allowedPartners: [2] },
              { id: 'api-6', method: 'GET', path: '/oto/query', name: 'Tra cứu thông tin ô tô', allowedPartners: [2, 4] }
            ]
          },
          {
            categoryId: 'cat-4',
            name: 'Bảo hiểm Sức khỏe',
            apis: [
              { id: 'api-7', method: 'POST', path: '/health/register', name: 'Đăng ký bảo hiểm sức khỏe', allowedPartners: [] },
              { id: 'api-8', method: 'GET', path: '/health/benefits', name: 'Tra cứu quyền lợi bảo hiểm', allowedPartners: [] }
            ]
          }
        ]);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.');
        // Đảm bảo dữ liệu mẫu được hiển thị
        setAccounts(FALLBACK_ACCOUNTS);
        setPartners(FALLBACK_PARTNERS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] text-slate-600 text-[13px] font-sans overflow-hidden antialiased">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg z-50 max-w-sm">
          ⚠️ {error}
        </div>
      )}
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 bg-white flex flex-col border-r border-slate-200 select-none">
        <div className="flex-1 px-3 py-6">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer transition-all ${
                activeTab === 'accounts' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span>Tài khoản</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('partners')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer transition-all ${
                activeTab === 'partners' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span>Đối tác</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left cursor-pointer transition-all ${
                activeTab === 'permissions' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0zm-3 0a3 3 0 11-6 0 3 3 0 016 0zM3.75 21h16.5M3.75 18h16.5" />
              </svg>
              <span>Phân quyền</span>
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">A</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800">Admin</div>
              <div className="text-[8px] text-emerald-600 font-medium">Super Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5]">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'accounts' && (
              <AccountsTab accounts={accounts} setAccounts={setAccounts} />
            )}
            {activeTab === 'partners' && (
              <PartnersTab partners={partners} setPartners={setPartners} accounts={accounts} />
            )}
            {activeTab === 'permissions' && (
              <PermissionsTab
                partners={partners}
                permissionCategories={permissionCategories}
                setPermissionCategories={setPermissionCategories}
                apiGroups={apiGroups}
                setApiGroups={setApiGroups}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}