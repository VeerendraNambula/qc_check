import test from 'node:test';
import assert from 'node:assert/strict';
import { canInspectTask, isAdminRole } from '../src/utils/taskPermissions.js';

test('admins can inspect tasks regardless of assignment', () => {
  assert.equal(canInspectTask({ role: 'ADMIN', userId: 'admin-1', assignedToId: 'user-2' }), true);
  assert.equal(canInspectTask({ role: 'ADMIN', userId: 'admin-1', assignedToId: null }), true);
});

test('an inspector can inspect their own assigned task', () => {
  assert.equal(canInspectTask({ role: 'USER', userId: 'user-1', assignedToId: 'user-1' }), true);
});

test('an inspector cannot inspect another users task', () => {
  assert.equal(canInspectTask({ role: 'USER', userId: 'user-1', assignedToId: 'user-2' }), false);
});

test('an inspector cannot inspect an unassigned task before claiming it', () => {
  assert.equal(canInspectTask({ role: 'USER', userId: 'user-1', assignedToId: null }), false);
});

test('missing identity does not grant inspection access', () => {
  assert.equal(canInspectTask({ role: 'USER', userId: null, assignedToId: 'user-1' }), false);
});

test('only the ADMIN role is treated as admin', () => {
  assert.equal(isAdminRole('ADMIN'), true);
  assert.equal(isAdminRole('USER'), false);
  assert.equal(isAdminRole(null), false);
});
