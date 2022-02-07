import express, { Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.get('/welcome', (req: Request, res: Response) => {
  res.send('welcome!');
});

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
  apis: [],
};

const specs = swaggerJsdoc(swaggerOptions);

app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// ------------

app.listen('1234', () => {
  console.log(`
################################################
🛡️  Server listening on port: 1234🛡️
################################################
  `);
});
