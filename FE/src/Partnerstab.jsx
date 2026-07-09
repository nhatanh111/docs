import React, { useState, useEffect } from 'react';
import {
  addPartner as addPartnerService,
  updatePartner as updatePartnerService,
  deletePartner as deletePartnerService,
  getPermissionProfiles
} from './services/localStorageService';

function PartnerModal({ isOpen, mode, currentPartner, setCurrentPartner, onSave, onClose, partners, accounts }) {
  if (!isOpen) return null;

  const formatId = (id) => {
    if (!id) return '---';
    const num = parseInt(id.split('-')[1]);
    return String(num).padStart(3, '0');
  };

  const getPartnerAccount = (accountId) => accounts.find(a => a.id === accountId);

  // Accounts chưa được dùng bởi partner khác (trừ partner đang edit)
  const getAvailableAccounts = () => {
    const usedAccountIds = partners
      .filter(p => p.id !== currentPartner.id)
      .map(p => p.accountId)
      .filter(id => id !== null);
    return accounts.filter(a => a.role === 'ĐỐI TÁC' && !usedAccountIds.includes(a.id));
  };

  const linkedAccount = getPartnerAccount(currentPartner.accountId);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">{mode === 'add' ? 'Thêm đối tác' : 'Cập nhật đối tác'}</h3>
            <p className="text-slate-400 text-xs">{mode === 'add' ? 'Khai báo thông tin đối tác mới' : 'Chỉnh sửa thông tin đối tác'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg">✕</button>
        </div>
        <form onSubmit={onSave} className="p-5 space-y-4">

          {/* Mã số đối tác (auto) */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mã số đối tác</label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2.5 text-sm font-bold text-blue-700">
              {mode === 'add' ? '(Tự động tạo)' : formatId(currentPartner.id)}
            </div>
            <p className="text-[9px] text-slate-400 mt-1">Hệ thống tự động đánh theo thứ tự</p>
          </div>

          {/* Tên đối tác */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tên đối tác *</label>
            <input
              type="text" required placeholder="VD: Công ty Cổ phần MoMo"
              value={currentPartner.name}
              onChange={(e) => setCurrentPartner({ ...currentPartner, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400"
            />
          </div>

          {/* Mã API */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mã API *</label>
            <input
              type="text" required placeholder="VD: MOMO_INS_PORTAL"
              value={currentPartner.clientId}
              onChange={(e) => setCurrentPartner({ ...currentPartner, clientId: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono font-bold outline-none focus:border-blue-400"
            />
          </div>

          {/* Tài khoản liên kết */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tài khoản liên kết</label>
            <select
              value={currentPartner.accountId || ''}
              onChange={(e) => setCurrentPartner({ ...currentPartner, accountId: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 cursor-pointer outline-none focus:border-blue-400"
            >
              <option value="">-- Chọn tài khoản --</option>
              {getAvailableAccounts().map(acc => (
                <option key={acc.id} value={acc.id}>{acc.email}</option>
              ))}
            </select>
            {linkedAccount && (
              <div className="mt-1.5 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[11px] text-emerald-700 font-semibold">{linkedAccount.email}</span>
                <span className="text-[9px] text-emerald-500 ml-auto">Đang liên kết</span>
              </div>
            )}
            <p className="text-[9px] text-slate-400 mt-1">Chỉ hiển thị tài khoản role "ĐỐI TÁC" chưa được dùng</p>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Trạng thái</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="p_status" checked={currentPartner.status === 'active'} onChange={() => setCurrentPartner({ ...currentPartner, status: 'active' })} className="accent-emerald-600" />
                <span>Mở cổng</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="p_status" checked={currentPartner.status === 'inactive'} onChange={() => setCurrentPartner({ ...currentPartner, status: 'inactive' })} className="accent-rose-600" />
                <span className="text-rose-600">Chặn cổng</span>
              </label>
            </div>
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

export default function PartnersTab({ partners, setPartners, accounts }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [profiles, setProfiles] = useState([]);
  const [currentPartner, setCurrentPartner] = useState({
    id: null, name: '', clientId: '', status: 'active', accountId: null, profileIds: []
  });

  useEffect(() => {
    setProfiles(getPermissionProfiles());
  }, [isModalOpen]); // Reload profiles when modal toggles

  const formatId = (id) => {
    if (!id) return '---';
    const num = parseInt(id.split('-')[1]);
    return String(num).padStart(3, '0');
  };

  const getPartnerAccount = (accountId) => accounts.find(a => a.id === accountId);

  const openAdd = () => {
    setModalMode('add');
    setCurrentPartner({ id: null, name: '', clientId: '', status: 'active', accountId: null, profileIds: [] });
    setIsModalOpen(true);
  };

  const openEdit = (p) => {
    setModalMode('edit');
    setCurrentPartner({ ...p });
    setIsModalOpen(true);
  };

  const savePartner = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        const newPartner = await addPartnerService(currentPartner);
        setPartners(prev => [...prev, newPartner]);
        setIsModalOpen(false);
      } else {
        const updated = await updatePartnerService(currentPartner.id, currentPartner);
        setPartners(prev => prev.map(p => p.id === updated.id ? updated : p));
        setIsModalOpen(false);
      }
    } catch (error) {
      alert('❌ Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đối tác này?')) return;
    try {
      await deletePartnerService(id);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert('❌ Lỗi xóa: ' + error.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Hồ sơ đối tác</h2>
          <p className="text-xs text-slate-400">Danh sách đối tác thương mại</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm đối tác
        </button>
      </div>

      <div className="space-y-3">
        {partners.map((p) => {
          const account = getPartnerAccount(p.accountId);
          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="text-slate-300 text-xs">#{formatId(p.id)}</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] ${
                        p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {p.status === 'active' ? '● Hoạt động' : '○ Đã khóa'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-xs mt-1">
                      {/* Mã API */}
                      <span className="flex items-center gap-1">
                        <span className="text-slate-400">API:</span>
                        <span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px]">{p.clientId}</span>
                      </span>

                      {/* Tài khoản liên kết */}
                      {account ? (
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {account.email}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg text-[10px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Chưa liên kết tài khoản
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <button onClick={() => openEdit(p)} className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="px-3.5 py-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium">Xóa</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="text-4xl mb-3">🤝</div>
          <p className="font-medium text-slate-600">Chưa có đối tác</p>
        </div>
      )}

      <PartnerModal
        isOpen={isModalOpen}
        mode={modalMode}
        currentPartner={currentPartner}
        setCurrentPartner={setCurrentPartner}
        onSave={savePartner}
        onClose={() => setIsModalOpen(false)}
        partners={partners}
        accounts={accounts}
      />

    </div>
  );
}