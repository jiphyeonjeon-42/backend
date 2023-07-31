import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

//  zod 스키마를 확장하여 openapi 스키마를 생성
//  openapi == swagger
extendZodWithOpenApi(z);

export { z };
