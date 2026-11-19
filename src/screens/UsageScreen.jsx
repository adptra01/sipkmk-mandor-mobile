import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, addOutbox, cacheMaster } from '../lib/db';
import { getMaterials, getProjects } from '../lib/api';
import { syncNow } from '../lib/sync';
import { compressPhoto, fileToDataUrl } from '../lib/photo';

const TODAY = new Date().toISOString().slice(0, 10);

const DEST_TYPES = [
  { value: 'App\\Models\\HousingUnit', label: 'Unit Rumah' },
  { value: 'App\\Models\\CostPool', label: 'Pekerjaan Bersama' },
];

function emptyItem() {
  return { materialId: '', quantity: '' };
}

export default function UsageScreen() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [offlineMsg, setOfflineMsg] = useState('');
  const [msg, setMsg] = useState('');

  // form state
  const [projectId, setProjectId] = useState('');
  const [warehouseId, setWarehouseId] = useState(1);
  const [destType, setDestType] = useState(DEST_TYPES[0].value);
  const [destId, setDestId] = useState('');
  const [usageDate, setUsageDate] = useState(TODAY);
  const [items, setItems] = useState([emptyItem()]);
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // recent outbox
  const [recentOutbox, setRecentOutbox] = useState([]);

  useEffect(() => {
    loadMaster();
    loadOutbox();
  }, []);

  async function loadMaster() {
    const [mats, projs] = await Promise.all([
      db.materials.toArray(),
      db.projects.toArray(),
    ]);
    if (mats.length && projs.length) {
      setMaterials(mats);
      setProjects(projs);
      return;
    }
    try {
      const [apiMats, apiProjs] = await Promise.all([getMaterials(), getProjects()]);
      await cacheMaster({ materials: apiMats, projects: apiProjs });
      setMaterials(Array.isArray(apiMats) ? apiMats : []);
      setProjects(Array.isArray(apiProjs) ? apiProjs : []);
    } catch {
      setOfflineMsg('Tidak dapat memuat data master. Anda mungkin sedang offline.');
      setMaterials(mats);
      setProjects(projs);
    }
  }

  async function loadOutbox() {
    const rows = await db.outbox.orderBy('createdAt').reverse().limit(10).toArray();
    setRecentOutbox(rows);
  }

  function setItem(i, field, val) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  }

  function addItem() { setItems(prev => [...prev, emptyItem()]); }

  function removeItem(i) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i));
  }

  async function handlePhotoChange(e) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    try {
      const compressed = await compressPhoto(raw);
      setPhotoFile(compressed);
      setPhotoPreview(await fileToDataUrl(compressed));
      setMsg(`Foto dikompresi: ${(raw.size / 1024).toFixed(0)} KB → ${(compressed.size / 1024).toFixed(0)} KB`);
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!projectId) { setMsg('Pilih proyek terlebih dahulu.'); return; }
    if (items.some(it => !it.materialId || !it.quantity)) {
      setMsg('Lengkapi semua baris material.');
      return;
    }

    const payload = {
      uuid: crypto.randomUUID(),
      projectId: Number(projectId),
      warehouseId: Number(warehouseId),
      destinationType: destType,
      destinationId: Number(destId),
      userId: user?.id ?? user?.user?.id ?? 1,
      usageDate,
      note,
      recordedAt: new Date().toISOString(),
      items: items.map(it => ({ materialId: Number(it.materialId), quantity: Number(it.quantity) })),
      photo: photoFile ?? null,
      photoDataUrl: photoPreview || null,
    };

    await addOutbox(payload);
    setMsg('Tersimpan. Menunggu sinkronisasi.');

    // reset
    setProjectId(''); setDestId(''); setUsageDate(TODAY);
    setItems([emptyItem()]); setNote(''); setPhotoFile(null); setPhotoPreview('');
    await loadOutbox();

    // try sync silently
    syncNow().catch(() => {});
  }

  function badgeClass(status) {
    if (status === 'synced') return 'badge badge-synced';
    if (status === 'failed') return 'badge badge-failed';
    return 'badge badge-pending';
  }

  function badgeLabel(status) {
    if (status === 'synced') return 'Tersinkron';
    if (status === 'failed') return 'Gagal';
    return 'Menunggu';
  }

  return (
    <div>
      <div className="section-title">Catat Pemakaian Material</div>

      {offlineMsg && <div className="alert alert-info">{offlineMsg}</div>}
      {msg && <div className={`alert ${msg.startsWith('Tersimpan') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">Proyek</label>
          <select className="form-control" data-testid="project-select" value={projectId} onChange={e => setProjectId(e.target.value)} required>
            <option value="">-- Pilih Proyek --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.code}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">ID Gudang</label>
          <input className="form-control" type="number" min="1" data-testid="warehouse-input" value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Tujuan</label>
          <select className="form-control" data-testid="dest-type-select" value={destType} onChange={e => setDestType(e.target.value)}>
            {DEST_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">ID Tujuan</label>
          <input className="form-control" type="number" min="1" data-testid="dest-id-input" value={destId} onChange={e => setDestId(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Tanggal</label>
          <input className="form-control" type="date" value={usageDate} onChange={e => setUsageDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Material</label>
          {items.map((it, i) => (
            <div className="item-row" key={i}>
              <select className="form-control" data-testid="material-select" value={it.materialId} onChange={e => setItem(i, 'materialId', e.target.value)} required>
                <option value="">-- Pilih --</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
              </select>
              <input className="form-control form-control-sm" type="number" min="0.01" step="any" placeholder="Qty" data-testid="qty-input" value={it.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} required />
              <button type="button" className="btn-remove" onClick={() => removeItem(i)}>×</button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Tambah Material</button>
        </div>

        <div className="form-group">
          <label className="form-label">Catatan</label>
          <textarea className="form-control" rows="3" value={note} onChange={e => setNote(e.target.value)} placeholder="Opsional..." />
        </div>

        <div className="form-group">
          <label className="form-label">Foto Bukti</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
          />
          {photoPreview && (
            <div style={{ marginTop: 8 }}>
              <img
                src={photoPreview}
                alt="Pratinjau foto"
                style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 6, objectFit: 'cover' }}
              />
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                {photoFile?.name} · {(photoFile?.size / 1024).toFixed(0)} KB
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-full">💾 Simpan ke Antrean</button>
      </form>

      {recentOutbox.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 20 }}>Antrean Terbaru</div>
          {recentOutbox.map(row => (
            <div className="outbox-item" key={row.id}>
              <div className="outbox-item-header">
                <span className="outbox-uuid">{row.uuid?.slice(0, 8)}…</span>
                <span className={badgeClass(row.status)}>{badgeLabel(row.status)}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.usageDate} · {row.createdAt?.slice(11, 16)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
