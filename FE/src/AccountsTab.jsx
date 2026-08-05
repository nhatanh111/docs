import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addAccount as addAccountService,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService,
  verifyAccountPassword
} from './services/localStorageService';

function AccountModal({ isOpen, mode, currentAccount, originalEmail, setCurrentAccount, onSave, onClose, t }) {
  const [oldPassword, setOldPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [oldVerified, setOldVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const verifyTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOldVerified(false);
      setVerifyError('');
      setVerifying(false);
    }
    return () => { if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current); };
  }, [isOpen]);

  const runVerify = async (value) => {
    setVerifying(true);
    setVerifyError('');
    let ok = false;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: originalEmail, password: value }),
      });
      if (res.ok) {
        ok = true;
      } else if (res.status === 401) {
        setVerifyError(t('accounts.wrong_old_password'));
        setVerifying(false);
        return;
      }
    } catch (e) {}
    if (!ok) {
      const account = await verifyAccountPassword(originalEmail, value);
      ok = !!account;
      if (!ok) setVerifyError(t('accounts.wrong_old_password'));
    }
    if (ok) {
      setOldVerified(true);
      setVerifyError('');
    }
    setVerifying(false);
  };

  const handleOldPasswordChange = (e) => {
    const value = e.target.value;
    setOldPassword(value);
    setVerifyError('');
    if (oldVerified) setOldVerified(false);
    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    if (!value) return;
    verifyTimerRef.current = setTimeout(() => runVerify(value), 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'edit') {
      if (oldVerified) {
        if (!newPassword) {
          setVerifyError(t('accounts.new_password_required'));
          return;
        }
        if (newPassword !== confirmPassword) {
          setVerifyError(t('accounts.password_mismatch'));
          return;
        }
        onSave(e, newPassword);
        return;
      }
      if (oldPassword) {
        setVerifyError(t('accounts.enter_old_password_first'));
        return;
      }
    }
    onSave(e);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">{mode === 'add' ? t('accounts.add') : t('accounts.edit')}</h3>
            <p className="text-slate-400 text-xs">{mode === 'add' ? t('accounts.add_subtitle') : t('accounts.edit_subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.email')} *</label>
            <input
               type="email" required placeholder={t('accounts.email_placeholder')}
                value={currentAccount.email}
                onChange={(e) => setCurrentAccount({ ...currentAccount, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-400"
            />
          </div>
          {mode === 'add' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t('accounts.password')} *
              </label>
              <input
                type="password"
                required
                placeholder={t('accounts.password_placeholder')}
                value={currentAccount.password || ''}
                onChange={(e) => setCurrentAccount({ ...currentAccount, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-400"
              />
              <p className="text-[9px] text-blue-600 mt-1 font-medium">
                {t('accounts.password_hint')}
              </p>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.old_password')}</label>
              <div className="relative">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={handleOldPasswordChange}
                  placeholder={t('accounts.old_password_placeholder')}
                  className={`w-full bg-slate-50 border rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-blue-400 pr-16 ${oldVerified ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'}`}
                />
                {verifying && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 animate-pulse">⏳ {t('accounts.verifying')}</span>
                )}
                {oldVerified && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-600">✓</span>
                )}
              </div>
              {verifyError && <p className="text-[11px] text-rose-600 mt-1 font-semibold">❌ {verifyError}</p>}
            </div>
          )}
          {mode === 'edit' && oldVerified && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-3 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.new_password')} *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setVerifyError(''); }}
                  placeholder={t('accounts.password_placeholder')}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t('accounts.confirm_password')} *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setVerifyError(''); }}
                  placeholder={t('accounts.confirm_password')}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3.5 py-2 text-sm font-mono outline-none focus:border-emerald-400"
                />
              </div>
              {verifyError && <p className="text-[11px] text-rose-600 font-semibold">❌ {verifyError}</p>}
            </div>
          )}
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

  const saveAccount = async (e, newPassword) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        if (accounts.find(a => a.email.toLowerCase() === currentAccount.email.toLowerCase())) {
          alert(t('accounts.email_exists'));
          return;
        }
        const newAccount = await addAccountService(currentAccount);
        setAccounts(prev => [...prev, newAccount]);
        alert(t('accounts.created_success', { email: newAccount.email }));
      } else {
        const dataToUpdate = { ...currentAccount };
        if (newPassword) dataToUpdate.password = newPassword;
        else delete dataToUpdate.password;
        const updated = await updateAccountService(currentAccount.id, dataToUpdate);
        setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
        alert(t('accounts.updated_success'));
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(t('accounts.save_error') + ' ' + error.message);
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
        originalEmail={accounts.find(a => a.id === currentAccount.id)?.email || currentAccount.email}
        setCurrentAccount={setCurrentAccount}
        onSave={saveAccount}
        onClose={() => setIsModalOpen(false)}
        t={t}
      />
    </div>
  );
}