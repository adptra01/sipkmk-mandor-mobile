// Bisa dioverride saat build: VITE_API_BASE=https://domain/api npm run build
// Default produksi = backend di hosting cPanel (WAJIB https: halaman Pages juga https,
// Mixed Content memblokir request http dari halaman https).
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

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // respons bukan JSON (mis. error HTML dari server)
  }
  if (!res.ok) {
    throw new Error((data && (data.pesan || data.message)) || 'Permintaan gagal');
  }
  return data;
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
  // Backend memakai Resource berbahasa Indonesia (kode/nama/satuan/...).
  // Normalisasi ke field internal agar UI tidak bergantung pada bahasa respons API.
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
  return apiRequest('/sync/usages', { method: 'POST', body: payload });
}