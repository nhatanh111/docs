
import { accountsApi, partnersApi } from './api';

const ACCOUNTS_KEY = 'pvi_accounts';
const PARTNERS_KEY = 'pvi_partners';
const PERMISSION_CATEGORIES_KEY = 'pvi_permission_categories';
const API_GROUPS_KEY = 'pvi_api_groups';
const PROFILES_KEY = 'pvi_permission_profiles';
const UPLOADED_ENDPOINTS_KEY = 'pvi_uploaded_endpoints';

const tryAPI = async (apiFn, fallbackFn) => {
  try {
    const result = await apiFn();
    return result;
  } catch {
    return fallbackFn();
  }
};

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Dữ liệu mặc định — không chứa password plaintext
export const FALLBACK_ACCOUNTS = [
  { id: 1, email: "admin@pvi.com", role: "ADMIN", status: "Active", description: "Quản trị viên" },
  { id: 2, email: "momo@pvi.com", role: "ĐỐI TÁC", status: "Active", description: "Tài khoản Ví MoMo" },
  { id: 3, email: "vifo@pvi.com", role: "ĐỐI TÁC", status: "Active", description: "Tài khoản VIFO" },
  { id: 4, email: "zalopay@pvi.com", role: "ĐỐI TÁC", status: "Inactive", description: "Tài khoản ZaloPay" },
  { id: 5, email: "vnpay@pvi.com", role: "ĐỐI TÁC", status: "Active", description: "Tài khoản VNPay" }
];

export const FALLBACK_PROFILES = [
  {
    id: 'prof-1',
    name: 'Cơ bản & Tham chiếu',
    description: 'Chỉ cho phép gọi các API tra cứu danh mục và thông tin cơ bản',
    allowedApis: ['auth-api-keys', 'auth-signature', 'auth-headers', 'api-get-car-categories', 'api-query-order', 'api-download-pdf', 'ref-dictionary', 'ref-status-codes', 'changelog-versions']
  },
  {
    id: 'prof-2',
    name: 'Đối tác Xe máy',
    description: 'Cho phép tích hợp toàn bộ API tính phí và cấp đơn bảo hiểm Xe Máy',
    allowedApis: ['auth-api-keys', 'auth-signature', 'auth-headers', 'api-calculate-premium-moto', 'api-insert-moto', 'api-get-car-categories', 'ref-dictionary', 'ref-status-codes']
  },
  {
    id: 'prof-3',
    name: 'Đối tác Ô tô & Bồi thường',
    description: 'Được quyền tính phí, cấp đơn Ô tô và khai báo bồi thường trực tuyến',
    allowedApis: ['auth-api-keys', 'auth-signature', 'auth-headers', 'api-calculate-premium-oto', 'api-insert-oto', 'api-get-car-categories', 'api-submit-claim', 'ref-dictionary', 'ref-status-codes']
  },
  {
    id: 'prof-4',
    name: 'Toàn quyền tích hợp',
    description: 'Được phép gọi tất cả các API đang hoạt động trên hệ thống PVI',
    allowedApis: [
      'auth-api-keys', 'auth-signature', 'auth-headers',
      'api-calculate-premium-moto', 'api-insert-moto',
      'api-calculate-premium-oto', 'api-insert-oto',
      'api-get-car-categories', 'api-query-order', 'api-download-pdf',
      'api-submit-claim', 'api-einvoice-issue', 'api-recon-daily',
      'api-agent-commission', 'api-endorse-cancel', 'api-crm-renewal-check',
      'api-uw-risk-assess', 'api-reinsurance-share', 'ref-dictionary',
      'ref-status-codes', 'changelog-versions',
      'api-aqua-fee-quote', 'api-aqua-create-policy', 'api-aqua-query-policy',
      'api-aqua-cancel-policy', 'api-vatcb-create', 'api-vatcb-query'
    ]
  }
];

