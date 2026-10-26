'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');

const worker = new Worker(
  'email',
  async (job) => {
    if (job.name !== 'otp') {
      throw new Error(`Unsupported email job: ${job.name}`);
    }

    const { to, otp } = job.data;
    if (typeof to !== 'string' || typeof otp !== 'string') {
      throw new Error('OTP email job is missing required data');
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'no-reply@example.com',
      to,
      subject: 'Your email verification code',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log('completed', job.id);
});

worker.on('failed', (job, error) => {
  console.error('failed', job?.id, error.message);
});

module.exports = { worker };
