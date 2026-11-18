import Dexie, { liveQuery } from 'dexie';

const db = new Dexie('sipkmk');
db.version(1).stores({
  outbox: '++id, &uuid, status, createdAt',
  materials: 'id, code',
  projects: 'id, code',
});

export async function addOutbox(payload) {
  return db.outbox.add({
    ...payload,
    status: 'pending_sync',
    attempts: 0,
    payloadJson: JSON.stringify(payload),
    createdAt: new Date().toISOString(),
  });
}

export async function pendingOutbox() {
  return db.outbox.where('status').equals('pending_sync').toArray();
}

export async function markSynced(uuid) {
  return db.outbox.where('uuid').equals(uuid).modify({ status: 'synced' });
}

export async function markFailed(uuid, error) {
  return db.outbox.where('uuid').equals(uuid).modify((row) => {
    row.status = 'failed';
    row.attempts = (row.attempts || 0) + 1;
    row.error = error;
  });
}

export async function cacheMaster({ materials, projects }) {
  await db.materials.bulkPut(Array.isArray(materials) ? materials : []);
  await db.projects.bulkPut(Array.isArray(projects) ? projects : []);
}

export function watchPending(callback) {
  return liveQuery(() => db.outbox.where('status').equals('pending_sync').count()).subscribe(callback);
}

export { db };
export default db;