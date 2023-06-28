import { createHttpTerminator } from 'http-terminator';
import app from './app';
import jipDataSource from './app-data-source';
import { logger } from './utils/logger';
import scheduler from './utils/scheduler';
import { gracefulTerminationTimeout } from './config';

const port = '3000';

const server = app.listen(port, () => {
  // console.log(`
  // ################################################
  // 🛡️  Server listening on port: ${port}🛡️
  // ################################################
  //   `);
  // console.log('server loaded, shutting off');
  // process.exit(0);
  // scheduler();
});

const httpTerminator = createHttpTerminator({ server, gracefulTerminationTimeout });

/** 종료 시그널을 받으면 할당된 자원(typeorm DB 연결, 소켓)을 반환하고 서버를 종료합니다. */
const attemptGracefulShutdown = async (signal: string) => {
  // logger.warn(`Attempting to gracefully shutdown for ${signal}`);
  if (jipDataSource.isInitialized) {
    try {
      await jipDataSource.destroy();
      // logger.warn('successfuly closed typeorm connection to database');
    } catch (error) {
      // logger.error('error when closing database connection', error);
    }
  }
  await httpTerminator.terminate();
  // logger.warn('closed http server');
  process.exit(0);
};

const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
signals.forEach((signal) => process.on(signal, () => attemptGracefulShutdown(signal)));
