import React, { useState } from 'react';

export default function PermissionModal({ isOpen, onClose, rawProjectData, onTogglePermission }) {
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

  if (!isOpen) return null;

  // Lấy danh sách đối tác từ localStorage hoặc dùng mặc định
  const partners = JSON.parse(localStorage.getItem('PVI_PARTNERS_LIST')) || [
    { id: 'pt-momo', name: 'MoMo', code: 'MOMO' },
    { id: 'pt-vifo', name: 'VIFO', code: 'VIFO' },
    { id: 'pt-vnpay', name: 'VNPay', code: 'VNPAY' },
    { id: 'pt-zalopay', name: 'ZaloPay', code: 'ZALOPAY' },
  ];

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">🔐 Quản lý bộ API</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Tìm đối tác..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div className="space-y-2">
          {filteredPartners.map(partner => (
            <div key={partner.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50">
              <span className="font-medium text-slate-700">{partner.name}</span>
              <span className="text-xs text-slate-400 font-mono">{partner.code}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-all">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}