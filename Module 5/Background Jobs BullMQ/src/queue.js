'use strict';

const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
};

const emailQueue = new Queue('email', {
  connection,
  // Queue-level defaults are applied to every job, so transient email failures
  // are retried with exponential backoff.
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

module.exports = { emailQueue, connection };
