import { openApiBuilder } from '@zodios/openapi';
import { Options } from 'swagger-jsdoc';

export const swaggerOptions = {
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
} satisfies Options;

export const zodiosSwaggerOptions: Parameters<typeof openApiBuilder>[0] = {
  title: '집현전 웹서비스 API (v2) (WIP)',
  version: '0.0.1',
  description:
          '@jiphyeonjeon/api에서 자동 생성된 API입니다. 개발중. 현재 동작하는 API만 추가되어 있습니다.',
  license: {
    name: 'MIT',
    url: 'https://spdx.org/licenses/MIT.html',
  },
  contact: {
    name: 'scarf005',
    url: 'https://github.com/scarf005/',
    email: 'greenscarf005@gmail.com',
  },
};
