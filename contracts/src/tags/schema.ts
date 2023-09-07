import { dateLike, metaSchema, mkErrorMessageSchema, positiveInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const subDefaultTagQuerySchema = z.object({
  page: positiveInt.optional().default(0),
  limit: positiveInt.optional().default(10),
  visibility: z.enum(['public', 'private']).optional(),
  query: z.string().optional().openapi({ example: '개발자의 코드' }),
});

export const subDefaultTagResponseSchema = z.object({
  items: z.array(
    z.object({
      bookInfoId: positiveInt.openapi({
        description: '태그가 등록된 도서의 info id',
        example: 1,
      }),
      title: z.string().openapi({
        description: '태그가 등록된 도서의 제목',
        example: '개발자의 코드',
      }),
      id: positiveInt.openapi({
        description: '태그 고유 id',
        example: 1,
      }),
      createdAt: dateLike.openapi({
        description: '태그가 등록된 시간',
        example: '2023-04-12',
      }),
      login: z.string().openapi({
        description: '태그를 작성한 카뎃의 닉네임',
        example: 'yena',
      }),
      content: z.string().openapi({
        description: '서브/디폴트 태그의 내용',
        example: 'yena가_추천하는',
      }),
      superContent: z.string().openapi({
        description: '슈퍼 태그의 내용',
        example: '1서클_추천_책',
      }),
      visibility: z.enum(['public', 'private']).openapi({
        description: '태그의 공개 여부. 공개는 public, 비공개는 private',
        example: 'private',
      }),
      meta: metaSchema,
    }),
  ),
});

export const superDefaultTagResponseSchema = z.object({
  items: z.array(
    z.object({
      createdAt: dateLike.openapi({
        description: '태그 생성일',
        example: '2023-04-12',
      }),
      content: z.string().openapi({
        description: '태그 내용',
        example: '1서클_추천_책',
      }),
      count: positiveInt.openapi({
        description: '슈퍼 태그에 속한 서브 태그의 개수. 디폴트 태그는 0',
        example: 1,
      }),
      type: z.enum(['super', 'default']).openapi({
        description: '태그의 타입. 슈퍼 태그는 super, 디폴트 태그는 default',
        example: 'super',
      }),
    }),
  ),
});

export const superTagIdQuerySchema = z.object({
  superTagId: positiveInt.openapi({
    description: '슈퍼 태그의 id',
    example: 1,
  }),
});

export const subTagResponseSchema = z.object({
  id: positiveInt.openapi({
    description: '태그 고유 id',
    example: 1,
  }),
  login: z.string().openapi({
    description: '태그를 작성한 카뎃의 닉네임',
    example: 'yena',
  }),
  content: z.string().openapi({
    description: '서브/디폴트 태그의 내용',
    example: 'yena가_추천하는',
  }),
});

export const tagsOfBookResponseSchema = z.object({
  items: z.array(
    z.object({
      id: positiveInt.openapi({
        description: '태그 고유 id',
        example: 1,
      }),
      login: z.string().openapi({
        description: '태그를 작성한 카뎃의 닉네임',
        example: 'yena',
      }),
      content: z.string().openapi({
        description: '슈퍼/디폴트 태그의 내용',
        example: 'yena가_추천하는',
      }),
      type: z.enum(['super', 'default']).openapi({
        description: '태그의 타입. 슈퍼 태그는 super, 디폴트 태그는 default',
        example: 'super',
      }),
      count: positiveInt.openapi({
        description: '슈퍼 태그에 속한 서브 태그의 개수. 디폴트 태그는 0',
        example: 1,
      }),
    }),
  ),
});

export const modifySuperTagBodySchema = z.object({
  id: positiveInt.openapi({
    description: '수정할 슈퍼 태그의 id',
    example: 1,
  }),
  content: z.string().openapi({
    description: '수정할 슈퍼 태그의 내용',
    example: '1서클_추천_책',
  }),
});

export const modifyTagResponseSchema = z.literal('success');

export const incorrectTagFormatSchema =
  mkErrorMessageSchema('INCORRECT_TAG_FORMAT').describe('태그 형식이 올바르지 않습니다.');

export const alreadyExistTagSchema =
  mkErrorMessageSchema('ALREADY_EXIST_TAG').describe('이미 존재하는 태그입니다.');

export const defaultTagCannotBeModifiedSchema = mkErrorMessageSchema(
  'DEFAULT_TAG_CANNOT_BE_MODIFIED',
).describe('디폴트 태그는 수정할 수 없습니다.');

export const modifySubTagBodySchema = z.object({
  id: positiveInt.openapi({
    description: '수정할 서브 태그의 id',
    example: 1,
  }),
  content: z.string().openapi({
    description: '수정할 서브 태그의 내용',
    example: 'yena가_추천하는',
  }),
  visibility: z.enum(['public', 'private']).openapi({
    description: '태그의 공개 여부. 공개는 public, 비공개는 private',
    example: 'private',
  }),
});

export const NoAuthorityToModifyTagSchema = mkErrorMessageSchema(
  'NO_AUTHORITY_TO_MODIFY_TAG',
).describe('태그를 수정할 권한이 없습니다.');

export const mergeTagsBodySchema = z.object({
  superTagId: positiveInt.nullable().openapi({
    description: '병합할 슈퍼 태그의 id. null이면 디폴트 태그로 병합됨을 의미한다.',
    example: 1,
  }),
  subTagIds: z.array(positiveInt).openapi({
    description: '병합할 서브 태그의 id 목록',
    example: [1, 2, 3],
  }),
});

export const invalidTagIdSchema =
  mkErrorMessageSchema('INVALID_TAG_ID').describe('태그 id가 올바르지 않습니다.');

export const createTagBodySchema = z.object({
  bookInfoId: positiveInt.openapi({
    description: '태그를 등록할 도서의 info id',
    example: 1,
  }),
  content: z.string().openapi({
    description: '태그 내용',
    example: 'yena가_추천하는',
  }),
});

export const duplicateTagSchema =
  mkErrorMessageSchema('DUPLICATE_TAG').describe('이미 존재하는 태그입니다.');

export const tagIdSchema = z.object({
  tagId: positiveInt.openapi({
    description: '태그의 id',
    example: 1,
  }),
});
