import React from 'react';
import { VALIDATION_LIMITS, FIELD_DICTIONARY } from '../MockData';
import { cleanJsonString } from './utils';

const REQUIRED_FIELDS = ['client_id', 'client_secret', 'grant_type', 'CpId', 'Sign', 'so_gcn', 'MaSoThue', 'NgayDoiSoat', 'type', 'ma_giaodich'];

const getTypeColor = (t) => {
  if (t === 'string') return 'text-emerald-600 font-medium';
  if (t === 'number' || t === 'integer') return 'text-blue-600 font-medium';
  if (t === 'boolean') return 'text-purple-600 font-medium';
  if (t === 'array') return 'text-amber-600 font-bold';
  return 'text-slate-500';
};

function SchemaNode({ dataObj }) {
  if (!dataObj) return null;

  let workingObj = dataObj;
  if (typeof dataObj === 'string') {
    try { workingObj = JSON.parse(cleanJsonString(dataObj)); }
    catch (e) { return <div className="text-xs font-mono text-slate-600 break-all pl-2">{dataObj}</div>; }
  }
  if (typeof workingObj !== 'object' || workingObj === null) {
    return <div className="text-xs font-mono text-slate-600 break-all pl-2">{String(workingObj)}</div>;
  }

  const keys = Object.keys(workingObj);
  if (keys.length === 0) return <div className="text-xs text-slate-400 italic pl-2">Trống (Rỗng)</div>;

  return keys.map((key, index) => {
    const value = workingObj[key];
    let type = typeof value;
    if (Array.isArray(value)) type = 'array';
    else if (value === null) type = 'null';

    const isRequired = REQUIRED_FIELDS.includes(key);
    const description = FIELD_DICTIONARY[key] || "Trường dữ liệu tích hợp thuộc nghiệp vụ logic Core Insurance PVI.";
    const hasLimitRule = VALIDATION_LIMITS[key];

    return (
      <div key={index} className="relative pl-5 pb-3 group font-sans text-left max-w-full overflow-hidden">
        <div className="absolute left-0 top-3 w-3 border-t border-slate-200 group-hover:border-blue-400 transition-colors"></div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs max-w-full">
          <span className="font-mono font-bold text-slate-900 text-[12px] break-all">{key}</span>
          <span className={`text-[11px] font-mono lowercase ${getTypeColor(type)}`}>{type}</span>
          {isRequired && <span className="text-[9px] bg-red-50 text-red-500 font-extrabold px-1 py-0.5 rounded border border-red-200 uppercase tracking-tighter">required</span>}
          {hasLimitRule && <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1 rounded border border-amber-200 whitespace-nowrap">{hasLimitRule.label}</span>}
        </div>
        <p className="text-slate-500 text-[11px] mt-0.5 font-medium leading-relaxed max-w-full break-words">{description}</p>
        {type !== 'object' && type !== 'array' && value !== undefined && value !== null && (
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono max-w-full break-all">
            <span className="text-slate-400 font-sans font-medium">Example:</span>{" "}
            <span className="text-slate-700 bg-slate-100 px-1 rounded border border-slate-200/60 font-semibold inline-block max-w-full break-all">
              {hasLimitRule && !isNaN(Number(value)) ? Number(value).toLocaleString('vi-VN') : String(value)}
            </span>
          </div>
        )}
        {type === 'object' && value !== null && (
          <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">
            <SchemaNode dataObj={value} />
          </div>
        )}
        {type === 'array' && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && (
          <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">
            <div className="text-[10px] text-amber-600 font-mono italic mb-1">↳ Cấu trúc đối tượng con:</div>
            <SchemaNode dataObj={value[0]} />
          </div>
        )}
      </div>
    );
  });
}

export default function TreeSchema({ dataObj }) {
  return <SchemaNode dataObj={dataObj} />;
}
