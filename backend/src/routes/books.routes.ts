import { Router } from 'express';
import {
  searchBookInfo, infoId, info, booker, search,
} from '../books/books.controller';

export const path = '/books';
export const router = Router();

router
/**
 * @openapi
 * /api/books/info/search:
 *    get:
 *      description: 책 정보를 검색하여 가져온다.
 *      parameters:
 *      - name: query
 *        in: query
 *        description: 검색어
 *        required: true
 *        schema:
 *          type: string
 *      - name: sort
 *        in: query
 *        description: 정렬 기준
 *        schema:
 *          type: string
 *          enum: [title, new]
 *      - name: page
 *        in: query
 *        description: 페이지 수
 *        required: true
 *        schema:
 *          type: integer
 *      - name: limit
 *        in: query
 *        description: 한 페이지 표시 개수
 *        requied: true
 *        schema:
 *          type: integer
 *      - name: category
 *        in: query
 *        description: 검색할 카테고리
 *        schema:
 *          type: string
 *      responses:
 *        200:
 *          description: 검색 결과를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  items:
 *                    description: 검색된 책들의 목록
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          description: 고유 id
 *                          type: integer
 *                          example: 340
 *                        title:
 *                          description: 제목
 *                          type: string
 *                          example: "한눈에 보이는 무료 글꼴 가이드: 영어편"
 *                        author:
 *                          description: 저자
 *                          type: string
 *                          example: 탁연상
 *                        publisher:
 *                          description: 출판사
 *                          type: string
 *                          example: DigitalNew
 *                        isbn:
 *                          description: 책의 isbn
 *                          type: string
 *                          example: 9791195982394
 *                        image:
 *                          description: 표지 사진
 *                          type: string
 *                          example: https://image.kyobobook.co.kr/images/book/xlarge/394/x9791195982394.jpg
 *                        publishedAt:
 *                          description: 출판일자
 *                          type: string
 *                          format: date
 *                          example: 2020-05-31T15:00:00.000Z
 *                        createdAt:
 *                          description: 생성일자
 *                          type: string
 *                          format: date
 *                          example: 2021-12-07T11:06:48.861Z
 *                        updatedAt:
 *                          description: 갱신일자
 *                          type: string
 *                          format: date
 *                          example: 2022-03-06T09:29:04.340Z
 *                  categories:
 *                    description: 검색된 목록의 카테고리 분류
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        name:
 *                          description: 카테고리 이름
 *                          type: string
 *                          example: 예술
 *                        count:
 *                          description: 검색된 개수
 *                          type: integer
 *                          example: 1
 *        400:
 *          description: query, page, limit 중 하나 이상이 없다.
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                description: error decription
 *                example: query, page, limit 중 하나 이상이 없습니다.
 */

  .get('/info/search', searchBookInfo)
  .get('/info/:id', infoId)
  .get('/info', info)
  .get('/:id/reservations/count', booker)
  .get('/search', search);
