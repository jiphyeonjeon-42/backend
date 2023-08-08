import { initContract, z } from "../deps.ts"
import {
	bookInfoIdSchema,
	bookInfoNotFoundSchema,
	positiveInt,
} from "../shared.ts"
import { likeNotFoundSchema, likeResponseSchema } from "./schema.ts"

const c = initContract()

export const likesContract = c.router(
	{
		post: {
			method: "POST",
			path: "/:bookInfoId/like",
			description: "책에 좋아요를 누릅니다.",
			pathParams: z.object({ bookInfoId: bookInfoIdSchema }),
			body: null,
			responses: {
				200: z.object({
					userId: positiveInt,
					bookInfoId: bookInfoIdSchema,
				}),
			},
		},
		get: {
			method: "GET",
			path: "/:bookInfoId/like",
			summary: "Like 정보를 가져온다.",
			description: "사용자가 좋아요 버튼을 누르면 좋아요 개수를 가져온다.",
			pathParams: z.object({ bookInfoId: bookInfoIdSchema }),
			responses: {
				200: likeResponseSchema,
				404: bookInfoNotFoundSchema,
			},
		},
		delete: {
			method: "DELETE",
			path: "/:bookInfoId/like",
			description: "delete a like",
			pathParams: z.object({ bookInfoId: bookInfoIdSchema }),
			body: null,
			responses: {
				204: null,
				404: z.union([likeNotFoundSchema, bookInfoNotFoundSchema]),
			},
		},
	},
	{ pathPrefix: "/books/info" },
)
