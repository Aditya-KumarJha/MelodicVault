const write = (level, message, ...args) => {
  console[level]?.(`[auth] ${message}`, ...args);
};

const logger = {
  info: (message, ...args) => write('info', message, ...args),
  warn: (message, ...args) => write('warn', message, ...args),
  error: (message, ...args) => write('error', message, ...args),
  debug: (message, ...args) => {
    if (process.env.LOG_LEVEL === 'debug') {
      write('debug', message, ...args);
    }
  },
};

const morganStream = {
  write: (message) => logger.info(message.trimEnd()),
};

export { logger, morganStream };
