import { z } from "../deps.ts"
import { mkErrorMessageSchema, positiveInt } from "../shared.ts"
export const reviewsIdSchema = positiveInt.describe("도서 리뷰 ID")

export const contentSchema = z.object({
	content: z.string().min(10).max(420).openapi({
		example: "책 정말 재미있어요 10글자 넘었다",
	}),
})

export const reviewIdPathSchema = z.object({
	reviewsId: reviewsIdSchema.openapi({ example: 1 }),
})

export const reviewNotFoundSchema = mkErrorMessageSchema("REVIEW_NOT_FOUND")
	.describe("검색한 리뷰가 존재하지 않습니다.")
export const mutationDescription = (action: "수정" | "삭제") =>
	`리뷰를 ${action}합니다. 작성자 또는 관리자만 ${action} 가능합니다.`
