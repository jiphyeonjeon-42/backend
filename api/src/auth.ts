import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"

const postApiauthlogin_Body = z.object({
  id: z.string(),
  password: z.string(),
})

export const schemas = {
  postApiauthlogin_Body,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/auth/getIntraAuthentication",
    description:
      `42 Api에 API key값을 추가해서 요청한다. redirect 되기에 반환값 확인 불가`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `정상적으로 42 Api로 이동`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/auth/intraAuthentication",
    description:
      `42 intra 인증을 실시한다. redirect 되어 들어오기에 반환값 확인 불가.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `성공적으로 토큰 발급`,
        schema: z.void(),
      },
      {
        status: 400,
        description: `ID, PW 값이 없는 잘못된 요청`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 401,
        description: `토큰이 없을 경우, 이미 인증된 회원의 경우 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 410,
        description: `해당 토큰의 유저가 DB에 없을 경우의 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 500,
        description: `예상 하지 못한 오류`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
    ],
  },
  {
    method: "post",
    path: "/api/auth/login",
    description:
      `입력된 회원정보를 Users DB에서 확인하여, Token을 발급해 쿠키에 저장해준다.`,
    requestFormat: "form-url",
    parameters: [
      {
        name: "body",
        description: `로그인할 유저 정보`,
        type: "Body",
        schema: postApiauthlogin_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `ID, PW 값이 없는 잘못된 요청`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 401,
        description: `ID를 찾을 수 없는 경우`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 403,
        description: `PW가 틀린 경우`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 500,
        description: `예상 하지 못한 오류`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
    ],
  },
  {
    method: "post",
    path: "/api/auth/logout",
    description: `발급한 token을 소멸시킨다.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/auth/me",
    description: `클라이언트의 로그인된 유저 정보를 받아온다.`,
    requestFormat: "json",
    response: z.object({
      email: z.string().describe("email"),
      id: z.number().int().describe("로그인한 유저의 PK"),
      intra: z.string().describe("인트라 아이디 (인트라아이디가 없다면 email)"),
      librarian: z.boolean().describe("사서 여부"),
    }),
    errors: [
      {
        status: 401,
        description: `토큰이 없을 경우 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 403,
        description: `권한이 맞지 않을때 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 410,
        description: `해당 토큰의 유저가 DB에 없을 경우의 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 500,
        description: `예상 하지 못한 오류`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/auth/oauth",
    description:
      `42 Api에 API key값을 추가해서 요청한다. redirect 되기에 반환값 확인 불가`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `정상적으로 42 Api로 이동`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/auth/token",
    description:
      `42 OAuth Api의 반환값을 이용하여 토큰을 발급한다. redirect 되기에 반환값 확인 불가.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 302,
        description: `성공적으로 토큰 발급`,
        schema: z.void(),
      },
      {
        status: 401,
        description:
          `42 api와 연동된 ID가 없음, [front에서 알림 후 회원가입창으로 이동]`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 500,
        description: `예상 하지 못한 오류`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/slack/updateSlackList",
    description: `인증된 회원의 Slack ID를 추가한다. (사서만 가능)`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `토큰이 없을 경우 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 403,
        description: `권한이 맞지 않을때 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 410,
        description: `해당 토큰의 유저가 DB에 없을 경우의 에러`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
      {
        status: 500,
        description: `예상 하지 못한 오류`,
        schema: z.object({ code: z.number(), message: z.string() }),
      },
    ],
  },
])

export const AuthApi = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
