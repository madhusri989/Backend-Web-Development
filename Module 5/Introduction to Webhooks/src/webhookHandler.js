'use strict';

const crypto = require('crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  if (
    typeof signature !== 'string' ||
    !signature.startsWith('sha256=') ||
    typeof secret !== 'string' ||
    !Buffer.isBuffer(req.body)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const receivedHex = signature.slice('sha256='.length);

  // SHA-256 produces exactly 32 bytes, represented by 64 hexadecimal characters.
  if (!/^[a-fA-F0-9]{64}$/.test(receivedHex)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const expectedDigest = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest();

  const receivedDigest = Buffer.from(receivedHex, 'hex');

  if (
    receivedDigest.length !== expectedDigest.length ||
    !crypto.timingSafeEqual(expectedDigest, receivedDigest)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (event.id == null) {
    return res.status(400).json({ error: 'Missing event id' });
  }

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // Record the ID before scheduling processing to prevent duplicate handling.
  _processedIds.add(event.id);

  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    try {
      handleEvent(event);
    } catch (error) {
      console.error('Webhook event processing failed:', error);
    }
  });
}

module.exports = { handleWebhook, _processedIds };
