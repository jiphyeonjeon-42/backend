import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/book-info/:bookInfoId/reviews",
    description:
      `책 리뷰 10개를 반환한다. 최종 페이지의 경우 1 &lt;&#x3D; n &lt;&#x3D; 10 개의 값이 반환될 수 있다. content에는 리뷰에 대한 정보를, finalPage 에는 해당 페이지가 마지막인지에 대한 여부를 boolean 값으로 반환한다. finalReviewsId는 마지막 리뷰의 Id를 반환하며, 반환할 아이디가 존재하지 않는 경우에는 해당 인자를 반환하지 않는다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "bookInfoId",
        type: "Path",
        schema: z
          .number()
          .describe("bookInfoId에 해당 하는 리뷰 페이지를 반환한다."),
      },
      {
        name: "reviewsId",
        type: "Query",
        schema: z
          .number()
          .describe(
            "해당 reviewsId를 조건으로 asc 기준 이후, desc 기준 이전의 페이지를 반환한다. 기본값은 첫 페이지를 반환한다.",
          )
          .optional(),
      },
      {
        name: "sort",
        type: "Query",
        schema: z
          .string()
          .describe(
            "asc, desc 값을 통해 시간순으로 정렬된 페이지를 반환한다. 기본값은 asd으로 한다.",
          )
          .optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z
          .number()
          .describe(
            "한 페이지에서 몇 개의 게시글을 가져올 지 결정한다. [default = 10]",
          )
          .optional(),
      },
    ],
    response: z.object({}),
    errors: [
      {
        status: 400,
        description: `적절하지 않은 인자값이 들어온 경우의 에러`,
        schema: z.object({}),
      },
    ],
  },
])

export const BookInfo_reviewsClient = new Zodios(endpoints)


