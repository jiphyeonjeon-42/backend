import { match } from "ts-pattern"
import { db } from "./mod.ts"
import { executeWithOffsetPagination } from "kysely-paginate"
import { Visibility } from "./shared.ts"

export const getReviewById = (id: number) =>
	db
		.selectFrom("reviews")
		.where("id", "=", id)
		.select(["userId", "isDeleted"])
		.executeTakeFirst()

type SearchOption = {
	query: string
	page: number
	perPage: number
	visibility: Visibility
	sort: "asc" | "desc"
}

const queryReviews = () =>
	db.selectFrom("reviews")
		.leftJoin("user", "user.id", "reviews.userId")
		.leftJoin("book_info", "book_info.id", "reviews.bookInfoId")
		.select([
			"id",
			"userId",
			"bookInfoId",
			"content",
			"createdAt",
			"book_info.title",
			"user.nickname",
			"user.intraId",
		])

export const searchReviews = (
	{ query, sort, visibility, page, perPage }: SearchOption,
) => {
	const searchQuery = queryReviews()
		.where("content", "like", `%${query}%`)
		.orderBy("updatedAt", sort)

	const withVisibility = match(visibility)
		.with("public", () => searchQuery.where("disabled", "=", false))
		.with("private", () => searchQuery.where("disabled", "=", true))
		.with("all", () => searchQuery)
		.exhaustive()

	return executeWithOffsetPagination(withVisibility, { page, perPage })
}

type CreateOption = {
	userId: number
	bookInfoId: number
	content: string
}
export const createReview = ({ userId, bookInfoId, content }: CreateOption) =>
	db
		.insertInto("reviews")
		.values({
			userId,
			updateUserId: userId,
			bookInfoId,
			content,
			disabled: false,
			isDeleted: false,
			createdAt: new Date(),
		})
		.executeTakeFirst()

type DeleteOption = {
	reviewsId: number
	deleteUserId: number
}
export const deleteReview = ({ reviewsId, deleteUserId }: DeleteOption) =>
	db.updateTable("reviews")
		.where("id", "=", reviewsId)
		.set({ deleteUserId, isDeleted: true })
		.executeTakeFirst()

// export const deleteReviewService = async ({ reviewsId, deleter }: DeleteOption) => {
// 	const isAdmin = () => deleter.role === "librarian"
// 	const deleteFn = () =>
// 		db.updateTable("reviews")
// 			.where("id", "=", reviewsId)
// 			.set({
// 				deleteUserId: deleter.id,
// 				isDeleted: true,
// 			})
// 			.executeTakeFirst()

// 	const review = await db
// 		.selectFrom("reviews")
// 		.where("id", "=", reviewsId)
// 		.select(["userId", "isDeleted"])
// 		.executeTakeFirst()

// 	return match(review)
// 		.with(
// 			undefined,
// 			{ isDeleted: true },
// 			() => new ReviewNotFoundError(reviewsId),
// 		)
// 		.when(isAdmin, deleteFn)
// 		.with({ userId: deleter.id }, deleteFn)
// 		.otherwise(() =>
// 			new ReviewForbiddenAccessError({ userId: deleter.id, reviewsId })
// 		)
// }
