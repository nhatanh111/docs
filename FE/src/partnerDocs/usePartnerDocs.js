import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_ENDPOINTS, VALIDATION_LIMITS } from '../MockData';
import { cleanJsonString, clampValue } from './utils';

export default function usePartnerDocs() {
  const [realEndpoints, setRealEndpoints] = useState([]);
  const [rawProjectData, setRawProjectData] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeEpId, setActiveEpId] = useState(null);
  const [authToken, setAuthToken] = useState('pvi_secret_access_key_2026');
  const [requestBodies, setRequestBodies] = useState({});
  const [apiResponses, setApiResponses] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedLang, setSelectedLang] = useState('curl');
  const [isFormMode, setIsFormMode] = useState(true);

  const middleScrollRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const apiRefs = useRef({});
  const isClickScrolling = useRef(false);
  const observerRef = useRef(null);

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

  const categories = Array.from(new Set(activeEndpoints.map(e => e.category || "CHUNG")));

  return {
    rawProjectData,
    showPermissionModal,
    setShowPermissionModal,
    activeEpId,
    authToken,
    setAuthToken,
    requestBodies,
    apiResponses,
    setApiResponses,
    loadingStates,
    selectedLang,
    setSelectedLang,
    isFormMode,
    setIsFormMode,
    middleScrollRef,
    sidebarScrollRef,
    apiRefs,
    handleTogglePermission,
    activeEndpoints,
    currentActiveEp,
    handleFormFieldChange,
    handleTextareaChange,
    handleExecuteSandbox,
    scrollToApi,
    categories,
  };
}
