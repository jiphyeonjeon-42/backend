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
  apis: ['./src/**/*.routes.ts'],
};

export default swaggerOptions;
