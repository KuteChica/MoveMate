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

test('nearest shuttle logic should choose the closest live shuttle from student coordinates', () => {
  const shuttles = [
    { id: 1, name: 'Bani', status: 'active', latitude: 5.6510, longitude: -0.1880, placeName: 'Library', recordedAt: new Date().toISOString() },
    { id: 2, name: 'TF', status: 'active', latitude: 5.6600, longitude: -0.1900, placeName: 'Main Gate', recordedAt: new Date().toISOString() },
  ];

  const nearest = aiRouter.getNearestShuttle(shuttles, { latitude: 5.6500, longitude: -0.1860 });

  assert.ok(nearest);
  assert.equal(nearest.name, 'Bani');
});

test('AI fallback should say when there are no active shuttles to compare', () => {
  const response = aiRouter.buildFallbackResponse('Which shuttle is closest to me?', {
    routes: [],
    shuttles: [
      { id: 1, name: 'Bani', status: 'inactive', latitude: null, longitude: null, placeName: null, recordedAt: null },
    ],
    notifications: [],
  }, { latitude: 5.6500, longitude: -0.1860 });

  assert.match(response, /no active shuttles/i);
});
