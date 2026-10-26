'use strict';
// routes/payments.js
//
// POST /payments is idempotent: a given Idempotency-Key creates at most one
// charge, and retries receive the exact status/body returned for the first request.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  if (typeof key !== 'string' || key.trim() === '') {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      },
    });
  }

  // Return the original result for retries without charging again.
  if (idempotency.has(key)) {
    const cached = idempotency.get(key);
    return res.status(cached.status).json(cached.body);
  }

  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  const status = 201;
  const body = { id: charge.id, amount: charge.amount, status: charge.status };
  idempotency.set(key, { status, body });

  return res.status(status).json(body);
});

module.exports = router;
