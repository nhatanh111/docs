import React, { useState, useRef } from 'react';

// ==========================================
// METHOD BADGE
// ==========================================
function MethodBadge({ method }) {
  const colors = {
    GET:    'bg-[#61affe] text-white',
    POST:   'bg-[#49cc90] text-white',
    PUT:    'bg-[#fca130] text-white',
    DELETE: 'bg-[#f93e3e] text-white',
    PATCH:  'bg-[#50e3c2] text-white',
  };
  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black tracking-wide min-w-[40px] shrink-0 ${colors[method] || 'bg-slate-400 text-white'}`}>
      {method}
    </span>
  );
}

// ==========================================
// SIDEBAR ACCORDION — trái
// ==========================================
function ApiSidebar({ categories, apiGroups, selectedCategoryId, onSelectCategory }) {
  const [expanded, setExpanded] = useState(() => {
    const m = {};
    categories.forEach(c => { m[c.id] = true; });
    return m;
  });

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const getApis = (catId) => (apiGroups.find(g => g.categoryId === catId)?.apis || []);

  return (
    <div className="w-[260px] shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh sách API</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => {
          const apis = getApis(cat.id);
          const isExp = expanded[cat.id];
          return (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-all border-b border-slate-100 text-left"
              >
                <span className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isExp ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExp && (
                <div className="bg-white">
                  {apis.length === 0 ? (
                    <p className="px-5 py-2 text-[10px] text-slate-300 italic">Chưa có API</p>
                  ) : (
                    apis.map((api) => (
                      <button
                        key={api.id}
                        type="button"
                        onClick={() => onSelectCategory(cat.id)}
                        className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left border-b border-slate-50 transition-all hover:bg-blue-50 group ${
                          selectedCategoryId === cat.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <MethodBadge method={api.method} />
                        <span className={`text-xs leading-snug pt-px ${
                          selectedCategoryId === cat.id ? 'text-blue-700 font-semibold' : 'text-slate-600 group-hover:text-blue-600'
                        }`}>
                          {api.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// DETAIL PHÂN QUYỀN — phải
// ==========================================
function PermissionDetail({ category, apiGroup, partners, onToggle }) {
  if (!category || !apiGroup) {
    return (
      <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">👈</div>
          <p className="font-medium text-slate-500">Chọn một danh mục để xem phân quyền</p>
        </div>
      </div>
    );
  }

  const activePartners = partners.filter(p => p.status === 'Active');

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col min-w-0">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
        <span className="text-xl">{category.icon}</span>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{category.name}</h3>
          <p className="text-[10px] text-slate-400">{apiGroup.apis.length} endpoints · Click đối tác để bật/tắt quyền</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {apiGroup.apis.map((api) => (
          <div key={api.id} className="px-5 py-4 hover:bg-slate-50/60 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <MethodBadge method={api.method} />
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
                    type="button"
                    onClick={() => onToggle(category.id, api.id, partner.id)}
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
      </div>
    </div>
  );
}

// ==========================================
// ADD FILE PANEL — inline, không modal
// ==========================================
function AddFilePanel({ onUpload }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('loading');
    setMsg('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = JSON.parse(ev.target.result);
        onUpload(content, file.name);
        setStatus('success');
        setMsg(`✅ Đã thêm danh mục "${content.categoryName || file.name}"`);
      } catch {
        setStatus('error');
        setMsg('❌ File không đúng định dạng JSON');
      }
      e.target.value = '';
      setTimeout(() => { setStatus(null); setMsg(''); }, 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-700">Thêm danh mục API từ file</p>
        {msg && (
          <p className={`text-[11px] mt-1 font-medium ${status === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>
        )}
      </div>

      <div className="shrink-0">
        <input ref={inputRef} type="file" accept=".json" onChange={handleChange} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'loading'}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {status === 'loading' ? 'Đang xử lý...' : 'Add file'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// TAB PHÂN QUYỀN — MAIN
// ==========================================
export default function PermissionsTab({
  partners,
  permissionCategories, setPermissionCategories,
  apiGroups, setApiGroups
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    permissionCategories.length > 0 ? permissionCategories[0].id : null
  );

  const togglePartnerPermission = (categoryId, apiId, partnerId) => {
    setApiGroups(apiGroups.map(group => {
      if (group.categoryId !== categoryId) return group;
      return {
        ...group,
        apis: group.apis.map(api => {
          if (api.id !== apiId) return api;
          const newAllowed = api.allowedPartners.includes(partnerId)
            ? api.allowedPartners.filter(id => id !== partnerId)
            : [...api.allowedPartners, partnerId];
          return { ...api, allowedPartners: newAllowed };
        })
      };
    }));
  };

  const handleUpload = (content, fileName) => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: content.categoryName || `Danh mục từ ${fileName}`,
      icon: content.icon || '📁',
      expanded: true
    };
    setPermissionCategories(prev => [...prev, newCategory]);
    setApiGroups(prev => [...prev, {
      categoryId: newCategory.id,
      name: newCategory.name,
      apis: (content.apis || []).map(api => ({ ...api, allowedPartners: api.allowedPartners || [] }))
    }]);
    setSelectedCategoryId(newCategory.id);
  };

  const selectedCategory = permissionCategories.find(c => c.id === selectedCategoryId);
  const selectedGroup = apiGroups.find(g => g.categoryId === selectedCategoryId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Phân quyền API</h2>
        <p className="text-xs text-slate-400">Quản lý quyền truy cập API theo từng đối tác</p>
      </div>

      {/* Add file panel — inline, không cần modal */}
      <AddFilePanel onUpload={handleUpload} />

      {/* Body: sidebar accordion + detail */}
      <div className="flex gap-4" style={{ minHeight: '480px' }}>
        {permissionCategories.length > 0 ? (
          <ApiSidebar
            categories={permissionCategories}
            apiGroups={apiGroups}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        ) : (
          <div className="w-[260px] shrink-0 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-6">
            <div>
              <div className="text-4xl mb-2">📂</div>
              <p className="text-xs text-slate-400">Chưa có danh mục API.<br/>Upload file JSON để bắt đầu.</p>
            </div>
          </div>
        )}

        <PermissionDetail
          category={selectedCategory}
          apiGroup={selectedGroup}
          partners={partners}
          onToggle={togglePartnerPermission}
        />
      </div>
    </div>
  );
}