export const FALLBACK_PARTNERS = [
  { id: "pt-1", name: "Ví Điện Tử MoMo", clientId: "MOMO_PVI_2026", status: "active", accountId: 2, profileIds: ['prof-4'] },
  { id: "pt-2", name: "Nền tảng VIFO", clientId: "VIFO_INSURTECH", status: "active", accountId: 3, profileIds: ['prof-2'] },
  { id: "pt-3", name: "Ví Điện Tử ZaloPay", clientId: "ZALOPAY_GATEWAY", status: "inactive", accountId: 4, profileIds: ['prof-1'] },
  { id: "pt-4", name: "Cổng VNPay", clientId: "VNPAY_BANKING", status: "active", accountId: 5, profileIds: ['prof-3'] },
  { id: "pt-5", name: "Công ty Bảo hiểm XYZ", clientId: "XYZ_INSURANCE", status: "active", accountId: null, profileIds: ['prof-1'] }
];

// --- Accounts ---
const HASH_123 = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';

const seedAccounts = () => {
  const seeded = FALLBACK_ACCOUNTS.map(acc => ({ ...acc, passwordHash: HASH_123 }));
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seeded));
  return seeded;
};

export const getAccounts = () => {
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0 && parsed[0].passwordHash) return parsed;
    } catch(e) {}
  }
  return seedAccounts();
};

export const saveAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const addAccount = async (account) => {
  try {
    const result = await accountsApi.create(account);
    const accounts = getAccounts();
    const updated = [...accounts, { ...result, passwordHash: result.passwordHash }];
    saveAccounts(updated);
    return result;
  } catch {
    const accounts = getAccounts();
    const newId = accounts.length ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
    const { password, ...rest } = account;
    const newAccount = {
      ...rest,
      id: newId,
      passwordHash: password ? await hashPassword(password) : undefined
    };
    const updated = [...accounts, newAccount];
    saveAccounts(updated);
    return newAccount;
  }
};

export const updateAccount = async (id, data) => {
  try {
    const result = await accountsApi.update(id, data);
    const accounts = getAccounts();
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...result };
      saveAccounts(accounts);
    }
    return result;
  } catch {
    const accounts = getAccounts();
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Account not found');
    const existing = accounts[index];
    const { password, ...rest } = data;
    const updated = {
      ...existing,
      ...rest,
      passwordHash: password ? await hashPassword(password) : existing.passwordHash
    };
    accounts[index] = updated;
    saveAccounts(accounts);
    return updated;
  }
};

export const deleteAccount = async (id) => {
  try {
    await accountsApi.delete(id);
  } catch {}
  const accounts = getAccounts();
  const filtered = accounts.filter(a => a.id !== id);
  saveAccounts(filtered);
};

export const verifyAccountPassword = async (email, password) => {
  const accounts = getAccounts();
  const account = accounts.find(a => a.email.trim().toLowerCase() === email.trim().toLowerCase());
  if (!account) return null;
  const inputHash = await hashPassword(password.trim());
  return inputHash === account.passwordHash ? account : null;
};

export const hashPasswordForStorage = hashPassword;

// --- Partners ---
export const getPartners = async () => {
  try {
    const result = await partnersApi.list();
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(result));
    return result;
  } catch {
    return getPartnersLocal();
  }
};

export const getPartnersLocal = () => {
  const stored = localStorage.getItem(PARTNERS_KEY);
  let partners = [];
  if (stored) {
    try { partners = JSON.parse(stored); } catch(e) { partners = FALLBACK_PARTNERS; }
  } else {
    partners = FALLBACK_PARTNERS;
  }
  
  // Migration: profileId (cũ) → profileIds (mới)
  const profiles = getPermissionProfiles();
  let updated = false;
  partners = partners.map(p => {
    const next = { ...p };
    if (next.profileId && !next.profileIds) {
      next.profileIds = [next.profileId];
      delete next.profileId;
      updated = true;
    }
    if (!next.profileIds) {
      next.profileIds = [];
    }
    // Đảm bảo mỗi đối tác đều có danh sách allowedApis riêng dựa trên profileIds nếu chưa có
    if (!next.allowedApis) {
      const allowedSet = new Set();
      (next.profileIds || []).forEach(pid => {
        const prof = profiles.find(pr => pr.id === pid);
        if (prof && prof.allowedApis) {
          prof.allowedApis.forEach(aid => allowedSet.add(aid));
        }
      });
      next.allowedApis = Array.from(allowedSet);
      updated = true;
    }
    return next;
  });
  if (updated) {
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  }
  return partners;
};

export const savePartners = (partners) => {
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
};

