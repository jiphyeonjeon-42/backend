import { contract } from "@jiphyeonjeon-42/contracts";
import { initServer } from "@ts-rest/express";
import { searchBookById } from "./service";
import { BookNotFoundError, bookNotFound } from "../shared";

const s = initServer();
export const books = s.router(contract.books, {
	// searchAllBookInfos: async ({ query }) => {
	// 	const result = await searchAllBookInfos(query);

	// 	return { status: 200, body: result } as const;
	// },
	// searchBookInfosByTag: ,
	// searchBookInfosSorted: ,
	// searchBookInfoById: ,
	// searchAllBooks: ,
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
	// createBook: ,
	// updateBook: ,
	// updateDonator: ,
});