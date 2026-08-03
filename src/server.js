'use strict';

// A deliberately small Express app. It uses several of the pinned
// dependencies so the test suite exercises real code paths (this is what
// keeps the pipeline test-reality check honest: the tests actually run the app).

const express = require('express');
const _ = require('lodash');
const semver = require('semver');
const qs = require('qs');

function createApp() {
  const app = express();
  app.use(express.json());

  // Liveness check.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Validate a semver string (uses the pinned semver dep).
  app.get('/version/:v', (req, res) => {
    const valid = semver.valid(req.params.v);
    if (!valid) {
      return res.status(400).json({ error: 'invalid semver' });
    }
    res.json({ version: valid, major: semver.major(valid) });
  });

  // Sum a list of numbers (uses lodash).
  app.post('/sum', (req, res) => {
    const nums = _.get(req.body, 'numbers', []);
    if (!_.isArray(nums) || !_.every(nums, _.isNumber)) {
      return res.status(400).json({ error: 'numbers must be an array of numbers' });
    }
    res.json({ total: _.sum(nums) });
  });

  // Parse a query string (uses qs).
  app.get('/parse', (req, res) => {
    const raw = String(req.query.q || '');
    res.json({ parsed: qs.parse(raw) });
  });

  return app;
}

// Only start listening when run directly, so tests can import the app.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`vuln-demo listening on ${port}`);
  });
}

module.exports = { createApp };
