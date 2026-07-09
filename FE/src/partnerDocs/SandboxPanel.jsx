import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, generateLanguageSnippet } from '../MockData';
import CodeHighlighter from './CodeHighlighter';
import { getFormFields } from './utils';

export default function SandboxPanel({
  currentActiveEp,
  selectedLang,
  setSelectedLang,
  requestBodies,
  authToken,
  setAuthToken,
  isFormMode,
  setIsFormMode,
  handleFormFieldChange,
  handleTextareaChange,
  handleExecuteSandbox,
  loadingStates,
  apiResponses,
  setApiResponses,
}) {
  const { t } = useTranslation();

  const handleCopyCode = async () => {
    const currentSnippetText = generateLanguageSnippet(selectedLang, currentActiveEp, requestBodies[currentActiveEp?.id]);
    if (currentSnippetText) {
      await navigator.clipboard.writeText(currentSnippetText);
      alert(t('portal.labels.copy_code'));
    }
  };

  const formFields = getFormFields(requestBodies[currentActiveEp?.id]);

  return (
    <div className="w-[550px] shrink-0 bg-[#ffffff] text-slate-800 p-5 flex flex-col space-y-5 border-l border-slate-200 overflow-y-auto select-none min-w-0 custom-scrollbar text-left shadow-2xl">

      {/* Code Generator */}
      <div className="space-y-3 border border-slate-200 bg-slate-50/50 p-3 rounded-2xl">
        <div className="flex w-full max-w-full bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 overflow-x-auto whitespace-nowrap gap-1 custom-scrollbar select-none">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLang(lang.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border-0 cursor-pointer shrink-0 ${
                selectedLang === lang.id
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 bg-transparent hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>{lang.icon}</span>
              <span>{lang.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleCopyCode}
            className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer border-0 shrink-0"
          >
            📋 {t('portal.labels.copy_code')}
          </button>
        </div>

        <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-xl max-w-full overflow-hidden relative">
          <pre className="w-full h-32 bg-[#0f172a] text-slate-300 font-mono text-[13px] leading-relaxed p-3 border-0 overflow-y-auto select-text custom-scrollbar resize-none text-left m-0 whitespace-pre-wrap">
            <CodeHighlighter
              code={generateLanguageSnippet(selectedLang, currentActiveEp, requestBodies[currentActiveEp?.id])}
              lang={selectedLang}
            />
          </pre>
        </div>
      </div>

      {/* Request System */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col space-y-4 font-sans flex-1">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase text-slate-900 tracking-wide">REQUEST SYSTEM</span>

          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold border border-slate-200">
            <button
              type="button" onClick={() => setIsFormMode(true)}
              className={`px-2 py-0.5 rounded-md cursor-pointer border-0 ${isFormMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 bg-transparent'}`}
            >
              FORM UI
            </button>
            <button
              type="button" onClick={() => setIsFormMode(false)}
              className={`px-2 py-0.5 rounded-md cursor-pointer border-0 ${!isFormMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 bg-transparent'}`}
            >
              RAW JSON
            </button>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="text-slate-500 font-bold flex items-center gap-1">
            <span>▾</span> {t('portal.labels.base_url')}
          </div>
          <div className="text-slate-800 font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl break-all">
            {import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com'}
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="text-slate-500 font-bold flex items-center gap-1">
            <span>▾</span> {t('portal.labels.auth_token_label')}
          </div>
          <input
            type="text"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Nhập mã bí mật pvi_secret..."
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500 shadow-sm select-text"
          />
        </div>

        <div className="space-y-2 text-xs flex-1 flex flex-col min-h-0">
          <div className="text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">▾ {t('portal.labels.body_required')}</span>
            {!isFormMode && <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">AUTO-VALIDATE</span>}
          </div>

          {currentActiveEp?.isCustomPage && currentActiveEp?.pageType !== "overview" ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
              <p className="text-[11px] leading-normal">{t('portal.labels.no_params')}</p>
            </div>
          ) : isFormMode ? (
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {formFields.length === 0 ? (
                <p className="text-slate-400 italic text-[11px] text-center pt-4">Không tìm thấy tham số khả dụng hoặc JSON bị lỗi.</p>
              ) : (
                formFields.map(([key, val]) => (
                  <div key={key} className="space-y-1 text-left">
                    <label className="block text-[11px] font-mono font-bold text-slate-700">{key}</label>
                    <input
                      type="text"
                      value={String(val)}
                      onChange={(e) => handleFormFieldChange(currentActiveEp?.id, key, e.target.value)}
                      placeholder={`Nhập thông tin cho ${key}...`}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                  </div>
                ))
              )}
            </div>
          ) : (
            <textarea
              value={requestBodies[currentActiveEp?.id] || '{}'}
              onChange={(e) => handleTextareaChange(currentActiveEp?.id, e.target.value)}
              className="w-full h-44 bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs leading-relaxed shadow-inner resize-none focus:outline-none focus:border-blue-500 overflow-y-auto select-text"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => handleExecuteSandbox(currentActiveEp?.id, currentActiveEp?.responseFormat)}
          disabled={loadingStates[currentActiveEp?.id]}
          className={`w-full text-white font-bold py-2.5 px-4 rounded-xl font-sans text-xs transition-all shadow active:scale-[0.99] flex items-center justify-center space-x-2 ${
            loadingStates[currentActiveEp?.id] ? 'bg-blue-800/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer border-0 outline-none'
          }`}
        >
          {loadingStates[currentActiveEp?.id] ? (
            <>
              <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{t('portal.labels.sending')}</span>
            </>
          ) : (
            <span>{t('portal.labels.send_request')}</span>
          )}
        </button>
      </div>

      {/* Response */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col h-52 overflow-hidden font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <span className="text-xs font-black uppercase text-slate-900 tracking-wide">{t('portal.labels.response')}</span>
          {apiResponses[currentActiveEp?.id] && (
            <button
              type="button"
              onClick={() => setApiResponses(prev => ({ ...prev, [currentActiveEp?.id]: null }))}
              className="text-[10px] text-red-500 font-bold bg-red-50 border-0 hover:bg-red-100 px-2 py-0.5 rounded cursor-pointer transition-all"
            >
              {t('portal.labels.clear')}
            </button>
          )}
        </div>
        <div className="w-full flex-1 bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-sky-400 font-mono text-[11px] leading-relaxed overflow-y-auto shadow-2xl break-all select-text custom-scrollbar">
          {apiResponses[currentActiveEp?.id] ? (
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap m-0 text-left">{JSON.stringify(apiResponses[currentActiveEp?.id], null, 2)}</pre>
          ) : (
            <span className="text-slate-500 italic font-sans text-xs flex h-full items-center justify-center text-center">
              {t('portal.labels.no_response')}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
