import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import * as yaml from 'js-yaml';
import mammoth from 'mammoth';
import { DEFAULT_ENDPOINTS } from './MockData';
import {
  getPermissionProfiles,
  savePermissionProfiles,
  addPermissionProfile,
  updatePermissionProfile,
  deletePermissionProfile,
  getPartners,
  getPartnersLocal,
  savePartners,
  addUploadedEndpoints,
  deleteUploadedEndpoint,
  getUploadedEndpoints
} from './services/localStorageService';


const METHOD_COLORS = {
  POST: 'bg-emerald-600',
  PUT: 'bg-amber-600',
  PATCH: 'bg-orange-500',
  GET: 'bg-blue-500',
  DELETE: 'bg-red-500',
  INFO: 'bg-blue-500',
  DATA: 'bg-blue-500',
  CODE: 'bg-purple-500',
  HASH: 'bg-purple-500',
  VER: 'bg-slate-500',
};

const methodBadgeClass = (method) => METHOD_COLORS[method] || 'bg-slate-500';

const groupByCategory = (endpoints) => {
  const map = {};
  endpoints.forEach(ep => {
    const cat = ep.category || 'CHUNG';
    if (!map[cat]) map[cat] = [];
    map[cat].push(ep);
  });
  return Object.entries(map).map(([category, apis]) => ({ category, apis }));
};


