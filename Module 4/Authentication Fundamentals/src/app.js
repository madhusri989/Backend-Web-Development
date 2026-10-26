require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  const code = status === 500 ? 'INTERNAL_ERROR' : error.code;
  const message = status === 500 ? 'Internal server error' : error.message;

  // Do not log request bodies, credentials, hashes, or raw database errors.
  if (status === 500) console.error('Authentication request failed');
  return res.status(status).json({ error: { code, message } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on ${port}`));
