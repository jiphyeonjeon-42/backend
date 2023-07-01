import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"
import { paginationMetaSchema } from "./shared/paginationMetaSchema"

const postApilendings_Body = z.object({
  bookId: z.number().int(),
  condition: z.string(),
  userId: z.number().int(),
})
const patchApilendingsreturn_Body = z.object({
  condition: z.string(),
  lendingId: z.number().int(),
})
const sort__3 = z
  .enum(["new", "old"])
  .describe("검색 결과를 정렬할 기준")
  .default("new")
const type__2 = z
  .enum(["user", "title", "callSign", "bookId"])
  .describe("query를 조회할 항목")
  .optional()

export const schemas = {
  postApilendings_Body,
  patchApilendingsreturn_Body,
  sort__3,
  type__2,
}

export const endpoints = makeApi([
  {
    method: "post",
    path: "/api/lendings",
    description: `대출 기록을 생성한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description:
          `bookId와 userId는 각각 대출할 도서와 대출할 회원의 pk, condition은 대출 당시 책 상태를 의미한다.`,
        type: "Body",
        schema: postApilendings_Body,
      },
    ],
    response: z.object({ dueDate: z.string() }),
    errors: [
      {
        status: 400,
        description:
          `잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등`,
        schema: z.object({ errorCode: z.number().int() }),
      },
      {
        status: 401,
        description: `대출을 생성할 권한이 없는 사용자`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `db 에러`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/lendings/return",
    description: `대출 레코드에 반납 처리를 한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description:
          `lendingId는 대출 고유 아이디, condition은 반납 당시 책 상태`,
        type: "Body",
        schema: patchApilendingsreturn_Body,
      },
    ],
    response: z.object({
      reservedBook: z
        .boolean()
        .describe("반납된 책이 예약이 되어있는지 알려줌"),
    }),
    errors: [
      {
        status: 400,
        description:
          `에러코드 0 dto에러 잘못된 json key, 1 db 에러 알 수 없는 lending id 등`,
        schema: z.object({ errorCode: z.number().int() }),
      },
      {
        status: 401,
        description: `알 수 없는 사용자 0 로그인 안 된 유저 1 사서권한없음`,
        schema: z.object({ errorCode: z.number().int() }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/lendings/search",
    description: `대출 기록의 정보를 검색하여 보여준다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z
          .number()
          .int()
          .describe("검색 결과의 페이지")
          .default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z
          .number()
          .int()
          .describe("검색 결과 한 페이지당 보여줄 결과물의 개수")
          .default(5),
      },
      {
        name: "sort",
        type: "Query",
        schema: sort__3,
      },
      {
        name: "query",
        type: "Query",
        schema: z
          .string()
          .describe(
            "대출 기록에서 검색할 단어, 검색 가능한 필드 [user, title, callSign, bookId]",
          )
          .optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: type__2,
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            callSign: z.string().describe("대출된 책의 청구기호"),
            condition: z.string().describe("대출 당시 책 상태"),
            createdAt: z.string(),
            dueDate: z.string().describe("반납기한"),
            id: z.number().int().describe("대출 고유 id"),
            login: z.string().describe("대출한 카뎃의 인트라 id"),
            penaltyDays: z
              .number()
              .int()
              .describe("현재 대출 기록의 연체 일수"),
            title: z.string().describe("대출된 책의 제목"),
          }),
        )
        .describe("검색된 책들의 목록"),
      meta: paginationMetaSchema,
    }),
    errors: [
      {
        status: 400,
        description:
          `잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `대출을 조회할 권한이 없는 사용자`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `db 에러`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/lendings/:lendingId",
    description: `특정 대출 기록의 상세 정보를 보여준다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "lendingId",
        type: "Path",
        schema: z.number().int().describe("대출 기록의 고유 아이디"),
      },
    ],
    response: z.object({
      callSign: z.string().describe("대출된 책의 청구기호"),
      condition: z.string().describe("대출 당시 책 상태"),
      createdAt: z.string().describe("대출 일자(대출 레코드 생성 일자)"),
      dueDate: z.string().describe("반납기한"),
      id: z.number().int().describe("대출 고유 id"),
      image: z.string().describe("대출된 책의 표지"),
      login: z.string().describe("대출한 카뎃의 인트라 id"),
      penaltyDays: z.number().int().describe("현재 대출 기록의 연체 일수"),
      title: z.string().describe("대출된 책의 제목"),
    }),
    errors: [
      {
        status: 400,
        description:
          `잘못된 요청. 잘못 입력된 json key, 유효하지 않은 lendingId 등`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `대출을 조회할 권한이 없는 사용자`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `db 에러`,
        schema: z.void(),
      },
    ],
  },
])

export const LendingsClient = new Zodios(endpoints)


