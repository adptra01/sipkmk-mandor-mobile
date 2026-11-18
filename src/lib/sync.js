import { pendingOutbox, markSynced, markFailed, watchPending } from './db';
import { syncUsage } from './api';

export async function syncNow() {
  const pending = await pendingOutbox();
  let berhasil = 0;
  let gagal = 0;
  const errors = [];

  for (const row of pending) {
    let payload = row;
    if (row.payloadJson) {
      try {
        payload = JSON.parse(row.payloadJson);
      } catch {
        payload = row;
      }
    }
    const body = {
      uuid: row.uuid,
      project_id: payload.projectId ?? row.projectId,
      warehouse_id: payload.warehouseId ?? row.warehouseId,
      destination_type: payload.destinationType ?? row.destinationType,
      destination_id: payload.destinationId ?? row.destinationId,
      user_id: payload.userId ?? payload.user_id ?? 1,
      usage_date: payload.usageDate ?? row.usageDate,
      note: payload.note ?? row.note ?? null,
      recorded_at: payload.recordedAt ?? row.recordedAt,
      items: payload.items ?? row.items,
    };
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
