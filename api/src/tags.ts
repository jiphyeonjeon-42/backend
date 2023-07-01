import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"
import { paginationMetaSchema } from "./shared/paginationSchema"

const visibility = z
  .enum(["null", "public", "private"])
  .describe(
    "공개 및 비공개 여부로, public 이면 공개, private 이면 비공개, null이면 모든 서브 및 디폴트 태그만 가져온다.",
  )
  .optional()
const postApireviews_Body = z.object({
  bookInfoId: z.number(),
  content: z.string(),
})
const patchApitagssub_Body = z.object({
  id: z.number().int().describe("수정할 태그의 id"),
  visibility: z.string().describe("서브 태그의 공개 여부").optional(),
})
const patchApitagssuper_Body = z.object({
  content: z.string().describe("슈퍼 태그 내용").optional(),
  id: z.number().int().describe("수정할 태그의 id"),
})
const patchApitagsBookInfoIdmerge_Body = z.object({
  subTagIds: z.array(z.any()).describe("병합될 서브 태그의 id 리스트"),
  superTagId: z
    .number()
    .int()
    .describe("슈퍼 태그의 id. null일 경우, 디폴트 태그로 병합됨을 의미한다."),
})

export const schemas = {
  visibility,
  postApireviews_Body,
  patchApitagssub_Body,
  patchApitagssuper_Body,
  patchApitagsBookInfoIdmerge_Body,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/tags",
    description:
      `서브/디폴트 태그 정보를 검색한다. 이는 태그 관리 페이지에서 사용한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().describe("검색 결과의 페이지.").optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z
          .number()
          .int()
          .describe("검색 결과 한 페이지당 보여줄 결과물의 개수.")
          .default(10),
      },
      {
        name: "visibility",
        type: "Query",
        schema: visibility,
      },
      {
        name: "query",
        type: "Query",
        schema: z
          .string()
          .describe("태그가 달린 도서명 또는 태그의 내용으로 검색한다.")
          .nullish(),
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            bookInfoId: z
              .number()
              .int()
              .describe("태그가 등록된 도서의 infoId"),
            content: z.string().describe("서브/디폴트 태그의 내용"),
            createdAt: z.string().describe("태그가 등록된 시간"),
            id: z.number().int().describe("태그 고유 id"),
            login: z.string().describe("태그를 작성한 카뎃의 닉네임"),
            superContent: z.string().describe("슈퍼 태그의 내용"),
            title: z.string().describe("태그가 등록된 도서의 제목"),
            visibility: z
              .string()
              .describe("공개 여부. 공개는 public, 비공개는 private이다."),
          }),
        )
        .describe("태그 목록"),
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
        description: `태그 기록을 조회할 권한이 없는 사용자`,
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
    method: "post",
    path: "/api/tags/default",
    description:
      `디폴트(자식) 태그를 생성한다. 태그 길이는 42자 미만으로 해야한다.`,
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
        schema: z.void(),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/tags/sub",
    description: `서브 태그를 수정한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApitagssub_Body,
      },
    ],
    response: z.object({
      id: z.number().int().describe("수정된 서브 태그의 id"),
    }),
    errors: [
      {
        status: 400,
        description: `태그의 양식이 올바르지 않습니다.`,
        schema: z.object({ errorCode: z.literal(900) }),
      },
      {
        status: 401,
        description: `권한이 없습니다.`,
        schema: z.object({ errorCode: z.literal(902) }),
      },
      {
        status: 500,
        description: `DB 에러로 인한 업데이트 실패`,
        schema: z.object({ errorCode: z.literal(905) }),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/tags/sub/:tagId",
    description:
      `서브, 디폴트 태그를 삭제한다. 작성자만 태그를 삭제할 수 있다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "tagId",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("들어온 tagId에 해당하는 태그를 삭제한다."),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `잘못된 요청.`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `존재하지 않는 tagsId.`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/tags/super",
    description: `슈퍼 태그를 수정한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApitagssuper_Body,
      },
    ],
    response: z.object({
      id: z.number().int().describe("수정된 슈퍼 태그의 id"),
    }),
    errors: [
      {
        status: 400,
        description: `태그 수정에 실패했습니다.`,
        schema: z.object({
          errorCode: z.union([z.literal(900), z.literal(902), z.literal(906)])
            .describe(`- 900: 태그의 양식이 올바르지 않습니다.
- 902: 이미 존재하는 태그입니다.
- 906: 디폴트 태그입니다.
`),
        }),
      },
      {
        status: 500,
        description: `DB 에러로 인한 업데이트 실패`,
        schema: z.object({ errorCode: z.literal(500) }),
      },
    ],
  },
  {
    method: "post",
    path: "/api/tags/super",
    description:
      `슈퍼(부모) 태그를 생성한다. 태그 길이는 42자 미만으로 해야한다.`,
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
        schema: z.void(),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/tags/super/:tagId",
    description:
      `슈퍼 태그를 삭제한다. 사서 권한이 있는 사용자만 삭제할 수 있다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "tagId",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("들어온 tagId에 해당하는 태그를 삭제한다."),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `잘못된 요청.`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `권한 없음.`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `존재하지 않는 tagsId.`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tags/:bookInfoId",
    description:
      `슈퍼 태그(노출되는 태그), 디폴트 태그(노출되지 않고 분류되지 않은 태그)를 가져온다. 이는 도서 상세 페이지 및 태그 병합 페이지에서 사용된다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "bookInfoId",
        type: "Path",
        schema: z.number().int().describe("태그를 조회할 도서의 infoId"),
      },
    ],
    response: z.object({
      items: z
        .object({
          content: z.string().describe("슈퍼 태그 내용"),
          count: z
            .number()
            .int()
            .describe(
              "슈퍼 태그에 속한 서브 태그 개수. 슈퍼 태그는 기본값이 1이며, 0이면 디폴트 태그를 의미한다.",
            ),
          id: z.number().int().describe("슈퍼 태그 고유 id"),
          login: z
            .string()
            .describe(
              "태그를 작성한 카뎃의 인트라 id. 슈퍼 태그는 기본값이 null이며, 디폴트 태그만 작성자 값이 있다.",
            ),
          type: z
            .string()
            .describe(
              "태그의 타입. 슈퍼 태그는 'super'이며, 디폴트 태그는 'default'이다.",
            ),
        })
        .describe("슈퍼 태그, 디폴트 태그 목록"),
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
        description: `태그 기록을 조회할 권한이 없는 사용자`,
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
    path: "/api/tags/:bookInfoId/merge",
    description: `태그를 병합한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApitagsBookInfoIdmerge_Body,
      },
      {
        name: "bookInfoId",
        type: "Path",
        schema: z.number().int().describe("병합할 책 정보의 id"),
      },
    ],
    response: z.object({ id: z.number().int().describe("슈퍼 태그의 id") }),
    errors: [
      {
        status: 400,
        description: `태그의 양식이 올바르지 않습니다.`,
        schema: z.object({
          errorCode: z.union([
            z.literal(900),
            z.literal(902),
            z.literal(906),
            z.literal(910),
          ]).describe(`- 900: 태그의 양식이 올바르지 않습니다.
- 902: 이미 존재하는 태그입니다.
- 906: 디폴트 태그에는 병합할 수 없습니다.
- 910: 유효하지 않은 태그 id입니다.
`),
        }),
      },
      {
        status: 500,
        description: `DB 에러로 인한 업데이트 실패`,
        schema: z.object({ errorCode: z.number() }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/tags/:superTagId/sub",
    description:
      `superTagId에 해당하는 슈퍼 태그에 속한 서브 태그 목록을 가져온다. 태그 병합 페이지에서 슈퍼 태그의 서브 태그를 가져올 때 사용한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "superTagId",
        type: "Path",
        schema: z.unknown(),
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            content: z.string().describe("서브 태그의 내용"),
            id: z.number().int().describe("서브 태그 고유 id"),
            login: z.string().describe("서브 태그를 작성한 카뎃의 인트라 id"),
          }),
        )
        .describe("슈퍼 태그에 속한 서브 태그 목록"),
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
        description: `태그 기록을 조회할 권한이 없는 사용자`,
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

export const TagsClient = new Zodios(endpoints)


