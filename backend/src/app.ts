import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import jipDataSource from '~/app-data-source';
import { connectMode } from '~/config';
import { logger, morganMiddleware } from '~/logger';
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

const app: express.Application = express();

app.use(morganMiddleware);
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:4242',
      'http://42library.kr',
      'https://42library.kr',
      'http://42jip.com',
    ],
    credentials: true,
  })
);

passport.use('42', FtStrategy);
passport.use('42Auth', FtAuthentication);
passport.use('jwt', JwtStrategy);

jipDataSource
  .initialize()
  .then(() => {
    logger.info('typeORM INIT SUCCESS');
    logger.info(connectMode);
  })
  .catch((e) => {
    logger.error(`typeORM INIT FAILED : ${e.message}`);
  });

// Swagger 연결
const specs = swaggerJsdoc(swaggerOptions);
app.get('/swagger.json', (_req, res) => res.json(specs));
app.use(
  '/swagger',
  swaggerUi.serveFiles(undefined, { swaggerUrl: '/swagger.json' }),
  swaggerUi.setup(undefined, { explorer: true, swaggerUrl: '/swagger.json' })
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
  }
);
app.get('/docs.json', (_req, res) => res.json(v2Specs));
app.use(
  '/docs',
  swaggerUi.serveFiles(undefined, { swaggerUrl: '/docs.json' }),
  swaggerUi.setup(undefined, { explorer: true, swaggerUrl: '/docs.json' })
);

// dev route
app.use('/api', router);

// dev/v2 route
createExpressEndpoints(contract, routerV2, app, {
  logInitialization: true,
  responseValidation: true,
});

// 에러 핸들러
app.use(errorConverter);
app.use(errorHandler);
export default app;
