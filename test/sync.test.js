import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSyncPayload } from '../src/lib/payload.js';

describe('buildSyncPayload', () => {
  it('membentuk payload snake_case yang benar dari row outbox', () => {
    const row = {
      uuid: 'c8b98b95-3211-4089-a29d-4076e01a886f',
      projectId: 2,
      warehouseId: 3,
      destinationType: 'CostPool',
      destinationId: 5,
      userId: 7,
      usageDate: '2026-11-18',
      note: 'Pemakaian semen proyek',
      recordedAt: '2026-11-18T10:30:00.000Z',
      items: [{ materialId: 10, quantity: 25 }],
    };

    const payload = buildSyncPayload(row);

    assert.equal(payload.uuid, 'c8b98b95-3211-4089-a29d-4076e01a886f');
    assert.equal(payload.project_id, 2);
    assert.equal(payload.warehouse_id, 3);
    assert.equal(payload.destination_type, 'CostPool');
    assert.equal(payload.destination_id, 5);
    assert.equal(payload.user_id, 7);
    assert.equal(payload.usage_date, '2026-11-18');
    assert.equal(payload.note, 'Pemakaian semen proyek');
    assert.equal(payload.recorded_at, '2026-11-18T10:30:00.000Z');
    assert.deepEqual(payload.items, [{ material_id: 10, quantity: 25 }]);
  });

  it('memastikan uuid tetap utuh tanpa modifikasi', () => {
    const uuid = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const payload = buildSyncPayload({ uuid });
    assert.equal(payload.uuid, uuid);
  });

  it('memetakan items camelCase (materialId) ke snake_case (material_id)', () => {
    const row = {
      items: [
        { materialId: 101, quantity: 5 },
        { material_id: 102, quantity: 15 },
      ],
    };

    const payload = buildSyncPayload(row);

    assert.deepEqual(payload.items, [
      { material_id: 101, quantity: 5 },
      { material_id: 102, quantity: 15 },
    ]);
  });

  it('tidak menyertakan field internal outbox (status, attempts, payloadJson, id, error, createdAt)', () => {
    const row = {
      id: 99,
      uuid: 'test-uuid-123',
      projectId: 1,
      status: 'pending_sync',
      attempts: 3,
      payloadJson: JSON.stringify({ projectId: 1 }),
      createdAt: '2026-11-18T00:00:00Z',
      error: 'Network timeout',
    };

    const payload = buildSyncPayload(row);

    assert.equal(payload.status, undefined);
    assert.equal(payload.attempts, undefined);
    assert.equal(payload.payloadJson, undefined);
    assert.equal(payload.id, undefined);
    assert.equal(payload.createdAt, undefined);
    assert.equal(payload.error, undefined);
  });

  it('memberikan default user_id = 1 jika tidak disediakan', () => {
    const payload = buildSyncPayload({ uuid: 'test-user-default' });
    assert.equal(payload.user_id, 1);
  });

  it('dapat mengekstrak data dari payloadJson jika tersedia', () => {
    const row = {
      uuid: 'json-uuid-001',
      payloadJson: JSON.stringify({
        projectId: 44,
        warehouseId: 55,
        destinationType: 'Subkon',
        destinationId: 12,
        userId: 9,
        usageDate: '2026-11-19',
        note: 'Dari JSON',
        items: [{ materialId: 88, quantity: 4 }],
      }),
    };

    const payload = buildSyncPayload(row);

    assert.equal(payload.project_id, 44);
    assert.equal(payload.warehouse_id, 55);
    assert.equal(payload.destination_type, 'Subkon');
    assert.equal(payload.destination_id, 12);
    assert.equal(payload.user_id, 9);
    assert.equal(payload.note, 'Dari JSON');
    assert.deepEqual(payload.items, [{ material_id: 88, quantity: 4 }]);
  });
});
