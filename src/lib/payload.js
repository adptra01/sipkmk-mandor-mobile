/**
 * Helper murni untuk pembentukan payload sinkronisasi dan transisi status offline outbox.
 * Tanpa ketergantungan DOM, Dexie, atau fetch agar aman dijalankan di Node.js test runner.
 */

/**
 * Mengubah baris outbox lokal menjadi format payload snake_case yang diharapkan backend.
 * Mengabaikan field internal outbox seperti status, attempts, error, id, dan payloadJson.
 *
 * @param {Object} row Data baris outbox
 * @returns {Object} Payload siap dikirim ke endpoint /api/sync/usages
 */
export function buildSyncPayload(row = {}) {
  let source = row;
  if (row?.payloadJson) {
    try {
      source = JSON.parse(row.payloadJson);
    } catch {
      source = row;
    }
  }

  const rawItems = source?.items ?? row?.items ?? [];
  const items = Array.isArray(rawItems)
    ? rawItems.map((item) => ({
        material_id: item?.material_id ?? item?.materialId,
        quantity: item?.quantity,
      }))
    : [];

  return {
    uuid: row?.uuid ?? source?.uuid,
    project_id: source?.projectId ?? source?.project_id ?? row?.projectId ?? row?.project_id,
    warehouse_id: source?.warehouseId ?? source?.warehouse_id ?? row?.warehouseId ?? row?.warehouse_id,
    destination_type: source?.destinationType ?? source?.destination_type ?? row?.destinationType ?? row?.destination_type,
    destination_id: source?.destinationId ?? source?.destination_id ?? row?.destinationId ?? row?.destination_id,
    user_id: source?.userId ?? source?.user_id ?? row?.userId ?? row?.user_id ?? 1,
    usage_date: source?.usageDate ?? source?.usage_date ?? row?.usageDate ?? row?.usage_date,
    note: source?.note ?? row?.note ?? null,
    recorded_at: source?.recordedAt ?? source?.recorded_at ?? row?.recordedAt ?? row?.recorded_at ?? null,
    items,
  };
}

/**
 * Menentukan status outbox berikutnya berdasarkan hasil percobaan sinkronisasi.
 *
 * @param {string} current Status saat ini ('pending_sync' | 'failed' | 'synced')
 * @param {boolean} success True jika sinkronisasi berhasil, false jika gagal
 * @returns {'synced' | 'failed'} Status baru
 */
export function nextStatus(current, success) {
  return success ? 'synced' : 'failed';
}
