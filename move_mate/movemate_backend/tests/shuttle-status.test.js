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

test('AI fallback should show only the place name for a live shuttle location', () => {
  const response = aiRouter.buildFallbackResponse('Where is TF right now?', {
    routes: [],
    shuttles: [{
      id: 1,
      name: 'TF',
      status: 'active',
      currentRouteId: 2,
      routeName: 'Main Campus Route',
      latitude: 5.6519,
      longitude: -0.1871,
      placeName: 'Haile Selassie Road',
      recordedAt: new Date().toISOString(),
    }],
    notifications: [],
  });

  assert.match(response, /TF is currently at Haile Selassie Road/i);
  assert.doesNotMatch(response, /Main Campus Route/i);
  assert.doesNotMatch(response, /5\.6519|0\.1871|was last reported/i);
});
