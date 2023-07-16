import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { FtAuthentication, FtStrategy, JwtStrategy } from '~/v1/auth/auth.strategy';
import swaggerOptions from '~/v1/swagger/swagger';
import errorConverter from '~/v1/utils/error/errorConverter';
import errorHandler from '~/v1/utils/error/errorHandler';
import { logger, morganMiddleware } from '~/v1/utils/logger';
import { connectMode } from '~/config';
import jipDataSource from '~/app-data-source';
import router from './v1/routes';

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
    logger.info('typeORM INIT SUCCESS');
    logger.info(connectMode);
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