export const addPartner = async (partner) => {
  try {
    const result = await partnersApi.create(partner);
    const partners = getPartnersLocal();
    const updated = [...partners, result];
    savePartners(updated);
    return result;
  } catch {
    const partners = getPartnersLocal();
    const maxId = partners.reduce((max, p) => {
      const num = parseInt(p.id.split('-')[1]) || 0;
      return num > max ? num : max;
    }, 0);
    const newId = `pt-${maxId + 1}`;
    const profiles = getPermissionProfiles();
    const allowedSet = new Set();
    (partner.profileIds || []).forEach(pid => {
      const prof = profiles.find(pr => pr.id === pid);
      if (prof && prof.allowedApis) {
        prof.allowedApis.forEach(aid => allowedSet.add(aid));
      }
    });
    const newPartner = { ...partner, id: newId, allowedApis: Array.from(allowedSet) };
    const updated = [...partners, newPartner];
    savePartners(updated);
    return newPartner;
  }
};

export const updatePartner = async (id, data) => {
  try {
    const result = await partnersApi.update(id, data);
    const partners = getPartnersLocal();
    const index = partners.findIndex(p => p.id === id);
    if (index !== -1) {
      partners[index] = { ...partners[index], ...result };
      savePartners(partners);
    }
    return result;
  } catch {
    const partners = getPartnersLocal();
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Partner not found');
    const oldPartner = partners[index];
    let allowedApis = data.allowedApis || oldPartner.allowedApis;
    if (data.profileIds && JSON.stringify(data.profileIds) !== JSON.stringify(oldPartner.profileIds || [])) {
      const profiles = getPermissionProfiles();
      const allowedSet = new Set();
      (data.profileIds || []).forEach(pid => {
        const prof = profiles.find(pr => pr.id === pid);
        if (prof && prof.allowedApis) {
          prof.allowedApis.forEach(aid => allowedSet.add(aid));
        }
      });
      allowedApis = Array.from(allowedSet);
    }
    const updated = { ...oldPartner, ...data, allowedApis };
    partners[index] = updated;
    savePartners(partners);
    return updated;
  }
};

export const deletePartner = async (id) => {
  try {
    await partnersApi.delete(id);
  } catch {}
  const partners = getPartnersLocal();
  const filtered = partners.filter(p => p.id !== id);
  savePartners(filtered);
};

export const getPartnerDefaultKey = (clientId) => {
  if (!clientId) return null;
  return `pvi_${clientId.toLowerCase()}_2026`;
};

// --- Permission Profiles ---
export const getPermissionProfiles = () => {
  const stored = localStorage.getItem(PROFILES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  localStorage.setItem(PROFILES_KEY, JSON.stringify(FALLBACK_PROFILES));
  return FALLBACK_PROFILES;
};

export const savePermissionProfiles = (profiles) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const addPermissionProfile = (profile) => {
  const profiles = getPermissionProfiles();
  const maxId = profiles.reduce((max, p) => {
    const num = parseInt(p.id.split('-')[1]) || 0;
    return num > max ? num : max;
  }, 0);
  const newId = `prof-${maxId + 1}`;
  const newProfile = { ...profile, id: newId };
  const updated = [...profiles, newProfile];
  savePermissionProfiles(updated);
  return newProfile;
};

export const updatePermissionProfile = (id, data) => {
  const profiles = getPermissionProfiles();
  const index = profiles.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Permission profile not found');
  const updated = { ...profiles[index], ...data };
  profiles[index] = updated;
  savePermissionProfiles(profiles);
  return updated;
};

export const deletePermissionProfile = (id) => {
  const profiles = getPermissionProfiles();
  const filtered = profiles.filter(p => p.id !== id);
  savePermissionProfiles(filtered);
};

// --- Permissions (categories & apiGroups) ---
const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Location', icon: '📍', expanded: true },
  { id: 'cat-2', name: 'Bảo hiểm Xe máy', icon: '🏍️', expanded: false },
  { id: 'cat-3', name: 'Bảo hiểm Ô tô', icon: '🚗', expanded: false },
  { id: 'cat-4', name: 'Bảo hiểm Sức khỏe', icon: '🏥', expanded: false },
  { id: 'cat-5', name: 'Bảo hiểm Tài sản', icon: '🏠', expanded: false },
  { id: 'cat-6', name: 'Bảo hiểm Du lịch', icon: '✈️', expanded: false }
];

