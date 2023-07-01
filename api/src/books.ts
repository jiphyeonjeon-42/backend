import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core"
import { z } from "zod"
import { paginationMetaSchema } from "./shared/paginationMetaSchema"

const postApibookscreate_Body = z.object({
  author: z.string(),
  categoryId: z.string(),
  donator: z.string().nullable(),
  image: z.string().nullable(),
  isbn: z.string().nullable(),
  pubdate: z.string(),
  publisher: z.string(),
  title: z.string(),
})
const sort = z.enum(["new", "popular"]).describe("정렬 기준")
const sort__2 = z
  .enum(["title", "popular", "new"])
  .describe("정렬 기준")
  .optional()
const patchApibooksupdate_Body = z.object({
  author: z.string().describe("저자").nullable(),
  bookId: z.number().int().describe("bookId"),
  bookInfoId: z.number().int().describe("bookInfoId"),
  callSign: z.string().describe("청구기호").nullable(),
  categoryId: z.number().int().describe("categoryId"),
  image: z.string().describe("표지이미지").nullable(),
  publishedAt: z.string().describe("출판연월").nullable(),
  publisher: z.string().describe("출판사").nullable(),
  status: z.number().int().describe("도서 상태"),
  title: z.string().describe("제목").nullable(),
})

export const schemas = {
  postApibookscreate_Body,
  sort,
  sort__2,
  patchApibooksupdate_Body,
}

