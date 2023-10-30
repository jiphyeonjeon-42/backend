import { initContract } from "@ts-rest/core"
import { bookInfoNotFoundSchema, unauthorizedSchema } from "..";
import { 
	reservationsGetQuerySchema,
	reservationsGetResponseSchema,
	reservationsGetCountResponseSchema,
	reservationsCancelResponseSchema,
	reservationsPostRequestBodySchema,
	reservationsPostResponseSchema,
	reservationsFailureReponseSchema,
	reservationsCancelRequestBodySchema,
	reservationsNotFoundError
} from "./schema";

const c = initContract();

export const reservationsContract = c.router({
	getMine: {
		method: 'GET',
		path: '/mypage/reservations',
		summary: '내 예약 정보를 가져옵니다.',
		responses: {
			200: reservationsGetResponseSchema,
			401: unauthorizedSchema
		},
	},
	get: {
		method: 'GET',
		path: '/reservations',
		summary: '사서가 전체 예약 기록을 가져옵니다.',
		query: reservationsGetQuerySchema,
		responses: {
			200: reservationsGetResponseSchema,
			401: unauthorizedSchema
		},
	},
	getCount: {
		method: 'GET',
		path: '/reservations/:bookinfoid',
		summary: 'bookInfo에 해당하는 예약 대기 수를 확인할 수 있다.',
		responses: {
			200: reservationsGetCountResponseSchema,
			400: bookInfoNotFoundSchema,
		},
	},
	post: {
		method: 'POST',
		path: '/reservations',
		summary: 'jwt로 인증된 유저가 예약을 생성한다.',
		body: reservationsPostRequestBodySchema,
		responses: {
			200: reservationsPostResponseSchema,
			400: reservationsFailureReponseSchema,
		},
	},
	patch: {
		method: 'PATCH',
		path: '/reservations/:reservationid',
		summary: '예약 취소',
		body: reservationsCancelRequestBodySchema,
		responses: {
			200: reservationsCancelResponseSchema,
			400: reservationsNotFoundError,
			401: unauthorizedSchema,
		},
	},
});