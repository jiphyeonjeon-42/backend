import { initContract, z } from "./deps.ts"
import { reviewsContract } from "./reviews/mod.ts"
export * from "./reviews/mod.ts"
export * from "./shared.ts"

const c = initContract()

export const testContract = c.router(
	{
		health: {
			method: "GET",
			path: "/",
			responses: { 200: z.string() },
		},
	},
)
// 		getObj: {
// 			method: "GET",
// 			path: "/obj",
// 			description: "get obj",
// 			responses: {
// 				200: z.object({
//                     // date: z.string()
// 					date: z.coerce.date(),
// 				}),
// 			},
// 		},
// 	},
// 	{ strictStatusCodes: true },
// )

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
	{
		// likes: likesContract,
		reviews: reviewsContract,
	},
	{
		pathPrefix: "/api/v2",
		strictStatusCodes: true,
	},
)
