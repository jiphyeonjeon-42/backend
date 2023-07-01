import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"
import { paginationMetaSchema } from "./shared/paginationSchema"

const postApiuserscreate_Body = z.object({
  email: z.string(),
  password: z.string(),
})
const patchApiusersupdateId_Body = z.object({
  intraId: z.number().int(),
  nickname: z.string(),
  penaltyEndDate: z.string(),
  role: z.number().int(),
  slack: z.string(),
})

export const schemas = {
  postApiuserscreate_Body,
  patchApiusersupdateId_Body,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/users/EasterEgg",
    description: `집현전 개발 버전을 확인합니다.`,
    requestFormat: "json",
    response: z.object({ version: z.string().describe("에러코드") }),
  },
  {
    method: "post",
    path: "/api/users/create",
    description: `유저를 생성한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiuserscreate_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `입력된 인자가 부적절합니다`,
        schema: z.object({
          errorCode: z.number().describe("error description"),
        }),
      },
      {
        status: 500,
        description: `Server Error`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/users/myupdate",
    description: `유저 정보를 변경한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApiuserscreate_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `들어온 인자가 없습니다..`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
      {
        status: 403,
        description: `수정하려는 계정이 본인의 계정이 아닙니다`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
      {
        status: 409,
        description: `수정하려는 값이 중복됩니다`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
      {
        status: 500,
        description: `Server Error`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/users/search",
    description:
      `유저 정보를 검색해 온다. query 가 null이면 모든 유저를 검색한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "nicknameOrEmail",
        type: "Query",
        schema: z
          .string()
          .describe("검색할 유저의 nickname or email")
          .optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().describe("페이지").optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z
          .number()
          .int()
          .describe("한 페이지에 들어올 검색결과 수")
          .optional(),
      },
      {
        name: "id",
        type: "Query",
        schema: z.number().int().describe("검색할 유저의 id").optional(),
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            email: z.string().describe("이메일"),
            id: z.number().int().describe("유저 번호"),
            intraId: z.number().int().describe("인트라 고유 번호"),
            lendings: z.array(z.any()).describe("해당 유저의 대출 정보"),
            nickname: z.string().describe("닉네임"),
            overDueDay: z.string().describe("현재 연체된 날수"),
            penaltyEndDate: z.string().describe("패널티 끝나는 날짜"),
            reservations: z.array(z.any()).describe("해당 유저의 예약 정보"),
            role: z.number().int().describe("권한"),
            slack: z.string().describe("slack 멤버 Id"),
          }),
        )
        .describe("유저 정보 목록"),
      meta: paginationMetaSchema,
    }),
    errors: [
      {
        status: 400,
        description: `Client Error Bad Request`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
      {
        status: 500,
        description: `Server Error`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/users/update/:id",
    description: `유저 정보를 변경한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApiusersupdateId_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int().describe("변경할 유저의 id 값"),
      },
    ],
    response: z.object({
      intraId: z.string().describe("인트라 ID"),
      nickname: z.string().describe("에러코드"),
      penaltyEbdDate: z.string().describe("패널티가 끝나는 날"),
      role: z.string().describe("유저의 권한"),
      slack: z.string().describe("slack 맴버 변수"),
    }),
    errors: [
      {
        status: 400,
        description: `nickname, intraId, slack, role 중 아무것도 없습니다..`,
        schema: z.object({ errorCode: z.number().int() }),
      },
      {
        status: 500,
        description: `DB Error`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
    ],
  },
])

export const UsersClient = new Zodios(endpoints)

