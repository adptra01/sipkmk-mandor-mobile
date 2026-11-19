import Dexie from 'dexie';
import { liveQuery } from 'dexie';

const db = new Dexie('sipkmk');

// v1: skema awal
db.version(1).stores({
  outbox: '++id, &uuid, status, createdAt',
  materials: 'id, code',
  projects: 'id, code',
});

// v2: foto dipisah ke tabel outboxPhotos (agar query outbox tetap ringan),
// scope per user (userId), status retryable.
db.version(2).stores({
  outbox: '++id, &uuid, userId, status, createdAt',
  outboxPhotos: '++id, &usageUuid, status, createdAt',
  materials: 'id, code',
  projects: 'id, code',
}).upgrade(async (tx) => {
  // migrasi data lama: tambah userId=0 & status default, hapus photoDataUrl dari outbox
  await tx.table('outbox').toCollection().modify((row) => {
    if (row.userId === undefined) row.userId = 0;
    if (!row.status) row.status = 'pending_sync';
  });
});

export default db;
export { db };

export function isSyncableStatus(status) {
  return status === 'pending_sync' || status === 'failed';
}

export async function addOutbox(payload, userId) {
  return db.transaction('rw', db.outbox, db.outboxPhotos, async () => {
    const id = await db.outbox.add({
      ...payload,
      userId: userId || 0,
      status: 'pending_sync',
      attempts: 0,
      payloadJson: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
      error: null,
    });
    if (payload.photo) {
      await db.outboxPhotos.add({
        usageUuid: payload.uuid,
        blob: payload.photo,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }
    return id;
  });
}

export async function pendingOutbox(userId) {
  let q = db.outbox.where('status').anyOf(['pending_sync', 'failed']);
  if (userId) q = q.and((r) => r.userId === userId);
  return q.sortBy('createdAt');
}

export async function markSynced(uuid) {
  await db.outbox.where('uuid').equals(uuid).modify({ status: 'synced', error: null });
}

export async function markFailed(uuid, error) {
  await db.outbox.where('uuid').equals(uuid).modify((r) => {
    r.status = 'failed';
    r.attempts = (r.attempts || 0) + 1;
    r.error = error || null;
  });
}

export async function deleteSyncedOutbox(userId) {
  let q = db.outbox.where('status').equals('synced');
  if (userId) q = q.and((r) => r.userId === userId);
  const rows = await q.toArray();
  const uuids = rows.map((r) => r.uuid);
  await db.transaction('rw', db.outbox, db.outboxPhotos, async () => {
    await q.delete();
    if (uuids.length) await db.outboxPhotos.where('usageUuid').anyOf(uuids).delete();
  });
  return rows.length;
}

export async function cacheMaster({ materials, projects }) {
  await db.transaction('rw', db.materials, db.projects, async () => {
    await db.materials.clear();
    await db.projects.clear();
    if (Array.isArray(materials) && materials.length) await db.materials.bulkPut(materials);
    if (Array.isArray(projects) && projects.length) await db.projects.bulkPut(projects);
  });
}

export async function watchPending(userId, cb) {
  const q = userId
    ? db.outbox.where('status').anyOf(['pending_sync', 'failed']).and((r) => r.userId === userId)
    : db.outbox.where('status').anyOf(['pending_sync', 'failed']);
  return liveQuery(() => q.count()).subscribe(cb);
}

export async function watchOutbox(userId, cb) {
  const q = userId
    ? db.outbox.where('status').anyOf(['pending_sync', 'failed', 'synced']).and((r) => r.userId === userId)
    : db.outbox.where('status').anyOf(['pending_sync', 'failed', 'synced']);
  return liveQuery(() => q.reverse().limit(30).toArray()).subscribe(cb);
}

export async function clearMasterCache() {
  await db.transaction('rw', db.materials, db.projects, async () => {
    await db.materials.clear();
    await db.projects.clear();
  });
}

export function isIdempotentReplayStatus(status) {
  return status === 409;
}