export const endpoints = makeApi([
  {
    method: "get",
    path: "/api/books/create",
    description: `책 생성을 위한 정보를 반환합니다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "isbnQuery",
        type: "Query",
        schema: z.string().describe("isbn번호"),
      },
    ],
    response: z.object({
      bookInfo: z.object({
        author: z.string().describe("저자"),
        category: z.string().describe("십진분류법상 대분류").nullable(),
        image: z.string().describe("책 표지 이미지 주소").nullable(),
        isbn: z.string().describe("ISBN 번호"),
        pubdate: z.string().describe("출판일자"),
        publisher: z.string().describe("출판사"),
        title: z.string().describe("책의 제목"),
      }),
    }),
    errors: [
      {
        status: 500,
        description: `ISBN 검색이 실패한 경우`,
        schema: z.object({
          errorCode: z.union([z.literal(303), z.literal(310)])
            .describe(`- 303: 국립중앙도서관 API에서 ISBN 검색이 실패
- 310: 네이버 책검색 API에서 ISBN 검색이 실패
`),
        }),
      },
    ],
  },
  {
    method: "post",
    path: "/api/books/create",
    description: `책 정보를 생성한다. bookInfo가 있으면 book에만 insert한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postApibookscreate_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `예상치 못한 에러로 책 정보 insert에 실패함.`,
        schema: z.object({
          errorCode: z.union([z.literal(308), z.literal(309), z.literal(311)])
            .describe(`- 308: 예상치 못한 에러로 책 정보 insert에 실패함.
- 309: 보내준 카테고리 ID에 해당하는 callsign을 찾을 수 없음
- 311: 입력한 pubdate가 알맞은 형식이 아님. 기대하는 형식 "20220807"
`),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/books/info",
    description:
      `책 정보를 기준에 따라 정렬한다. 정렬기준이 popular일 경우 당일으로부터 42일간 인기순으로 한다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "sort",
        type: "Query",
        schema: sort,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().describe("한 페이지 표시 개수"),
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            author: z.string().describe("저자"),
            createdAt: z.string().describe("생성일자"),
            id: z.number().int().describe("고유 id"),
            image: z.string().describe("표지 사진"),
            isbn: z.string().describe("책의 isbn"),
            lendingCnt: z.number().describe("전체기간동안 책이 빌려진 횟수"),
            publishedAt: z.string().describe("출판일자"),
            publisher: z.string().describe("출판사"),
            title: z.string().describe("제목"),
            updatedAt: z.string().describe("갱신일자"),
          }),
        )
        .describe("정렬된 책들의 목록"),
    }),
    errors: [
      {
        status: 400,
        description: `클라이언트 오류`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/books/info/search",
    description: `책 정보를 검색하여 가져온다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "query",
        type: "Query",
        schema: z.string().describe("검색어").optional(),
      },
      {
        name: "sort",
        type: "Query",
        schema: sort__2,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().describe("페이지 수"),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().describe("한 페이지 표시 개수"),
      },
      {
        name: "category",
        type: "Query",
        schema: z.string().describe("검색할 카테고리").optional(),
      },
    ],
    response: z.object({
      categories: z
        .array(
          z.object({
            count: z.number().int().describe("검색된 개수"),
            name: z.string().describe("카테고리 이름"),
          }),
        )
        .describe("검색된 목록의 카테고리 분류"),
      items: z
        .array(
          z.object({
            author: z.string().describe("저자"),
            createdAt: z.string().describe("생성일자"),
            id: z.number().int().describe("고유 id"),
            image: z.string().describe("표지 사진"),
            isbn: z.string().describe("책의 isbn"),
            lendingCnt: z.number().int().describe("대출 횟수"),
            publishedAt: z.string().describe("출판일자"),
            publisher: z.string().describe("출판사"),
            title: z.string().describe("제목"),
            updatedAt: z.string().describe("갱신일자"),
          }),
        )
        .describe("검색된 책들의 목록"),
      meta: paginationMetaSchema,
    }),
    errors: [
      {
        status: 400,
        description: `query, page, limit 중 하나 이상이 없다.`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/books/info/:id",
    description: `book_info테이블의 ID기준으로 책 한 종류의 정보를 가져온다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int().describe("책의 id"),
      },
    ],
    response: z.object({
      author: z.string().describe("저자"),
      books: z
        .array(
          z.object({
            callSign: z.string().describe("청구기호"),
            donator: z.string().describe("책의 기부자").nullable(),
            dueDate: z.string().describe("반납 예정 일자, 대출가능 시 '-'"),
            id: z.number().int().describe("실물 책의 id"),
            isLendable: z.boolean().describe("책의 대출가능여부"),
            isReserved: z.boolean().describe("책의 예약 여부"),
            status: z
              .number()
              .describe("책의 상태 (0:양호 1:분실 2:파손 3:지정도서)"),
          }),
        )
        .describe("비치된 책들"),
      category: z.string().describe("카테고리"),
      id: z.number().int().describe("책의 id"),
      image: z.string().describe("이미지 주소").nullable(),
      isbn: z.string().describe("isbn"),
      publishedAt: z.string().describe("출판일자"),
      publisher: z.string().describe("출판사"),
      title: z.string().describe("제목"),
    }),
    errors: [
      {
        status: 400,
        description: `유효하지 않은 입력`,
        schema: z.object({
          errorCode: z.union([z.literal(300), z.literal(304)])
            .describe(`- 300: id가 숫자가 아님.
- 304: 유효하지않은 infoId 값.
`),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/books/search",
    description:
      `정보를 검색하여 가져온다. 책이 대출할 수 있는지 확인 할 수 있음`,
    requestFormat: "json",
    parameters: [
      {
        name: "query",
        type: "Query",
        schema: z.string().describe("검색어").optional(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().describe("페이지 수"),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().describe("한 페이지 표시 개수"),
      },
    ],
    response: z.object({
      items: z
        .array(
          z.object({
            author: z.string().describe("저자"),
            bookId: z.number().int().describe("Book Id"),
            bookInfoId: z.number().int().describe("고유 bookInfo id"),
            callSign: z.string().describe("청구 기호"),
            category: z.string().describe("카데고리"),
            categoryId: z.number().int().describe("카데고리 Id"),
            image: z.string().describe("이미지 URL 주소"),
            isLendable: z.boolean().describe("대출 가능 여부"),
            isbn: z.string().describe("책의 isbn"),
            publishedAt: z.string().describe("출판일자"),
            publisher: z.string().describe("출판사"),
            status: z.number().int().describe("Book status"),
            title: z.string().describe("제목"),
          }),
        )
        .describe("검색된 책들의 목록"),
      meta: paginationMetaSchema,
    }),
    errors: [
      {
        status: 400,
        description: `query, page, limit 중 하나 이상이 없다.`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/books/update",
    description: `책 정보를 수정합니다. book_info table or book table`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: patchApibooksupdate_Body,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `올바르지 않은 요청`,
        schema: z.object({
          errorCode: z.union([z.literal(311), z.literal(313)])
            .describe(
              `- 311: 입력한 publishedAt field가 알맞은 형식이 아님. 기대하는 형식 "20220807"
- 313: 수정할 DATA가 적어도 한 개는 필요. 수정할 DATA가 없음"
`,
            ),
        }),
      },
      {
        status: 500,
        description: `예상치 못한 에러로 책 정보 patch에 실패.`,
        schema: z.object({
          errorCode: z
            .literal(312)
            .describe("예상치 못한 에러로 책 정보 patch에 실패."),
        }),
      },
    ],
  },
  {
    method: "get",
    path: "/api/books/:id",
    description: `book테이블의 ID기준으로 책 한 종류의 정보를 가져온다.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int().describe("book 테이블의 id"),
      },
    ],
    response: z.object({
      author: z.string().describe("저자"),
      callSign: z.string().describe("청구기호"),
      category: z.string().describe("카테고리"),
      donator: z.string().describe("책의 기부자"),
      dueDate: z.string().describe("반납 예정 일자, 대출가능 시 '-'"),
      id: z.number().int().describe("book테이블의 id"),
      image: z.string().describe("이미지 주소"),
      isLendable: z.boolean().describe("책의 대출가능여부"),
      isbn: z.string().describe("isbn"),
      publishedAt: z.string().describe("출판일자"),
      publisher: z.string().describe("출판사"),
      title: z.string().describe("제목"),
    }),
  },
])

export const BooksClient = new Zodios(endpoints)


