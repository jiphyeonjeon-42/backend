import express, { Request, Response, Router } from 'express';
import passport from 'passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { router } from './routes';
import { swaggerOptions } from './swagger/swagger';
import errorHandler from './errorHandler';
import cookieParser from 'cookie-parser';
import { FtStrategy, JwtStrategy } from './auth/auth.strategy';
import { morganMiddleware } from './utils/logger';

const app: express.Application = express();

app.use(morganMiddleware);
app.use(cookieParser());
app.use(passport.initialize());

passport.use('42', FtStrategy);
passport.use('jwt', JwtStrategy);

app.get('/welcome', (req: Request, res: Response) => {
  res.send('welcome!');
});

// Swagger 연결
const specs = swaggerJsdoc(swaggerOptions);
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true }),
);

// dev route
app.use('/api', router);

//에러 핸들러
app.use(errorHandler);
export default app;