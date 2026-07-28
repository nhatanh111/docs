import React, { useState, useRef } from 'react';

export default function AiUploadModal({ isOpen, onClose, onImport }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
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

  const handleFile = async (file) => {
    setError(null);
    setPreview(null);
    setSuccess(null);
    setFileName(file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/documents/ai-extract`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const result = await res.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.endpoints) {
        setPreview(result.endpoints);
        setSuccess(`AI trích xuất thành công: ${result.count} API endpoints`);
      }
    } catch (err) {
      setError('Lỗi kết nối server: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (preview && onImport) {
      onImport(preview);
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900">AI Trích xuất API từ tài liệu</h2>
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
              accept=".docx,.pdf,.txt,.json,.yaml,.yml"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <p className="text-slate-500 text-sm">Kéo thả file tài liệu vào đây</p>
              <p className="text-slate-400 text-xs">hoặc click để chọn file (DOCX, PDF, TXT, JSON, YAML)</p>
            </div>
          </div>

          {uploading && !preview && !error && (
            <div className="flex flex-col items-center gap-3 py-4">
              <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-slate-500">AI đang đọc và trích xuất API từ {fileName}...</p>
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

          {preview && preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700">Kết quả trích xuất:</p>
              {preview.map((ep, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>{ep.method}</span>
                    <span className="text-xs font-mono text-slate-500">{ep.path}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{ep.name}</p>
                  {ep.description && <p className="text-xs text-slate-500 mt-0.5">{ep.description}</p>}
                  {ep.fields && ep.fields.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">{ep.fields.length} fields</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Đóng
          </button>
          {preview && preview.length > 0 && (
            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer border-0"
            >
              Import {preview.length} API vào hệ thống
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
