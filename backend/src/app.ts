import express, { Request, Response } from 'express';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import router from './routes';
import swaggerOptions from './swagger/swagger';
import errorHandler from './utils/error/errorHandler';
import { FtStrategy, JwtStrategy, FtAuthentication } from './auth/auth.strategy';
import { morganMiddleware } from './utils/logger';

const app: express.Application = express();
const cors = require('cors');

app.use(morganMiddleware);
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.urlencoded());
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
app.use(errorHandler);
export default app;
