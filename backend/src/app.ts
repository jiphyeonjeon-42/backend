import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { zodiosApp } from '@zodios/express';

import jipDataSource from './app-data-source';
import { FtAuthentication, FtStrategy, JwtStrategy } from './auth/auth.strategy';
import { connectMode } from './config';
import router from './routes';
import errorConverter from './utils/error/errorConverter';
import errorHandler from './utils/error/errorHandler';
import { logger, morganMiddleware } from './utils/logger';
import { document, newDocument } from './openapi';

const app = zodiosApp();

app.use(morganMiddleware);
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:4242',
    'http://42library.kr',
    'https://42library.kr',
    'http://42jip.com',
  ],
  credentials: true,
}));

passport.use('42', FtStrategy);
passport.use('42Auth', FtAuthentication);
passport.use('jwt', JwtStrategy);

jipDataSource.initialize().then(
  () => {
    logger.info('typeORM INIT SUCCESS');
    logger.info(connectMode);
  },
).catch(
  (e) => {
    logger.error(`typeORM INIT FAILED : ${e.message}`);
  },
);

// Swagger (기존)
app.use('/swagger.json', (_, res) => res.json(document));
app.use('/swagger', swaggerUi.serveFiles(document));
app.use('/swagger', swaggerUi.setup(undefined, { swaggerUrl: '/swagger.json', explorer: true }));

// Swagger (신규)
app.use('/docs.json', (_, res) => res.json(newDocument));
app.use('/docs', swaggerUi.serveFiles(newDocument));
app.use('/docs', swaggerUi.setup(undefined, { swaggerUrl: '/docs.json', explorer: true }));

// dev route
app.use('/api', router);

// 에러 핸들러
app.use(errorConverter);
app.use(errorHandler);
export default app;
