import { extendZodWithOpenApi } from "npm:@anatine/zod-openapi"
import { z as rawZod } from "npm:zod"

//  zod 스키마를 확장하여 openapi 스키마를 생성
//  openapi == swagger
extendZodWithOpenApi(rawZod)

export { initContract } from "npm:@ts-rest/core"
export { rawZod as z }
