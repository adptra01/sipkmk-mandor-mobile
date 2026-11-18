import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nextStatus } from '../src/lib/payload.js';

describe('nextStatus dan transisi status offline outbox', () => {
  it('mengubah status pending_sync menjadi synced saat sinkronisasi sukses', () => {
    const currentStatus = 'pending_sync';
    const statusBerikutnya = nextStatus(currentStatus, true);
    assert.equal(statusBerikutnya, 'synced');
  });

  it('mengubah status pending_sync menjadi failed saat sinkronisasi gagal', () => {
    const currentStatus = 'pending_sync';
    const statusBerikutnya = nextStatus(currentStatus, false);
    assert.equal(statusBerikutnya, 'failed');
  });

  it('mengubah status failed menjadi synced saat percobaan ulang (retry) berhasil', () => {
    const currentStatus = 'failed';
    const statusBerikutnya = nextStatus(currentStatus, true);
    assert.equal(statusBerikutnya, 'synced');
  });

  it('tetap failed saat percobaan ulang sinkronisasi kembali gagal', () => {
    const currentStatus = 'failed';
    const statusBerikutnya = nextStatus(currentStatus, false);
    assert.equal(statusBerikutnya, 'failed');
  });

  it('simulasi antrean outbox offline: memproses batch item dengan transisi status yang tepat', () => {
    // Mock item antrean outbox lokal tanpa IndexedDB / Dexie
    const antreanOutbox = [
      { id: 1, uuid: 'tx-001', status: 'pending_sync', attempts: 0 },
      { id: 2, uuid: 'tx-002', status: 'pending_sync', attempts: 0 },
      { id: 3, uuid: 'tx-003', status: 'failed', attempts: 1 },
    ];

    // Hasil mock sinkronisasi: tx-001 sukses, tx-002 gagal jaringan, tx-003 retry sukses
    const hasilSync = {
      'tx-001': true,
      'tx-002': false,
      'tx-003': true,
    };

    const hasilProses = antreanOutbox.map((item) => {
      const berhasil = hasilSync[item.uuid];
      return {
        ...item,
        status: nextStatus(item.status, berhasil),
        attempts: berhasil ? item.attempts : item.attempts + 1,
      };
    });

    assert.equal(hasilProses[0].status, 'synced');
    assert.equal(hasilProses[0].attempts, 0);

    assert.equal(hasilProses[1].status, 'failed');
    assert.equal(hasilProses[1].attempts, 1);

    assert.equal(hasilProses[2].status, 'synced');
    assert.equal(hasilProses[2].attempts, 1);
  });
});
