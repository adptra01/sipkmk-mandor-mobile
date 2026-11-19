import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { syncNow } from '../lib/sync';

export default function SyncScreen() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [outbox, setOutbox] = useState([]);

  useEffect(() => { loadOutbox(); }, []);

  async function loadOutbox() {
    const rows = await db.outbox.orderBy('createdAt').reverse().toArray();
    setOutbox(rows);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await syncNow();
      setResult(res);
    } catch (e) {
      setResult({ total: 0, berhasil: 0, gagal: 0, errors: [{ error: e.message }] });
    } finally {
      setSyncing(false);
      await loadOutbox();
    }
  }

  async function handleDeleteSynced() {
    await db.outbox.where('status').equals('synced').delete();
    await loadOutbox();
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

  const hasSynced = outbox.some(r => r.status === 'synced');

  return (
    <div>
      <div className="section-title">Sinkronisasi Data</div>

      <button className="btn btn-primary btn-full" onClick={handleSync} disabled={syncing}>
        {syncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
      </button>

      {result && (
        <div className="sync-result">
          <div className="sync-stat">
            <div className="sync-stat-value">{result.total}</div>
            <div className="sync-stat-label">Total</div>
          </div>
          <div className="sync-stat">
            <div className="sync-stat-value" style={{ color: 'var(--success)' }}>{result.berhasil}</div>
            <div className="sync-stat-label">Berhasil</div>
          </div>
          <div className="sync-stat">
            <div className="sync-stat-value" style={{ color: result.gagal > 0 ? 'var(--danger)' : 'inherit' }}>{result.gagal}</div>
            <div className="sync-stat-label">Gagal</div>
          </div>
        </div>
      )}

      {result?.errors?.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 12 }}>
          {result.errors.map((e, i) => <div key={i}>{e.uuid ? `${e.uuid.slice(0,8)}: ` : ''}{e.error}</div>)}
        </div>
      )}

      {hasSynced && (
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }} onClick={handleDeleteSynced}>
          🗑 Hapus yang Tersinkronisasi
        </button>
      )}

      <div className="section-title">Semua Antrean ({outbox.length})</div>

      {outbox.length === 0 && (
        <div className="alert alert-info">Belum ada data di antrean.</div>
      )}

      {outbox.map(row => (
        <div className="outbox-item" key={row.id}>
          <div className="outbox-item-header">
            <span className="outbox-uuid">{row.uuid?.slice(0, 12)}…</span>
            <span className={badgeClass(row.status)}>{badgeLabel(row.status)}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {row.usageDate} · Dibuat: {row.createdAt?.slice(0, 16).replace('T', ' ')}
          </div>
          {row.error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>⚠ {row.error}</div>}
        </div>
      ))}
    </div>
  );
}
