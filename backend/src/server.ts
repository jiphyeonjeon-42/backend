/// <reference types="vite/client" />

import { createHttpTerminator } from 'http-terminator';
import jipDataSource from '~/app-data-source';
import { gracefulTerminationTimeout } from '~/config';
import { logger } from '~/logger';
import { scheduler } from '~/v1/utils/scheduler';
import app from './app';

const port = '3000';

const server = app.listen(port, () => {
  logger.info(`
  ################################################
  🛡️  Server listening on port: ${port}🛡️
  ################################################
    `);
  scheduler();
});

const httpTerminator = createHttpTerminator({ server, gracefulTerminationTimeout });

/** 자원 할당 해제 */
const releaseResources = async () => {
  if (jipDataSource.isInitialized) {
    try {
      await jipDataSource.destroy();
      logger.warn('successfuly closed typeorm connection to database');
    } catch (error) {
      logger.error('error when closing database connection', error);
    }
  }
  await httpTerminator.terminate();
  logger.warn('closed http server');
};

/** 종료 시그널을 받으면 할당된 자원(typeorm DB 연결, 소켓)을 반환하고 서버를 종료합니다. */
const attemptGracefulShutdown = async (signal: string) => {
  logger.warn(`Attempting to gracefully shutdown for ${signal}`);
  await releaseResources();
  process.exit(0);
};

const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
signals.forEach((signal) => process.on(signal, () => attemptGracefulShutdown(signal)));

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', releaseResources);
  import.meta.hot.dispose(releaseResources);
}
