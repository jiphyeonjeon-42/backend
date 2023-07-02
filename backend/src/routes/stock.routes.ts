import { zodiosRouter } from '@zodios/express';
import { StockApi } from '@jiphyeonjeon/api';
import { stockSearch, stockUpdate } from '../stocks/stocks.controller';

export const path = '/stock';

export const router = zodiosRouter(StockApi);

router
/**
 * @openapi
 * /api/stock/search:
 *    get:
 *      description: 책 재고 정보를 검색해 온다.
 *      tags:
 *      - stock
 *      parameters:
 *        - in: query
 *          name: page
 *          description: 페이지
 *          schema:
 *            type: integer
 *        - in: query
 *          name: limit
 *          description: 한 페이지에 들어올 검색결과 수
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: 검색 결과를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  items:
 *                    description: 재고 정보 목록
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        bookId:
 *                          description: 도서 번호
 *                          type: integer
 *                          example: 3
 *                        bookInfoId:
 *                          description: 도서 정보 번호
 *                          type: integer
 *                          example: 2
 *                        title:
 *                          description: 책 제목
 *                          type: string
 *                          example: "TCP IP 윈도우 소켓 프로그래밍"
 *                        author:
 *                          description: 저자
 *                          type: string
 *                          example: "김선우"
 *                        donator:
 *                          description: 기부자 닉네임
 *                          type: string
 *                          example: ""
 *                        publisher:
 *                          description: 출판사
 *                          type: string
 *                          example: "한빛아카데미"
 *                        pubishedAt:
 *                          description: 출판일
 *                          type: string
 *                          format: date
 *                          example: 20220522
 *                        isbn:
 *                          description: isbn
 *                          type: string
 *                          format: number
 *                          example: "9788998756444"
 *                        image:
 *                          description: 이미지 주소
 *                          type: string
 *                          format: uri
 *                          example: "https://image.kyobobook.co.kr/images/book/xlarge/444/x9788998756444.jpg"
 *                        status:
 *                          description: 책의 상태 정보
 *                          type: number
 *                          example: 0
 *                        categoryId:
 *                          description: 책의 캬테고리 번호
 *                          type: number
 *                          example: 2
 *                        callSign:
 *                          description: 책의 고유 호출 번호
 *                          type: string
 *                          example: "C5.13.v1.c2"
 *                        category:
 *                          description: 책의 카테고리 정보
 *                          type: string
 *                          example: "네트워크"
 *                        updatedAt:
 *                          description: 책 정보의 마지막 변경 날짜
 *                          type: string
 *                          format: date
 *                          example: "2022-07-09-22:49:33"
 *                  meta:
 *                    description: 재고 수와 관련된 정보
 *                    type: object
 *                    properties:
 *                      totalItems:
 *                        description: 전체 검색 결과 수
 *                        type: integer
 *                        example: 1
 *                      itemCount:
 *                        description: 현재 페이지 검색 결과 수
 *                        type: integer
 *                        example: 1
 *                      itemsPerPage:
 *                        description: 페이지 당 검색 결과 수
 *                        type: integer
 *                        example: 1
 *                      totalPages:
 *                        description: 전체 결과 페이지 수
 *                        type: integer
 *                        example: 1
 *                      currentPage:
 *                        description: 현재 페이지
 *                        type: integer
 *                        example: 1
 *        '500':
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                description: error decription
 *                properties:
 *                  errorCode:
 *                    type: number
 *                    description: 에러코드
 *                    example: 1
 *
 */
  .get('/search', stockSearch)

  /**
   * @openapi
   * /api/stock/update:
   *    patch:
   *      description: 책 재고를 확인하고 업데이트
   *      tags:
   *      - stock
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                id:
   *                  type: number
   *                  description: bookId
   *      responses:
   *         '200':
   *            description: 재고가 정상적으로 update 됨.
   *         '307':
   *            description: update 할 수 없는 bookId
   */
  .patch('/update', stockUpdate);