const DEFAULT_API_GROUPS = [
  {
    categoryId: 'cat-1',
    name: 'Location',
    apis: [
      { id: 'api-loc-1', method: 'GET', path: '/location/countries', name: 'Lấy danh sách quốc gia', allowedPartners: [1, 2, 4] },
      { id: 'api-loc-2', method: 'GET', path: '/location/provinces', name: 'Lấy danh sách Tỉnh/Thành phố', allowedPartners: [1, 2, 4] },
      { id: 'api-loc-3', method: 'GET', path: '/location/districts', name: 'Lấy danh sách Quận/Huyện', allowedPartners: [1, 2] },
      { id: 'api-loc-4', method: 'GET', path: '/location/wards', name: 'Lấy danh sách Phường/Xã', allowedPartners: [1, 2] },
      { id: 'api-loc-5', method: 'POST', path: '/location/search', name: 'Tìm địa chỉ theo mã thành phố và mã phường', allowedPartners: [1, 2, 4] }
    ]
  },
  {
    categoryId: 'cat-2',
    name: 'Bảo hiểm Xe máy',
    apis: [
      { id: 'api-1', method: 'POST', path: '/moto/calculate', name: 'Tính phí bảo hiểm xe máy', allowedPartners: [1, 2] },
      { id: 'api-2', method: 'POST', path: '/moto/insert', name: 'Đăng ký cấp ấn chỉ xe máy', allowedPartners: [1] },
      { id: 'api-3', method: 'GET', path: '/moto/query', name: 'Tra cứu thông tin xe máy', allowedPartners: [1, 2] }
    ]
  },
  {
    categoryId: 'cat-3',
    name: 'Bảo hiểm Ô tô',
    apis: [
      { id: 'api-4', method: 'POST', path: '/oto/calculate', name: 'Tính phí bảo hiểm ô tô', allowedPartners: [2, 4] },
      { id: 'api-5', method: 'POST', path: '/oto/insert', name: 'Đăng ký cấp ấn chỉ ô tô', allowedPartners: [2] },
      { id: 'api-6', method: 'GET', path: '/oto/query', name: 'Tra cứu thông tin ô tô', allowedPartners: [2, 4] }
    ]
  },
  {
    categoryId: 'cat-4',
    name: 'Bảo hiểm Sức khỏe',
    apis: [
      { id: 'api-7', method: 'POST', path: '/health/register', name: 'Đăng ký bảo hiểm sức khỏe', allowedPartners: [] },
      { id: 'api-8', method: 'GET', path: '/health/benefits', name: 'Tra cứu quyền lợi bảo hiểm', allowedPartners: [] }
    ]
  }
];

export const getPermissionCategories = () => {
  const stored = localStorage.getItem(PERMISSION_CATEGORIES_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  localStorage.setItem(PERMISSION_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
};

export const savePermissionCategories = (categories) => {
  localStorage.setItem(PERMISSION_CATEGORIES_KEY, JSON.stringify(categories));
};

export const getApiGroups = () => {
  const stored = localStorage.getItem(API_GROUPS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  localStorage.setItem(API_GROUPS_KEY, JSON.stringify(DEFAULT_API_GROUPS));
  return DEFAULT_API_GROUPS;
};

export const saveApiGroups = (groups) => {
  localStorage.setItem(API_GROUPS_KEY, JSON.stringify(groups));
};

// --- Uploaded API Endpoints ---
export const getUploadedEndpoints = () => {
  const stored = localStorage.getItem(UPLOADED_ENDPOINTS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return [];
};

export const saveUploadedEndpoints = (endpoints) => {
  localStorage.setItem(UPLOADED_ENDPOINTS_KEY, JSON.stringify(endpoints));
};

export const addUploadedEndpoints = (newEndpoints) => {
  const existing = getUploadedEndpoints();
  const existingIds = new Set(existing.map(ep => ep.id));
  const uniqueNew = newEndpoints.filter(ep => !existingIds.has(ep.id));
  const updated = [...existing, ...uniqueNew];
  saveUploadedEndpoints(updated);
  return { updated, skipped: newEndpoints.length - uniqueNew.length };
};

export const deleteUploadedEndpoint = (id) => {
  const endpoints = getUploadedEndpoints();
  const filtered = endpoints.filter(ep => ep.id !== id);
  saveUploadedEndpoints(filtered);
  return filtered;
};