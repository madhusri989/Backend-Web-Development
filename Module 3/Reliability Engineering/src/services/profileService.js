const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  if (!error) return false;

  if (error.name === 'AbortError') return true;

  const status = error.status ?? error.statusCode ?? error.response?.status;

  // Network errors have no HTTP status; retry them along with 429 and 5xx.
  if (status === undefined || status === null) return true;
  if (status === 429) return true;
  return status >= 500 && status <= 599;
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  let timer;

  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      const error = new Error(`Operation timed out after ${timeoutMs}ms`);
      error.name = 'AbortError';
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      Promise.resolve().then(() => operation(controller.signal)),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 25;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const hasAttemptsLeft = attempt + 1 < maxAttempts;
      if (!hasAttemptsLeft || !isRetryable(error)) {
        throw error;
      }

      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  // maxAttempts should be positive; this protects callers passing zero.
  throw new Error('Operation failed without being attempted');
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs ?? 200;
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 25;

  try {
    const avatar = await withRetry(
      () => withTimeout(
        signal => avatarClient.getAvatar(authorId, { signal }),
        timeoutMs,
      ),
      { maxAttempts, baseDelayMs },
    );

    return { authorId, avatar, degraded: false };
  } catch (error) {
    // Avatar data is optional, so dependency failures must not break the profile.
    return { authorId, avatar: DEFAULT_AVATAR, degraded: true };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};
