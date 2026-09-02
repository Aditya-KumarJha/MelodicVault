import { logger } from '../utils/logger.js';

async function connect() {
  logger.debug('RabbitMQ is not configured for Melodic Vault MVP auth.');
  return null;
}

async function publishToQueue(queueName, data = {}) {
  void queueName;
  void data;
  return false;
}

async function subscribeToQueue(queueName, callback) {
  void callback;
  void queueName;
  return false;
}

async function close() {
  return true;
}

const isConnected = () => false;

export { connect, publishToQueue, subscribeToQueue, close, isConnected };

export default {
  connect,
  publishToQueue,
  subscribeToQueue,
  close,
  isConnected,
};
