import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  subDefaultTagQuerySchema,
  subDefaultTagResponseSchema,
  superDefaultTagResponseSchema,
  superTagIdQuerySchema,
  subTagResponseSchema,
  tagsOfBookResponseSchema,
  modifySuperTagBodySchema,
  modifyTagResponseSchema,
  incorrectTagFormatSchema,
  alreadyExistTagSchema,
  defaultTagCannotBeModifiedSchema,
  modifySubTagBodySchema,
  NoAuthorityToModifyTagSchema,
  mergeTagsBodySchema,
  invalidTagIdSchema,
  createTagBodySchema,
  duplicateTagSchema,
  tagIdSchema,
} from './schema';
import {
  bookInfoIdSchema,
  bookInfoNotFoundSchema,
  paginationQuerySchema,
} from '../shared';

const c = initContract();

export const tagContract = c.router(
  {
    getSubDefault: {
      method: 'GET',
      path: '',
      summary: '서브/디폴트 태그 정보를 검색한다.',
      description: '서브/디폴트 태그 정보를 검색한다. 이는 태그 관리 페이지에서 사용한다.',
      query: subDefaultTagQuerySchema,
      responses: {
        200: subDefaultTagResponseSchema,
      },
    },
    getSuperDefaultForMain: {
      method: 'GET',
      path: '/main',
      summary: '메인 페이지에서 사용할 태그 목록을 가져온다.',
      description: '슈퍼 태그(노출되는 태그), 디폴트 태그(노출되지 않고 분류되지 않은 태그)를 랜덤한 순서로 가져온다. 이는 메인 페이지에서 사용된다.',
      query: paginationQuerySchema.omit({ page: true }),
      responses: {
        200: superDefaultTagResponseSchema,
      },
    },
    getSubOfSuperTag: {
      method: 'GET',
      path: '/{superTagId}/sub',
      summary: '슈퍼 태그에 속한 서브 태그 목록을 가져온다.',
      description: 'superTagId에 해당하는 슈퍼 태그에 속한 서브 태그 목록을 가져온다. 태그 병합 페이지에서 슈퍼 태그의 서브 태그를 가져올 때 사용한다.',
      pathParams: superTagIdQuerySchema,
      responses: {
        200: subTagResponseSchema,
      },
    },
    getSubOfSuperTagForAdmin: {
      method: 'GET',
      path: '/manage/{superTagId}/sub',
      summary: '슈퍼 태그에 속한 서브 태그 목록을 가져온다.',
      description: 'superTagId에 해당하는 슈퍼 태그에 속한 서브 태그 목록을 가져온다. 태그 관리 페이지에서 슈퍼 태그의 서브 태그를 가져올 때 사용한다.',
      pathParams: superTagIdQuerySchema,
      responses: {
        200: subTagResponseSchema,
      },
    },
    getTagsOfBook: {
      method: 'GET',
      path: '/{bookInfoId}',
      summary: '도서에 등록된 슈퍼 태그, 디폴트 태그 목록을 가져온다.',
      description: '슈퍼 태그(노출되는 태그), 디폴트 태그(노출되지 않고 분류되지 않은 태그)를 가져온다. 이는 도서 상세 페이지 및 태그 병합 페이지에서 사용된다.',
      pathParams: bookInfoIdSchema,
      responses: {
        200: tagsOfBookResponseSchema,
      },
    },
    modifySuperTag: {
      method: 'PATCH',
      path: '/super',
      description: '슈퍼 태그를 수정한다.',
      body: modifySuperTagBodySchema,
      responses: {
        204: z.null(),
        400: z.union([alreadyExistTagSchema, defaultTagCannotBeModifiedSchema]),
      },
    },
    modifySubTag: {
      method: 'PATCH',
      path: '/sub',
      description: '서브 태그를 수정한다.',
      body: modifySubTagBodySchema,
      responses: {
        200: modifyTagResponseSchema,
        900: incorrectTagFormatSchema,
        901: NoAuthorityToModifyTagSchema,
      },
    },
    mergeTags: {
      method: 'PATCH',
      path: '/{bookInfoId}/merge',
      description: '태그를 병합한다.',
      pathParams: bookInfoIdSchema,
      body: mergeTagsBodySchema,
      responses: {
        200: modifyTagResponseSchema,
        900: incorrectTagFormatSchema,
        902: alreadyExistTagSchema,
        906: defaultTagCannotBeModifiedSchema,
        910: invalidTagIdSchema,
      },
    },
    createDefaultTag: {
      method: 'POST',
      path: '/default',
      description: '디폴트 태그를 생성한다. 태그 길이는 42자 이하여야 한다.',
      body: createTagBodySchema,
      responses: {
        201: modifyTagResponseSchema,
        900: incorrectTagFormatSchema,
        907: bookInfoNotFoundSchema,
        909: duplicateTagSchema,
      },
    },
    createSuperTag: {
      method: 'POST',
      path: '/super',
      description: '슈퍼 태그를 생성한다. 태그 길이는 42자 이하여야 한다.',
      body: createTagBodySchema,
      responses: {
        201: modifyTagResponseSchema,
        900: incorrectTagFormatSchema,
        907: bookInfoNotFoundSchema,
        909: duplicateTagSchema,
      },
    },
    deleteSubDefaultTag: {
      method: 'DELETE',
      path: '/sub/{tagId}',
      description: '서브/디폴트 태그를 삭제한다.',
      pathParams: tagIdSchema,
      body: null,
      responses: {
        200: modifyTagResponseSchema,
        910: invalidTagIdSchema,
      },
    },
    deleteSuperTag: {
      method: 'DELETE',
      path: '/super/{tagId}',
      description: '슈퍼 태그를 삭제한다.',
      pathParams: tagIdSchema,
      body: null,
      responses: {
        200: modifyTagResponseSchema,
        910: invalidTagIdSchema,
      },
    },
  },
  { pathPrefix: '/tags' },
);