// Dropdown chọn nhiều nhóm quyền với Search
function MultiProfileDropdown({ profiles, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selectedProfiles = profiles.filter(p => value.includes(p.id));

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lọc profiles theo search
  const filtered = profiles.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id) => {
    const next = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id];
    onChange(next);
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="w-full flex items-center justify-between gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer outline-none hover:border-blue-300 focus:border-blue-400 transition-all min-h-[32px]"
      >
        <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
          {selectedProfiles.length === 0 ? (
            <span className="text-slate-400 font-normal">-- Chưa gán --</span>
          ) : selectedProfiles.length <= 2 ? (
            selectedProfiles.map(sp => (
              <span key={sp.id} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold truncate max-w-[100px]">{sp.name}</span>
            ))
          ) : (
            <>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">{selectedProfiles[0].name}</span>
              <span className="text-blue-500 text-[10px] font-bold">+{selectedProfiles.length - 1}</span>
            </>
          )}
        </div>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Tìm nhóm quyền..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Option list */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">Không tìm thấy nhóm quyền nào</div>
            )}

            {filtered.map(prof => {
              const isChecked = value.includes(prof.id);
              return (
                <label
                  key={prof.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors border-b border-slate-100 last:border-0 text-xs hover:bg-blue-50/30 ${isChecked ? 'bg-blue-50/40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(prof.id)}
                    className="accent-blue-600 w-3.5 h-3.5"
                  />
                  <span className="font-bold text-slate-700">{prof.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Modal Thêm/Sửa Nhóm quyền

function ProfileModal({ isOpen, mode, currentProfile, setCurrentProfile, onSave, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">{mode === 'add' ? 'Thêm Nhóm Quyền Mới' : 'Sửa Nhóm Quyền'}</h3>
            <p className="text-slate-400 text-xs">Cấu hình tên và mô tả nhóm quyền tích hợp</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg">✕</button>
        </div>
        <form onSubmit={onSave} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tên nhóm quyền *</label>
            <input
              type="text" required placeholder="VD: Đối tác Bán lẻ Xe Máy"
              value={currentProfile.name || ''}
              onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-semibold outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mô tả nhóm quyền</label>
            <textarea
              rows="3" placeholder="Mô tả các API được phép truy cập trong nhóm này..."
              value={currentProfile.description || ''}
              onChange={(e) => setCurrentProfile({ ...currentProfile, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm resize-none outline-none focus:border-blue-400"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-5 rounded-lg text-sm transition-all">Đóng</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-all">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Upload file API
function UploadModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');

  const SUPPORTED_FORMATS = '.json,.xlsx,.xls,.csv,.xml,.yaml,.yml,.docx';

  const normalizeRow = (row) => {
    // Map common column name variations from Excel/CSV
    const map = {
      id: row.id || row.ID || row.Id || row['API ID'] || row.api_id || row.apiId || row['STT'] || '',
      category: row.category || row.Category || row.CATEGORY || row['Danh mục'] || row.danh_muc || row['Nhóm'] || row.nhom || '',
      method: row.method || row.Method || row.METHOD || row['Phương thức'] || row.phuong_thuc || row['HTTP'] || row.http || '',
      path: row.path || row.Path || row.PATH || row['Đường dẫn'] || row.duong_dan || row.endpoint || row.Endpoint || row['API'] || row.api || '',
      description: row.description || row.Description || row.DESCRIPTION || row['Mô tả'] || row.mo_ta || row.name || row.Name || row['Chức năng'] || '',
      requestSample: row.requestSample || row.request_sample || row.RequestSample || row['Request mẫu'] || row['request_sample'] || row['Request'] || null,
      responseFormat: row.responseFormat || row.response_format || row.ResponseFormat || row['Response mẫu'] || row['response_format'] || row['Response'] || null,
    };
    return map;
  };

  const validateEndpoints = (endpoints) => {
    const valid = endpoints.every(item => item.id && item.category && item.method && item.path);
    if (!valid) {
      setError('Mỗi API cần có: id, category, method, path');
      return false;
    }
    return true;
  };

  const parseJson = (content) => {
    const json = JSON.parse(content);
    let endpoints = [];
    if (Array.isArray(json)) {
      endpoints = json;
    } else if (json.endpoints && Array.isArray(json.endpoints)) {
      endpoints = json.endpoints;
    } else if (json.items && Array.isArray(json.items)) {
      endpoints = json.items;
    } else if (json.paths) {
      // OpenAPI / Swagger format
      endpoints = Object.entries(json.paths).flatMap(([path, methods]) =>
        Object.entries(methods).map(([method, spec]) => ({
          id: (method + '-' + path).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase(),
          category: 'openapi',
          method: method.toUpperCase(),
          path: path,
          description: spec.summary || spec.description || path,
          requestSample: null,
          responseFormat: null
        }))
      );
    } else {
      setError('Không tìm thấy danh sách API trong file JSON');
      return null;
    }
    return endpoints;
  };

  const parseYaml = (content) => {
    const doc = yaml.load(content);
    let endpoints = [];
    if (Array.isArray(doc)) {
      endpoints = doc;
    } else if (doc.endpoints && Array.isArray(doc.endpoints)) {
      endpoints = doc.endpoints;
    } else if (doc.items && Array.isArray(doc.items)) {
      endpoints = doc.items;
    } else if (doc.paths) {
      // OpenAPI YAML format
      endpoints = Object.entries(doc.paths).flatMap(([path, methods]) =>
        Object.entries(methods).map(([method, spec]) => ({
          id: (method + '-' + path).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase(),
          category: 'openapi',
          method: method.toUpperCase(),
          path: path,
          description: spec.summary || spec.description || path,
          requestSample: null,
          responseFormat: null
        }))
      );
    } else {
      setError('Không tìm thấy danh sách API trong file YAML');
      return null;
    }
    return endpoints;
  };

  const parseXml = (content) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) throw new Error(parseError.textContent);

    // Support: <endpoints><endpoint>...</endpoint></endpoints> or <root><item>...</item></root>
    const items = xmlDoc.querySelectorAll('endpoint, item, api, row');
    if (items.length === 0) {
      // Try direct children of root
      const root = xmlDoc.documentElement;
      if (root.children.length > 0) {
        return Array.from(root.children).map(el => {
          const get = (tag) => {
            const child = el.querySelector(tag);
            return child ? child.textContent.trim() : '';
          };
          return {
            id: get('id') || get('ID') || get('apiId') || get('api_id'),
            category: get('category') || get('Category') || get('danh-muc') || get('nhom'),
            method: get('method') || get('Method') || get('phuong-thuc') || get('http'),
            path: get('path') || get('Path') || get('endpoint') || get('url') || get('api'),
            description: get('description') || get('Description') || get('mo-ta') || get('name'),
            requestSample: get('requestSample') || get('request-sample') || null,
            responseFormat: get('responseFormat') || get('response-format') || null,
          };
        });
      }
      setError('Không tìm thấy API nào trong file XML');
      return null;
    }
    return Array.from(items).map(el => {
      const get = (tag) => {
        const child = el.querySelector(tag);
        return child ? child.textContent.trim() : '';
      };
      return {
        id: get('id') || get('ID') || get('apiId'),
        category: get('category') || get('Category'),
        method: get('method') || get('Method'),
        path: get('path') || get('Path') || get('endpoint') || get('url'),
        description: get('description') || get('Description') || get('name'),
        requestSample: get('requestSample') || null,
        responseFormat: get('responseFormat') || null,
      };
    });
  };

  const parseExcel = (data) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    return rows.map(normalizeRow);
  };

  const parseWord = async (arrayBuffer) => {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');
    if (tables.length === 0) {
      setError('Không tìm thấy bảng nào trong file Word. Vui lòng tạo bảng với header: id, category, method, path.');
      return null;
    }
    // Parse first table
    const table = tables[0];
    const headers = Array.from(table.querySelectorAll('tr:first-child th, tr:first-child td')).map(th => th.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tr')).slice(1);
    if (rows.length === 0) {
      setError('Bảng trong file Word không có dòng dữ liệu');
      return null;
    }
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (cells[i]?.textContent || '').trim(); });
      return normalizeRow(obj);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setParsedData(null);

    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const endpoints = parseJson(event.target.result);
          if (!endpoints || !validateEndpoints(endpoints)) return;
          setParsedData(endpoints);
        } catch (e) {
          setError('Lỗi đọc file JSON: ' + e.message);
        }
      };
      reader.onerror = () => setError('Lỗi đọc file');
      reader.readAsText(selectedFile);
    } else if (['yaml', 'yml'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const endpoints = parseYaml(event.target.result);
          if (!endpoints || !validateEndpoints(endpoints)) return;
          setParsedData(endpoints);
        } catch (e) {
          setError('Lỗi đọc file YAML: ' + e.message);
        }
      };
      reader.onerror = () => setError('Lỗi đọc file');
      reader.readAsText(selectedFile);
    } else if (ext === 'xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const endpoints = parseXml(event.target.result);
          if (!endpoints || !validateEndpoints(endpoints)) return;
          setParsedData(endpoints);
        } catch (e) {
          setError('Lỗi đọc file XML: ' + e.message);
        }
      };
      reader.onerror = () => setError('Lỗi đọc file');
      reader.readAsText(selectedFile);
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const endpoints = parseExcel(event.target.result);
          const missing = endpoints.filter(item => !item.id || !item.category || !item.method || !item.path);
          if (missing.length > 0) {
            setError(`Có ${missing.length} dòng thiếu trường bắt buộc (id, category, method, path). Dòng đầu tiên phải là header.`);
            return;
          }
          setParsedData(endpoints);
        } catch (e) {
          setError('Lỗi đọc file Excel/CSV: ' + e.message);
        }
      };
      reader.onerror = () => setError('Lỗi đọc file');
      reader.readAsArrayBuffer(selectedFile);
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const endpoints = await parseWord(event.target.result);
          if (!endpoints) return;
          const missing = endpoints.filter(item => !item.id || !item.category || !item.method || !item.path);
          if (missing.length > 0) {
            setError(`Có ${missing.length} dòng thiếu trường bắt buộc. Kiểm tra header bảng (cần: id, category, method, path).`);
            return;
          }
          setParsedData(endpoints);
        } catch (e) {
          setError('Lỗi đọc file Word: ' + e.message);
        }
      };
      reader.onerror = () => setError('Lỗi đọc file');
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setError('Định dạng file không hỗ trợ. Chấp nhận: JSON, YAML, XML, Excel, CSV, Word (.docx)');
    }
  };

  const handleUpload = () => {
    if (!parsedData) return;
    const fileName = file ? file.name.replace(/\.[^.]+$/, '') : 'Bộ API từ file';
    onUpload(parsedData, fileName);
    setParsedData(null);
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Upload file API</h3>
            <p className="text-slate-400 text-xs">Tải lên file để giải nén danh sách API</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
            <input type="file" accept={SUPPORTED_FORMATS} onChange={handleFileChange} className="hidden" id="file-upload-input" />
            <label htmlFor="file-upload-input" className="cursor-pointer block">
              <div className="text-4xl mb-2">📂</div>
              <p className="font-bold text-slate-700 text-sm">Click để chọn file</p>
              <p className="text-xs text-slate-400 mt-1">
                Hỗ trợ: <strong>JSON</strong>, <strong>YAML</strong>, <strong>XML</strong>, <strong>Excel</strong>, <strong>CSV</strong>, <strong>Word</strong>
              </p>
            </label>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          )}

          {parsedData && !error && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <span>✅</span> Đã đọc <strong>{parsedData.length}</strong> API từ file
              <button
                type="button"
                onClick={() => { setParsedData(null); setFile(null); }}
                className="ml-auto bg-transparent border-0 cursor-pointer text-xs text-slate-400 hover:text-slate-600"
              >✕</button>
            </div>
          )}

          {parsedData && !error && (
            <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
              {parsedData.map((ep, i) => (
                <div key={i} className="px-3 py-1.5 flex items-center gap-2 text-xs">
                  <span className={`text-[8px] px-1 py-0.5 rounded font-black text-white ${methodBadgeClass(ep.method)}`}>{ep.method}</span>
                  <span className="font-mono text-slate-600">{ep.path}</span>
                  <span className="text-slate-400 ml-auto">{ep.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-5 rounded-lg text-sm transition-all">Đóng</button>
          <button
            onClick={handleUpload}
            disabled={!parsedData || !!error}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-all disabled:opacity-50"
          >
            Xem trước
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PermissionsTab({ partners, setPartners, accounts, initialSelectedProfileId, initialSubTab }) {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState(initialSubTab || 'profiles'); // 'profiles' | 'mapping'
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(initialSelectedProfileId || null);
  
  // States cho Profile API Search
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  // States cho Profile Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProfile, setCurrentProfile] = useState({ name: '', description: '', allowedApis: [] });

  // Upload preview
  const [previewEndpoints, setPreviewEndpoints] = useState([]);
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadNotification, setUploadNotification] = useState(null);
  const [expandedPartnerId, setExpandedPartnerId] = useState(null);
  const [partnerApiSearch, setPartnerApiSearch] = useState('');
  const [uploadedVersion, setUploadedVersion] = useState(0);

  // Accordion categories (sub-tab 1)
  const [expandedCategories, setExpandedCategories] = useState({});
  // Accordion categories per partner (sub-tab 2)
  const [expandedPartnerCategories, setExpandedPartnerCategories] = useState({});

  useEffect(() => {
    if (initialSelectedProfileId !== undefined && initialSelectedProfileId !== null) {
      setSelectedProfileId(initialSelectedProfileId);
    }
  }, [initialSelectedProfileId]);

  useEffect(() => {
    if (initialSubTab !== undefined) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    setProfiles(getPermissionProfiles());
  }, []);

  // Auto-dismiss notification after 6s
  useEffect(() => {
    if (!uploadNotification) return;
    const timer = setTimeout(() => setUploadNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [uploadNotification]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  // Merge default + uploaded endpoints
  const allEndpoints = useMemo(
    () => [...DEFAULT_ENDPOINTS, ...getUploadedEndpoints()],
    [uploadedVersion]
  );

  // Group endpoints by category
  const categories = useMemo(() =>
    Array.from(new Set(allEndpoints.map(ep => ep.category || "CHUNG"))),
    [allEndpoints]
  );

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const togglePartnerCategory = (partnerId, cat) => {
    const key = `${partnerId}:${cat}`;
    setExpandedPartnerCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Bật/Tắt quyền gọi API trong profile
  const handleToggleApi = (profileId, apiId) => {
    const updatedProfiles = profiles.map(p => {
      if (p.id === profileId) {
        const allowed = p.allowedApis || [];
        const isAllowed = allowed.includes(apiId);
        const nextAllowed = isAllowed
          ? allowed.filter(id => id !== apiId)
          : [...allowed, apiId];
        return { ...p, allowedApis: nextAllowed };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    savePermissionProfiles(updatedProfiles);
  };

  // Chọn nhanh Bật tất cả / Tắt tất cả API cho category (Chỉ áp dụng với kết quả lọc hiện tại nếu đang search)
  const handleToggleCategoryAll = (profileId, cat, action) => {
    const apisOfCat = allEndpoints.filter(ep => (ep.category || "CHUNG") === cat);
    const filteredApisOfCat = apisOfCat.filter(ep => {
      if (!apiSearchQuery) return true;
      const q = apiSearchQuery.toLowerCase();
      return (
        ep.path?.toLowerCase().includes(q) ||
        t(ep.description)?.toLowerCase().includes(q) ||
        ep.method?.toLowerCase().includes(q)
      );
    });
    const apiIdsToToggle = filteredApisOfCat.map(ep => ep.id);

    const updatedProfiles = profiles.map(p => {
      if (p.id === profileId) {
        const allowed = p.allowedApis || [];
        let nextAllowed = [];
        if (action === 'allow') {
          nextAllowed = Array.from(new Set([...allowed, ...apiIdsToToggle]));
        } else {
          nextAllowed = allowed.filter(id => !apiIdsToToggle.includes(id));
        }
        return { ...p, allowedApis: nextAllowed };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    savePermissionProfiles(updatedProfiles);
  };

  // CRUD Profiles
  const openAddProfile = () => {
    setModalMode('add');
    setCurrentProfile({ name: '', description: '', allowedApis: [] });
    setIsModalOpen(true);
  };

  const openEditProfile = (p) => {
    setModalMode('edit');
    setCurrentProfile({ ...p });
    setIsModalOpen(true);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newProfile = addPermissionProfile(currentProfile);
      setProfiles([...profiles, newProfile]);
      setSelectedProfileId(newProfile.id);
    } else {
      const updated = updatePermissionProfile(currentProfile.id, currentProfile);
      setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
    }
    setIsModalOpen(false);
  };

  const handleDeleteProfile = (id) => {
    if (['prof-1', 'prof-4'].includes(id)) {
      alert('❌ Không thể xóa nhóm quyền hệ thống mặc định!');
      return;
    }
    if (!window.confirm('Xóa nhóm quyền này? Các đối tác thuộc nhóm này sẽ mất cấu hình quyền.')) return;
    deletePermissionProfile(id);
    setProfiles(profiles.filter(p => p.id !== id));
    if (selectedProfileId === id) setSelectedProfileId(null);
  };

  // Upload file — giải nén API ra trang xem trước
  const handleUploadFile = (endpoints, fileName) => {
    setPreviewEndpoints(endpoints);
    setPreviewFileName(fileName);
    setUploadNotification({
      type: 'success',
      message: `✅ Đã giải nén ${endpoints.length} API từ file "${fileName}"`
    });
  };

  // Tạo nhóm quyền từ preview
  const handleCreateProfileFromPreview = () => {
    if (previewEndpoints.length === 0) return;
    const result = addUploadedEndpoints(previewEndpoints);
    const newProfile = addPermissionProfile({
      name: previewFileName,
      description: `Được tạo từ file upload — ${result.updated.length} API`,
      allowedApis: result.updated.map(ep => ep.id)
    });
    setProfiles([...profiles, newProfile]);
    setSelectedProfileId(newProfile.id);
    setPreviewEndpoints([]);
    setPreviewFileName('');
    setUploadedVersion(v => v + 1);
    const newCategories = [...new Set(result.updated.map(ep => ep.category))];
    setExpandedCategories(prev => {
      const next = { ...prev };
      newCategories.forEach(cat => { next[cat] = true; });
      return next;
    });
    setUploadNotification({
      type: 'success',
      message: `✅ Đã tạo nhóm quyền "${previewFileName}" với ${result.updated.length} API${result.skipped > 0 ? ` (bỏ qua ${result.skipped} API trùng ID)` : ''}`
    });
  };

  // Mapping Partner -> Profiles (multi-select)
  const handlePartnerProfileChange = (partnerId, profileIds) => {
    const allowedSet = new Set();
    (profileIds || []).forEach(pid => {
      const prof = profiles.find(p => p.id === pid);
      if (prof && prof.allowedApis) {
        prof.allowedApis.forEach(aid => allowedSet.add(aid));
      }
    });
    const allowedApis = Array.from(allowedSet);
    const updatedPartners = partners.map(p => {
      if (p.id === partnerId) {
        const updatedPartner = { ...p, profileIds: profileIds || [], allowedApis };
        updatePartnerProfile(partnerId, updatedPartner);
        return updatedPartner;
      }
      return p;
    });
    setPartners(updatedPartners);
  };

  // Helper update partner in local storage
  const updatePartnerProfile = (partnerId, data) => {
    const allPartners = getPartnersLocal();
    const index = allPartners.findIndex(p => p.id === partnerId);
    if (index !== -1) {
      allPartners[index] = data;
      savePartners(allPartners);
    }
  };

  // Toggle API cho từng đối tác (override profile)
  const handlePartnerApiToggle = (partnerId, apiId) => {
    const updatedPartners = partners.map(p => {
      if (p.id !== partnerId) return p;
      const current = p.allowedApis || [];
      const next = current.includes(apiId)
        ? current.filter(id => id !== apiId)
        : [...current, apiId];
      const updated = { ...p, allowedApis: next };
      updatePartnerProfile(partnerId, updated);
      return updated;
    });
    setPartners(updatedPartners);
  };

  // Chọn hết / Bỏ hết API trong category cho từng đối tác
  const handlePartnerApiToggleCategoryAll = (partnerId, cat, action) => {
    const apiIdsToToggle = allEndpoints
      .filter(ep => (ep.category || 'CHUNG') === cat)
      .filter(ep => {
        if (!partnerApiSearch) return true;
        const q = partnerApiSearch.toLowerCase();
        return (
          ep.path?.toLowerCase().includes(q) ||
          t(ep.description)?.toLowerCase().includes(q) ||
          ep.method?.toLowerCase().includes(q)
        );
      })
      .map(ep => ep.id);

    const updatedPartners = partners.map(p => {
      if (p.id !== partnerId) return p;
      const current = p.allowedApis || [];
      const next = action === 'allow'
        ? Array.from(new Set([...current, ...apiIdsToToggle]))
        : current.filter(id => !apiIdsToToggle.includes(id));
      const updated = { ...p, allowedApis: next };
      updatePartnerProfile(partnerId, updated);
      return updated;
    });
    setPartners(updatedPartners);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quản lý bộ API</h2>
          <p className="text-xs text-slate-400">Quản lý nhóm quyền tích hợp và cấu hình API cho đối tác</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSubTab('profiles')}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all border-0 ${subTab === 'profiles' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 bg-transparent'}`}
          >
            🛡️ Quản lý Nhóm Quyền ({profiles.length})
          </button>
          <button
            onClick={() => setSubTab('mapping')}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all border-0 ${subTab === 'mapping' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 bg-transparent'}`}
          >
            🤝 Gán quyền cho Đối tác ({partners.length})
          </button>
        </div>
      </div>

      {/* Upload notification & button (global — both tabs) */}
      {uploadNotification && (
        <div className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
          uploadNotification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          <span>{uploadNotification.message}</span>
          <button
            onClick={() => setUploadNotification(null)}
            className="ml-auto bg-transparent border-0 cursor-pointer text-xs opacity-60 hover:opacity-100"
          >✕</button>
        </div>
      )}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-4 rounded-lg transition-all cursor-pointer border-0 shadow-sm"
        >
          📤 Upload file API
        </button>
      </div>

      {/* ==================================================== */}
      {/* SUB-TAB 1: QUẢN LÝ NHÓM QUYỀN */}
      {/* ==================================================== */}
      {subTab === 'profiles' && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List Profiles (Left Side) */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách nhóm</span>
              <button
                onClick={openAddProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-0"
              >
                ➕ Thêm nhóm
              </button>
            </div>

            <div className="space-y-2">
              {profiles.map(p => {
                const partnerCount = partners.filter(part => (part.profileIds || []).includes(p.id)).length;
                const isSelected = selectedProfileId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditProfile(p); }}
                          className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 border-0 bg-transparent cursor-pointer"
                          title="Sửa tên nhóm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}
                          disabled={['prof-1', 'prof-4'].includes(p.id)}
                          className="p-1 rounded text-slate-300 hover:bg-red-50 hover:text-red-500 border-0 bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Xóa nhóm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-normal line-clamp-2">{p.description || 'Chưa có mô tả'}</p>
                    
                    <div className="flex items-center gap-3 mt-3 text-[10px] font-semibold">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {p.allowedApis?.length || 0} API
                      </span>
                      <span className="text-slate-400">
                        {partnerCount} đối tác áp dụng
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Config APIs in Selected Profile (Right Side) */}
          <div className="lg:col-span-2 space-y-4">
            {selectedProfile ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-left">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Đang cấu hình</span>
                    <h3 className="text-base font-black text-slate-800 mt-1">{selectedProfile.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedProfile.description}</p>
                  </div>
                  <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-600">
                    Cấp quyền: <span className="text-blue-600">{selectedProfile.allowedApis?.length || 0} / {allEndpoints.length}</span> API
                  </div>
                </div>

                {/* API Search box for 1000+ API Scalability */}
                <div className="relative" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="🔍 Tìm nhanh API (đường dẫn, tên nghiệp vụ, method...)"
                    value={apiSearchQuery}
                    onChange={(e) => { setApiSearchQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2 pl-10 text-xs outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                  />
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {apiSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setApiSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold border-0 bg-transparent cursor-pointer"
                    >
                      ✕ xóa lọc
                    </button>
                  )}

                  {/* Suggestions dropdown — chỉ show tên category, click để thêm toàn bộ API của category đó */}
                  {showSuggestions && selectedProfile && (() => {
                    const unassignedApis = allEndpoints.filter(ep => !selectedProfile.allowedApis?.includes(ep.id));
                    const suggestions = apiSearchQuery
                      ? unassignedApis.filter(ep => {
                          const q = apiSearchQuery.toLowerCase();
                          return ep.path?.toLowerCase().includes(q) || t(ep.description)?.toLowerCase().includes(q) || ep.method?.toLowerCase().includes(q);
                        })
                      : unassignedApis;
                    const grouped = {};
                    suggestions.forEach(ep => {
                      const cat = ep.category || 'CHUNG';
                      if (!grouped[cat]) grouped[cat] = [];
                      grouped[cat].push(ep);
                    });
                    return (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                        {Object.keys(grouped).length === 0 ? (
                          <div className="p-4 text-xs text-slate-400 text-center italic">Không tìm thấy API nào</div>
                        ) : (
                          Object.entries(grouped).map(([cat, eps]) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => { eps.forEach(ep => { if (!selectedProfile.allowedApis?.includes(ep.id)) handleToggleApi(selectedProfile.id, ep.id); }); setShowSuggestions(false); }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0 cursor-pointer bg-transparent"
                            >
                              <span className="font-bold text-slate-700">{t(cat)}</span>
                              <span className="text-[10px] text-blue-600 font-bold">+{eps.length}</span>
                            </button>
                          ))
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* API Tree structure (Lazy Rendering & Auto-expand on search) */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {categories.map(cat => {
                    const apis = allEndpoints.filter(ep => (ep.category || "CHUNG") === cat);

                    // Mặc định: chỉ show API đã được gán cho nhóm
                    // Khi search: show toàn bộ API khớp để dễ thêm mới
                    const filteredApis = apis.filter(ep => {
                      if (apiSearchQuery) {
                        const q = apiSearchQuery.toLowerCase();
                        return (
                          ep.path?.toLowerCase().includes(q) ||
                          t(ep.description)?.toLowerCase().includes(q) ||
                          ep.method?.toLowerCase().includes(q)
                        );
                      }
                      return selectedProfile.allowedApis?.includes(ep.id);
                    });

                    // Nếu không có API nào khớp trong danh mục này, ẩn luôn danh mục đó
                    if (filteredApis.length === 0) return null;

                    const allowedCount = filteredApis.filter(ep => selectedProfile.allowedApis?.includes(ep.id)).length;
                    
                    // Auto-expand danh mục khi có kết quả search để hiển thị API khớp
                    const isExpanded = apiSearchQuery ? true : !!expandedCategories[cat];
                    const isAllSelected = allowedCount === filteredApis.length;

                    return (
                      <div key={cat} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-[#fafafa]/50">
                        {/* Accordion header */}
                        <div
                          onClick={() => toggleCategory(cat)}
                          className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{t(cat)}</span>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                              {allowedCount} / {filteredApis.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleCategoryAll(selectedProfile.id, cat, isAllSelected ? 'deny' : 'allow')}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                                isAllSelected
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              {isAllSelected ? 'Bỏ chọn hết' : 'Chọn hết'}
                            </button>
                          </div>
                        </div>

                        {/* Category endpoint list - Lazy mounted for dom performance */}
                        {isExpanded && (
                          <div className="divide-y divide-slate-100 bg-white border-t border-slate-100">
                            {filteredApis.map(ep => {
                              const isAllowed = selectedProfile.allowedApis?.includes(ep.id);
                              return (
                                <div key={ep.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/30">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white shrink-0 ${methodBadgeClass(ep.method)}`}>
                                        {ep.method}
                                      </span>
                                      <span className="font-mono text-[11px] text-slate-700 truncate font-semibold">{ep.path}</span>
                                      {!DEFAULT_ENDPOINTS.some(d => d.id === ep.id) && (
                                        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 font-bold">FILE</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Delete uploaded API button */}
                                    {!DEFAULT_ENDPOINTS.some(d => d.id === ep.id) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!window.confirm(`Xóa API "${ep.path}" khỏi danh sách đã upload?`)) return;
                                          deleteUploadedEndpoint(ep.id);
                                          setUploadNotification({ type: 'success', message: `✅ Đã xóa API "${ep.path}"` });
                                        }}
                                        className="p-1 rounded text-slate-300 hover:bg-red-50 hover:text-red-500 border-0 bg-transparent cursor-pointer transition-colors"
                                        title="Xóa API đã upload"
                                      >
                                        🗑️
                                      </button>
                                    )}

                                    {/* Toggle Switch */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleApi(selectedProfile.id, ep.id)}
                                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        isAllowed ? 'bg-emerald-500' : 'bg-slate-200'
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          isAllowed ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400">
                <div className="text-5xl mb-4 font-mono">🛡️</div>
                <h4 className="font-bold text-slate-700 text-sm">Chưa chọn nhóm quyền</h4>
                <p className="text-xs text-slate-400 mt-1">Chọn một nhóm quyền ở cột bên trái để tiến hành cấu hình quyền gọi API</p>
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: GÁN QUYỀN CHO ĐỐI TÁC */}
      {/* ==================================================== */}
      {subTab === 'mapping' && (
        <>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-left shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                  <th className="p-4 text-left">Mã đối tác</th>
                  <th className="p-4 text-left">Tên Đối Tác</th>
                  <th className="p-4 text-left">Tài khoản liên kết</th>
                  <th className="p-4 text-left w-64">Nhóm quyền tích hợp (có thể chọn nhiều)</th>
                  <th className="p-4 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.map(p => {
                  const account = accounts.find(a => a.id === p.accountId);
                  const partnerApiIds = p.allowedApis || [];
                  const partnerApis = allEndpoints.filter(ep => partnerApiIds.includes(ep.id));
                  const isExpanded = expandedPartnerId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                    <tr
                      onClick={() => setExpandedPartnerId(isExpanded ? null : p.id)}
                      className="hover:bg-slate-50/50 cursor-pointer"
                    >
                      <td className="p-4 font-mono font-bold text-[11px] text-slate-500">
                        {String(parseInt(p.id.split('-')[1])).padStart(3, '0')}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">API: {p.clientId}</div>
                      </td>
                      <td className="p-4">
                        {account ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                            {account.email}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Chưa liên kết</span>
                        )}
                      </td>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <MultiProfileDropdown
                            profiles={profiles}
                            value={p.profileIds || []}
                            onChange={(profileIds) => handlePartnerProfileChange(p.id, profileIds)}
                          />
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                            {partnerApis.length}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center w-6">
                        <span className={`inline-flex items-center justify-center text-slate-200 text-[9px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.id}-apis`}>
                        <td colSpan={5} className="p-0">
                          <div className="bg-slate-50/20 border-t border-slate-100/50 px-4 py-3 space-y-2">
                            {/* Search */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="🔍 Tìm API..."
                                value={partnerApiSearch}
                                onChange={e => setPartnerApiSearch(e.target.value)}
                                className="w-full border border-slate-200/70 bg-white/80 rounded-lg px-3 py-1.5 pl-7 text-[11px] outline-none focus:border-blue-300 transition-all"
                              />
                              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              {partnerApiSearch && (
                                <button
                                  type="button"
                                  onClick={() => setPartnerApiSearch('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] border-0 bg-transparent cursor-pointer"
                                >✕</button>
                              )}
                            </div>

                            {partnerApis.length === 0 && !partnerApiSearch ? (
                              <div className="text-center py-3 text-[11px] text-slate-400 italic">Đối tác chưa được cấp API nào</div>
                            ) : (
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {groupByCategory(allEndpoints).map(({ category: cat, apis }) => {
                                  const allowedIds = p.allowedApis || [];
                                  const filteredApis = partnerApiSearch
                                    ? apis.filter(ep => {
                                        const q = partnerApiSearch.toLowerCase();
                                        return ep.path?.toLowerCase().includes(q) || t(ep.description)?.toLowerCase().includes(q) || ep.method?.toLowerCase().includes(q);
                                      })
                                    : apis.filter(ep => allowedIds.includes(ep.id));
                                  if (filteredApis.length === 0) return null;
                                  const visibleAllowed = filteredApis.filter(ep => allowedIds.includes(ep.id)).length;
                                  const isAllSelected = visibleAllowed === filteredApis.length;
                                  const isNoneSelected = visibleAllowed === 0;
                                  const isPartnerCatExpanded = expandedPartnerCategories[`${p.id}:${cat}`];
                                  return (
                                    <div key={cat} className="border border-slate-200/60 rounded-lg overflow-hidden bg-white/90">
                                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/40 border-b border-slate-100/50">
                                        <div
                                          className="flex items-center gap-1.5 cursor-pointer select-none flex-1 min-w-0"
                                          onClick={() => togglePartnerCategory(p.id, cat)}
                                        >
                                          <span className={`text-slate-400 text-[9px] transition-transform ${isPartnerCatExpanded ? 'rotate-90' : ''}`}>▶</span>
                                          <span className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider truncate">{t(cat)}</span>
                                          <span className="text-[8px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full shrink-0">{visibleAllowed}/{filteredApis.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {!isAllSelected && visibleAllowed > 0 && (
                                            <button
                                              type="button"
                                              onClick={() => handlePartnerApiToggleCategoryAll(p.id, cat, 'deny')}
                                              className="text-[8px] font-semibold px-2 py-0.5 rounded border text-rose-500 border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all"
                                            >Bỏ hết</button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => handlePartnerApiToggleCategoryAll(p.id, cat, isAllSelected ? 'deny' : 'allow')}
                                            className={`text-[8px] font-semibold px-2 py-0.5 rounded border transition-all ${
                                              isAllSelected
                                                ? 'text-rose-500 border-rose-200 bg-rose-50/50 hover:bg-rose-50'
                                                : 'text-blue-500 border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                                            }`}
                                          >
                                            {isAllSelected ? 'Bỏ hết' : isNoneSelected ? 'Chọn hết' : 'Chọn hết'}
                                          </button>
                                        </div>
                                      </div>
                                      {isPartnerCatExpanded && (
                                      <div className="divide-y divide-slate-100/50">
                                        {filteredApis.map(ep => {
                                          const isAllowed = allowedIds.includes(ep.id);
                                          return (
                                            <div
                                              key={ep.id}
                                              className="px-3 py-1.5 flex items-center gap-2 text-[11px] hover:bg-slate-50/30 transition-colors"
                                            >
                                              <span className={`text-[6px] px-1 py-0.5 rounded font-bold text-white shrink-0 ${methodBadgeClass(ep.method)}`}>{ep.method}</span>
                                              <span className={`font-mono truncate flex-1 ${isAllowed ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>{ep.path}</span>
                                              {/* Toggle Switch */}
                                              <button
                                                type="button"
                                                onClick={() => handlePartnerApiToggle(p.id, ep.id)}
                                                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                  isAllowed ? 'bg-emerald-500' : 'bg-slate-200'
                                                }`}
                                              >
                                                <span
                                                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    isAllowed ? 'translate-x-4' : 'translate-x-0'
                                                  }`}
                                                />
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collapsible preview — API từ file upload */}
        {previewEndpoints.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div
              onClick={() => setPreviewExpanded(v => !v)}
              className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`text-slate-400 text-xs transition-transform ${previewExpanded ? 'rotate-90' : ''}`}>▶</span>
                <span className="font-bold text-slate-700 text-sm">📂 API từ file upload</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{previewEndpoints.length}</span>
                <span className="text-xs text-slate-400 font-medium">{previewFileName}</span>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => { handleCreateProfileFromPreview(); setPreviewExpanded(true); }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer border-0"
                >
                  ➕ Tạo nhóm quyền
                </button>
              </div>
            </div>

            {previewExpanded && (
              <div className="border-t border-slate-100 p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {groupByCategory(previewEndpoints).map(({ category: cat, apis }) => (
                  <div key={cat} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between p-3 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{t(cat)}</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{apis.length}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                      {apis.map(ep => (
                        <div key={ep.id} className="p-3 flex items-center gap-4 hover:bg-slate-50/30">
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white shrink-0 ${methodBadgeClass(ep.method)}`}>{ep.method}</span>
                          <span className="font-mono text-[11px] text-slate-700 truncate font-semibold min-w-0 flex-1">{ep.path}</span>
                          <span className="text-xs text-slate-500">{t(ep.description)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      )}

      {/* Modal Profile */}
      <ProfileModal
        isOpen={isModalOpen}
        mode={modalMode}
        currentProfile={currentProfile}
        setCurrentProfile={setCurrentProfile}
        onSave={saveProfile}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal Upload file */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => { setIsUploadModalOpen(false); setUploadNotification(null); }}
        onUpload={handleUploadFile}
      />
    </div>
  );
}