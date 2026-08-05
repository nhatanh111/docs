// src/partnerDocs/CustomPageContent.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FIELD_DICTIONARY, ERROR_CODES_DATA } from '../MockData';

export default function CustomPageContent({ type }) {
  const { t } = useTranslation();

  if (type === "overview") {
    return (
      <div className="space-y-6 text-left">
        <p className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('portal.custom.overview') }} />
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-bold text-slate-800 text-xs uppercase mb-1">{t('portal.custom.sandbox_url')}</div>
            <code className="text-blue-600 font-mono text-xs break-all block">https://sandbox-api.pvi.vn</code>
          </div>
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-bold text-slate-800 text-xs uppercase mb-1">{t('portal.custom.prod_url')}</div>
            <code className="text-emerald-600 font-mono text-xs break-all block">https://api.pvi.vn</code>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong className="block mb-1 font-bold">{t('portal.custom.note')}</strong>
        </div>
      </div>
    );
  }

  if (type === "headers") {
    return (
      <div className="space-y-4 text-left">
        <p className="text-xs text-slate-600">{t('portal.custom.headers_desc')}</p>
        <pre className="bg-slate-50 border p-4 rounded-xl font-mono text-xs text-slate-700 leading-relaxed">{`{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer eyJhbGciOiJIUzI1Ni...",\n  "CpId": "partner",\n  "Sign": "8cc21a24890c2918bb1237a892b11a12"\n}`}</pre>
      </div>
    );
  }

  if (type === "dictionary") {
    return (
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold text-slate-700 text-left">{t('portal.custom.dictionary_title')}</th>
              <th className="p-3 font-semibold text-slate-700 text-left">{t('portal.custom.dictionary_desc')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {Object.entries(FIELD_DICTIONARY).map(([key, desc]) => (
              <tr key={key} className="hover:bg-slate-50/40">
                <td className="p-3 font-mono font-bold text-slate-900">{key}</td>
                <td className="p-3 text-slate-600 font-medium">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "error-codes") {
    return (
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold text-slate-700 w-24 text-center">{t('portal.custom.error_code')}</th>
              <th className="p-3 font-semibold text-slate-700 text-left">{t('portal.custom.error_desc')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ERROR_CODES_DATA.map(([code, desc]) => (
              <tr key={code} className="hover:bg-slate-50/40">
                <td className="p-3 font-mono font-bold text-red-600 text-center bg-slate-50/30">{code}</td>
                <td className="p-3 font-medium text-slate-600 text-left">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "changelog") {
    return (
      <div className="space-y-4 text-left font-sans">
        <div className="border rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-bold text-slate-900 text-sm">{t('portal.custom.changelog_version', 'v1.3.0 Stable Release')}</span>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-emerald-100">{t('portal.custom.changelog_latest')}</span>
          </div>
          <ul className="list-disc ml-5 text-xs text-slate-600 space-y-1">
            <li>{t('portal.custom.changelog_detail')}</li>
            <li>{t('portal.custom.changelog_optimize')}</li>
          </ul>
        </div>
        <div className="border rounded-xl p-4 bg-slate-50/20">
          <span className="font-bold text-slate-800 text-xs block mb-1">{t('portal.custom.changelog_old_version', 'v1.2.0 Release')}</span>
          <p className="text-xs text-slate-500">{t('portal.custom.changelog_old_detail', 'Enhanced encryption for Core Insurance e-certificate PDF download speed.')}</p>
        </div>
      </div>
    );
  }

  return null;
}
