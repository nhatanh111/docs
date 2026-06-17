// PartnerDocs.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PermissionModal from './PermissionModal'; 
import { 
  VALIDATION_LIMITS, 
  DEFAULT_ENDPOINTS, 
  ERROR_CODES_DATA, 
  FIELD_DICTIONARY,
  SUPPORTED_LANGUAGES,
  generateLanguageSnippet 
} from './MockData'; 

export default function PartnerDocs() {
  const [realEndpoints, setRealEndpoints] = useState([]);
  const [rawProjectData, setRawProjectData] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeEpId, setActiveEpId] = useState(null);
  const [authToken, setAuthToken] = useState('pvi_secret_access_key_2026');
  const [requestBodies, setRequestBodies] = useState({});
  const [apiResponses, setApiResponses] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedLang, setSelectedLang] = useState('curl'); // Quản lý ngôn ngữ code mẫu
  const [isFormMode, setIsFormMode] = useState(true); // Switch giữa Form nhập và JSON thô

  const middleScrollRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const apiRefs = useRef({});
  const isClickScrolling = useRef(false);
  const observerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert("🔒 Đã đăng xuất tài khoản quản trị thành công!");
    window.location.reload();
  };

  const fetchApiDocuments = useCallback(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com';
    const token = localStorage.getItem('token');

    fetch(`${backendUrl}/api/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        const flatList = [
          { id: "auth-signature", category: "AUTHENTICATION", method: "HASH", path: "Thuật toán băm: MD5", description: "Quy tắc ký chữ ký bảo mật dữ liệu giao dịch (Sign)", isCustomPage: true, pageType: "signature" },
          { id: "auth-headers", category: "AUTHENTICATION", method: "INFO", path: "HTTP Headers bắt buộc kèm theo", description: "Cấu hình HTTP Headers truyền tải thông tin định danh", isCustomPage: true, pageType: "headers" }
        ];

        setRawProjectData(data);

        data.forEach(proj => {
          proj.documents.forEach(doc => {
            doc.endpoints.forEach(ep => {
              flatList.push({
                id: ep.endpointId,
                category: doc.title,
                method: ep.method,
                path: ep.path,
                description: ep.name,
                requestSample: ep.requestSample || {},
                responseFormat: ep.responseFormat || {},
                allowedPartners: ep.allowedPartners || []
              });
            });
          });
        });

        flatList.push(
          { id: "ref-dictionary", category: "REFERENCE CENTER", method: "DATA", path: "Từ điển dữ liệu toàn bộ hệ thống", description: "Data Dictionary - Tra cứu giải nghĩa định nghĩa tham số", isCustomPage: true, pageType: "dictionary" },
          { id: "ref-status-codes", category: "REFERENCE CENTER", method: "CODE", path: "Mã lỗi quy ước hệ thống Core PVI", description: "Status & Error Codes - Bảng tra cứu mã phản hồi hệ thống", isCustomPage: true, pageType: "error-codes" },
          { id: "changelog-versions", category: "CHANGELOG", method: "VER", path: "Nhật ký nâng cấp phiên bản", description: "Versions - Thông tin cập nhật hệ thống cổng kết nối", isCustomPage: true, pageType: "changelog" }
        );

        setRealEndpoints(flatList);
      }
    })
    .catch(err => console.error("Lỗi kết nối API:", err));
  }, []);

  useEffect(() => {
    fetchApiDocuments();
  }, [fetchApiDocuments]);

  const handleTogglePermission = (type, targetId, partnerKey, currentChecked) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com';
    const token = localStorage.getItem('token');
    
    let endpointUrl = `${backendUrl}/api/documents/endpoints/${targetId}/permissions`;
    if (type === 'document') {
      endpointUrl = `${backendUrl}/api/documents/docs/${targetId}/permissions`;
    }

    fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ partnerKey, allow: !currentChecked })
    })
    .then(res => {
      if (res.ok) { fetchApiDocuments(); }
    })
    .catch(err => console.error("Lỗi phân quyền hệ thống:", err));
  };

  const activeEndpoints = realEndpoints.length > 0 ? realEndpoints : DEFAULT_ENDPOINTS;
  const currentActiveEp = activeEndpoints.find(e => e.id === activeEpId) || activeEndpoints[0];

  useEffect(() => {
    if (activeEndpoints.length > 0 && !activeEpId) {
      setActiveEpId(activeEndpoints[0].id);
    }
  }, [activeEndpoints, activeEpId]);

  const scrollSidebarToActive = useCallback((id) => {
    const sidebar = sidebarScrollRef.current;
    const btn = document.getElementById(`sidebar-item-${id}`);
    if (!sidebar || !btn) return;
    const targetScroll = btn.offsetTop - (sidebar.clientHeight / 2) + (btn.offsetHeight / 2);
    sidebar.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
  }, []);

  const cleanJsonString = (rawStr) => {
    if (!rawStr) return '{}';
    if (typeof rawStr === 'object') return JSON.stringify(rawStr, null, 2);
    let currentStr = String(rawStr).trim();
    currentStr = currentStr.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
    try {
      const parsed = JSON.parse(currentStr);
      if (parsed && typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
    } catch (e) {}
    return currentStr;
  };

  const clampValue = (fieldName, val) => {
    const rule = VALIDATION_LIMITS[fieldName];
    if (!rule) return val;
    if (val === undefined || val === null || val === '') return rule.min;
    let num = parseInt(String(val).replace(/\D/g, ''), 10);
    if (isNaN(num)) num = rule.min;
    return Math.max(rule.min, Math.min(rule.max, num));
  };

  useEffect(() => {
    const initialBodies = {};
    activeEndpoints.forEach(ep => {
      const sampleText = ep.requestSample ? cleanJsonString(ep.requestSample) : '{}';
      initialBodies[ep.id] = sampleText;
    });
    setRequestBodies(initialBodies);
  }, [activeEndpoints]);

  useEffect(() => {
    if (activeEndpoints.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length === 0) return;
        const best = visibleEntries.reduce((prev, curr) =>
          Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev
        );
        const id = best.target.dataset.apiId;
        if (id) {
          setActiveEpId(id);
          scrollSidebarToActive(id);
        }
      },
      { root: middleScrollRef.current, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    Object.values(apiRefs.current).forEach(el => {
      if (el) observerRef.current.observe(el);
    });

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [activeEndpoints, scrollSidebarToActive]);

  const handleTextareaChange = (id, rawText) => {
    if (!id) return;
    if (!rawText || rawText.trim() === '') {
      setRequestBodies(prev => ({ ...prev, [id]: rawText }));
      return;
    }
    try {
      const parsed = JSON.parse(rawText);
      let hasChanged = false;
      Object.keys(parsed).forEach(key => {
        if (VALIDATION_LIMITS[key] !== undefined && typeof parsed[key] !== 'object') {
          const validatedValue = clampValue(key, parsed[key]);
          if (parsed[key] !== validatedValue) { parsed[key] = validatedValue; hasChanged = true; }
        }
      });
      
      const nextBodyText = hasChanged ? JSON.stringify(parsed, null, 2) : rawText;
      setRequestBodies(prev => ({ ...prev, [id]: nextBodyText }));
    } catch (e) {
      setRequestBodies(prev => ({ ...prev, [id]: rawText }));
    }
  };

  // Cập nhật giá trị từ các ô input của Form UI vào chuỗi JSON gốc
  const handleFormFieldChange = (id, key, val) => {
    try {
      const currentBody = JSON.parse(requestBodies[id] || '{}');
      currentBody[key] = val;
      handleTextareaChange(id, JSON.stringify(currentBody, null, 2));
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu form:", e);
    }
  };

  const handleExecuteSandbox = (id, responseFormat) => {
    if (!id) return;
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    let finalResponse = { Status: "00", Message: "Giao dịch giả lập thành công." };
    if (responseFormat) {
      try { finalResponse = typeof responseFormat === 'string' ? JSON.parse(cleanJsonString(responseFormat)) : { ...responseFormat }; }
      catch (e) { finalResponse = { Status: "00", Message: "Giao dịch thành công.", Data: responseFormat }; }
    }
    try {
      const currentBody = JSON.parse(requestBodies[id] || '{}');
      Object.keys(currentBody).forEach(key => {
        if (VALIDATION_LIMITS[key] && currentBody[key] !== undefined) {
          const validNum = clampValue(key, currentBody[key]);
          if (key === 'TongPhi' && finalResponse.TotalFee !== undefined) finalResponse.TotalFee = validNum;
        }
      });
    } catch(e) {}
    setTimeout(() => {
      setApiResponses(prev => ({ ...prev, [id]: finalResponse }));
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 350);
  };

  const scrollToApi = useCallback((id) => {
    const element = apiRefs.current[id];
    if (!element) return;
    isClickScrolling.current = true;
    setActiveEpId(id);
    scrollSidebarToActive(id);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isClickScrolling.current = false; }, 800);
  }, [scrollSidebarToActive]);

  const highlightCodeText = (code, lang) => {
    if (!code) return '';
    let escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (lang === 'curl') {
      escaped = escaped.replace(/(curl|--location|--method|--header|--data)/g, '<span class="text-amber-400 font-bold">$1</span>');
      escaped = escaped.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>');
    } else {
      escaped = escaped.replace(/\b(const|let|var|new|return|import|from|require|function|echo|class|public|private|false|true)\b/g, '<span class="text-purple-400 font-bold">$1</span>');
      escaped = escaped.replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>');
      escaped = escaped.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>');
      escaped = escaped.replace(/\b(fetch|then|catch|console\.log|requests\.request|print|axios\.request)\b/g, '<span class="text-blue-400">$1</span>');
    }
    return <code dangerouslySetInnerHTML={{ __html: escaped }} />;
  };

  const renderTreeSchema = (dataObj) => {
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

      const isRequired = ['client_id', 'client_secret', 'grant_type', 'CpId', 'Sign', 'so_gcn', 'MaSoThue', 'NgayDoiSoat', 'type', 'ma_giaodich'].includes(key);
      const description = FIELD_DICTIONARY[key] || "Trường dữ liệu tích hợp thuộc nghiệp vụ logic Core Insurance PVI.";
      const hasLimitRule = VALIDATION_LIMITS[key];

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
            <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">{renderTreeSchema(value)}</div>
          )}
          {type === 'array' && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && (
            <div className="mt-2 pl-2 border-l border-dashed border-slate-300 space-y-1 max-w-full">
              <div className="text-[10px] text-amber-600 font-mono italic mb-1">↳ Cấu trúc đối tượng con:</div>
              {renderTreeSchema(value[0])}
            </div>
          )}
        </div>
      );
    });
  };

  const renderCustomPageContent = (type) => {
    if (type === "overview") {
      return (
        <div className="space-y-6 text-left">
          <p className="text-sm text-slate-600 leading-relaxed">
            Chào mừng đối tác đến với tài liệu kỹ thuật tích hợp cổng thông tin điện tử bảo hiểm <strong>An Biên Hub</strong>. Hệ thống hỗ trợ xử lý luồng tính toán phí và phát hành ấn chỉ tự động kết nối Core Insurance của PVI Đông Đô.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
              <div className="font-bold text-slate-800 text-xs uppercase mb-1">Môi trường Sandbox</div>
              <code className="text-blue-600 font-mono text-xs break-all block">https://sandbox-api.pvi.vn</code>
            </div>
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
              <div className="font-bold text-slate-800 text-xs uppercase mb-1">Môi trường Production</div>
              <code className="text-emerald-600 font-mono text-xs break-all block">https://api.pvi.vn</code>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <strong className="block mb-1 font-bold">📌 Lưu ý tích hợp:</strong>
            Mọi cổng payload gửi lên đều bắt buộc mã hóa định dạng UTF-8, cấu trúc JSON ứng với phương thức giao dịch POST bảo mật.
          </div>
        </div>
      );
    }
    if (type === "headers") {
      return (
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600">Mọi cuộc gọi API lõi nghiệp vụ từ phía Đối tác đều bắt buộc phải khai báo cấu hình danh sách HTTP Headers dưới đây:</p>
          <pre className="bg-slate-50 border p-4 rounded-xl font-mono text-xs text-slate-700 leading-relaxed">{`{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer eyJhbGciOiJIUzI1Ni...",\n  "CpId": "PARTNER_ID_AN_BIEN",\n  "Sign": "8cc21a24890c2918bb1237a892b11a12"\n}`}</pre>
        </div>
      );
    }
    if (type === "dictionary") {
      return (
        <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold text-slate-700 text-left">Trường (Field Key)</th>
                <th className="p-3 font-semibold text-slate-700 text-left">Ý nghĩa giải nghĩa tham số hệ thống</th>
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
                <th className="p-3 font-semibold text-slate-700 w-24 text-center">Mã Code</th>
                <th className="p-3 font-semibold text-slate-700 text-left">Định nghĩa chi tiết lỗi nghiệp vụ</th>
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
              <span className="font-bold text-slate-900 text-sm">v1.3.0 Stable Release</span>
              <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-emerald-100">LATEST</span>
            </div>
            <ul className="list-disc ml-5 text-xs text-slate-600 space-y-1">
              <li>Cập nhật bổ sung 10 API nghiệp vụ: Khai báo bồi thường, Đối soát kế toán, CRM, Tái bảo hiểm.</li>
              <li>Tối ưu cơ chế Validate kiểm tra trường dữ liệu (Validation Limits) trên Sandbox Portal.</li>
            </ul>
          </div>
          <div className="border rounded-xl p-4 bg-slate-50/20">
            <span className="font-bold text-slate-800 text-xs block mb-1">v1.2.0 Release</span>
            <p className="text-xs text-slate-500">Mã hóa nâng cao tốc độ tải file PDF chứng nhận điện tử Core Insurance.</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Trích xuất danh sách Form Field từ chuỗi JSON để sinh UI nhập liệu thông minh cho cột 3
  const getFormFields = (jsonStr) => {
    try {
      const obj = JSON.parse(jsonStr || '{}');
      return Object.entries(obj).filter(([_, v]) => typeof v !== 'object');
    } catch (e) {
      return [];
    }
  };

  const categories = Array.from(new Set(activeEndpoints.map(e => e.category || "CHUNG")));

  return (
    <div className="flex h-screen w-full bg-white text-slate-800 text-sm overflow-hidden select-text font-sans">
      
      {/* CỘT 1: SIDEBAR DANH MỤC TRÁI */}
      <div ref={sidebarScrollRef} className="w-80 shrink-0 border-r border-slate-200 bg-[#f8fafc] p-4 overflow-y-auto space-y-0 text-xs select-none flex flex-col custom-scrollbar">
        <div className="space-y-2">
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {categories.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-1">
              <div className="text-slate-400 uppercase font-extrabold tracking-wider text-[9px] pt-3 px-1 text-left">{cat}</div>
              <div className="space-y-0.5">
                {activeEndpoints.filter(e => (e.category || "CHUNG") === cat).map((ep) => (
                  <div
                    key={ep.id}
                    id={`sidebar-item-${ep.id}`}
                    onClick={() => scrollToApi(ep.id)}
                    className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                      activeEpId === ep.id ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white shrink-0 ${
                      ep.method === 'POST' ? 'bg-emerald-600' : ep.method === 'INFO' || ep.method === 'DATA' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="truncate flex-1 font-semibold text-left">{ep.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT 2: KHU VỰC THÔNG TIN SCHEMA CHI TIẾT (Ở GIỮA) */}
      <div ref={middleScrollRef} className="flex-1 p-8 overflow-y-auto space-y-24 scroll-smooth min-w-0 custom-scrollbar bg-white">
        {activeEndpoints.map((ep) => (
          <div key={ep.id} data-api-id={ep.id} ref={el => apiRefs.current[ep.id] = el} className="pt-2 border-b border-slate-100 pb-16 last:border-0 scroll-mt-6 max-w-full">
            <div className="text-left max-w-full">
              <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md border border-slate-200 inline-block">
                {ep.category}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1.5 max-w-full">{ep.description}</h1>
              <div className="mt-3 flex items-center space-x-2 text-xs max-w-full">
                <span className={`text-white font-black px-2.5 py-1 rounded-md shrink-0 ${ep.method === 'POST' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{ep.method}</span>
                <code className="bg-slate-50 text-slate-700 px-3 py-1 rounded-xl font-mono border border-slate-200/70 break-all flex-1 font-bold text-left">{ep.path}</code>
              </div>
            </div>

            {ep.isCustomPage ? (
              <div className="mt-6 max-w-full">{renderCustomPageContent(ep.pageType)}</div>
            ) : (
              <>
                <div className="mt-8 space-y-3 text-left max-w-full">
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Request Body Schema</h2>
                  <div className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">application/json</div>
                  <div className="pl-2 border-l border-slate-200 space-y-1 pt-1 max-w-full overflow-hidden">
                    {ep.requestSample ? renderTreeSchema(ep.requestSample) : <p className="text-xs text-slate-400 italic">Không yêu cầu Body Header Parameter.</p>}
                  </div>
                </div>
                <div className="mt-8 space-y-4 text-left max-w-full">
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Response JSON Format</h2>
                  <div className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">application/json</div>
                  <div className="pl-2 border-l border-slate-200 space-y-1 pt-1 max-w-full overflow-hidden">
                    {ep.responseFormat ? renderTreeSchema(ep.responseFormat) : <p className="text-xs text-slate-400 italic">Không có phản hồi mẫu.</p>}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* CỘT 3: CONSOLE SANDBOX WORKBENCH & CODE SNIPPETS (TỐI ƯU GIAO DIỆN THEO ẢNH MẪU) */}
      <div className="w-[450px] shrink-0 bg-[#ffffff] text-slate-800 p-5 flex flex-col space-y-5 border-l border-slate-200 overflow-y-auto select-none min-w-0 custom-scrollbar text-left shadow-2xl">
        
        {/* TỐI ƯU 1: KHU VỰC KHỐI CODE SNIPPETS ĐA NGÔN NGỮ (ĐƯỢC ĐƯA LÊN ĐẦU THEO ẢNH MẪU) */}
        <div className="space-y-3 border border-slate-200 bg-slate-50/50 p-3 rounded-2xl">
          <div className="flex items-center justify-between font-sans">
            <div className="text-[11px] uppercase text-slate-700 font-extrabold tracking-wider flex items-center gap-1.5">
              <span>🛠️</span> Code Generator Templates
            </div>
            <button
              type="button"
              onClick={async () => {
                const currentSnippetText = generateLanguageSnippet(selectedLang, currentActiveEp, requestBodies[currentActiveEp?.id]);
                if (currentSnippetText) {
                  await navigator.clipboard.writeText(currentSnippetText);
                  alert(`📋 Đã copy đoạn mã [${selectedLang.toUpperCase()}] thành công!`);
                }
              }}
              className="text-[10px] px-3 py-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer border-0 font-bold shadow-sm"
            >
              📋 Copy Code
            </button>
          </div>

          {/* Tab bar chọn ngôn ngữ dạng viên thuốc cao cấp tròn trịa */}
          <div className="flex items-center space-x-1 bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none select-none">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLang(lang.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border-0 cursor-pointer whitespace-nowrap ${
                  selectedLang === lang.id
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 bg-transparent hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>

          {/* Khung hiển thị Code Highlight nền tối chuyên nghiệp */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-xl max-w-full overflow-hidden relative">
            <div className="absolute right-2.5 top-2 text-[9px] text-slate-500 font-bold select-none uppercase tracking-wider font-sans">
              {selectedLang}
            </div>
            <pre className="w-full h-40 bg-[#0f172a] text-slate-300 font-mono text-[11px] leading-relaxed p-3 border-0 overflow-y-auto select-text custom-scrollbar resize-none text-left m-0 whitespace-pre-wrap">
              {highlightCodeText(
                generateLanguageSnippet(selectedLang, currentActiveEp, requestBodies[currentActiveEp?.id]),
                selectedLang
              )}
            </pre>
          </div>
        </div>

        {/* TỐI ƯU 2: GIAO DIỆN TÀI LIỆU NHẬP LIỆU WORKBENCH TRỰC QUAN (GIỐNG HỆT FILE ẢNH MẪU) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black uppercase text-slate-900 tracking-wide">REQUEST SYSTEM</span>
            
            {/* Toggle chuyển đổi nhanh giữa Giao diện nhập form UI và Soạn JSON thô */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold border border-slate-200">
              <button 
                type="button" onClick={() => setIsFormMode(true)}
                className={`px-2 py-0.5 rounded-md cursor-pointer border-0 ${isFormMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 bg-transparent'}`}
              >
                FORM UI
              </button>
              <button 
                type="button" onClick={() => setIsFormMode(false)}
                className={`px-2 py-0.5 rounded-md cursor-pointer border-0 ${!isFormMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 bg-transparent'}`}
              >
                RAW JSON
              </button>
            </div>
          </div>

          {/* Trường Base URL tĩnh */}
          <div className="space-y-1 text-xs">
            <div className="text-slate-500 font-bold flex items-center gap-1">
              <span>▾</span> Base URL
            </div>
            <div className="text-slate-800 font-mono text-[11px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl break-all">
              {import.meta.env.VITE_API_URL || 'https://docs-ozw6.onrender.com'}
            </div>
          </div>

          {/* Trường Auth Key token định danh */}
          <div className="space-y-1 text-xs">
            <div className="text-slate-500 font-bold flex items-center gap-1">
              <span>▾</span> Auth (Bearer Token)
            </div>
            <input
              type="text" 
              value={authToken} 
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Nhập mã bí mật pvi_secret..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500 shadow-sm select-text"
            />
          </div>

          {/* Khối quản lý Body Parameters theo cấu hình lựa chọn */}
          <div className="space-y-2 text-xs flex-1 flex flex-col min-h-0">
            <div className="text-slate-500 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1">▾ Body <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-black">REQUIRED</span></span>
              {!isFormMode && <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">AUTO-VALIDATE</span>}
            </div>

            {currentActiveEp?.isCustomPage && currentActiveEp?.pageType !== "overview" ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                <p className="text-[11px] leading-normal">Trang tham chiếu tĩnh không chứa tham số yêu cầu.</p>
              </div>
            ) : isFormMode ? (
              /* HIỂN THỊ DẠNG FORM UI: Tự động map các trường từ object mẫu ra ô nhập tương thích (Giống ảnh b2d763) */
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {getFormFields(requestBodies[currentActiveEp?.id]).length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] text-center pt-4">Không tìm thấy tham số khả dụng hoặc JSON bị lỗi.</p>
                ) : (
                  getFormFields(requestBodies[currentActiveEp?.id]).map(([key, val]) => (
                    <div key={key} className="space-y-1 text-left">
                      <label className="block text-[11px] font-mono font-bold text-slate-700">{key}</label>
                      <input
                        type="text"
                        value={String(val)}
                        onChange={(e) => handleFormFieldChange(currentActiveEp?.id, key, e.target.value)}
                        placeholder={`Nhập thông tin cho ${key}...`}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                      />
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* HIỂN THỊ DẠNG TEXTAREA RAW JSON THÔ (Như thiết kế ban đầu của bạn) */
              <textarea
                value={requestBodies[currentActiveEp?.id] || '{}'}
                onChange={(e) => handleTextareaChange(currentActiveEp?.id, e.target.value)}
                className="w-full h-36 bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs leading-relaxed shadow-inner resize-none focus:outline-none focus:border-blue-500 overflow-y-auto select-text"
              />
            )}
          </div>

          {/* Nút hành động Execute gửi API Sandbox lên Core PVI */}
          <button
            type="button"
            onClick={() => handleExecuteSandbox(currentActiveEp?.id, currentActiveEp?.responseFormat)}
            disabled={loadingStates[currentActiveEp?.id]}
            className={`w-full text-white font-bold py-2.5 px-4 rounded-xl font-sans text-xs transition-all shadow active:scale-[0.99] flex items-center justify-center space-x-2 ${
              loadingStates[currentActiveEp?.id] ? 'bg-blue-800/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer border-0 outline-none'
            }`}
          >
            {loadingStates[currentActiveEp?.id] ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>SENDING API REQUEST...</span>
              </>
            ) : (
              <span>SEND API REQUEST</span>
            )}
          </button>
        </div>

        {/* TỐI ƯU 3: KHỐI CONSOLE CONSOLE LOG ĐẦU RA PHẢN HỒI RESPONSE (GIỐNG HỆT TRONG CÁC ẢNH MẪU) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col h-44 overflow-hidden font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-xs font-black uppercase text-slate-900 tracking-wide">RESPONSE BACKEND</span>
            {apiResponses[currentActiveEp?.id] && (
              <button 
                type="button" 
                onClick={() => setApiResponses(prev => ({ ...prev, [currentActiveEp?.id]: null }))}
                className="text-[10px] text-red-500 font-bold bg-red-50 border-0 hover:bg-red-100 px-2 py-0.5 rounded cursor-pointer transition-all"
              >
                CLEAR
              </button>
            )}
          </div>
          <div className="w-full flex-1 bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-sky-400 font-mono text-[11px] leading-relaxed overflow-y-auto shadow-2xl break-all select-text custom-scrollbar">
            {apiResponses[currentActiveEp?.id] ? (
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap m-0 text-left">{JSON.stringify(apiResponses[currentActiveEp?.id], null, 2)}</pre>
            ) : (
              <span className="text-slate-500 italic font-sans text-xs flex h-full items-center justify-center text-center">
                Click the "Send API Request" button above and see the response here!
              </span>
            )}
          </div>
        </div>

      </div>

      {/* MODAL PHÂN QUYỀN ĐỐI TÁC BIỆT LẬP */}
      <PermissionModal 
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        rawProjectData={rawProjectData}
        onTogglePermission={handleTogglePermission}
      />

    </div>
  );
}