const test = require('node:test');
const assert = require('node:assert/strict');

const aiRouter = require('../routes/ai.js');

test('live GPS should keep a shuttle active even when the stored status is inactive', () => {
  const now = Date.now();
  const status = aiRouter.getShuttleStatus({
    status: 'inactive',
    recordedAt: new Date(now - 60 * 1000).toISOString(),
  });

  assert.equal(status, 'active');
});

test('maintenance should stay maintenance even with fresh GPS', () => {
  const now = Date.now();
  const status = aiRouter.getShuttleStatus({
    status: 'maintenance',
    recordedAt: new Date(now - 60 * 1000).toISOString(),
  });

  assert.equal(status, 'maintenance');
});
