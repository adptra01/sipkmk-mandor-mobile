import { pendingOutbox, markSynced, markFailed, watchPending } from './db';
import { syncUsage } from './api';
import { buildSyncPayload } from './payload';

export async function syncNow() {
  const pending = await pendingOutbox();
  let berhasil = 0;
  let gagal = 0;
  const errors = [];

  for (const row of pending) {
    const body = buildSyncPayload(row);
    try {
      await syncUsage(body);
      await markSynced(row.uuid);
      berhasil++;
    } catch (e) {
      await markFailed(row.uuid, e.message);
      gagal++;
      errors.push({ uuid: row.uuid, error: e.message });
    }
  }

  return { total: pending.length, berhasil, gagal, errors };
}

export { watchPending };

// Auto-sync saat koneksi kembali
window.addEventListener('online', () => syncNow().catch(() => {}));

// Auto-sync via pesan Service Worker (Background Sync)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SIPKMK_SYNC') syncNow().catch(() => {});
  });
}
