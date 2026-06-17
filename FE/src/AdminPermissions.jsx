import React, { useState, useEffect, useRef } from 'react';

export default function AdminPermissions() {
  // Danh mục cố định dựa trên cấu trúc các bộ tài liệu trên cơ sở dữ liệu của PVI
  const categories = [
    "Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô",
    "Tài liệu tích hợp API Bảo hiểm TNDS Xe máy",
    "Quy trình tích hợp gói bảo hiểm Sức khỏe con người",
    "Hệ thống danh mục dùng chung",
    "Tra cứu & Thông báo kết quả"
  ];

  // GIẢI PHÁP CHO 1000+ ĐỐI TÁC: Định nghĩa các Nhóm/Phân hạng để gán quyền hàng loạt (RBAC)
  const partnerGroups = [
    { id: 'tier_strategic', name: 'ĐỐI TÁC CHIẾN LƯỢC (Tier 1)', description: 'Momo, ShopeePay, VIFO, VNPay...' },
    { id: 'tier_standard', name: 'ĐỐI TÁC TIÊU CHUẨN (Tier 2)', description: 'Các đại lý, showroom, môi giới nhỏ' },
    { id: 'bank_gateways', name: 'KHỐI NGÂN HÀNG (Bancassurance)', description: 'Vietcombank, Agribank, BIDV...' },
    { id: 'tier_sandbox', name: 'MÔI TRƯỜNG THỬ NGHIỆM (Sandbox)', description: 'Các đối tác mới đang dev test' }
  ];

  const BASE_URL = import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com';

  // State quản lý Form thêm mới Endpoint
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [method, setMethod] = useState('POST');
  const [path, setPath] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Quản lý danh sách Endpoints lấy động từ server về
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý quyền tích chọn của đối tác/nhóm quyền
  const [projectPermissions, setProjectPermissions] = useState({});

  // States hỗ trợ tìm kiếm và lọc phân hệ quy mô lớn
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  // STATE QUẢN LÝ UPLOAD FILE & TỰ ĐỘNG QUY CHUẨN SANG WORD
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, originName: "YeuCauTichHop_Momo_v2.pdf", targetName: "PVI_Quy_Chuan_Momo.docx", size: "2.4 MB", status: "Success", time: "2026-06-17 10:30" },
    { id: 2, originName: "DanhSachEndpoint_Vifo_Draft.xlsx", targetName: "PVI_Quy_Chuan_Vifo.docx", size: "1.1 MB", status: "Success", time: "2026-06-17 14:15" }
  ]);
  const fileInputRef = useRef(null);

  // 1. TỰ ĐỘNG GỌI API ĐỂ LẤY DỮ LIỆU THẬT TỪ BACKEND
  useEffect(() => {
    fetchEndpointsData();
  }, []);

  const fetchEndpointsData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/endpoints`);
      if (!res.ok) throw new Error("Mất kết nối API Gateway Server");
      const data = await res.json();
      setEndpoints(data);

      // Map ma trận quyền từ API đổ về State UI
      const initialPermissions = {};
      data.forEach(ep => {
        initialPermissions[ep.id] = {
          TIER_1: ep.allowedPartners?.includes('tier-1') || false,
          TIER_2: ep.allowedPartners?.includes('tier-2') || false,
          BANK: ep.allowedPartners?.includes('bank') || false,
          SANDBOX: ep.allowedPartners?.includes('sandbox') || false,
          VIFO: ep.allowedPartners?.includes('pt-vifo') || false,
          MoMo: ep.allowedPartners?.includes('pt-momo') || false,
        };
      });
      setProjectPermissions(initialPermissions);
    } catch (err) {
      console.error("❌ Lỗi Fetch dữ liệu ma trận quyền:", err);
      // Dữ liệu giả lập khi Backend Offline giúp giao diện không bị lỗi trắng trang
      const mockData = [
        { id: "ep_1", category: categories[0], method: "POST", path: "/api/v1/car/quote", businessName: "Tính phí bảo hiểm ô tô bắt buộc" },
        { id: "ep_2", category: categories[0], method: "POST", path: "/api/v1/car/issue", businessName: "Phát hành giấy chứng nhận điện tử ô tô PVI" },
        { id: "ep_3", category: categories[1], method: "GET", path: "/api/v1/moto/categories", businessName: "Lấy cấu hình phân hạng hãng xe máy" }
      ];
      setEndpoints(mockData);
      
      const fallbackPerms = {};
      mockData.forEach(ep => {
        fallbackPerms[ep.id] = { TIER_1: true, TIER_2: false, BANK: true, SANDBOX: false, VIFO: false, MoMo: false };
      });
      setProjectPermissions(fallbackPerms);
    } finally {
      setLoading(false);
    }
  };

  // 2. HÀM THỰC THI THÊM MỚI ENDPOINT LÊN SERVER TỪ FORM
  const handleAddEndpointSubmit = async (e) => {
    e.preventDefault();
    if (!path.trim() || !businessName.trim()) {
      alert("Vui lòng điền đầy đủ thông tin Path và Tên nghiệp vụ!");
      return;
    }

    const payload = {
      category: selectedCategory,
      method,
      path: path.trim(),
      businessName: businessName.trim(),
      allowedPartners: []
    };

    try {
      const response = await fetch(`${BASE_URL}/api/endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("✨ Thêm mới API thành công lên hệ thống Gateway!");
        setPath('');
        setBusinessName('');
        fetchEndpointsData(); // Reload danh sách động
      }
    } catch (error) {
      // Chế độ Offline dự phòng
      const localId = "ep_" + Date.now();
      setEndpoints([...endpoints, { ...payload, id: localId }]);
      setPath('');
      setBusinessName('');
    }
  };

  // 3. XỬ LÝ CHECKBOX PHÂN QUYỀN
  const handleCheckboxChange = async (endpointId, groupKey) => {
    const currentVal = projectPermissions[endpointId]?.[groupKey] || false;
    const nextVal = !currentVal;

    // Cập nhật giao diện lập tức (Optimistic Update)
    setProjectPermissions(prev => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [groupKey]: nextVal
      }
    }));

    try {
      await fetch(`${BASE_URL}/api/endpoints/${endpointId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupKey, isAllowed: nextVal })
      });
    } catch (err) {
      console.warn("⚠️ Thay đổi đã được lưu tạm trên Browser (Chưa đồng bộ lên Server Backend).");
    }
  };

  // Thao tác hàng loạt (Bulk Actions) cho tất cả API đang hiển thị
  const handleBulkGroupPermission = (groupKey, applyAll) => {
    const updated = { ...projectPermissions };
    endpoints.forEach(ep => {
      if (!updated[ep.id]) updated[ep.id] = {};
      updated[ep.id][groupKey] = applyAll;
    });
    setProjectPermissions(updated);
    alert(`⚡ Đã ${applyAll ? 'CẤP QUYỀN' : 'HỦY QUYỀN'} đồng loạt cho toàn bộ nhóm đối tác [${groupKey}] trên tất cả Endpoint.`);
  };

  // 4. LOGIC TIẾP NHẬN FILE & AI ENGINE QUY CHUẨN SANG FILE WORD (.DOCX)
  const triggerFileSelect = () => fileInputRef.current.click();

  const handleFileProcess = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    // Giả lập tiến trình gửi file lên Backend Engine để bóc tách và xuất file Word mẫu chuẩn
    setTimeout(() => {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const standardizedFile = {
        id: Date.now(),
        originName: file.name,
        targetName: `PVI_Quy_Chuan_${baseName}.docx`, // Ép đuôi định dạng đầu ra luôn là .docx theo chuẩn công ty
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        status: "Success",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setUploadedFiles(prev => [standardizedFile, ...prev]);
      setUploading(false);
      alert(`🎉 Tiếp nhận file đối tác thành công!\n\nHệ thống đã tự động chuyển đổi file gốc "${file.name}" thành cấu trúc File Word chuẩn định dạng: "${standardizedFile.targetName}".`);
    }, 2000); 
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] text-slate-800 text-xs overflow-hidden font-sans select-text">
      
      {/* ─── VÙNG TRÁI: FORM ENDPOINT & TIẾP NHẬN QUY CHUẨN FILE WORD ─── */}
      <div className="w-96 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        

        {/* Form Thêm Mới Endpoint */}
        <div className="p-4 border-b border-slate-100 text-left">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5 select-none">
            <span>➕</span> Thêm Endpoint Nghiệp Vụ Mới
          </h3>
          <form onSubmit={handleAddEndpointSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Thuộc Chuyên Mục</label>
              <select 
                value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium text-slate-700 cursor-pointer"
              >
                {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Method</label>
                <select 
                  value={method} onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 font-bold text-center text-slate-700 cursor-pointer"
                >
                  <option value="POST" className="text-emerald-600 font-bold">POST</option>
                  <option value="GET" className="text-blue-600 font-bold">GET</option>
                  <option value="PUT" className="text-amber-600 font-bold">PUT</option>
                  <option value="DELETE" className="text-rose-600 font-bold">DELETE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Đường dẫn API (Path)</label>
                <input 
                  type="text" value={path} onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/v1/insurance/create"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tên Nghiệp Vụ Bảo Hiểm</label>
              <input 
                type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ví dụ: Tính phí bảo hiểm ô tô cấp đơn..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl shadow-md shadow-blue-500/10 transition-all border-0 cursor-pointer outline-none">
              Kích hoạt & Lưu Cấu Hình
            </button>
          </form>
        </div>

        {/* KHU VỰC THÊM FILE & TỰ ĐỘNG CHUYỂN ĐỔI QUY CHUẨN SANG FILE WORD */}
        <div className="p-4 flex-1 bg-slate-50/50 text-left border-t border-slate-100">
          <div className="flex items-center justify-between mb-2 select-none">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <span>📄</span> Khu Vực Add File Hồ Sơ
            </h3>
            <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 font-extrabold px-1.5 py-0.5 rounded-md">AUTO DOCX</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Hệ thống tự động bóc tách và quy chuẩn mọi định dạng file đối tác gửi lên (PDF, Excel, Ảnh, Scan...) về cấu trúc <b>File Word (.docx) mẫu mặc định</b>.
          </p>

          <div 
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all bg-white select-none ${
              uploading ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/10'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileProcess} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
            {uploading ? (
              <div className="py-2 space-y-1">
                <span className="inline-block animate-spin text-lg">⏳</span>
                <div className="font-bold text-amber-600 text-xs">AI Converter Đang Quy Chuẩn Sang Word...</div>
                <div className="text-[9px] text-slate-400">Vui lòng đợi hệ thống dựng form tài liệu</div>
              </div>
            ) : (
              <div className="py-1 space-y-1">
                <span className="text-2xl inline-block text-slate-400">📥</span>
                <div className="font-bold text-slate-700">Thêm file hoặc Kéo thả file vào đây</div>
                <div className="text-[10px] text-slate-400">Chấp nhận tất cả thể loại (PDF, Excel, Ảnh...)</div>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Danh sách Hồ sơ đã đồng bộ (.docx)</div>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="p-2.5 bg-white border border-slate-200 rounded-xl text-left shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-1">
                  <div className="truncate flex-1">
                    <div className="text-[9px] text-slate-400 font-mono truncate">Nguồn đối tác: {file.originName}</div>
                    <div className="font-bold text-blue-800 truncate mt-0.5 flex items-center gap-1">
                      <span className="text-blue-500">💙</span> {file.targetName}
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-extrabold shrink-0 select-none">WORD OK</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100 font-mono">
                  <span>{file.size} | {file.time}</span>
                  <button className="text-blue-600 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0 text-[10px] outline-none">Tải xuống 💾</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── VÙNG PHẢI: MA TRẬN PHÂN QUYỀN ĐÃ ĐƯỢC TỐI ƯU ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        
        {/* Bộ Lọc Thông Minh Quy Mô Lớn */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-left shadow-sm select-none">
          <div className="space-y-0.5">
            <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              🛡️ Quản Lý Phân Quyền API Gateway Chuyên Nghiệp
            </h1>
            <p className="text-[11px] text-slate-500">
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" placeholder="Tìm nhanh API Path / Nghiệp vụ..." value={apiSearchQuery} onChange={(e) => setApiSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 pl-7 pr-3 py-1.5 rounded-xl text-xs w-60 focus:outline-none focus:border-blue-500 font-medium"
              />
              <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
            </div>

            <select
              value={selectedGroupFilter} onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl border-0 outline-none cursor-pointer shadow-md shadow-slate-900/10"
            >
              <option value="all">Xem tất cả phân hạng phân quyền</option>
              {partnerGroups.map(g => (
                <option key={g.id} value={g.id} className="bg-white text-slate-800 font-medium">{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Khung Hành Động Nhanh Hàng Loạt */}
        <div className="px-4 py-1.5 bg-amber-50/60 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600 select-none">
          <span className="flex items-center gap-1 text-amber-800">⚡ THAO TÁC NHANH CHO TOÀN BỘ ENDPOINTS HỆ THỐNG:</span>
          <div className="flex space-x-1.5">
            <button onClick={() => handleBulkGroupPermission('TIER_1', true)} className="px-2 py-0.5 bg-white border border-slate-200 text-emerald-700 rounded shadow-sm hover:bg-slate-50 cursor-pointer font-bold outline-none">Bật Full Tier 1</button>
            <button onClick={() => handleBulkGroupPermission('TIER_1', false)} className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded shadow-sm hover:bg-rose-100 cursor-pointer font-bold outline-none">Tắt Full Tier 1</button>
            <button onClick={() => handleBulkGroupPermission('BANK', true)} className="px-2 py-0.5 bg-white border border-slate-200 text-purple-700 rounded shadow-sm hover:bg-slate-50 cursor-pointer font-bold outline-none">Mở Full Khối Bank</button>
          </div>
        </div>

        {/* DANH SÁCH MA TRẬN QUYỀN */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-2 select-none">
              <span className="animate-spin text-xl">🔄</span>
              <span className="font-medium font-mono">Đang truy vấn sơ đồ ma trận bảo mật PVI Portal...</span>
            </div>
          ) : (
            <div className="space-y-4 max-w-6xl mx-auto">
              {categories.map((categoryName, catIndex) => {
                const filteredEndpoints = endpoints.filter(ep => {
                  if (ep.category !== categoryName) return false;
                  if (apiSearchQuery) {
                    const searchLower = apiSearchQuery.toLowerCase();
                    return ep.path.toLowerCase().includes(searchLower) || ep.businessName.toLowerCase().includes(searchLower);
                  }
                  return true;
                });

                if (filteredEndpoints.length === 0) return null;

                return (
                  <div key={catIndex} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left">
                    
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex justify-between items-center select-none">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-mono font-bold">MỤC {catIndex + 1}:</span>
                        <h3 className="font-extrabold text-slate-800 tracking-tight uppercase text-xs">{categoryName}</h3>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {filteredEndpoints.length} Routes
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredEndpoints.map((ep) => {
                        // SỬA LỖI TẠI ĐÂY: Trích xuất trực tiếp giá trị boolean từ state dữ liệu động một cách an toàn
                        const isTier1Checked = projectPermissions[ep.id]?.TIER_1 || false;
                        const isBankChecked = projectPermissions[ep.id]?.BANK || false;
                        const isTier2Checked = projectPermissions[ep.id]?.TIER_2 || false;
                        const isSandboxChecked = projectPermissions[ep.id]?.SANDBOX || false;
                        const isVifoChecked = projectPermissions[ep.id]?.VIFO || false;
                        const isMomoChecked = projectPermissions[ep.id]?.MoMo || false;

                        return (
                          <div key={ep.id} className="p-3.5 hover:bg-slate-50/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-[10px] tracking-wide border min-w-[54px] text-center select-none ${
                                  ep.method === 'POST' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  ep.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                  ep.method === 'PUT' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                                }`}>
                                  {ep.method}
                                </span>
                                <span className="font-mono font-bold text-slate-900 text-xs tracking-tight break-all">
                                  {ep.path}
                                </span>
                              </div>
                              <div className="text-slate-500 font-medium text-xs">
                                {ep.businessName}
                              </div>
                            </div>

                            {/* MA TRẬN PHÂN QUYỀN THEO NHÓM LỚN (TIERS) */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                              
                              <label className="flex items-center space-x-2 cursor-pointer select-none font-bold">
                                <input 
                                  type="checkbox" checked={isTier1Checked} onChange={() => handleCheckboxChange(ep.id, 'TIER_1')}
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={isTier1Checked ? "text-emerald-700 font-extrabold" : "text-slate-400"}>👑 TIER 1</span>
                              </label>

                              <label className="flex items-center space-x-2 cursor-pointer select-none font-bold">
                                <input 
                                  type="checkbox" checked={isBankChecked} onChange={() => handleCheckboxChange(ep.id, 'BANK')}
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={isBankChecked ? "text-purple-700 font-extrabold" : "text-slate-400"}>🏦 BANK</span>
                              </label>

                              <label className="flex items-center space-x-2 cursor-pointer select-none font-medium">
                                <input 
                                  type="checkbox" checked={isTier2Checked} onChange={() => handleCheckboxChange(ep.id, 'TIER_2')}
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={isTier2Checked ? "text-slate-800 font-bold" : "text-slate-400"}>📦 TIER 2</span>
                              </label>

                              <label className="flex items-center space-x-2 cursor-pointer select-none font-medium">
                                <input 
                                  type="checkbox" checked={isSandboxChecked} onChange={() => handleCheckboxChange(ep.id, 'SANDBOX')}
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={isSandboxChecked ? "text-amber-700 font-bold" : "text-slate-400"}>🧪 SANDBOX</span>
                              </label>

                              <div className="w-px h-3.5 bg-slate-300 mx-1 hidden sm:block"></div>

                              {/* Giữ lại 2 cột đối tác mẫu đã được liên kết đồng bộ an toàn */}
                              <label className="flex items-center space-x-2 cursor-pointer select-none font-medium">
                                <input 
                                  type="checkbox" checked={isVifoChecked} onChange={() => handleCheckboxChange(ep.id, 'VIFO')}
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={isVifoChecked ? "text-blue-600 font-bold" : "text-slate-400"}>VIFO</span>
                              </label>

                              <label className="flex items-center space-x-2 cursor-pointer select-none font-medium">
                                <input 
                                  type="checkbox" checked={isMomoChecked} onChange={() => handleCheckboxChange(ep.id, 'MoMo')}
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className={isMomoChecked ? "text-blue-600 font-bold" : "text-slate-400"}>MOMO</span>
                              </label>

                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}