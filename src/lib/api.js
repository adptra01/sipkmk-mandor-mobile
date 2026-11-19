export const API_BASE = import.meta.env.VITE_API_BASE || 'https://curious-lime-sloth.101-50-1-74.cpanel.site/api';

const TOKEN_KEY = 'sipkmk_token';

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Event bus sederhana untuk 401 → AuthContext membersihkan sesi.
const UNAUTHORIZED_EVENT = 'sipkmk:unauthorized';
export function onUnauthorized(cb) {
  window.addEventListener(UNAUTHORIZED_EVENT, cb);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, cb);
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = true, timeout = 15000 } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* bukan JSON */ }
    if (!res.ok) {
      if (res.status === 401 && auth) {
        clearToken();
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
      throw new ApiError((data && (data.pesan || data.message)) || 'Permintaan gagal', res.status, data);
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('Koneksi timeout. Periksa jaringan.', 0, null);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function login(email, password) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: { email, password, device_name: 'react-mandor' },
    auth: false,
  });
  setToken(data.token);
  return data;
}

export async function me() {
  return apiRequest('/me');
}

export async function getMaterials() {
  const rows = await apiRequest('/materials');
  return (Array.isArray(rows) ? rows : rows?.data ?? []).map((m) => ({
    id: m.id,
    code: m.kode ?? m.code,
    name: m.nama ?? m.name,
    category: m.kategori ?? m.category,
    specification: m.spesifikasi ?? m.specification ?? null,
    unit: m.satuan ?? m.unit ?? '',
    minimumStock: m.stok_minimum ?? m.minimum_stock ?? m.minimumStock ?? 0,
  }));
}

export async function getProjects() {
  const rows = await apiRequest('/projects');
  return Array.isArray(rows) ? rows : rows?.data ?? [];
}

export async function syncUsage(payload) {
  return apiRequest('/sync/usages', { method: 'POST', body: payload, timeout: 30000 });
}

export async function uploadPhoto(file, usageUuid) {
  const fd = new FormData();
  fd.append('photo', file);
  if (usageUuid) fd.append('usage_uuid', usageUuid);
  const token = getToken();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(`${API_BASE}/photos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
      signal: ctrl.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* bukan JSON */ }
    if (!res.ok) {
      if (res.status === 401) { clearToken(); window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT)); }
      throw new ApiError((data && (data.pesan || data.message)) || 'Upload foto gagal', res.status, data);
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('Upload timeout. Periksa jaringan.', 0, null);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function isIdempotentReplayStatus(status) {
  return status === 409;
}