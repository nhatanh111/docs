import React from 'react';

export default function DocsSidebar({ sidebarScrollRef, categories, activeEndpoints, activeEpId, scrollToApi }) {
  return (
    <div ref={sidebarScrollRef} className="w-80 shrink-0 border-r border-slate-200 bg-[#f8fafc] p-4 overflow-y-auto space-y-0 text-xs select-none flex flex-col custom-scrollbar">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {categories.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-1">
            <div className="text-slate-400 uppercase font-extrabold tracking-wider text-[9px] pt- px-1 text-left">{cat}</div>
            <div className="space-y-0.5">
              {activeEndpoints.filter(e => (e.category || "CHUNG") === cat).map((ep) => (
                <div
                  key={ep.id}
                  id={`sidebar-item-${ep.id}`}
                  onClick={() => scrollToApi(ep.id)}
                  className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                    activeEpId === ep.id ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white shrink-0 ${
                    ep.method === 'POST' ? 'bg-emerald-600' : ep.method === 'INFO' || ep.method === 'DATA' ? 'bg-blue-500' : 'bg-slate-500'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="truncate flex-1 font-semibold text-left">{ep.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
