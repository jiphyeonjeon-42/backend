import type { ColumnType, SqlBool } from "kysely"

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>
export type Book = {
	id: Generated<number>
	donator: Generated<string | null>
	callSign: string
	status: number
	createdAt: Generated<Date>
	infoId: number
	updatedAt: Generated<Date>
	donatorId: Generated<number | null>
}
export type BookInfo = {
	id: Generated<number>
	title: string
	author: string
	publisher: string
	isbn: Generated<string | null>
	image: Generated<string | null>
	publishedAt: Generated<Date | null>
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
	categoryId: number
}
export type Category = { id: number; name: string }
export type Lending = {
	id: number
	lendingLibrarianId: number
	lendingCondition: string
	returningLibrarianId: Generated<number | null>
	returningCondition: Generated<string | null>
	returnedAt: Generated<Date | null>
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
	bookId: number
	userId: number
}
export type Likes = {
	id: number
	userId: number
	bookInfoId: number
	isDeleted: SqlBool
}
export type Reservation = {
	id: number
	endAt: Generated<Date | null>
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
	status: Generated<number>
	bookInfoId: number
	bookId: Generated<number | null>
	userId: number
}
export type Reviews = {
	id: number
	userId: number
	bookInfoId: number
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
	updateUserId: number
	isDeleted: Generated<number>
	deleteUserId: Generated<number | null>
	content: string
	disabled: Generated<number>
	disabledUserId: Generated<number | null>
}
export type SubTag = {
	id: number
	userId: number
	superTagId: number
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
	isDeleted: Generated<number>
	updateUserId: number
	content: string
	isPublic: Generated<number>
}
export type SuperTag = {
	id: number
	userId: number
	bookInfoId: number
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
	isDeleted: Generated<number>
	updateUserId: number
	content: string
}
export type User = {
	id: number
	email: string
	password: string
	nickname: Generated<string | null>
	intraId: Generated<number | null>
	slack: Generated<string | null>
	penaltyEndDate: Generated<Date>
	role: Generated<number>
	createdAt: Generated<Date>
	updatedAt: Generated<Date>
}
export type UserReservation = {
	reservationId: Generated<number>
	endAt: Generated<Date | null>
	reservationDate: Generated<Date>
	reservedBookInfoId: number
	userId: number
	title: string | null
	author: string | null
	image: Generated<string | null>
	ranking: Generated<number | null>
}
export type DB = {
	book: Book
	bookInfo: BookInfo
	category: Category
	lending: Lending
	likes: Likes
	reservation: Reservation
	reviews: Reviews
	subTag: SubTag
	superTag: SuperTag
	user: User
	userReservation: UserReservation
}
