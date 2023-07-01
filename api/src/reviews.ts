import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"

const postApireviews_Body = z.object({
  bookInfoId: z.number(),
  content: z.string(),
})
const putApireviewsReviewsId_Body = z.object({ content: z.string() })

export const schemas = {
  postApireviews_Body,
  putApireviewsReviewsId_Body,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/reviews",
    description:
      `책 리뷰 10개를 반환한다. 최종 페이지의 경우 1 &lt;&#x3D; n &lt;&#x3D; 10 개의 값이 반환될 수 있다. content에는 리뷰에 대한 정보를, finalPage 에는 해당 페이지가 마지막인지에 대한 여부를 boolean 값으로 반환한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "titleOrNickname",
        type: "Query",
        schema: z
          .string()
          .describe("책 제목 또는 닉네임을 검색어로 받는다.")
          .optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().describe("해당하는 페이지를 보여준다.").optional(),
      },
      {
        name: "disabled",
        type: "Query",
        schema: z
          .number()
          .describe(
            "0이라면 공개 리뷰를, 1이라면 비공개 리뷰를, -1이라면 모든 리뷰를 가져온다.",
          ),
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
      {
        name: "sort",
        type: "Query",
        schema: z
          .string()
          .describe("asc, desc 값을 통해 시간순으로 정렬된 페이지를 반환한다.")
          .optional(),
      },
    ],
    response: z.object({}),
    errors: [
      {
        status: 400,
        description: `적절하지 않은 값`,
        schema: z.object({}),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.object({}),
      },
    ],
  },
  {
    method: "post",
    path: "/api/reviews",
    description:
      `책 리뷰를 작성한다. content 길이는 10글자 이상 420글자 이하로 입력하여야 한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApireviews_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `잘못된 요청.`,
        schema: z.object({}),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.object({}),
      },
    ],
  },
  {
    method: "get",
    path: "/api/reviews/my-reviews",
    description:
      `자기자신에 대한 모든 Review 데이터를 가져온다. 내부적으로 getReview와 같은 함수를 사용한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "titleOrNickname",
        type: "Query",
        schema: z
          .string()
          .describe("책 제목 또는 닉네임을 검색어로 받는다.")
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
      {
        name: "page",
        type: "Query",
        schema: z.number().describe("해당하는 페이지를 보여준다.").optional(),
      },
      {
        name: "sort",
        type: "Query",
        schema: z
          .string()
          .describe("asd, desc 값을 통해 시간순으로 정렬된 페이지를 반환한다.")
          .optional(),
      },
      {
        name: "isMyReview",
        type: "Query",
        schema: z
          .boolean()
          .describe(
            "true 라면 마이페이지 용도의 리뷰를, false 라면 모든 리뷰를 가져온다.",
          )
          .optional(),
      },
    ],
    response: z.object({}),
    errors: [
      {
        status: 400,
        description: `잘못된 요청.`,
        schema: z.object({}),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.object({}),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/reviews/:reviewsId",
    description:
      `책 리뷰를 삭제한다. 작성자와 사서 권한이 있는 사용자만 삭제할 수 있다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "reviewsId",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("들어온 reviewsId에 해당하는 리뷰를 삭제한다."),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `잘못된 요청.`,
        schema: z.object({}),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.object({}),
      },
      {
        status: 404,
        description: `존재하지 않는 reviewsId.`,
        schema: z.object({}),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/reviews/:reviewsId",
    description: `책 리뷰의 비활성화 여부를 토글 방식으로 변환`,
    requestFormat: "json",
    parameters: [
      {
        name: "reviewsId",
        type: "Path",
        schema: z.number().int().describe("수정할 reviews ID"),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/reviews/:reviewsId",
    description:
      `책 리뷰를 수정한다. 작성자만 수정할 수 있다. content 길이는 10글자 이상 100글자 이하로 입력하여야 한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: putApireviewsReviewsId_Body,
      },
      {
        name: "reviewsId",
        type: "Path",
        schema: z.number().int().describe("수정할 reviews ID"),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `클라이언트 요청이 유효하지 않음.`,
        schema: z.object({}),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.object({}),
      },
      {
        status: 404,
        description: `존재하지 않는 reviewsId.`,
        schema: z.object({}),
      },
    ],
  },
])

export const ReviewsClient = new Zodios(endpoints)


