import { dateLike, metaSchema, positiveInt } from '../shared';
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
