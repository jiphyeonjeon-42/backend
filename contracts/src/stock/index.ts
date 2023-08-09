import { initContract } from '@ts-rest/core';
import { stockGetQuerySchema, stockGetResponseSchema, stockPatchBodySchema, stockPatchResponseSchema } from './schema';
import { bookNotFoundSchema } from '../shared';

const c = initContract();

export const stockContract = c.router(
	{
		get: {
			method: 'GET',
			path: '/search',
			description: '책 재고 정보를 검색해 온다.',
			query: stockGetQuerySchema,
			responses: {
				200: stockGetResponseSchema,
				// 특정한 에러케이스가 생각나지 않습니다.
			},
		},
		patch: {
			method: 'PATCH',
			path: '/update',
			description: '책 재고를 확인하고 수정일시를 업데이트한다.',
			body: stockPatchBodySchema,
			responses: {
				200: stockPatchResponseSchema,
				307: bookNotFoundSchema,
			},
		},
	},
	{ pathPrefix: '/stock'},
)