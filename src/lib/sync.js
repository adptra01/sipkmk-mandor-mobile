import db, { pendingOutbox, markSynced, markFailed, isSyncableStatus, isIdempotentReplayStatus, watchPending as watchPendingDb } from './db.js';
import { syncUsage, uploadPhoto, isIdempotentReplayStatus as isReplay, ApiError } from './api.js';
import { buildSyncPayload } from './payload.js';

let activeSyncPromise = null;
let queuedSyncRequest = null;

export async function syncNow(userId) {
  if (activeSyncPromise) {
    if (!queuedSyncRequest) {
      queuedSyncRequest = syncNow(userId);
    }
    return queuedSyncRequest;
  }
  activeSyncPromise = (async () => {
    try {
      const pending = await pendingOutbox(userId);
      let berhasil = 0;
      let gagal = 0;
      const errors = [];
      for (const row of pending) {
        if (!isSyncableStatus(row.status)) continue;
        try {
          const payload = buildSyncPayload(row);
          await syncUsage(payload);
          await markSynced(row.uuid);
          berhasil++;
          // Upload foto bukti (best-effort, tidak membatalkan sync transaksi utama)
          try {
            const photos = await db.outboxPhotos.where('usageUuid').equals(row.uuid).toArray();
            if (photos.length > 0 && photos[0].blob) {
              await uploadPhoto(photos[0].blob, row.uuid);
            }
          } catch (e) {
            // foto gagal upload tidak membatalkan status synced transaksi
          }
        } catch (e) {
          await markFailed(row.uuid, e.message);
          gagal++;
          errors.push({ uuid: row.uuid, error: e.message });
          if (isReplay(e.status)) {
            // 409 = replay idempoten → tandai synced (tidak gagal)
            await markSynced(row.uuid);
            berhasil++;
            gagal = Math.max(0, gagal - 1);
          }
        }
      }
      return { total: pending.length, berhasil, gagal, errors };
    } finally {
      activeSyncPromise = null;
      if (queuedSyncRequest) {
        const q = queuedSyncRequest;
        queuedSyncRequest = null;
        await q;
      }
    }
  })();
  return activeSyncPromise;
}

// Auto-sync saat online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { syncNow().catch(() => {}); });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'SIPKMK_SYNC') syncNow().catch(() => {});
    });
  }
}

export { isSyncableStatus, isIdempotentReplayStatus };
export function watchPending(cbOrUserId, cb) {
  // Support both watchPending(cb) and watchPending(userId, cb)
  if (typeof cbOrUserId === 'function') return watchPendingDb(null, cbOrUserId);
  return watchPendingDb(cbOrUserId, cb);
}