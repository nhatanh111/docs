import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com';

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

function AccountModal({ isOpen, mode, currentAccount, setCurrentAccount, onSave, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">{mode === 'add' ? 'Thêm tài khoản' : 'Cập nhật tài khoản'}</h3>
            <p className="text-slate-400 text-xs">{mode === 'add' ? 'Tạo tài khoản mới' : 'Chỉnh sửa thông tin'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg">✕</button>
        </div>
        <form onSubmit={onSave} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email *</label>
            <input
              type="email" required placeholder="ten@pvi.com.vn"
              value={currentAccount.email}
              onChange={(e) => setCurrentAccount({ ...currentAccount, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mật khẩu *</label>
            <input
              type="text" required placeholder="Nhập mật khẩu..."
              value={currentAccount.password || ''}
              onChange={(e) => setCurrentAccount({ ...currentAccount, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vai trò *</label>
            <select
              value={currentAccount.role}
              onChange={(e) => setCurrentAccount({ ...currentAccount, role: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-medium outline-none focus:border-blue-400"
            >
              <option value="ĐỐI TÁC">ĐỐI TÁC</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Trạng thái</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="acc_status" checked={currentAccount.status === 'Active'} onChange={() => setCurrentAccount({ ...currentAccount, status: 'Active' })} className="accent-emerald-600" />
                <span>Hoạt động</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="acc_status" checked={currentAccount.status === 'Inactive'} onChange={() => setCurrentAccount({ ...currentAccount, status: 'Inactive' })} className="accent-rose-600" />
                <span className="text-rose-600">Khóa</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ghi chú</label>
            <textarea
              rows="2" placeholder="Nhập ghi chú..."
              value={currentAccount.description}
              onChange={(e) => setCurrentAccount({ ...currentAccount, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm resize-none outline-none focus:border-blue-400"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-5 rounded-lg text-sm transition-all">Đóng</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-all">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountsTab({ accounts, setAccounts }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentAccount, setCurrentAccount] = useState({
    id: null, email: '', password: '', role: 'ĐỐI TÁC', status: 'Active', description: ''
  });

  const openAdd = () => {
    setModalMode('add');
    setCurrentAccount({ id: null, email: '', password: '', role: 'ĐỐI TÁC', status: 'Active', description: '' });
    setIsModalOpen(true);
  };

  const openEdit = (acc) => {
    setModalMode('edit');
    setCurrentAccount({ ...acc, password: '' }); // không hiển thị mật khẩu cũ
    setIsModalOpen(true);
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        const newAccount = await fetchWithAuth('/api/admin/accounts', {
          method: 'POST',
          body: JSON.stringify(currentAccount),
        });
        setAccounts([...accounts, newAccount]);
        alert(`✅ Tài khoản "${newAccount.email}" đã được tạo!`);
      } else {
        const updated = await fetchWithAuth(`/api/admin/accounts/${currentAccount.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentAccount),
        });
        setAccounts(accounts.map(a => a.id === updated.id ? updated : a));
        alert('✅ Cập nhật thành công!');
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const deleteAccount = async (id) => {
    if (!window.confirm('Xóa tài khoản này?')) return;
    try {
      await fetchWithAuth(`/api/admin/accounts/${id}`, { method: 'DELETE' });
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (error) {
      alert('❌ Lỗi xóa: ' + error.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quản lý tài khoản</h2>
          <p className="text-xs text-slate-400">Quản lý người dùng và phân quyền truy cập</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 w-28 text-left">Vai trò</th>
              <th className="p-3 w-24 text-center">Trạng thái</th>
              <th className="p-3 text-left">Ghi chú</th>
              <th className="p-3 w-28 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50/60">
                <td className="p-3 text-center text-slate-300 text-xs">{acc.id}</td>
                <td className="p-3 font-medium text-slate-800 text-sm">{acc.email}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                    acc.role === 'ADMIN' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>{acc.role}</span>
                </td>
                <td className="p-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                    acc.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    {acc.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="p-3 text-slate-400 text-xs max-w-[180px] truncate">{acc.description || '---'}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(acc)} className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 text-xs font-medium">Sửa</button>
                    <button onClick={() => deleteAccount(acc.id)} className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AccountModal
        isOpen={isModalOpen}
        mode={modalMode}
        currentAccount={currentAccount}
        setCurrentAccount={setCurrentAccount}
        onSave={saveAccount}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}