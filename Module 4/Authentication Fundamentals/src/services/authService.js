const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const invalidCredentials = () =>
  new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function requireNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register({ name, email, password }) {
  if (
    !requireNonEmptyString(name) ||
    !requireNonEmptyString(email) ||
    !requireNonEmptyString(password)
  ) {
    throw new AuthError(400, 'INVALID_INPUT', 'Name, email, and password are required');
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new AuthError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const cost = Number(process.env.BCRYPT_COST) || 12;
  const passwordHash = await bcrypt.hash(password, cost);

  try {
    const user = await userRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });
    return safeUser(user);
  } catch (error) {
    // Protect against a concurrent registration racing on the unique email index.
    if (error && error.code === 'P2002') {
      throw new AuthError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login({ email, password }) {
  if (!requireNonEmptyString(email) || !requireNonEmptyString(password)) {
    throw new AuthError(400, 'INVALID_INPUT', 'Email and password are required');
  }

  const user = await userRepository.findByEmail(normalizeEmail(email));
  if (!user) throw invalidCredentials();

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw invalidCredentials();

  return safeUser(user);
}

module.exports = { register, login, AuthError };
