import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DocsSidebar({ sidebarScrollRef, categories, activeEndpoints, activeEpId, scrollToApi }) {
  const { t } = useTranslation();

  return (
    <div ref={sidebarScrollRef} className="w-80 shrink-0 border-r border-slate-200 bg-[#f8fafc] p-4 overflow-y-auto space-y-0 text-xs select-none flex flex-col custom-scrollbar">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {categories.map((cat, cIdx) => {
          const epsInCat = activeEndpoints.filter(e => (e.category || "CHUNG") === cat);
          if (epsInCat.length === 0) return null;
          return (
            <div key={cIdx} className="space-y-1">
              <div className="text-slate-400 uppercase font-extrabold tracking-wider text-[9px] pt-1 px-1 text-left">
                {t(cat)}
              </div>
              <div className="space-y-0.5">
                {epsInCat.map((ep) => (
                  <div
                    key={ep.id}
                    id={`sidebar-item-${ep.id}`}
                    onClick={() => scrollToApi(ep.id)}
                    className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                      activeEpId === ep.id ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white shrink-0 ${
                      {POST: 'bg-emerald-600', PUT: 'bg-amber-600', PATCH: 'bg-orange-500', GET: 'bg-blue-500', DELETE: 'bg-red-500', INFO: 'bg-blue-500', DATA: 'bg-blue-500', CODE: 'bg-purple-500', HASH: 'bg-purple-500', VER: 'bg-slate-500'}[ep.method] || 'bg-slate-500'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="truncate flex-1 font-semibold text-left">{t(ep.description)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}