import { metaSchema, mkErrorMessageSchema, nonNegativeInt } from '../shared';
import { z } from '../zodWithOpenapi';

export const searchUserSchema = z.object({
  nicknameOrEmail: z.string().optional().describe('검색할 유저의 nickname or email'),
  page: nonNegativeInt.optional().default(0).describe('페이지'),
  limit: nonNegativeInt.optional().default(10).describe('한 페이지에 들어올 검색결과 수'),
  id: nonNegativeInt.optional().describe('검색할 유저의 id'),
});

const reservationSchema = z
  .object({
    reservationId: nonNegativeInt.describe('예약 번호').openapi({ example: 17 }),
    reservedBookInfoId: nonNegativeInt.describe('예약된 도서 번호').openapi({ example: 34 }),
    endAt: z.coerce
      .string()
      .nullable()
      .describe('예약 만료 날짜')
      .openapi({ example: '2023-08-16' }),
    ranking: z.coerce.string().nullable().describe('예약 순위').openapi({ example: '1' }),
    title: z
      .string()
      .describe('예약된 도서 제목')
      .openapi({ example: '생활코딩! Node.js 노드제이에스 프로그래밍(위키북스 러닝스쿨 시리즈)' }),
    author: z.string().describe('예약된 도서 저자').openapi({ example: '이고잉' }),
    image: z.string().describe('예약된 도서 이미지').openapi({
      example: 'https://image.kyobobook.co.kr/images/book/xlarge/383/x9791158392383.jpg',
    }),
    userId: nonNegativeInt.describe('예약한 유저 번호').openapi({ example: 1547 }),
  })
  .optional();

const lendingSchema = z
  .object({
    userId: nonNegativeInt.describe('대출한 유저 번호').openapi({ example: 1547 }),
    bookInfoId: nonNegativeInt.describe('대출한 도서 info id').openapi({ example: 20 }),
    lendDate: z.coerce
      .string()
      .describe('대출 날짜')
      .openapi({ example: '2023-08-08T20:20:55.000Z' }),
    lendingCondition: z.string().describe('대출 상태').openapi({ example: '이상 없음' }),
    image: z.string().describe('대출한 도서 이미지').openapi({
      example: 'https://image.kyobobook.co.kr/images/book/xlarge/642/x9791185585642.jpg',
    }),
    author: z
      .string()
      .describe('대출한 도서 저자')
      .openapi({ example: '어제이 애그러월, 조슈아 갠스, 아비 골드파브' }),
    title: z.string().describe('대출한 도서 제목').openapi({ example: '예측 기계' }),
    duedate: z.coerce
      .string()
      .describe('반납 예정 날짜')
      .openapi({ example: '2023-08-22T20:20:55.000Z' }),
    reservedNum: z.string().describe('예약된 수').openapi({ example: '0' }),
  })
  .optional();

const searchUserResponseItemSchema = z.object({
  id: nonNegativeInt.describe('유저 번호').openapi({ example: 1 }),
  email: z.string().email().describe('이메일').openapi({ example: 'kyungsle@gmail.com' }),
  nickname: z.string().describe('닉네임').openapi({ example: 'kyungsle' }),
  intraId: nonNegativeInt.describe('인트라 고유 번호').openapi({ example: '10068' }),
  slack: z.string().describe('slack 멤버 Id').openapi({ example: 'U035MUEUGKW' }),
  penaltyEndDate: z.coerce
    .string()
    .optional()
    .describe('연체 패널티 끝나는 날짜')
    .openapi({ example: '2022-05-22' }),
  role: nonNegativeInt.describe('유저 권한').openapi({ example: 2 }),
  reservations: z.array(reservationSchema).describe('해당 유저의 예약 정보'),
  lendings: z.array(lendingSchema).describe('해당 유저의 대출 정보'),
});

export const searchUserResponseSchema = z.object({
  items: z.array(searchUserResponseItemSchema).describe('검색된 유저 정보'),
  meta: metaSchema.describe('페이지네이션에 필요한 정보'),
});

export const createUserSchema = z.object({
  email: z.string().email().describe('이메일').openapi({ example: 'yena@student.42seoul.kr' }),
  password: z.string().describe('패스워드').openapi({ example: 'KingGodMajesty42' }),
});

export const createUserResponseSchema = z.literal('유저 생성 성공!');

export const userIdSchema = z.object({
  id: nonNegativeInt.describe('유저 id 값').openapi({ example: 1 }),
});

export const updateUserSchema = z.object({
  nickname: z.string().optional().describe('닉네임').openapi({ example: 'kyungsle' }),
  intraId: nonNegativeInt.optional().describe('인트라 고유 번호').openapi({ example: '10068' }),
  slack: z.string().optional().describe('slack 멤버 Id').openapi({ example: 'U035MUEUGKW' }),
  role: nonNegativeInt.optional().describe('유저 권한').openapi({ example: 2 }),
  penaltyEndDate: z.coerce
    .string()
    .optional()
    .describe('연체 패널티 끝나는 날짜')
    .openapi({ example: '2022-05-22' }),
});
