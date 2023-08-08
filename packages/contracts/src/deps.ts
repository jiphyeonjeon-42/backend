import { z as rawZod } from "npm:zod@3.21.4"
import { extendZodWithOpenApi } from "npm:@anatine/zod-openapi@2.0.1"

//  zod 스키마를 확장하여 openapi 스키마를 생성
//  openapi == swagger
extendZodWithOpenApi(rawZod)

export { initContract } from "npm:@ts-rest/core@3.27.0"
export { rawZod as z }
