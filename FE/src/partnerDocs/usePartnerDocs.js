// src/partnerDocs/usePartnerDocs.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_ENDPOINTS, VALIDATION_LIMITS } from '../MockData';
import { cleanJsonString, clampValue } from './utils';
import {
  getPartners,
  getAccounts,
  getPermissionProfiles
} from '../services/localStorageService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchUploadedEndpoints() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/documents/uploaded`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default function usePartnerDocs() {
  const [activeEpId, setActiveEpId] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [requestBodies, setRequestBodies] = useState({});
  const [apiResponses, setApiResponses] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedLang, setSelectedLang] = useState('curl');
  const [isFormMode, setIsFormMode] = useState(true);
  const [uploadedEndpoints, setUploadedEndpoints] = useState([]);

  const middleScrollRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const apiRefs = useRef({});
  const isClickScrolling = useRef(false);
  const observerRef = useRef(null);

  const [activeEndpoints, setActiveEndpoints] = useState([]);

  const mergeEndpoints = useCallback((defaultEps, uploadedEps) => {
    const merged = [...defaultEps];
    const existingIds = new Set(defaultEps.map(ep => ep.id));
    uploadedEps.forEach(ep => {
      if (!existingIds.has(ep.id)) {
        merged.push(ep);
        existingIds.add(ep.id);
      }
    });
    return merged;
  }, []);

  useEffect(() => {
    (async () => {
      const uploaded = await fetchUploadedEndpoints();
      setUploadedEndpoints(uploaded);

      const savedUser = localStorage.getItem('user_info');
      if (!savedUser) {
        setActiveEndpoints(mergeEndpoints(DEFAULT_ENDPOINTS, uploaded));
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
          setActiveEndpoints(mergeEndpoints(DEFAULT_ENDPOINTS, uploaded));
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

        const allowedSet = new Set((partner.allowedApis || []));
        if (allowedSet.size === 0) {
          profileIds.forEach(pid => {
            const prof = profiles.find(pr => pr.id === pid);
            if (prof && prof.allowedApis) {
              prof.allowedApis.forEach(aid => allowedSet.add(aid));
            }
          });
        }
        const filtered = DEFAULT_ENDPOINTS.filter(ep => allowedSet.has(ep.id));
        const filteredUploaded = uploaded.filter(ep => allowedSet.has(ep.id));
        setActiveEndpoints(mergeEndpoints(filtered, filteredUploaded));
      } catch (e) {
        console.error("Lỗi phân quyền:", e);
        setActiveEndpoints(mergeEndpoints(DEFAULT_ENDPOINTS, uploaded));
      }
    })();
  }, [mergeEndpoints]);

  useEffect(() => {
    setRequestBodies(prev => {
      const next = { ...prev };
      activeEndpoints.forEach(ep => {
        if (!(ep.id in next)) {
          next[ep.id] = ep.requestSample ? cleanJsonString(ep.requestSample) : '{}';
        }
      });
      Object.keys(next).forEach(id => {
        if (!activeEndpoints.find(ep => ep.id === id)) delete next[id];
      });
      return next;
    });
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

  const handleExecuteSandbox = async (id, responseFormat) => {
    if (!id) return;
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    try {
      const currentEp = activeEndpoints.find(e => e.id === id);
      let requestBody = {};
      try {
        requestBody = JSON.parse(requestBodies[id] || '{}');
      } catch (e) {
        requestBody = {};
      }
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const auth = authToken || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth ? { 'Authorization': `Bearer ${auth}` } : {}),
        },
        body: JSON.stringify({
          endpointId: id,
          method: currentEp?.method || 'POST',
          path: currentEp?.path || '',
          requestBody
        })
      });
      const data = await res.json();
      setApiResponses(prev => ({ ...prev, [id]: data.data || data }));
    } catch (err) {
      setApiResponses(prev => ({ ...prev, [id]: { status: 'error', message: err.message } }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
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

  const refreshUploadedEndpoints = useCallback(async () => {
    const uploaded = await fetchUploadedEndpoints();
    setUploadedEndpoints(uploaded);

    const savedUser = localStorage.getItem('user_info');
    if (!savedUser) {
      setActiveEndpoints(mergeEndpoints(DEFAULT_ENDPOINTS, uploaded));
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') {
        setActiveEndpoints(mergeEndpoints(DEFAULT_ENDPOINTS, uploaded));
        return;
      }
      const accounts = getAccounts();
      const partners = await getPartners();
      const profiles = getPermissionProfiles();
      const account = accounts.find(a => a.email.toLowerCase() === user.email.toLowerCase());
      if (!account) { setActiveEndpoints([]); return; }
      const partner = partners.find(p => p.accountId === account.id);
      if (!partner || partner.status !== 'active') { setActiveEndpoints([]); return; }
      const profileIds = partner.profileIds || (partner.profileId ? [partner.profileId] : []);
      const allowedSet = new Set((partner.allowedApis || []));
      if (allowedSet.size === 0) {
        profileIds.forEach(pid => {
          const prof = profiles.find(pr => pr.id === pid);
          if (prof && prof.allowedApis) prof.allowedApis.forEach(aid => allowedSet.add(aid));
        });
      }
      const filtered = DEFAULT_ENDPOINTS.filter(ep => allowedSet.has(ep.id));
      const filteredUploaded = uploaded.filter(ep => allowedSet.has(ep.id));
      setActiveEndpoints(mergeEndpoints(filtered, filteredUploaded));
    } catch {
      setActiveEndpoints(mergeEndpoints(DEFAULT_ENDPOINTS, uploaded));
    }
  }, [mergeEndpoints]);

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
    refreshUploadedEndpoints,
  };
}