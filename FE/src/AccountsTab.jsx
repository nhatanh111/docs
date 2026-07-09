import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addAccount as addAccountService,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService
} from './services/localStorageService';

function AccountModal({ isOpen, mode, currentAccount, setCurrentAccount, onSave, onClose, t }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">{mode === 'add' ? t('accounts.add') : t('accounts.edit')}</h3>
            <p className="text-slate-400 text-xs">{mode === 'add' ? 'Tạo tài khoản mới cho đối tác' : 'Chỉnh sửa thông tin tài khoản'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg">✕</button>
        </div>
        <form onSubmit={onSave} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.email')} *</label>
            <input
               type="email" required placeholder={t('accounts.email_placeholder')}
                value={currentAccount.email}
                onChange={(e) => setCurrentAccount({ ...currentAccount, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              {t('accounts.password')} {mode === 'add' ? '*' : '(có thể chỉnh sửa)'}
            </label>
            <input
              type="text"
              required={mode === 'add'}
              placeholder={mode === 'add' ? t('accounts.password_placeholder') : 'Nhập mật khẩu mới nếu muốn thay đổi'}
              value={currentAccount.password || ''}
              onChange={(e) => setCurrentAccount({ ...currentAccount, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
            {mode === 'add' && (
              <p className="text-[9px] text-blue-600 mt-1 font-medium">
                💡 Mật khẩu này sẽ được dùng để đăng nhập hệ thống
              </p>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.role')} *</label>
            <select
              value={currentAccount.role}
              onChange={(e) => setCurrentAccount({ ...currentAccount, role: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-medium outline-none focus:border-blue-400"
            >
              <option value="ĐỐI TÁC">{t('accounts.role_partner')}</option>
              <option value="ADMIN">{t('accounts.role_admin')}</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.status')}</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="acc_status" checked={currentAccount.status === 'Active'} onChange={() => setCurrentAccount({ ...currentAccount, status: 'Active' })} className="accent-emerald-600" />
                <span>{t('accounts.status_active_label')}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" name="acc_status" checked={currentAccount.status === 'Inactive'} onChange={() => setCurrentAccount({ ...currentAccount, status: 'Inactive' })} className="accent-rose-600" />
                <span className="text-rose-600">{t('accounts.status_inactive_label')}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.description')}</label>
            <textarea
              rows="2" placeholder={t('accounts.description_placeholder')}
              value={currentAccount.description}
              onChange={(e) => setCurrentAccount({ ...currentAccount, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm resize-none outline-none focus:border-blue-400"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-5 rounded-lg text-sm transition-all">{t('app.close')}</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-all">{t('app.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountsTab({ accounts, setAccounts }) {
  const { t } = useTranslation();
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
    setCurrentAccount({ ...acc, password: acc.password || '' });
    setIsModalOpen(true);
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        if (accounts.find(a => a.email.toLowerCase() === currentAccount.email.toLowerCase())) {
          alert('❌ Email này đã tồn tại trong hệ thống!');
          return;
        }
        const newAccount = await addAccountService(currentAccount);
        setAccounts(prev => [...prev, newAccount]);
        alert(`✅ Tài khoản "${newAccount.email}" đã được tạo!\n📧 Email: ${newAccount.email}\n🔑 Mật khẩu: ${currentAccount.password}`);
      } else {
        const dataToUpdate = { ...currentAccount };
        if (!dataToUpdate.password) {
          const existingAcc = accounts.find(a => a.id === currentAccount.id);
          dataToUpdate.password = existingAcc?.password || '';
        }
        const updated = await updateAccountService(currentAccount.id, dataToUpdate);
        setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
        alert(t('accounts.updated_success'));
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(t('accounts.delete_error') + ' ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('accounts.delete_confirm'))) return;
    try {
      await deleteAccountService(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert(t('accounts.delete_error') + ' ' + error.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t('accounts.title')}</h2>
          <p className="text-xs text-slate-400">{t('accounts.subtitle')}</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('accounts.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 text-left">{t('accounts.email')}</th>
              <th className="p-3 w-28 text-left">{t('accounts.role')}</th>
              <th className="p-3 w-24 text-center">{t('accounts.status')}</th>
              <th className="p-3 text-left">{t('accounts.description')}</th>
              <th className="p-3 w-28 text-center">{t('accounts.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50/60">
                <td className="p-3 text-center text-slate-300 text-xs">{acc.id}</td>
                <td className="p-3 font-medium text-slate-800 text-sm">
                  <div>{acc.email}</div>
                  <div className="text-[10px] text-slate-400 font-mono">🔑 ••••••</div>
                </td>
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
                    {acc.status === 'Active' ? t('accounts.status_active_label') : t('accounts.status_inactive_label')}
                  </span>
                </td>
                <td className="p-3 text-slate-400 text-xs max-w-[180px] truncate">{acc.description || '---'}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(acc)} className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 text-xs font-medium">{t('app.edit')}</button>
                    <button onClick={() => handleDelete(acc.id)} className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium">{t('app.delete')}</button>
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
        t={t}
      />
    </div>
  );
}