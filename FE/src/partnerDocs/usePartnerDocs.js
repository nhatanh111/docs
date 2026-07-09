// src/partnerDocs/usePartnerDocs.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_ENDPOINTS, VALIDATION_LIMITS } from '../MockData';
import { cleanJsonString, clampValue } from './utils';
import {
  getPartners,
  getAccounts,
  getPermissionProfiles,
  getUploadedEndpoints
} from '../services/localStorageService';

export default function usePartnerDocs() {
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

  const [activeEndpoints, setActiveEndpoints] = useState([]);

  useEffect(() => {
    (async () => {
      const savedUser = localStorage.getItem('user_info');
      if (!savedUser) {
        setActiveEndpoints(DEFAULT_ENDPOINTS);
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
          setActiveEndpoints([...DEFAULT_ENDPOINTS, ...getUploadedEndpoints()]);
          return;
        }

        const accounts = getAccounts();
        const partners = await getPartners();
        const profiles = getPermissionProfiles();

        const account = accounts.find(a => a.email.toLowerCase() === user.email.toLowerCase());
        if (!account) {
          setActiveEndpoints([]);
          return;
        }

        const partner = partners.find(p => p.accountId === account.id);
        if (!partner) {
          setActiveEndpoints([]);
          return;
        }

        if (partner.status !== 'active') {
          setActiveEndpoints([]);
          return;
        }

        const profileIds = partner.profileIds || (partner.profileId ? [partner.profileId] : []);
        if (profileIds.length === 0) {
          setActiveEndpoints([]);
          return;
        }

        const allowedSet = new Set();
        profileIds.forEach(pid => {
          const prof = profiles.find(pr => pr.id === pid);
          if (prof && prof.allowedApis) {
            prof.allowedApis.forEach(aid => allowedSet.add(aid));
          }
        });
        const allApis = [...DEFAULT_ENDPOINTS, ...getUploadedEndpoints()];
        const filtered = allApis.filter(ep => allowedSet.has(ep.id));
        setActiveEndpoints(filtered);
      } catch (e) {
        console.error("Lỗi phân quyền:", e);
        setActiveEndpoints(DEFAULT_ENDPOINTS);
      }
    })();
  }, []);

  useEffect(() => {
    const initialBodies = {};
    activeEndpoints.forEach(ep => {
      const sampleText = ep.requestSample ? cleanJsonString(ep.requestSample) : '{}';
      initialBodies[ep.id] = sampleText;
    });
    setRequestBodies(initialBodies);
  }, [activeEndpoints]);

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
    activeEndpoints,
    currentActiveEp,
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
    handleTextareaChange,
    handleFormFieldChange,
    handleExecuteSandbox,
    scrollToApi,
    categories,
  };
}