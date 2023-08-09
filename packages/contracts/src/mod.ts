/// <reference types="npm:@types/node@18.16.1" />

import { initContract } from "./deps.ts"
import { reviewsContract } from "./reviews/mod.ts"
export * from "./reviews/mod.ts"
export * from "./shared.ts"

const c = initContract()

//  다른 contract 를 모아서 하나의 contract 로 만들기.
export const contract = c.router(
	{
		// likes: likesContract,
		reviews: reviewsContract,
	} as const,
	{
		pathPrefix: "/api/v2",
		strictStatusCodes: true,
	},
)

