import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"

const postApireservations_Body = z.object({
  bookInfoId: z.number().int().describe("예약 대상이 되는 책 정보의 id"),
})
const filter = z
  .enum(["pending", "expired", "waiting", "all"])
  .describe("조회 범위를 제한하기 위한 필터 옵션")
  .optional()
  .default("pending")

export const schemas = {
  postApireservations_Body,
  filter,
}

export const endpoints = makeApi([
  {
    method: "post",
    path: "/api/reservations",
    description: `jwt로 인증된 유저가 예약을 생성한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApireservations_Body,
      },
    ],
    response: z.object({ count: z.number().int().describe("예약 순위") }),
    errors: [
      {
        status: 400,
        description: `예약에 실패함`,
        schema: z.object({
          errorCode: z.union([
            z.literal(2),
            z.literal(502),
            z.literal(503),
            z.literal(504),
            z.literal(505),
            z.literal(506),
            z.literal(507),
            z.literal(508),
            z.literal(509),
          ]).describe(`- 2: 올바르지 않은 입력
- 502: 패널티 기간
- 503: 대출이 가능한 책
- 504: 이미 예약중인 책
- 505: 이미 대출중인 책
- 506: 이미 2권 대출중
- 507: 사용자가 존재하지 않음
- 508: RESERVATION_NOT_EXIST
- 509: NOT_RESERVED
`),
        }),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/reservations/cancel/:id",
    description: `예약을 취소한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int().describe("예약 고유 아이디"),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description:
          `에러코드 0 dto에러 잘못된 json key 1 존재하지 않는 예약 아이디`,
        schema: z.object({ errorCode: z.number().int() }),
      },
      {
        status: 401,
        description: `알 수 없는 사용자`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/reservations/count",
    description: `책 예약 대기 수를 확인한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "bookInfo",
        type: "Query",
        schema: z
          .string()
          .describe("bookInfo에 해당하는 예약 대기 수를 확인할 수 있다.")
          .optional(),
      },
    ],
    response: z.object({ count: z.number().int().describe("예약 순위") }),
    errors: [
      {
        status: 400,
        description: `잘못된 정보를 입력한 경우`,
        schema: z.object({
          errorCode: z
            .number()
            .int()
            .describe("여러 가지 경우의 에러를 나타내는 코드"),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/reservations/search",
    description: `사서는 모든 예약 정보를 조회할 수 있다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "query",
        type: "Query",
        schema: z
          .string()
          .describe(
            "조회하기 위한 검색어 (인트라아이디, 책제목, 청구기호 중 일부)",
          )
          .optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().describe("페이지 수").optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z
          .number()
          .int()
          .describe("한 페이지 표시 개수")
          .optional()
          .default(5),
      },
      {
        name: "filter",
        type: "Query",
        schema: filter,
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            bookId: z.number().int().describe("book id"),
            callSign: z.string().describe("예약된 책 청구기호"),
            createdAt: z.string().describe("예약 생성일"),
            endAt: z.string().describe("예약 만료일"),
            image: z.string().describe("예약된 책 표지 사진"),
            login: z.string().describe("예약한 사람의 login ID"),
            penaltyDays: z.number().int().describe("예약한 사람의 연체 정보"),
            reservationId: z.number().int().describe("예약 고유 id"),
            status: z.number().int().describe("예약 상태"),
            title: z.string().describe("예약된 책 제목"),
            userId: z.number().int().describe("유저 ID"),
          }),
        )
        .describe("검색된 책들의 목록"),
      meta: z
        .object({
          currentPage: z.number().int().describe("현재 페이지"),
          itemCount: z.number().int().describe("현재 페이지 검색 결과 수"),
          itemsPerPage: z.number().int().describe("페이지 당 검색 결과 수"),
          totalItems: z.number().int().describe("전체 예약 검색 결과 건수"),
          totalPages: z.number().int().describe("전체 결과 페이지 수"),
        })
        .describe("예약 건수와 관련된 정보"),
    }),
    errors: [
      {
        status: 400,
        description:
          `query, page, limit, filter중 하나에 유효하지 않은 value가 들어온 경우`,
        schema: z.string(),
      },
      {
        status: 401,
        description: `사서 권한 없는 요청`,
        schema: z.void(),
      },
    ],
  },
])

export const ReservationsApi = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
