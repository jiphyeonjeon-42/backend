import express, { Request, Response, Router } from 'express';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import * as auth from './auth/auth.route';
import { FtStrategy, JwtStrategy } from './auth/auth.strategy';

const app = express();

app.use(cookieParser());
app.use(passport.initialize());

passport.use('42', FtStrategy);
passport.use('jwt', JwtStrategy);

app.get('/welcome', (req: Request, res: Response) => {
  res.send('welcome!');
});

// ----------- set routers

const router = Router();
router.use(auth.path, auth.router);

app.use('/api', router);

// ----------- set swagger-ui options

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '42-jiphyoenjeon web service API',
      version: '0.1.0',
      description:
        "42-jiphyeonjeon web service, that is, 42library's APIs with Express and documented with Swagger",
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'jolim',
        url: 'https://github.com/evelon/',
        email: 'ezemango@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/',
      },
    ],
  },
  apis: ['./src/**/*.controller.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);

app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true }),
);

// ------------

app.listen('3000', () => {
  console.log(`
################################################
🛡️  Server listening on port: 3000🛡️
################################################
  `);
});

// queryTest();
// usersTest();
