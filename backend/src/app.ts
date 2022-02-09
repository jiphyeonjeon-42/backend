import express, { Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { router } from './routes';
import { swaggerOptions } from './swagger/swagger';
import errorHandler from './errorHandler';

const app: express.Application = express();

// server 접속 시 GET
app.get('/', (req: Request, res: Response) => {
  res.send('welcome!');
});


// Swagger 연결
const specs = swaggerJsdoc(swaggerOptions);
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// dev route
app.use('/api', router);

//에러 핸들러
app.use(errorHandler);
export default app;
