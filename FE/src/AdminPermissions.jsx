import React, { useState, useEffect } from 'react';

export default function AdminPermissions() {
  // Danh mục cố định dựa trên cấu trúc các bộ tài liệu trên cơ sở dữ liệu của PVI
  const categories = [
    "Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô",
    "Tài liệu tích hợp API Bảo hiểm TNDS Xe máy",
    "Quy trình tích hợp gói bảo hiểm Sức khỏe con người",
    "Hệ thống danh mục dùng chung",
    "Tra cứu & Thông báo kết quả"
  ];

  // Cấu hình Base URL kết nối đến Server Backend thật của bạn
  const BASE_URL = (import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com').replace(/\/$/, '');

  // State quản lý Form thêm mới Endpoint
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [method, setMethod] = useState('POST');
  const [path, setPath] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Quản lý danh sách Endpoints lấy động từ server về
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý quyền tích chọn của cả cụm Project (Category)
  const [projectPermissions, setProjectPermissions] = useState({});

  // 1. TỰ ĐỘNG GỌI API ĐỂ LẤY DỮ LIỆU THẬT TỪ BACKEND KHI MỞ TRANG
  const fetchRealDataFromServer = () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    fetch(`${BASE_URL}/api/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const flatList = [];
          data.forEach(proj => {
            proj.documents.forEach(doc => {
              // Lọc các endpoint thuộc tài liệu này
              if (doc.endpoints && Array.isArray(doc.endpoints)) {
                doc.endpoints.forEach(ep => {
                  flatList.push({
                    id: ep.endpointId,          // Đồng bộ ID thực tế từ database server
                    category: doc.title,         // Thuộc bộ tài liệu nào
                    method: ep.method,
                    path: ep.path,
                    description: ep.name,        // Tên nghiệp vụ mô tả
                    allowedPartners: ep.allowedPartners || [] // Mảng chứa ['pt-vifo', 'pt-momo']
                  });
                });
              }
            });
          });
          setEndpoints(flatList);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu từ Backend:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRealDataFromServer();
  }, []);

  // 2. TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI CHECKBOX CỦA PROJECT CHA DỰA TRÊN ENDPOINT CON
  useEffect(() => {
    const updated = {};
    categories.forEach(cat => {
      const catEndpoints = endpoints.filter(ep => ep.category === cat);
      if (catEndpoints.length === 0) {
        updated[cat] = { VIFO: false, MoMo: false };
      } else {
        const allVifo = catEndpoints.every(ep => ep.allowedPartners?.includes('pt-vifo'));
        const allMoMo = catEndpoints.every(ep => ep.allowedPartners?.includes('pt-momo'));
        updated[cat] = { VIFO: allVifo, MoMo: allMoMo };
      }
    });
    setProjectPermissions(updated);
  }, [endpoints]);

  // 3. HÀM GỬI LỆNH TẠO MỚI API ENDPOINT LÊN SERVER BACKEND
  const handleAddEndpoint = async (e) => {
    e.preventDefault();
    if (!path.trim() || !businessName.trim()) {
      alert("Vui lòng điền đầy đủ Đường dẫn API và Tên nghiệp vụ!");
      return;
    }

    const token = localStorage.getItem('token');
    const formatedPath = path.trim().startsWith('/') ? path.trim() : '/' + path.trim();

    // Chuẩn hóa cấu trúc dữ liệu Payload gửi lên backend (Bao gồm category, docTitle và endpoint data)
    const payload = {
      category: selectedCategory, 
      method: method,
      path: formatedPath,
      name: businessName.trim(),
      allowedPartners: [] // Khi vừa tạo mặc định chưa cấp quyền cho ai
    };

    try {
      // Bạn lưu ý check kỹ endpoint POST tạo API này trên Swagger/Postman backend của bạn nhé (Ví dụ: /api/documents/endpoints)
      const res = await fetch(`${BASE_URL}/api/documents/endpoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Thêm API Endpoint lên hệ thống máy chủ thành công!");
        setPath('');
        setBusinessName('');
        fetchRealDataFromServer(); // Tải lại danh sách mới nhất từ server về
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Lỗi hệ thống: ${errorData.message || 'Không thể tạo endpoint mới trên server'}`);
      }
    } catch (err) {
      console.error("Lỗi kết nối mạng:", err);
      alert("Không thể kết nối tới server để thêm Endpoint!");
    }
  };

  // 4. HÀM XỬ LÝ XÓA ENDPOINT THẬT KHỎI DATABASE SERVER
  const handleDeleteEndpoint = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa API Endpoint này khỏi cơ sở dữ liệu hệ thống?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BASE_URL}/api/documents/endpoints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Xóa thành công!");
        fetchRealDataFromServer(); // Reload
      } else {
        alert("Không thể xóa endpoint, vui lòng kiểm tra quyền hạn.");
      }
    } catch (err) {
      console.error("Lỗi xóa dữ liệu:", err);
    }
  };

  // 5. HÀM ĐỒNG BỘ PHÂN QUYỀN (CHECKBOX ĐƠN LẺ) LÊN BACKEND THẬT
  const handleCheckboxChange = async (endpointId, partner) => {
    const token = localStorage.getItem('token');
    const partnerKey = partner.toLowerCase() === 'vifo' ? 'pt-vifo' : 'pt-momo';
    
    // Tìm endpoint hiện tại để xác định trạng thái checked trước đó
    const targetEp = endpoints.find(ep => ep.id === endpointId);
    if (!targetEp) return;

    const isCurrentlyChecked = targetEp.allowedPartners?.includes(partnerKey);

    try {
      // Gọi lên Server cập nhật đúng Router quyền của dự án
      const res = await fetch(`${BASE_URL}/api/documents/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'endpoint',
          id: endpointId,
          partner: partnerKey,
          currentStatus: isCurrentlyChecked
        })
      });

      if (res.ok) {
        // Cập nhật giao diện state tức thì sau khi API Server lưu thành công
        setEndpoints(prev => prev.map(ep => {
          if (ep.id === endpointId) {
            const currentPartners = ep.allowedPartners || [];
            return {
              ...ep,
              allowedPartners: isCurrentlyChecked 
                ? currentPartners.filter(p => p !== partnerKey)
                : [...currentPartners, partnerKey]
            };
          }
          return ep;
        }));
      } else {
        console.error("Server từ chối cập nhật quyền.");
      }
    } catch (err) {
      console.error("Lỗi kết nối phân quyền:", err);
    }
  };

  // 6. HÀM ĐỒNG BỘ PHÂN QUYỀN TỔNG (CẤP ĐỘ CẢ PROJECT) LÊN SERVER
  const handleProjectCheckboxChange = async (categoryName, partner) => {
    const token = localStorage.getItem('token');
    const partnerKey = partner.toLowerCase() === 'vifo' ? 'pt-vifo' : 'pt-momo';
    const isCurrentlyChecked = projectPermissions[categoryName]?.[partner] || false;

    try {
      const res = await fetch(`${BASE_URL}/api/documents/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'project',
          category: categoryName,
          partner: partnerKey,
          currentStatus: isCurrentlyChecked
        })
      });

      if (res.ok) {
        // Cập nhật hàng loạt danh sách endpoint con thuộc category này local để đồng bộ UI
        setEndpoints(prev => prev.map(ep => {
          if (ep.category === categoryName) {
            const currentPartners = ep.allowedPartners || [];
            return {
              ...ep,
              allowedPartners: isCurrentlyChecked
                ? currentPartners.filter(p => p !== partnerKey)
                : currentPartners.includes(partnerKey) ? currentPartners : [...currentPartners, partnerKey]
            };
          }
          return ep;
        }));
      }
    } catch (err) {
      console.error("Lỗi đồng bộ quyền Project:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 text-sm font-sans antialiased p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TIÊU ĐỀ CHÍNH */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <span>🔐</span> Cổng cấu hình gộp phân quyền đối tác PVI
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý phân quyền đồng bộ cấp độ bộ tài liệu dự án (Project) và chi tiết từng cổng kết nối (Endpoint) trực tiếp lên Database.
            </p>
          </div>
        </div>

        {/* KHU VỰC 1: FORM THÊM MỚI ENDPOINT */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
              <span>➕</span> Đăng ký thêm mới API Endpoint hệ thống
            </h2>
          </div>
          
          <form onSubmit={handleAddEndpoint} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Thuộc bộ tài liệu nghiệp vụ (Project)</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên nghiệp vụ / Mô tả chức năng</label>
              <input 
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ví dụ: Tính phí bảo hiểm ô tô tự nguyện, Tra cứu đơn hàng..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div className="space-y-1.5 col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Method</label>
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-center focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="POST" className="text-emerald-600 font-bold">POST</option>
                  <option value="GET" className="text-blue-600 font-bold">GET</option>
                  <option value="PUT" className="text-amber-600 font-bold">PUT</option>
                  <option value="DELETE" className="text-red-600 font-bold">DELETE</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2 flex flex-col justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Đường dẫn API Endpoint Path</label>
                <div className="flex-1 flex items-center">
                  <input 
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Ví dụ: /calculate-premium hoặc /v1/moto/insert"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <button 
                    type="submit"
                    className="ml-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow transition-all shrink-0 cursor-pointer h-full border-0 outline-none"
                  >
                    THÊM API
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* KHU VỰC 2: GỘP CHUNG BẢNG QUẢN LÝ PHÂN QUYỀN */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1 text-left">
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span>📋</span> Danh sách phân quyền gộp cấu trúc dữ liệu cơ sở
            </h2>
            <span className="text-xs text-slate-400 italic">Đồng bộ đám mây thời gian thực</span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-400 text-xs">Đang tải cấu trúc dữ liệu từ cơ sở dữ liệu PVI...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat, catIdx) => {
                const catEndpoints = endpoints.filter(ep => ep.category === cat);
                const isProjectVifoChecked = projectPermissions[cat]?.VIFO || false;
                const isProjectMoMoChecked = projectPermissions[cat]?.MoMo || false;

                return (
                  <div key={catIdx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left">
                    
                    {/* CẤP ĐỘ 1: HEADER PROJECT */}
                    <div className="bg-slate-100/90 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-base shrink-0">📁</span>
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-tight truncate">
                          Bộ tài liệu (Project): {cat}
                        </h3>
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                          {catEndpoints.length} APIs
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-sm shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold pr-1 border-r border-slate-200">Quyền Project:</span>
                        
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isProjectVifoChecked}
                            onChange={() => handleProjectCheckboxChange(cat, 'VIFO')}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={isProjectVifoChecked ? "text-blue-600 font-extrabold" : "text-slate-400"}>VIFO</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isProjectMoMoChecked}
                            onChange={() => handleProjectCheckboxChange(cat, 'MoMo')}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={isProjectMoMoChecked ? "text-blue-600 font-extrabold" : "text-slate-400"}>MoMo</span>
                        </label>
                      </div>
                    </div>

                    {/* CẤP ĐỘ 2: DANH SÁCH ENDPOINTS CON */}
                    <div className="divide-y divide-slate-100 bg-white">
                      {catEndpoints.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 italic text-xs">
                          Chưa có API Endpoint nào được đăng ký trong bộ tài liệu này. Vui lòng sử dụng form phía trên để thêm mới.
                        </div>
                      ) : (
                        catEndpoints.map((ep) => {
                          const isVifoChecked = ep.allowedPartners?.includes('pt-vifo') || false;
                          const isMomoChecked = ep.allowedPartners?.includes('pt-momo') || false;

                          return (
                            <div key={ep.id} className="p-4 hover:bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                              
                              <div className="min-w-0 flex-1 space-y-1.5 text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[9px] text-white font-black px-2 py-0.5 rounded tracking-wide font-mono ${
                                    ep.method === 'POST' ? 'bg-emerald-600' : 
                                    ep.method === 'GET' ? 'bg-blue-600' : 
                                    ep.method === 'PUT' ? 'bg-amber-600' : 'bg-red-600'
                                  }`}>
                                    {ep.method}
                                  </span>
                                  <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 break-all">
                                    {ep.path}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEndpoint(ep.id)}
                                    className="text-slate-300 hover:text-red-500 text-xs ml-auto md:ml-2 border-0 bg-transparent cursor-pointer outline-none transition-colors"
                                    title="Xóa API này khỏi server"
                                  >
                                    🗑️
                                  </button>
                                </div>
                                <p className="text-slate-500 text-xs font-medium pl-1">
                                  {ep.description}
                                </p>
                              </div>

                              <div className="flex items-center space-x-5 md:justify-end shrink-0 font-bold text-xs bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-200/40">
                                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={isVifoChecked}
                                    onChange={() => handleCheckboxChange(ep.id, 'VIFO')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className={isVifoChecked ? "text-blue-600" : "text-slate-400"}>VIFO</span>
                                </label>

                                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={isMomoChecked}
                                    onChange={() => handleCheckboxChange(ep.id, 'MoMo')}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className={isMomoChecked ? "text-blue-600" : "text-slate-400"}>MoMo</span>
                                </label>
                              </div>

                            </div>
                          );
                        })
                      )}
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