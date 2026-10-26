'use strict';

const crypto = require('crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function invalidSignature(res) {
  return res.status(401).json({ error: 'Invalid signature' });
}

async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-webhook-signature'];
    const secret = process.env.WEBHOOK_SECRET;

    if (
      typeof signature !== 'string' ||
      !signature.startsWith('sha256=') ||
      !/^[a-f0-9]{64}$/i.test(signature.slice('sha256='.length)) ||
      !Buffer.isBuffer(req.body) ||
      !secret
    ) {
      return invalidSignature(res);
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest();
    const received = Buffer.from(signature.slice('sha256='.length), 'hex');

    // timingSafeEqual requires equal-length buffers; the format check above
    // ensures the supplied digest is exactly the expected SHA-256 length.
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return invalidSignature(res);
    }

    let event;
    try {
      event = JSON.parse(req.body.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    if (!event || typeof event.id !== 'string' || event.id.length === 0) {
      return res.status(400).json({ error: 'Invalid event' });
    }

    if (_processedIds.has(event.id)) {
      return res.status(200).json({ status: 'already_processed' });
    }

    // Record the ID before scheduling work so a quick retry cannot enqueue it
    // a second time.
    _processedIds.add(event.id);
    res.status(200).json({ status: 'received' });

    setImmediate(() => {
      Promise.resolve(handleEvent(event)).catch(() => {
        // Acknowledgement has already been sent; processing failures should
        // be handled by production retry/monitoring infrastructure.
      });
    });
  } catch {
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = { handleWebhook, _processedIds };
