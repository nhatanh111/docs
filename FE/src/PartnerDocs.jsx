import React, { useState, useEffect, useRef } from 'react';

export default function PartnerDocs({ endpoints }) {
  // 1. THIẾT LẬP DEFAULT VALUE CHO DANH SÁCH ENDPOINTS TRÁNH LỖI PHÂN QUYỀN RỖNG
  const activeEndpoints = endpoints && endpoints.length > 0 ? endpoints : [];

  const [activeEpId, setActiveEpId] = useState(activeEndpoints[0]?.id || null);
  const [authToken, setAuthToken] = useState('pvi_secret_access_key_2026');
  
  // DEFAULT VALUE CHO KHU VỰC LƯU TRỮ TRẠNG THÁI SANDBOX ĐỘNG
  const [requestBodies, setRequestBodies] = useState({});
  const [apiResponses, setApiResponses] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const middleScrollRef = useRef(null);
  const apiRefs = useRef({});

  // BỘ LỌC ĐỆ QUY LÀM SẠCH VÀ GIẢI MÃ CHUỒI JSON BỊ LỖI DẤU NHÁY KÉP LỒNG NHAU TỪ WORD/DOCX
  const cleanJsonString = (rawStr) => {
    if (!rawStr) return '{}';
    if (typeof rawStr === 'object') return JSON.stringify(rawStr, null, 2);
    
    let currentStr = String(rawStr).trim();
    
    // Xử lý loại bỏ các dấu nháy Word đặc biệt trước khi xử lý sâu
    currentStr = currentStr.replace(/“/g, '"').replace(/”/g, '"');

    // Vòng lặp bóc tách các lớp chuỗi bị bọc nháy kép hoặc bị escape quá nhiều lần
    for (let i = 0; i < 5; i++) {
      try {
        if (currentStr.startsWith('"') && currentStr.endsWith('"') && currentStr.length > 1) {
          const unquoted = JSON.parse(currentStr);
          if (typeof unquoted === 'string') {
            currentStr = unquoted.trim();
            continue;
          }
        }
        
        const parsed = JSON.parse(currentStr);
        if (parsed && typeof parsed === 'object') {
          return JSON.stringify(parsed, null, 2);
        }
      } catch (e) {
        let nextStr = currentStr
          .replace(/\\"/g, '"')    
          .replace(/""/g, '"')     
          .replace(/\\n/g, '')     
          .replace(/\\r/g, '')     
          .replace(/\\t/g, '');    
          
        if (nextStr === currentStr) {
          break; 
        }
        currentStr = nextStr.trim();
      }
    }

    try {
      if (currentStr.includes('{') && currentStr.includes('}')) {
        const finalTry = currentStr.replace(/\\"/g, '"').replace(/"{/g, '{').replace(/}"/g, '}');
        return JSON.stringify(JSON.parse(finalTry), null, 2);
      }
    } catch(err) {}

    return currentStr;
  };

  // Đồng bộ và gán Request Body mẫu ban đầu
  useEffect(() => {
    const initialBodies = {};
    activeEndpoints.forEach(ep => {
      if (ep.requestSample) {
        initialBodies[ep.id] = cleanJsonString(ep.requestSample);
      } else {
        initialBodies[ep.id] = '{}';
      }
    });
    setRequestBodies(initialBodies);
  }, [endpoints]);

  // Tự động theo dõi vị trí cuộn chuột (IntersectionObserver) để kích hoạt menu trái
  useEffect(() => {
    if (activeEndpoints.length === 0) return;

    const observerOptions = {
      root: middleScrollRef.current,
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveEpId(entry.target.dataset.apiId || null);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    Object.values(apiRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeEndpoints]);

  if (activeEndpoints.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 italic text-xs h-[calc(100vh-56px)]">
        Tài khoản của bạn hiện chưa được phân quyền truy cập bất kỳ tài liệu API nào.
      </div>
    );
  }

  // Từ điển ánh xạ nghiệp vụ lõi hệ thống nâng cấp
  const fieldDictionary = {
    username: "Tên đăng nhập tài khoản của hệ thống đối tác",
    password: "Mật khẩu mã hóa kết nối bảo mật",
    site_id: "Mã định danh phân vùng chi nhánh hệ thống quản lý",
    status: "Trạng thái xử lý logic (success | error)",
    code: "Mã lỗi nội bộ phân cấp hệ thống",
    message: "Thông báo mô tả tổng quát chi tiết kết quả xử lý",
    errors: "Mô tả chi tiết nội dung lỗi từ máy chủ",
    status_code: "Mã trạng thái phản hồi HTTP status chuẩn",
    link: "Đường dẫn URL gốc dùng để khởi tạo tài nguyên asset",
    media_type: "Phân loại định dạng tệp tin truyền tải (audio, video, audiovisual...)",
    match_types: "Danh sách các loại định dạng tệp tin đối khớp tương thích",
    collection_ids: "Mảng danh sách các ID bộ sưu tập danh mục liên quan",
    reference_ids: "Mảng danh sách các ID tham chiếu đối ứng",
    production_date: "Chuỗi ký tự định dạng ngày sản xuất (YYYY-MM-DD)",
    asset_id: "Mã ID tài nguyên asset định dạng số nguyên signed 64-bit",
    asset_id_str: "Chuỗi định dạng văn bản đại diện cho mã asset ID",
    ma_trongtai: "Mã trọng tải của phương tiện xe ô tô",
    so_cho: "Số chỗ ngồi đăng ký chính thức của xe",
    ma_mdsd: "Mã mục đích sử dụng (1: Không kinh doanh, 2: Có kinh doanh...)",
    giodau: "Giờ bắt đầu hiệu lực bảo hiểm (HH:mm)",
    giocuoi: "Giờ kết thúc hiệu lực bảo hiểm (HH:mm)",
    ngaydau: "Ngày bắt đầu có hiệu lực (DD/MM/YYYY)",
    ngaycuoi: "Ngày kết thúc hiệu lực (DD/MM/YYYY)",
    mtn_laiphu: "Mức trách nhiệm bảo hiểm lái phụ xe lựa chọn",
    so_nguoi: "Số người tham gia bảo hiểm tai nạn ngồi trên xe",
    thamgia_laiphu: "Trạng thái tham gia bảo hiểm lái phụ xe",
    thamgia_tndsbb: "Trạng thái tham gia TNDS bắt buộc",
    ma_loaixe: "Mã loại xe theo cấu hình danh mục hệ thống PVI",
    Sign: "Chữ ký bảo mật kết nối mã hóa dạng chuỗi băm MD5",
    CpId: "Mã định danh duy nhất của Đối tác được PVI cấp phát",
    CPId: "Mã định danh duy nhất của Đối tác được PVI cấp phát",
    DienThoai: "Số điện thoại của khách hàng mua bảo hiểm",
    TenKH: "Họ và tên khách hàng đại diện mua đơn",
    DiaChiKH: "Địa chỉ thường trú của khách hàng mua",
    TenChuXe: "Họ và tên chủ sở hữu xe trên đăng ký",
    DiaChiChuXe: "Địa chỉ của chủ xe ghi trên cà vẹt",
    EmailKH: "Địa chỉ email để hệ thống gửi giấy chứng nhận điện tử",
    LoaiXe: "Mã phân loại xe chi tiết",
    BienKiemSoat: "Biển kiểm soát phương tiện (Nếu chưa có mặc định ANBIEN_KS)",
    SoKhung: "Số khung của phương tiện xe",
    SoMay: "Số máy của phương tiện xe",
    NamSX: "Năm sản xuất của phương tiện",
    NamSD: "Năm bắt đầu đưa vào sử dụng",
    ThamGiaLaiPhu: "Tích chọn tham gia bảo hiểm tai nạn lái phụ xe",
    MTNLaiPhu: "Mức trách nhiệm tai nạn lái xe, phụ xe",
    SoNguoiToiDa: "Số lượng người ngồi tối đa được bảo hiểm",
    ChoNgoi: "Số lượng chỗ ngồi thiết kế",
    PhiBHLaiPhu: "Phí bảo hiểm thành tiền của lái phụ xe",
    PhiBHTNDSBB: "Phí bảo hiểm thành tiền của gói TNDS bắt buộc",
    MaMucDichSD: "Mã mục đích sử dụng phương tiện",
    TongPhi: "Tổng số tiền phí bảo hiểm đối tác cần thanh toán (Hợp lệ: 1 -> 500,000,000 VNĐ)",
    ngay_dau: "Ngày giờ bắt đầu hiệu lực (DD/MM/YYYY HH:mm)",
    ngay_cuoi: "Ngày giờ kết thúc hiệu lực (DD/MM/YYYY HH:mm)",
    loai_xe: "Mã phân loại phương tiện xe máy",
    muc_trachnhiem_laiphu: "Mức trách nhiệm bảo hiểm tai nạn xe máy",
    so_nguoi_tgia_laiphu: "Số người ngồi trên xe máy tham gia",
    ma_giaodich: "Mã đối tác tự sinh để quản lý đối soát đơn hàng",
    ten_nguoimua_bh: "Họ tên người mua ấn chỉ bảo hiểm xe máy",
    diachi_nguoimua_bh: "Địa chỉ liên hệ người mua bảo hiểm",
    bien_kiemsoat: "Biển số xe máy đăng ký",
    so_may: "Số máy xe máy",
    so_khung: "Số khung xe máy",
    nhan_hieu: "Mã nhãn hiệu xe",
    nam_sanxuat: "Năm sản xuất xe máy",
    ten_chuxe: "Tên chủ sở hữu xe máy",
    email: "Email nhận chứng nhận điện tử xe máy",
    so_dienthoai: "Số điện thoại liên hệ",
    dia_chi: "Địa chỉ chủ xe máy",
    Status: "Mã trạng thái phản hồi kết quả (Mặc định 00 là thành công)",
    Message: "Thông báo mô tả chi tiết kết quả xử lý giao dịch hệ thống",
    TotalFee: "Tổng phí bảo hiểm cuối cùng bao gồm thuế VAT (Hợp lệ: 1 -> 500,000,000 VNĐ)",
    Data: "Danh sách mảng chứa các đối tượng dữ liệu danh mục trả về",
    Value: "Giá trị mã định danh danh mục",
    Text: "Tên hiển thị chi tiết của danh mục PVI"
  };

  // HÀM KIỂM TRA VÀ RÀNG BUỘC SỐ TỪ 1 ĐẾN 500,000,000
  const validateAndFormatLimit = (val) => {
    if (val === undefined || val === null || val === '') return 1;
    let num = parseInt(String(val).replace(/\D/g, ''), 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 500000000) num = 500000000;
    return num;
  };

  // Hàm chặn gõ dữ liệu thô trực tiếp trong Textarea Sandbox để ép dải số an toàn
  const handleTextareaChange = (id, rawText) => {
    if (!id) return;
    if (!rawText || rawText.trim() === '') {
      setRequestBodies(prev => ({ ...prev, [id]: rawText }));
      return;
    }

    try {
      const parsed = JSON.parse(rawText);
      const targetFields = ['TongPhi', 'TotalFee', 'PhiBHTNDSBB', 'PhiBHLaiPhu', 'phi_tndsbb', 'phi_lpx', 'phi_moto', 'phi_laiphu'];
      
      let hasChanged = false;
      targetFields.forEach(field => {
        if (parsed[field] !== undefined && typeof parsed[field] !== 'object') {
          const validated = validateAndFormatLimit(parsed[field]);
          if (parsed[field] !== validated) {
            parsed[field] = validated;
            hasChanged = true;
          }
        }
      });
      
      if (hasChanged) {
        setRequestBodies(prev => ({ ...prev, [id]: JSON.stringify(parsed, null, 2) }));
      } else {
        setRequestBodies(prev => ({ ...prev, [id]: rawText }));
      }
    } catch (e) {
      setRequestBodies(prev => ({ ...prev, [id]: rawText }));
    }
  };

  // THUẬT TOÁN ĐỆ QUY VẼ CÂY SCHEMA ĐÃ ĐƯỢC FIX LỖI TRIỆT ĐỂ
  const renderTreeSchema = (dataObj) => {
    if (!dataObj) return null;
    
    let workingObj = dataObj;
    
    // Nếu đầu vào là một String, tiến hành dọn dẹp và ép kiểu về Object thật
    if (typeof dataObj === 'string') {
      try {
        const cleanedStr = cleanJsonString(dataObj);
        workingObj = JSON.parse(cleanedStr);
      } catch (e) {
        return <div className="text-xs font-mono text-slate-600 break-all pl-2">{dataObj}</div>;
      }
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

      const isRequired = ['username', 'password', 'site_id', 'link', 'media_type', 'CpId', 'CPId', 'Sign', 'ma_giaodich', 'Status'].includes(key);
      const description = fieldDictionary[key] || "Trường dữ liệu thuộc nghiệp vụ kết nối tích hợp hệ thống.";
      const isMoneyField = ['TongPhi', 'TotalFee', 'phi_tndsbb', 'phi_lpx', 'phi_moto', 'phi_laiphu'].includes(key);

      const getTypeColor = (t) => {
        if (t === 'string') return 'text-emerald-600 font-medium';
        if (t === 'number' || t === 'integer') return 'text-blue-600 font-medium';
        if (t === 'boolean') return 'text-purple-600 font-medium';
        if (t === 'array') return 'text-amber-600 font-bold';
        return 'text-slate-500';
      };

      return (
        <div key={index} className="relative pl-5 pb-3 group font-sans text-left max-w-full overflow-hidden">
          <div className="absolute left-0 top-3 w-3 border-t border-slate-200 group-hover:border-blue-400 transition-colors"></div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs max-w-full">
            <span className="font-mono font-bold text-slate-900 text-[12px] break-all">{key}</span>
            <span className={`text-[11px] font-mono lowercase ${getTypeColor(type)}`}>{type}</span>
            {isRequired && (
              <span className="text-[9px] bg-red-50 text-red-500 font-extrabold px-1 py-0.5 rounded border border-red-200 uppercase tracking-tighter">required</span>
            )}
            {isMoneyField && (
              <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1 rounded border border-emerald-200 whitespace-nowrap">
                {"1 - 500,000,000 VNĐ"}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5 font-medium leading-relaxed max-w-full break-words">{description}</p>
          
          {type !== 'object' && type !== 'array' && value !== undefined && value !== null && (
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono max-w-full break-all">
              <span className="text-slate-400 font-sans font-medium">Example:</span>{" "}
              <span className="text-slate-700 bg-slate-100 px-1 rounded border border-slate-200/60 font-semibold inline-block max-w-full break-all">
                {isMoneyField && !isNaN(Number(value)) ? Number(value).toLocaleString('vi-VN') : String(value)}
              </span>
            </div>
          )}

          {type === 'object' && value !== null && (
            <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">
              {renderTreeSchema(value)}
            </div>
          )}

          {type === 'array' && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && (
            <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">
              <div className="text-[10px] text-amber-600 font-mono italic mb-1">↳ Mảng chứa các đối tượng:</div>
              {renderTreeSchema(value[0])}
            </div>
          )}
        </div>
      );
    });
  };

  const scrollToApi = (id) => {
    const element = apiRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExecuteSandbox = (id, responseFormat) => {
    if (!id) return;
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    let finalResponse = { Status: "00", Message: "Giao dịch giả lập thành công." };
    if (responseFormat) {
      try {
        finalResponse = typeof responseFormat === 'string' ? JSON.parse(cleanJsonString(responseFormat)) : { ...responseFormat };
      } catch (e) {
        finalResponse = { Status: "00", Message: "Giao dịch giả lập thành công.", Data: responseFormat };
      }
    }
    
    try {
      const currentBody = JSON.parse(requestBodies[id] || '{}');
      if (currentBody.TongPhi && finalResponse.TotalFee !== undefined) {
        finalResponse.TotalFee = validateAndFormatLimit(currentBody.TongPhi);
      }
    } catch(e) {}

    setTimeout(() => {
      setApiResponses(prev => ({ ...prev, [id]: finalResponse }));
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 400);
  };

  const categories = Array.from(new Set(activeEndpoints.map(e => e.category || "Chung")));
  const currentActiveEp = activeEndpoints.find(e => e.id === activeEpId) || activeEndpoints[0];

  return (
    <div className="flex h-[calc(100vh-56px)] w-full bg-white text-slate-800 text-sm overflow-hidden select-text">
      
      {/* CỘT 1: DANH MỤC TRÁI */}
      <div className="w-72 shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto space-y-4 text-xs select-none">
        

        {categories.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-1">
            <div className="text-slate-400 uppercase font-black tracking-wider text-[10px] pt-2 px-1 break-words">{cat}</div>
            <div className="space-y-0.5">
              {activeEndpoints.filter(e => (e.category || "Chung") === cat).map((ep) => {
                const isSelected = activeEpId === ep.id;
                return (
                  <div 
                    key={ep.id}
                    onClick={() => scrollToApi(ep.id)}
                    className={`flex items-center space-x-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-600 text-white font-bold shadow-sm scale-[1.01]' : 'text-slate-600 hover:bg-slate-200/60'}`}
                  >
                    <span className={`text-[8px] px-1 py-0.5 rounded font-black text-white shrink-0 ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-orange-500'}`}>
                      {ep.method || 'POST'}
                    </span>
                    <span className="truncate flex-1 font-medium">{ep.description || ep.path}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CỘT 2: HIỂN THỊ CÂY TÀI LIỆU CUỘN VÔ HẠN */}
      <div 
        ref={middleScrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-24 scroll-smooth min-w-0"
      >
        {activeEndpoints.map((ep) => (
          <div 
            key={ep.id}
            data-api-id={ep.id}
            ref={el => apiRefs.current[ep.id] = el}
            className="pt-4 border-b border-slate-100 pb-16 last:border-0 scroll-mt-6 max-w-full"
          >
            {/* THÔNG TIN CHUNG API */}
            <div className="text-left max-w-full">
              <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-slate-200 inline-block">
                {ep.category || "Chung"}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1 wrap-break-word max-w-full">
                {ep.description || 'Chi tiết nghiệp vụ API'}
              </h1>
              <div className="mt-3 flex items-start sm:items-center space-x-2 text-xs max-w-full">
                <span className="bg-emerald-600 text-white font-black px-2 py-1 rounded shrink-0">{ep.method || 'POST'}</span>
                <code className="bg-slate-100 text-slate-700 px-3 py-1 rounded font-mono border border-slate-200 break-all flex-1 font-bold max-w-full">{ep.path}</code>
              </div>
            </div>

            {/* REQUEST TREE */}
            <div className="mt-8 space-y-3 text-left max-w-full">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Request Schema</h2>
              <div className="inline-block bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">application/json</div>
              <div className="pl-2 border-l border-slate-200 space-y-1 pt-1 max-w-full overflow-hidden">
                {ep.requestSample ? renderTreeSchema(ep.requestSample) : <p className="text-xs text-slate-400 italic">Không yêu cầu tham số body.</p>}
              </div>
            </div>

            {/* RESPONSE TREE */}
            <div className="mt-8 space-y-4 text-left max-w-full">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Response Schema</h2>
              <div className="inline-block bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">application/json</div>
              <div className="pl-2 border-l border-slate-200 space-y-1 pt-1 max-w-full overflow-hidden">
                {ep.responseFormat ? renderTreeSchema(ep.responseFormat) : <p className="text-xs text-slate-400 italic">Không có cấu trúc phản hồi mẫu.</p>}
              </div>
            </div>

            {/* BẢNG MÃ LỖI NGHIỆP VỤ ĐI KÈM */}
            <div className="mt-8 space-y-3 text-left max-w-full">
              <h3 className="font-bold text-blue-600 text-xs uppercase tracking-wider flex items-center space-x-1.5 select-none">📋 Mã phản hồi nghiệp vụ riêng</h3>
              <div className="pl-2 border-l border-slate-200 space-y-2 max-w-full">
                {(ep.errors && ep.errors.length > 0) ? (
                  ep.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start sm:items-center space-x-2 text-xs max-w-full">
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${err.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{err.code}</span>
                      <span className="text-slate-600 font-medium wrap-break-word max-w-full">{err.message}</span>
                    </div>
                  ))
                ) : <p className="text-xs text-slate-400 italic pl-2">Áp dụng bảng mã phản hồi hệ thống chung.</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CỘT 3: KHUNG KIỂM THỬ THỰC TẾ (SANDBOX) TỰ ĐỘNG TRACK THEO MÀN HÌNH */}
      <div className="w-96 shrink-0 bg-slate-900 text-slate-200 p-4 flex flex-col space-y-4 border-l border-slate-800 font-mono text-xs overflow-y-auto select-none min-w-0">
        <div className="max-w-full">
          <div className="text-[9px] uppercase text-slate-400 font-bold mb-1 tracking-wider text-left">ACTIVE CONTEXT</div>
          <div className="bg-slate-800 text-blue-400 font-bold px-2 py-1.5 rounded text-[11px] truncate text-left border border-slate-700 max-w-full">
            🔗 {currentActiveEp?.description || currentActiveEp?.path || "Đang tải cấu trúc..."}
          </div>
        </div>

        <div className="max-w-full">
          <div className="text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-wider text-left">SECURE PARTNER KEY</div>
          <input 
            type="text" 
            value={authToken} 
            onChange={(e) => setAuthToken(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-xs focus:outline-none shadow-inner max-w-full"
          />
        </div>

        <div className="flex flex-col h-44 max-w-full">
          <div className="text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-wider flex justify-between items-center max-w-full">
            <span>REQUEST BODY SAMPLE</span>
            <span className="text-[9px] text-amber-500 font-bold whitespace-nowrap">
              {"VAL: 1 -> 500M"}
            </span>
          </div>
          <textarea 
            value={requestBodies[currentActiveEp?.id] || '{}'}
            onChange={(e) => handleTextareaChange(currentActiveEp?.id, e.target.value)}
            className="w-full flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-emerald-400 font-mono text-[11px] leading-normal shadow-inner resize-none focus:outline-none text-left select-text overflow-y-auto whitespace-pre-wrap break-all font-semibold"
          />
        </div>

        <button 
          onClick={() => handleExecuteSandbox(currentActiveEp?.id, currentActiveEp?.responseFormat)}
          disabled={loadingStates[currentActiveEp?.id || '']}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg shadow-md transition-all uppercase tracking-wider text-[11px] cursor-pointer shrink-0"
        >
          {loadingStates[currentActiveEp?.id || ''] ? '⏳ Processing Live Core...' : `▶ Execute ${currentActiveEp?.method || 'POST'} Sandbox`}
        </button>

        <div className="flex-1 flex flex-col min-h-0 max-w-full">
          <div className="text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-wider flex justify-between items-center max-w-full">
            <span>LIVE SERVER RESPONSE</span>
            {apiResponses[currentActiveEp?.id || ''] && <span className="text-emerald-400 font-bold shrink-0">200 OK</span>}
          </div>
          <div className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-auto text-sky-400 text-[11px] leading-relaxed max-h-none shadow-inner text-left select-text">
            {apiResponses[currentActiveEp?.id || ''] ? (
              <pre className="whitespace-pre-wrap break-words word-break-all max-w-full font-mono font-semibold">{JSON.stringify(apiResponses[currentActiveEp.id], null, 2)}</pre>
            ) : (
              <div className="text-slate-600 italic h-full flex items-center justify-center text-center px-4 font-sans text-xs">
                Bấm nút Execute để nhận dữ liệu JSON chạy thử nghiệm cho API này.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}