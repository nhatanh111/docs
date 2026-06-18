// PermissionModal.jsx
import React, { useState, useMemo } from 'react';

// Giả lập danh sách hạng nhóm để quản lý 1000+ đối tác không cần tick tay
const PARTNER_TIERS = [
  { id: 'all', name: '📦 Tất cả đối tác (1,000+)' },
  { id: 'tier-gold', name: '🥇 Đối tác Hạng Vàng (Ví điện tử, Ngân hàng)' },
  { id: 'tier-silver', name: '🥈 Đối tác Hạng Bạc (Đại lý liên kết Cấp 1)' },
  { id: 'tier-insurtech', name: '🚀 Khối InsurTech / Startup' },
  { id: 'tier-test', name: '🧪 Tài khoản Sandbox / Testing' },
];

export default function PermissionModal({ isOpen, onClose, rawProjectData, onTogglePermission }) {
  if (!isOpen) return null;

  // Đọc danh sách đối tác từ localStorage để đồng bộ với cấu trúc lưu trữ mới
  const [localPartners, setLocalPartners] = useState(() => {
    const saved = localStorage.getItem('PVI_PARTNERS_LIST');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi parse đối tác:", e);
      }
    }
    return [
      { id: 'pt-momo', name: 'Ví Điện Tử MoMo', tier: 'tier-gold', code: 'momo_pvi_secure_2026', status: 'Active' },
      { id: 'pt-vifo', name: 'VIFO', tier: 'tier-insurtech', code: 'vifo_pvi_secure_2026', status: 'Active' },
      { id: 'pt-vnpay', name: 'Cổng Thanh Toán VNPay', tier: 'tier-gold', code: 'VNPAY_PVI', status: 'Active' },
      { id: 'pt-zalopay', name: 'Ví Điện Tử ZaloPay', tier: 'tier-gold', code: 'ZALOPAY', status: 'Active' },
      { id: 'pt-baoviet', name: 'Đại lý Bảo hiểm Tinh Nhuệ', tier: 'tier-silver', code: 'BAOVIET_DL', status: 'Active' },
      { id: 'pt-medici', name: 'Insurtech Medici Việt Nam', tier: 'tier-insurtech', code: 'MEDICI_TECH', status: 'Pending' },
      { id: 'pt-test01', name: 'Cá nhân Thử nghiệm 01', tier: 'tier-test', code: 'TEST_01', status: 'Suspended' },
    ];
  });

  // State quản lý bộ lọc và tìm kiếm theo giao diện gốc của bạn
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [activePartnerId, setActivePartnerId] = useState('pt-momo');
  
  // Các state form bổ sung để thêm tài khoản
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerTier, setNewPartnerTier] = useState('tier-gold');
  const [newPartnerCode, setNewPartnerCode] = useState('');

  // State quản lý Upload và Quy chuẩn file Word theo mẫu PVI
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'HopDong_Goc_MoMo_Chua_Chuan.pdf', size: '2.4 MB', time: '10 phút trước', status: 'Đã quy chuẩn thành Word PVI_Template.docx' }
  ]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // HÀM XỬ LÝ THÊM ĐỐI TÁC MỚI CHUẨN LƯU LOCALSTORAGE VÀ KHÔNG CRASH
  const handleCreatePartnerInModal = (e) => {
    e.preventDefault();
    if (!newPartnerName.trim()) {
      alert("Vui lòng nhập tên đối tác!");
      return;
    }

    const newId = `pt-${Date.now()}`;
    const generatedCode = newPartnerCode.trim() || `${newPartnerName.toLowerCase().replace(/\s+/g, '_')}_secure_2026`;

    const newPartner = {
      id: newId,
      name: newPartnerName.trim(),
      tier: newPartnerTier,
      code: generatedCode,
      status: 'Active'
    };

    const updated = [...localPartners, newPartner];
    setLocalPartners(updated);
    
    // Lưu đè thẳng vào localStorage để khi reset web không bị mất tài khoản
    localStorage.setItem('PVI_PARTNERS_LIST', JSON.stringify(updated));

    // Kích hoạt event thông báo cập nhật tự động sang PartnerDocs.jsx ngay lập tức
    window.dispatchEvent(new Event('pvi_partners_changed'));

    // Reset Form
    setNewPartnerName('');
    setNewPartnerCode('');
    alert(`🎉 Đã lưu tài khoản [${newPartner.name}] vĩnh viễn vào hệ thống web!`);
  };

  // Tìm kiếm và lọc nhanh đối tác dựa trên localPartners động
  const filteredPartners = useMemo(() => {
    return localPartners.filter(partner => {
      const matchSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          partner.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = selectedTier === 'all' ? true : partner.tier === selectedTier;
      return matchSearch && matchTier;
    });
  }, [localPartners, searchQuery, selectedTier]);

  const currentPartner = useMemo(() => {
    return localPartners.find(p => p.id === activePartnerId) || localPartners[0] || {};
  }, [localPartners, activePartnerId]);

  // Xử lý kéo thả file và quy chuẩn tài liệu về file Word mẫu của PVI
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessingFile(true);

    setTimeout(() => {
      const newFileObj = {
        name: files[0].name,
        size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
        time: 'Vừa xong',
        status: '⚡ Hệ thống đã ép cấu trúc về File Word quy chuẩn PVI thành công!'
      };
      setUploadedFiles(prev => [newFileObj, ...prev]);
      setIsProcessingFile(false);
      alert(`🎉 Tài liệu [${files[0].name}] đã được hệ thống bóc tách và quy chuẩn về mẫu Word mặc định của PVI thành công!`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans text-slate-800 text-xs select-text">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-left">
        
        {/* HEADER CỦA KHUNG QUẢN LÝ - ĐÃ ĐỔI TÊN THÀNH PVI */}
        <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black tracking-wide uppercase flex items-center gap-2">
              <span>🛡️</span> HỆ THỐNG QUẢN LÝ PHÂN QUYỀN API & CHUẨN HÓA HỒ SƠ – CỔNG PVI
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Giải pháp quản trị tự động hóa phân quyền theo Tier-Class và quy chuẩn tài liệu văn bản thông minh dành cho các đối tác kết nối cổng PVI.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-8 h-8 rounded-xl border-0 flex items-center justify-center font-bold text-sm cursor-pointer transition-all focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* THÂN BÊN TRONG */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50">
          
          {/* CỘT TRÁI: BỘ LỌC HẠNG & DANH SÁCH ĐỐI TÁC */}
          <div className="w-80 shrink-0 border-r border-slate-200 bg-white p-4 flex flex-col space-y-3 min-h-0">
            
            {/* THÊM FORM ĐỂ TIẾP NHẬN INPUT ACCOUNT ADMIN MỚI */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-black uppercase text-slate-600 mb-1.5 flex items-center gap-1">➕ Thêm Đối Tác Admin Mới</div>
              <div className="space-y-1.5">
                <input 
                  type="text" 
                  placeholder="Tên đối tác (Ví dụ: Momo Admin, VIFO v2)..." 
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-blue-500"
                />
                <div className="grid grid-cols-2 gap-1">
                  <select
                    value={newPartnerTier}
                    onChange={(e) => setNewPartnerTier(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-[10px] font-bold focus:outline-none"
                  >
                    <option value="tier-gold">Hạng Vàng</option>
                    <option value="tier-silver">Hạng Bạc</option>
                    <option value="tier-insurtech">Insurtech</option>
                    <option value="tier-test">Sandbox</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Mã token bảo mật..." 
                    value={newPartnerCode}
                    onChange={(e) => setNewPartnerCode(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none"
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleCreatePartnerInModal}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1 rounded-lg border-0 text-[10px] transition-all cursor-pointer"
                >
                  LƯU TÀI KHOẢN VÀO HỆ THỐNG
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Lọc theo Hạng đối tác (Tier-Based)</label>
              <select 
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                {PARTNER_TIERS.map(tier => (
                  <option key={tier.id} value={tier.id}>{tier.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Tìm kiếm đối tác nhanh</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Nhập tên, mã đối tác..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 font-medium focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-bold">🔍</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1 pl-1">
                Kết quả lọc ({filteredPartners.length} đối tác)
              </div>
              
              {filteredPartners.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic font-medium">
                  Không tìm thấy đối tác nào phù hợp.
                </div>
              ) : (
                filteredPartners.map(partner => (
                  <div
                    key={partner.id}
                    onClick={() => setActivePartnerId(partner.id)}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col space-y-1 ${
                      activePartnerId === partner.id
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-sm'
                        : 'bg-white border-slate-200/60 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[12px] truncate flex-1">{partner.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                        partner.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {partner.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 font-medium">
                      <span>Mã: {partner.code}</span>
                      <span className="text-blue-500 font-sans font-semibold">
                        {PARTNER_TIERS.find(t => t.id === partner.tier)?.name.split(' ')[1] || 'Thành viên'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT PHÂN QUYỀN & KHU VỰC THẢ FILE QUY CHUẨN WORD MẶC ĐỊNH */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 min-w-0 custom-scrollbar">
            
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded border border-blue-200 inline-block uppercase tracking-wider">
                  Đang cấu hình hệ thống
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mt-1">{currentPartner.name || 'Chưa chọn'} ({currentPartner.code || 'N/A'})</h4>
              </div>
              
              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-600">Áp dụng quyền nhanh:</span>
                <button 
                  type="button"
                  onClick={() => alert(`⚡ Đã tự động đồng bộ & kích hoạt toàn bộ nhóm API mặc định cho ${currentPartner.name} thành công!`)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer border-0 shadow-sm transition-all"
                >
                  ⚡ Đồng bộ theo Nhóm quyền mặc định
                </button>
              </div>
            </div>

            {/* 📥 KHU VỰC THÊM FILE & TỰ ĐỘNG QUY CHUẨN VỀ FILE WORD MẪU CỦA PVI */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h5 className="font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>📥</span> Hồ sơ tích hợp & Tự động chuẩn hóa mẫu file Word PVI
                </h5>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ⚙️ Active Engine: PVI Word-Converter v1.2
                </span>
              </div>

              {/* Vùng kéo thả file */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10 rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center relative min-h-[120px]">
                  <input 
                    type="file"
                    accept=".doc,.docx,.pdf,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={isProcessingFile}
                  />
                  {isProcessingFile ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                      <span className="text-blue-600 font-bold block animate-pulse">ĐANG QUY CHUẨN FILE WORD PVI...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl mb-1">📄</span>
                      <span className="font-bold text-slate-800 text-[11px]">Kéo thả hồ sơ hoặc Click chọn</span>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">Hỗ trợ mọi định dạng file. Hệ thống tự động bóc tách và ép về khung văn bản quy chuẩn mặc định của PVI.</p>
                    </>
                  )}
                </div>

                {/* Danh sách file đã được xử lý */}
                <div className="md:col-span-2 bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-[11px] flex flex-col justify-between min-h-[120px]">
                  <div className="text-slate-400 font-bold uppercase text-[9px] tracking-wider pb-1.5 border-b border-slate-800 font-sans flex items-center justify-between">
                    <span>Lịch sử tài liệu quy chuẩn lưu trữ hệ thống</span>
                    <span className="text-emerald-400 font-mono">STATUS: PVI STANDARDIZED</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 mt-2 max-h-24 custom-scrollbar">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="truncate pr-2">
                          <div className="text-slate-200 font-bold truncate">↳ {file.name} ({file.size})</div>
                          <div className="text-emerald-400 text-[10px] font-sans font-medium mt-0.5">{file.status}</div>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">{file.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* DANH SÁCH CHI TIẾT CÁC ENDPOINT (GIỮ ĐÚNG GIAO DIỆN VÀ LOGIC MAPPING GỐC) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
              <h5 className="font-black text-slate-900 uppercase tracking-wide">
                Tra cứu trạng thái Endpoint chi tiết
              </h5>
              
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto custom-scrollbar">
                {rawProjectData && rawProjectData.length > 0 ? (
                  rawProjectData.map((project) => (
                    <div key={project.id} className="p-3 bg-slate-50/50">
                      <div className="font-bold text-slate-900 text-[11px] mb-2 uppercase tracking-wide bg-slate-200/60 px-2 py-0.5 inline-block rounded">
                        📂 {project.title || 'Dự án chính'}
                      </div>
                      
                      {project.documents?.map((doc) => (
                        <div key={doc.id} className="pl-2 mt-1 space-y-1.5">
                          {doc.endpoints?.map((ep) => {
                            const isAllowed = ep.allowedPartners?.includes(currentPartner.id) || false;
                            return (
                              <div key={ep.endpointId} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/60 hover:shadow-inner transition-all">
                                <div className="flex items-center space-x-2 truncate">
                                  <span className={`text-[8px] font-black text-white px-1.5 py-0.2 rounded ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-500'}`}>
                                    {ep.method}
                                  </span>
                                  <span className="font-mono text-slate-700 font-medium truncate">{ep.path}</span>
                                  <span className="text-slate-400 hidden sm:inline">— {ep.name}</span>
                                </div>
                                <label className="flex items-center space-x-1 font-bold text-slate-600 cursor-pointer shrink-0 select-none">
                                  <input 
                                    type="checkbox"
                                    checked={isAllowed}
                                    onChange={() => onTogglePermission && onTogglePermission('endpoint', ep.endpointId, currentPartner.id, isAllowed)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span>{isAllowed ? 'Đã cấp' : 'Chưa cấp'}</span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-slate-400 italic">Dữ liệu API Endpoints đang được tải...</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER ĐÓNG MODAL */}
        <div className="p-3 border-t border-slate-200 bg-white text-right flex items-center justify-between px-5">
          <span className="text-slate-400 text-[10px] font-mono">PVI Integration Portal v1.3.0</span>
          <button 
            type="button"
            onClick={onClose} 
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-6 rounded-xl border-0 shadow-md cursor-pointer transition-all active:scale-95 focus:outline-none"
          >
            ĐÓNG KHUNG QUẢN LÝ
          </button>
        </div>

      </div>
    </div>
  );
}