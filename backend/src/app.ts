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

// eslint-disable-next-line import/no-extraneous-dependencies
import { contract } from '@jiphyeonjeon-42/contracts';
// eslint-disable-next-line import/no-extraneous-dependencies
import { generateOpenApi } from '@ts-rest/open-api';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createExpressEndpoints } from '@ts-rest/express';

import router from '~/v1/routes';
import routerV2 from '~/v2/routes';
import lusca from "lusca";
import session from 'express-session';
import * as crypto from "crypto";
import { morganMiddleware } from './logger';

const app: express.Application = express();
const secret = crypto.randomBytes(42).toString('hex');

app.use(session({
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
  }
}));
app.use(morganMiddleware);
app.use(cookieParser(
  secret,
));
app.use(lusca.csrf());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:4242',
      'https://localhost:4242',
      'http://42library.kr',
      'https://42library.kr',
      'http://42jip.com',
    ],
    credentials: true,
  }),
);

passport.use('42', FtStrategy);
passport.use('42Auth', FtAuthentication);
passport.use('jwt', JwtStrategy);

// Swagger 연결
const specs = swaggerJsdoc(swaggerOptions);
const v1JsonPath = '/swagger/openapi.json';
app.get(v1JsonPath, (_req, res) => res.json(specs));
app.use(
  '/swagger',
  swaggerUi.serveFiles(undefined, { swaggerUrl: v1JsonPath }),
  swaggerUi.setup(undefined, { explorer: true, swaggerUrl: v1JsonPath }),
);

const v2Specs = generateOpenApi(
  contract,
  {
    info: {
      title: 'Reviews Patch API (WIP)',
      version: '0.0.2-alpha',
    },
  },
  {
    setOperationId: false,
  },
);

const v2JsonPath = '/swagger-v2/openapi.json';
app.get(v2JsonPath, (_req, res) => res.json(v2Specs));
app.use(
  '/swagger-v2',
  swaggerUi.serveFiles(undefined, { swaggerUrl: v2JsonPath }),
  swaggerUi.setup(undefined, { explorer: true, swaggerUrl: v2JsonPath }),
);

// dev route
app.use('/api', router);

// dev/v2 route
createExpressEndpoints(contract, routerV2, app, {
  logInitialization: true,
  responseValidation: true,
  jsonQuery: true,
});

// 에러 핸들러
app.use(errorConverter);
app.use(errorHandler);

export default app;
