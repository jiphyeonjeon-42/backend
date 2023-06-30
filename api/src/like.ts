import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"

export const endpoints = makeApi([
  {
    method: "delete",
    path: "/api/books/info/:bookInfoId/like",
    requestFormat: "json",
    parameters: [
      {
        name: "bookInfoId",
        type: "Path",
        schema: z.number().int().describe("book_info 테이블의 id"),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `유효하지 않은 입력`,
        schema: z.object({
          errorCode: z.union([z.literal(601), z.literal(603)])
            .describe(`- 601: bookInfoId가 유효하지 않음
- 603: 존재하지 않는 좋아요데이터를 삭제하려 함.
`),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/books/info/:bookInfoId/like",
    description: `Get info about likenum and whether user press like button`,
    requestFormat: "json",
    parameters: [
      {
        name: "bookInfoId",
        type: "Path",
        schema: z.number().int().describe("book_info 테이블의 id"),
      },
    ],
    response: z.object({
      bookInfoId: z.number().int().describe("좋아요할 bookInfo의 id"),
      isLiked: z
        .boolean()
        .describe("사용자가 이 책에 대하여 좋아요를 눌렀는 지 여부"),
      likeNum: z.number().int().describe("이 책에 눌린 좋아요의 수"),
    }),
    errors: [
      {
        status: 400,
        description: `bookInfoId가 유효하지 않음`,
        schema: z.object({
          errorCode: z.literal(601).describe(`- 601: bookInfoId가 유효하지 않음
`),
        }),
      },
    ],
  },
  {
    method: "post",
    path: "/api/books/info/:bookInfoId/like",
    requestFormat: "json",
    parameters: [
      {
        name: "bookInfoId",
        type: "Path",
        schema: z.number().int().describe("book_info 테이블의 id"),
      },
    ],
    response: z.object({
      bookInfoId: z.number().int().describe("좋아요할 bookInfo의 id"),
      userId: z.number().int().describe("좋아요를 누른 유저의 id"),
    }),
    errors: [
      {
        status: 400,
        description: `유효하지 않은 입력`,
        schema: z.object({
          errorCode: z.union([z.literal(601), z.literal(602)])
            .describe(`- 601: bookInfoId가 유효하지 않음
- 602: 중복된 like데이터가 이미 존재함.
`),
        }),
      },
    ],
  },
])

export const LikeApi = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
