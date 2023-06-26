import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import jipDataSource from './app-data-source';
import { FtAuthentication, FtStrategy, JwtStrategy } from './auth/auth.strategy';
import { connectMode } from './config';
import router from './routes';
import swaggerOptions from './swagger/swagger';
import errorConverter from './utils/error/errorConverter';
import errorHandler from './utils/error/errorHandler';
import { logger, morganMiddleware } from './utils/logger';

const app: express.Application = express();

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
    // logger.info('typeORM INIT SUCCESS');
    // logger.info(connectMode);
    console.log('server :', new Date().toISOString());
  },
).catch(
  (e) => {
    logger.error(`typeORM INIT FAILED : ${e.message}`);
  },
);

// Swagger 연결
const specs = swaggerJsdoc(swaggerOptions);
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true }),
);

// dev route
app.use('/api', router);

// 에러 핸들러
app.use(errorConverter);
app.use(errorHandler);
export default app;
