import { dateLike, metaSchema, nonNegativeInt } from "..";
import { z } from "../zodWithOpenapi";

export const reservationsGetQuerySchema = z.object({
	query: z.string().optional().describe('조회하기 위한 검색어 (인트라아이디, 책제목, 청구기호 중 일부)'),
	filter: z.enum(['pending', 'waiting', 'expired', 'all']).default('pending').optional(),
	page: nonNegativeInt.default(0),
	limit: nonNegativeInt.default(10),
});

export const reservationsGetResponseSchema = z.object({
	items: z.array(
		z.object({
			reservationId: nonNegativeInt,
			login: z.string(),
			penaltyDays: nonNegativeInt,
			title: z.string(),
			image: z.string(),
			callSign: z.string(),
			createdAt: dateLike,
			endAt: dateLike,
			status: nonNegativeInt,
		}),
	),
	meta: metaSchema,
});

export const reservationsGetCountResponseSchema = reservationsGetResponseSchema.extend({
	count: nonNegativeInt
})