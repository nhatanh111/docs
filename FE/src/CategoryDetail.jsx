import React, { useState } from 'react';

export default function CategoryDetail({
  categoryId,
  categories,
  groups,
  partners,
  setApiGroups,
  onBack
}) {
  const category = categories.find(c => c.id === categoryId);
  const group = groups.find(g => g.categoryId === categoryId);

  if (!category || !group) {
    return <div className="p-6">Không tìm thấy danh mục</div>;
  }

  const activePartners = partners.filter(p => p.status === 'Active');

  const togglePartnerPermission = (apiId, partnerId) => {
    setApiGroups(prev => prev.map(g => {
      if (g.categoryId !== categoryId) return g;
      return {
        ...g,
        apis: g.apis.map(api => {
          if (api.id !== apiId) return api;
          const newAllowed = api.allowedPartners.includes(partnerId)
            ? api.allowedPartners.filter(id => id !== partnerId)
            : [...api.allowedPartners, partnerId];
          return { ...api, allowedPartners: newAllowed };
        })
      };
    }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-lg font-bold text-slate-800">{category.name}</h2>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Danh sách API trong danh mục */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="font-semibold text-sm text-slate-700">
            {group.apis.length} API
          </span>
          <span className="text-xs text-slate-400">Click đối tác để bật/tắt quyền</span>
        </div>

        {group.apis.map((api) => (
          <div key={api.id} className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50/60 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${api.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {api.method}
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{api.path}</span>
              <span className="text-xs text-slate-500 truncate">{api.name}</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-1">
              <span className="text-[9px] text-slate-400 font-semibold self-center mr-1">ĐƯỢC PHÉP:</span>
              {activePartners.map(partner => {
                const has = api.allowedPartners.includes(partner.id);
                return (
                  <button
                    key={partner.id}
                    onClick={() => togglePartnerPermission(api.id, partner.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                      has
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${has ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {partner.name}
                  </button>
                );
              })}
              {activePartners.length === 0 && (
                <span className="text-[10px] text-slate-300 italic">Chưa có đối tác Active</span>
              )}
            </div>
          </div>
        ))}

        {group.apis.length === 0 && (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            Danh mục này chưa có API nào
          </div>
        )}
      </div>
    </div>
  );
}