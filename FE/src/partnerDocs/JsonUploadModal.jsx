import React, { useState, useRef } from 'react';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
const ALLOWED_TYPES = new Set(['String', 'Number', 'Boolean', 'Object', 'Array']);

function validateSchema(data) {
  if (!Array.isArray(data)) return 'File phải là một mảng (array) chứa danh sách API';
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const idx = i + 1;
    if (!item.id || typeof item.id !== 'string') return `Item ${idx}: thiếu hoặc sai kiểu 'id' (string)`;
    if (!item.category || typeof item.category !== 'string') return `Item ${idx}: thiếu hoặc sai kiểu 'category' (string)`;
    if (!item.method || !ALLOWED_METHODS.has(item.method.toUpperCase()))
      return `Item ${idx}: 'method' phải là GET/POST/PUT/DELETE/PATCH`;
    if (!item.path || typeof item.path !== 'string') return `Item ${idx}: thiếu hoặc sai kiểu 'path' (string)`;
    if (!item.name || typeof item.name !== 'string') return `Item ${idx}: thiếu hoặc sai kiểu 'name' (string)`;
    if (item.requestSample && typeof item.requestSample !== 'object') return `Item ${idx}: 'requestSample' phải là object`;
    if (item.responseFormat && typeof item.responseFormat !== 'object') return `Item ${idx}: 'responseFormat' phải là object`;
    if (item.fields) {
      if (!Array.isArray(item.fields)) return `Item ${idx}: 'fields' phải là array`;
      for (let j = 0; j < item.fields.length; j++) {
        const f = item.fields[j];
        if (!f.name || typeof f.name !== 'string') return `Item ${idx}, field ${j + 1}: thiếu 'name' (string)`;
        if (f.type && !ALLOWED_TYPES.has(f.type)) return `Item ${idx}, field ${j + 1}: 'type' phải là String/Number/Boolean/Object/Array`;
        if (typeof f.required !== 'boolean') return `Item ${idx}, field ${j + 1}: 'required' phải là boolean`;
        if (!f.description || typeof f.description !== 'string') return `Item ${idx}, field ${j + 1}: thiếu 'description' (string)`;
      }
    }
  }
  return null;
}

export default function JsonUploadModal({ isOpen, onClose, onImport }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const reset = () => {
    setError(null);
    setPreview(null);
    setSuccess(null);
    setUploading(false);
    setFileName('');
  };

  const handleFile = (file) => {
    setError(null);
    setPreview(null);
    setSuccess(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const validationError = validateSchema(data);
        if (validationError) {
          setError(validationError);
          return;
        }
        setPreview(data);
      } catch (err) {
        setError('File JSON không hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!preview) return;
    setUploading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ endpoints: preview }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload thất bại');
      }
      const result = await res.json();
      setSuccess(`Upload thành công: ${result.count} API endpoints`);
      if (onImport) onImport(preview);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900">Upload API JSON</h2>
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-slate-500 text-sm">Kéo thả file JSON vào đây</p>
              <p className="text-slate-400 text-xs">hoặc click để chọn file</p>
            </div>
          </div>

          {fileName && !error && !preview && !success && (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xử lý {fileName}...
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0">✕</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2">
              <span className="text-green-500 font-bold shrink-0">✓</span>
              <span>{success}</span>
            </div>
          )}

          {preview && !success && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 font-bold">
                <span>✓</span>
                <span>{preview.length} API endpoints hợp lệ</span>
              </div>
              {uploading && (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang upload lên server...
                </div>
              )}
              <div className="bg-[#0f172a] rounded-xl p-3 max-h-48 overflow-y-auto">
                <pre className="text-green-400 text-xs font-mono leading-relaxed m-0 whitespace-pre-wrap">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="font-bold text-slate-700">Yêu cầu định dạng:</p>
            <ul className="space-y-1 pl-2">
              <li>• File JSON phải là mảng (array)</li>
              <li>• Mỗi item cần có: <code className="bg-slate-200 px-1 rounded text-[10px]">id</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">category</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">method</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">path</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">name</code></li>
              <li>• <code className="bg-slate-200 px-1 rounded text-[10px]">method</code>: GET, POST, PUT, DELETE, hoặc PATCH</li>
              <li>• <code className="bg-slate-200 px-1 rounded text-[10px]">requestSample</code> và <code className="bg-slate-200 px-1 rounded text-[10px]">responseFormat</code>: object (tùy chọn)</li>
              <li>• <code className="bg-slate-200 px-1 rounded text-[10px]">fields</code>: mảng các field với <code className="bg-slate-200 px-1 rounded text-[10px]">name</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">type</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">required</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">description</code> (tùy chọn)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Đóng
          </button>
          {preview && !success && (
            <button
              type="button"
              onClick={handleImport}
              disabled={uploading}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
            >
              {uploading ? 'Đang upload...' : `Import ${preview.length} API`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
