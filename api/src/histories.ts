import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"
import { paginationMetaSchema } from "./shared/paginationMetaSchema"

const who = z.enum(["all", "my"]).describe("대출/반납의 기록 범위")
const type = z
  .enum(["user", "title", "callsign", "bookId"])
  .describe("어떤 값들로 검색하고 싶은지 결정하는 필터")
  .optional()

export const schemas = {
  who,
  type,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/histories",
    description:
      `현재까지의 대출 기록을 최신순으로 가져온다. 사서라면 모든 사용자의 기록을, 사서가 아니라면 본인의 기록만 볼  수 있다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "who",
        type: "Query",
        schema: who,
      },
      {
        name: "query",
        type: "Query",
        schema: z.string().describe("검색어").optional(),
      },
      {
        name: "type",
        type: "Query",
        schema: type,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().describe("페이지 수").optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().describe("한 페이지 표시 개수").optional(),
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            bookInfoId: z.number().int().describe("book_info의 id"),
            callSign: z.string().describe("청구 기호"),
            createdAt: z.string().describe("lending 생성 일시"),
            dueDate: z.string().describe("반납 마감 일시"),
            id: z.number().int().describe("고유 id"),
            image: z.string().describe("책의 이미지 주소"),
            lendingCondition: z.string().describe("대출시 책 상태"),
            lendingLibrarianNickName: z.string().describe("대출해준 사서 이름"),
            login: z.string().describe("대출자 아이디"),
            penaltyDays: z.number().int().describe("연체 일"),
            returnedAt: z.string().describe("반납 일시"),
            returningCondition: z.string().describe("반납시 책 상태"),
            returningLibrarianNickname: z
              .string()
              .describe("반납해준 사서 이름(없으면 null)"),
            title: z.string().describe("책 제목"),
          }),
        )
        .describe("검색된 대출 기록들의 목록"),
      meta: paginationMetaSchema,
    }),
    errors: [
      {
        status: 401,
        description: `사서권한 없은 유저가 전체 대출/반납 기록을 조회하려고 함`,
        schema: z.object({ errorCode: z.number().int() }),
      },
    ],
  },
])

export const HistoriesClient = new Zodios(endpoints)


