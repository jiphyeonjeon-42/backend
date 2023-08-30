import { contract } from "@jiphyeonjeon-42/contracts";
import { initServer } from "@ts-rest/express";
import { searchAllBooks, searchBookById, updateBookOrBookInfo } from "./service";
import { BookNotFoundError, bookNotFound, pubdateFormatError } from "../shared";
import { PubdateFormatError } from "./errors";
import authValidate from "~/v1/auth/auth.validate";
import { roleSet } from '~/v1/auth/auth.type';

const s = initServer();
export const books = s.router(contract.books, {
	// searchAllBookInfos: async ({ query }) => {
	// 	const result = await searchAllBookInfos(query);

	// 	return { status: 200, body: result } as const;
	// },
	// searchBookInfosByTag: ,
	// searchBookInfosSorted: ,
	// searchBookInfoById: ,
	searchAllBooks: async ({ query }) => {
		const result = await searchAllBooks( query );

		return { status: 200, body: result} as const;
	},
	// searchBookInfoForCreate: ,
	searchBookById: async ({ params: {id}}) => {
		const result = await searchBookById({ id });

		if (result instanceof BookNotFoundError){
			return bookNotFound;
		}

		return {
			status: 200,
			body: result
		} as const;
	},
	// createBook: {
	// 	middleware: [authValidate(roleSet.librarian)],
	// 	handler: async ({ body }) => {

	// 	}
	// },
	updateBook: {
		// middleware: [authValidate(roleSet.librarian)],
		handler: async ({ body }) => {
			const result = await updateBookOrBookInfo(body);

			if (result instanceof PubdateFormatError) {
				return pubdateFormatError;
			}
			return {status: 200, body: '책 정보가 수정되었습니다.'} as const;
		}
	},
	// updateDonator: ,
});