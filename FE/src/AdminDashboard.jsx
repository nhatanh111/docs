import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AccountsTab from './AccountsTab';
import PartnersTab from './PartnersTab';
import PermissionsTab from './PermissionsTab';
import { getAccounts, getPartners, getPermissionCategories, getApiGroups, savePermissionCategories, saveApiGroups } from './services/localStorageService';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [permissionCategories, setPermissionCategories] = useState([]);
  const [apiGroups, setApiGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('partners');
  const [initialProfileId, setInitialProfileId] = useState(null);
  const [initialSubTab, setInitialSubTab] = useState('profiles');

  useEffect(() => {
    (async () => {
      const [accountsData, partnersData] = await Promise.all([
        getAccounts(),
        getPartners()
      ]);
      setAccounts(accountsData);
      setPartners(partnersData);
      setPermissionCategories(getPermissionCategories());
      setApiGroups(getApiGroups());
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (permissionCategories.length) {
      savePermissionCategories(permissionCategories);
    }
  }, [permissionCategories]);

  useEffect(() => {
    if (apiGroups.length) {
      saveApiGroups(apiGroups);
    }
  }, [apiGroups]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('app.loading', 'Loading...')}</div>;
  }

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] text-slate-600 text-[13px] font-sans overflow-hidden antialiased">
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
              <span>{t('menu.accounts')}</span>
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
              <span>{t('menu.partners')}</span>
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
              <span>{t('menu.permissions')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5]">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'accounts' && <AccountsTab accounts={accounts} setAccounts={setAccounts} />}
            {activeTab === 'partners' && (
              <PartnersTab
                partners={partners}
                setPartners={setPartners}
                accounts={accounts}
              />
            )}
            {activeTab === 'permissions' && (
              <PermissionsTab
                partners={partners}
                setPartners={setPartners}
                accounts={accounts}
                initialSelectedProfileId={initialProfileId}
                initialSubTab={initialSubTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}