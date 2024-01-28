import { dateLike, metaSchema, mkErrorMessageSchema, nonNegativeInt } from "..";
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
});

export const reservationsPostRequestBodySchema = z.object({
	bookInfoId: nonNegativeInt,
});

export const reservationsPostResponseSchema = z.object({
	count: nonNegativeInt,
});

export const reservationsFailureReponseSchema = z.object({
	code: z.enum(['PENALTY', 'LENDABLE', 'RESERVED', 'LENDING']),
});

export const reservationsCancelRequestBodySchema = z.object({
	reservationId: nonNegativeInt
});

export const reservationsCancelResponseSchema = z.literal("예약이 정상적으로 취소되었습니다.");

export const reservationsNotFoundError = mkErrorMessageSchema('RESERVATION_NOT_FOUND').describe('해당 예약 정보가 존재하지 않습니다.');