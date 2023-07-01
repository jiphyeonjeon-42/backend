import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"

const patchApistockupdate_Body = z.object({
  id: z.number().describe("bookId"),
})

export const schemas = {
  patchApistockupdate_Body,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/stock/search",
    description: `책 재고 정보를 검색해 온다.`,
    requestFormat: "json",
    parameters: [
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
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            author: z.string().describe("저자"),
            bookId: z.number().int().describe("도서 번호"),
            bookInfoId: z.number().int().describe("도서 정보 번호"),
            callSign: z.string().describe("책의 고유 호출 번호"),
            category: z.string().describe("책의 카테고리 정보"),
            categoryId: z.number().describe("책의 캬테고리 번호"),
            donator: z.string().describe("기부자 닉네임"),
            image: z.string().url().describe("이미지 주소"),
            isbn: z.string().describe("isbn"),
            pubishedAt: z.string().describe("출판일"),
            publisher: z.string().describe("출판사"),
            status: z.number().describe("책의 상태 정보"),
            title: z.string().describe("책 제목"),
            updatedAt: z.string().describe("책 정보의 마지막 변경 날짜"),
          }),
        )
        .describe("재고 정보 목록"),
      meta: z
        .object({
          currentPage: z.number().int().describe("현재 페이지"),
          itemCount: z.number().int().describe("현재 페이지 검색 결과 수"),
          itemsPerPage: z.number().int().describe("페이지 당 검색 결과 수"),
          totalItems: z.number().int().describe("전체 검색 결과 수"),
          totalPages: z.number().int().describe("전체 결과 페이지 수"),
        })
        .describe("재고 수와 관련된 정보"),
    }),
    errors: [
      {
        status: 500,
        description: `Server Error`,
        schema: z.object({ errorCode: z.number().describe("에러코드") }),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/stock/update",
    description: `책 재고를 확인하고 업데이트`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApistockupdate_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 307,
        description: `update 할 수 없는 bookId`,
        schema: z.void(),
      },
    ],
  },
])

export const StockClient = new Zodios(endpoints)


