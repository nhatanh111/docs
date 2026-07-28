import React from 'react';
import { useTranslation } from 'react-i18next';
import TreeSchema from './TreeSchema';
import CustomPageContent from './CustomPageContent';

export default function DocsMainContent({ middleScrollRef, activeEndpoints, apiRefs }) {
  const { t } = useTranslation();

  return (
    <div ref={middleScrollRef} className="flex-1 p-8 overflow-y-auto space-y-24 scroll-smooth min-w-0 custom-scrollbar bg-white">
      {activeEndpoints.map((ep) => (
        <div key={ep.id} data-api-id={ep.id} ref={el => apiRefs.current[ep.id] = el} className="pt-2 border-b border-slate-100 pb-16 last:border-0 scroll-mt-6 max-w-full">
          <div className="text-left max-w-full">
            <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md border border-slate-200 inline-block">
              {t(ep.category)}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1.5 max-w-full">{t(ep.description)}</h1>
            <div className="mt-3 flex items-center space-x-2 text-xs max-w-full">
              <span className={`text-white font-black px-2.5 py-1 rounded-md shrink-0 ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{ep.method}</span>
              <code className="bg-slate-50 text-slate-700 px-3 py-1 rounded-xl font-mono border border-slate-200/70 break-all flex-1 font-bold text-left">{ep.path}</code>
            </div>
          </div>

          {ep.isCustomPage ? (
            <div className="mt-6 max-w-full">
              <CustomPageContent type={ep.pageType} />
            </div>
          ) : (
            <>
              <div className="mt-8 space-y-3 text-left max-w-full">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">{t('portal.labels.request_body')}</h2>
                <div className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">application/json</div>
                <div className="pl-2 border-l border-slate-200 space-y-1 pt-1 max-w-full overflow-hidden">
                  {ep.requestSample ? <TreeSchema dataObj={ep.requestSample} /> : <p className="text-xs text-slate-400 italic">Không yêu cầu Body Header Parameter.</p>}
                </div>
              </div>
              <div className="mt-8 space-y-4 text-left max-w-full">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">{t('portal.labels.response_format')}</h2>
                <div className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">application/json</div>
                <div className="pl-2 border-l border-slate-200 space-y-1 pt-1 max-w-full overflow-hidden">
                  {ep.responseFormat ? <TreeSchema dataObj={ep.responseFormat} /> : <p className="text-xs text-slate-400 italic">Không có phản hồi mẫu.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
