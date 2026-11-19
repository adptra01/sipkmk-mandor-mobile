import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { watchPending } from '../lib/sync';
import { syncNow } from '../lib/sync';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const nama = user?.nama || user?.email || 'Mandor';
  const proyekCount = user?.proyek?.length ?? 0;

  useEffect(() => {
    const sub = watchPending(setPending);
    return () => sub.unsubscribe();
  }, []);

  async function handleSync() {
    setSyncing(true);
    try {
      const hasil = await syncNow();
      alert(`Sinkronisasi selesai.\nBerhasil: ${hasil.berhasil} | Gagal: ${hasil.gagal}`);
    } catch (e) {
      alert('Gagal sinkronisasi: ' + e.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
        Selamat datang, <strong>{nama}</strong>!
      </p>

      <div className="card-row">
        <div className="card">
          <div className="card-title">Proyek</div>
          <div className="card-value">{proyekCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Antrean</div>
          <div className="card-value" style={{ color: pending > 0 ? 'var(--warning)' : 'var(--success)' }}>{pending}</div>
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSync} disabled={syncing}>
        {syncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
      </button>

      <button className="btn btn-secondary btn-full" onClick={() => navigate('/pemakaian')}>
        Catat Pemakaian Material
      </button>
    </div>
  );
}
