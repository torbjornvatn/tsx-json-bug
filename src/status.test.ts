import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStatusMessage } from './status.ts';

test('getStatusMessage returns correct message for 200', () => {
  assert.equal(getStatusMessage(200), 'OK');
});

test('getStatusMessage returns correct message for 404', () => {
  assert.equal(getStatusMessage(404), 'Not Found');
});

test('getStatusMessage returns correct message for 500', () => {
  assert.equal(getStatusMessage(500), 'Internal Server Error');
});
