import React, { useState, useEffect } from 'react';

export default function AdminPermissions() {
  // Danh mục cố định trích từ tài liệu Word của PVI
  const categories = [
    "Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô",
    "Tài liệu tích hợp API Bảo hiểm TNDS Xe máy",
    "Quy trình tích hợp gói bảo hiểm Sức khỏe con người",
    "Hệ thống danh mục dùng chung",
    "Tra cứu & Thông báo kết quả"
  ];

  // State quản lý Form thêm mới Endpoint
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [method, setMethod] = useState('POST');
  const [path, setPath] = useState('');
  const [businessName, setBusinessName] = useState('');

  // 1. KHỞI TẠO STATE BAN ĐẦU: Ưu tiên đọc dữ liệu đã lưu từ localStorage ra trước
  const [endpoints, setEndpoints] = useState(() => {
    const savedEndpoints = localStorage.getItem('pvi_api_endpoints');
    if (savedEndpoints) {
      return JSON.parse(savedEndpoints);
    }
    // Danh sách mặc định ban đầu nếu bộ nhớ trống
    return [
      {
        id: 1,
        category: "Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô",
        method: "POST",
        path: "/calculate-premium",
        description: "Tính phí bảo hiểm ô tô dựa trên số chỗ/tải trọng",
        permissions: { VIFO: true, MoMo: true }
      },
      {
        id: 2,
        category: "Quy trình cấp đơn bảo hiểm TNDS bắt buộc Xe ô tô",
        method: "POST",
        path: "/create-order",
        description: "Nhập thông tin chủ xe và tạo đơn hàng cấp giấy chứng nhận điện tử",
        permissions: { VIFO: true, MoMo: false }
      },
      {
        id: 3,
        category: "Tài liệu tích hợp API Bảo hiểm TNDS Xe máy",
        method: "POST",
        path: "/issue-certificate",
        description: "Cấp mã giấy chứng nhận bảo hiểm xe máy online tự động",
        permissions: { VIFO: true, MoMo: false }
      }
    ];
  });

  // 2. THEO DÕI TỰ ĐỘNG: Cứ mỗi khi danh sách endpoints thay đổi (Thêm mới/Tích chọn), tự động đồng bộ vào localStorage
  useEffect(() => {
    localStorage.setItem('pvi_api_endpoints', JSON.stringify(endpoints));
  }, [endpoints]);

  // Hàm xử lý khi bấm nút "Thêm Endpoint"
  const handleAddEndpoint = (e) => {
    e.preventDefault();
    if (!path || !businessName) {
      alert("Vui lòng điền đầy đủ thông tin Path và Tên nghiệp vụ!");
      return;
    }

    const newEndpoint = {
      id: Date.now(),
      category: selectedCategory,
      method: method,
      path: path.startsWith('/') ? path : `/${path}`,
      description: businessName,
      permissions: { VIFO: false, MoMo: false } // Mặc định tạo mới chưa cấp cho ai
    };

    setEndpoints([...endpoints, newEndpoint]); // Khi hàm này chạy, useEffect ở trên sẽ tự động lưu vào localStorage vĩnh viễn
    setPath('');
    setBusinessName('');
    alert("Thêm mới Endpoint API thành công và đã lưu vào hệ thống trình duyệt!");
  };

  // Hàm xử lý bật/tắt Checkbox phân quyền trực tiếp trên lưới
  const handleCheckboxChange = (id, partner) => {
    setEndpoints(endpoints.map(ep => {
      if (ep.id === id) {
        return {
          ...ep,
          permissions: {
            ...ep.permissions,
            [partner]: !ep.permissions[partner]
          }
        };
      }
      return ep;
    }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-slate-100 p-6 font-sans">
      
      {/* TIÊU ĐỀ TRANG CẤU HÌNH */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <span>🛠️</span> <span>PVI API PORTAL — ADMIN CONTROL PANEL</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống cấu hình bóc tách dữ liệu tài liệu, cấp quyền hiển thị Endpoint bảo hiểm dành riêng cho từng Đối tác kết nối. (Dữ liệu đã được lưu trữ tự động).
        </p>
      </div>

      {/* BỐ CỤC CHIA LÀM 2 PHẦN CHÍNH */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* KHỐI TRÁI: FORM THÊM ENDPOINT API */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <span>➕</span> <span>Thêm Endpoint API Mới</span>
          </h3>
          
          <form onSubmit={handleAddEndpoint} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Thuộc tài liệu nghiệp vụ</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">METHOD</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-bold focus:outline-none focus:border-blue-500 text-center"
                >
                  <option value="POST" className="text-emerald-600 font-bold">POST</option>
                  <option value="GET" className="text-orange-600 font-bold">GET</option>
                  <option value="PUT" className="text-blue-600 font-bold">PUT</option>
                  <option value="DELETE" className="text-red-600 font-bold">DELETE</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="block font-semibold text-slate-700">PATH ENDPOINT</label>
                <input 
                  type="text"
                  placeholder="/v1/url-endpoint"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">TÊN NGHIỆP VỤ / ĐẶC TẢ CHỨC NĂNG</label>
              <input 
                type="text"
                placeholder="Ví dụ: Tính toán phí bảo hiểm thân vỏ..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all text-xs uppercase tracking-wider mt-2"
            >
              Thêm Endpoint Vào Hệ Thống
            </button>
          </form>
        </div>

        {/* KHỐI PHẢI: LƯỚI QUẢN LÝ PHÂN QUYỀN CHO ĐỐI TÁC */}
        <div className="xl:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <span>📝</span> <span>Quản lý phân quyền hiển thị tài liệu Đối tác</span>
          </h3>

          <div className="space-y-6">
            {categories.map((cat, catIdx) => {
              const currentEndpoints = endpoints.filter(ep => ep.category === cat);
              if (currentEndpoints.length === 0) return null;

              return (
                <div key={catIdx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50/50">
                  
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="truncate max-w-[70%]">{cat}</span>
                    <div className="flex space-x-6 text-[10px] text-slate-500 uppercase tracking-wider">
                      <span>Quyền: VIFO</span>
                      <span>MOMO</span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {currentEndpoints.map((ep) => (
                      <div 
                        key={ep.id} 
                        className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-300 transition"
                      >
                        <div className="flex items-start space-x-2.5 text-xs min-w-0 flex-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
                            {ep.method}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <code className="font-mono font-bold text-slate-900 text-xs">{ep.path}</code>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-500 truncate">{ep.description}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8 text-xs font-semibold pl-6 md:pl-0">
                          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={ep.permissions.VIFO}
                              onChange={() => handleCheckboxChange(ep.id, 'VIFO')}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={ep.permissions.VIFO ? "text-blue-600" : "text-slate-400"}>VIFO</span>
                          </label>

                          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={ep.permissions.MoMo}
                              onChange={() => handleCheckboxChange(ep.id, 'MoMo')}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={ep.permissions.MoMo ? "text-blue-600" : "text-slate-400"}>MoMo</span>
                          </label>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}