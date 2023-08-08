import { initContract, z } from "../deps.ts"

export * from "./schema.ts"

//  contract 를 생성할 때, router 함수를 사용하여 api 를 생성
const c = initContract()

export const reviewsContract = c.router(
	{
		get: {
			method: "GET",
			path: "/",
			description: "전체 책 리뷰를 조회합니다.",
			responses: {
				200: z.object({
					items: z.array(z.string()),
				}),
			},
		},
		// post: {
		// 	method: "POST",
		// 	path: "/",
		// 	query: z.object({
		// 		bookInfoId: bookInfoIdSchema.openapi({ description: "도서 ID" }),
		// 	}),
		// 	description: "책 리뷰를 작성합니다.",
		// 	body: contentSchema,
		// 	responses: {
		// 		201: z.literal("리뷰가 작성되었습니다."),
		// 		404: bookInfoNotFoundSchema,
		// 	},
		// },
		// patch: {
		// 	method: "PATCH",
		// 	path: "/:reviewsId",
		// 	pathParams: reviewIdPathSchema,
		// 	description: "책 리뷰의 비활성화 여부를 토글 방식으로 변환합니다.",
		// 	body: null,
		// 	responses: {
		// 		200: z.literal("리뷰 공개 여부가 업데이트되었습니다."),
		// 		404: reviewNotFoundSchema,
		// 	},
		// },
		// put: {
		// 	method: "PUT",
		// 	path: "/:reviewsId",
		// 	pathParams: reviewIdPathSchema,
		// 	description: mutationDescription("수정"),
		// 	body: contentSchema,
		// 	responses: {
		// 		200: z.literal("리뷰가 수정되었습니다."),
		// 		404: reviewNotFoundSchema,
		// 	},
		// },
		// delete: {
		// 	method: "DELETE",
		// 	path: "/:reviewsId",
		// 	pathParams: reviewIdPathSchema,
		// 	description: mutationDescription("삭제"),
		// 	body: null,
		// 	responses: {
		// 		200: z.literal("리뷰가 삭제되었습니다."),
		// 		404: reviewNotFoundSchema,
		// 	},
		// },
	},
	//  pathPrefix 를 통해 모든 경로에 공통적으로 /reviews 를 붙여줍니다.
	//  여러 api 마다 공통적으로 /reviews/~~~ 를 사용하니까 중복해서 선언하는 것을 방지하기 위함.
	{ pathPrefix: "/reviews" },
)
