import { Router } from 'express';
import {
  searchBookInfo,
  sortInfo,
  booker,
  search,
  getInfoId,
  createBook,
} from '../books/books.controller';

export const path = '/books';
export const router = Router();

router
  /**
   * @openapi
   * /api/books/info/search:
   *    get:
   *      description: 책 정보를 검색하여 가져온다.
   *      tags:
   *      - books
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
   *          enum: [title,popular ,new]
   *      - name: page
   *        in: query
   *        description: 페이지 수
   *        required: true
   *        schema:
   *          type: integer
   *      - name: limit
   *        in: query
   *        description: 한 페이지 표시 개수
   *        required: true
   *        schema:
   *          type: integer
   *      - name: category
   *        in: query
   *        description: 검색할 카테고리
   *        schema:
   *          type: string
   *      responses:
   *        '200':
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
   *                  meta:
   *                    description: 책 수와 관련된 정보
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
   *        '400':
   *          description: query, page, limit 중 하나 이상이 없다.
   *          content:
   *            application/json:
   *              schema:
   *                type: string
   *                description: error decription
   *                example: query, page, limit 중 하나 이상이 없습니다.
   */
  .get('/info/search', searchBookInfo);

router
  /**
   * @openapi
   * /api/books/info:
   *    get:
   *      description: 책 정보를 기준에 따라 정렬한다.
   *      tags:
   *      - books
   *      parameters:
   *      - name: sort
   *        in: query
   *        description: 정렬 기준
   *        required: true
   *        schema:
   *          type: string
   *          enum: [new, popular]
   *      - name: limit
   *        in: query
   *        description: 한 페이지 표시 개수
   *        required: true
   *        schema:
   *          type: integer
   *      responses:
   *        '200':
   *          description: 기준에 따라 정렬된 책들을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 정렬된 책들의 목록
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
   *                        lendingCnt:
   *                          description: 전체기간동안 책이 빌려진 횟수
   *                          type : number
   *                          example: 1
   *
   *
   *        '400':
   *          description: 클라이언트 오류
   *          content:
   *            application/json:
   *              schema:
   *                type: string
   *                description: error decription
   *                example: 클라이언트 오류.
   */
  .get('/info', sortInfo)

  /**
   * @openapi
   * /api/books/info/{id}:
   *    get:
   *      description: 책 한 종류의 정보를 가져온다.
   *      tags:
   *      - books
   *      parameters:
   *      - name: id
   *        in: path
   *        description: 책의 id
   *        schema:
   *          type: integer
   *      responses:
   *        '200':
   *          description: 조회 결과를 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  id:
   *                    description: 책의 id
   *                    type: integer
   *                    example: 4261
   *                  title:
   *                    description: 제목
   *                    type: string
   *                    example: 12가지 인생의 법칙
   *                  author:
   *                    description: 저자
   *                    type: string
   *                    example: 조던 B. 피터슨
   *                  publisher:
   *                    description: 출판사
   *                    type: string
   *                    example: 메이븐
   *                  image:
   *                    description: 이미지 주소
   *                    type: string
   *                    example: https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F3943658%3Ftimestamp%3D20210706194852
   *                  category:
   *                    description: 카테고리
   *                    type: string
   *                    example: 프로그래밍
   *                  publishedAt:
   *                    description: 출판일자
   *                    type: string
   *                    example: 2018년 10월
   *                  isbn:
   *                    descriptoin: isbn
   *                    type: string
   *                    example: '9791196067694'
   *                  donators:
   *                    descriptoin: 기부자
   *                    type: string
   *                    example: hyekim, tkim, jwoo, minkykim
   *                  books:
   *                    description: 비치된 책들
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 실물 책의 id
   *                          type: integer
   *                          example: 3
   *                        callSign:
   *                          description: 청구기호
   *                          type: string
   *                          example: h1.18.v1.c1
   *                        status:
   *                          description: 책의 상태
   *                          type: string
   *                          example: 비치 중
   *                        dueDate:
   *                          description: 반납 예정 일자
   *                          type: string
   *                          example: 21.08.05
   *        '400':
   *          description: id가 숫자가 아니다.
   *          content:
   *            application/json:
   *              schema:
   *                type: string
   *                description: error decription
   *                example: id가 숫자가 아닙니다.
   */
  .get('/info/:id', getInfoId)
  .get('/:id/reservations/count', booker);

router
  /**
   * @openapi
   * /api/books/search:
   *    get:
   *      description: 사서용 책 정보를 검색하여 가져온다. 책이 대출할 수 있는지 확인 할 수 있음
   *      tags:
   *      - books
   *      parameters:
   *      - name: query
   *        in: query
   *        description: 검색어
   *        required: true
   *        schema:
   *          type: string
   *      - name: page
   *        in: query
   *        description: 페이지 수
   *        required: true
   *        schema:
   *          type: integer
   *      - name: limit
   *        in: query
   *        description: 한 페이지 표시 개수
   *        required: true
   *        schema:
   *          type: integer
   *      responses:
   *        '200':
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
   *                        category:
   *                          description: 카데고리
   *                          type: string
   *                          example: 기술교양
   *                        isLenderable:
   *                          description: 대출 가능 여부
   *                          type: boolean
   *                          example: true
   *                  meta:
   *                    description: 책 수와 관련된 정보
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
   *        '400':
   *          description: query, page, limit 중 하나 이상이 없다.
   *          content:
   *            application/json:
   *              schema:
   *                type: string
   *                description: error decription
   *                example: query, page, limit 중 하나 이상이 없습니다.
   */
  .get('/search', search);

router/**
* @openapi
* /api/books/create:
*    post:
*      description: 책 정보를 생성한다. bookInfo가 있으면 book에만 insert한다.
*      tags:
*      - books
*      requestBody:
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                isbn:
*                  type: string
*                  example: 9788065960874
*                categoryId:
*                  type: integer
*                  example: 1
*                donator:
*                  type: string
*                  example: seongyle
*                callSign:
*                  type: string
*                  example: e7.79.v2.c3
*      responses:
*         '200':
*            description: 책 정보 정상적으로 insert됨.
*            content:
*             application/json:
*               schema:
*                 type: string
*                 description: insert success
*                 example: insert successfully done.
*         '400':
*            description: 클라이언트 오류.
*            content:
*             application/json:
*               schema:
*                 type: string
*                 description: insert fail
*                 example: insert unsuccessfully done.
*         '500':
*            description: 서버오류
*            content:
*             application/json:
*               schema:
*                 type: string
*                 description: insert fail, 서버오류
*                 example: insert unsuccessfully done.
*         '501':
*            description: DB오류
*            content:
*             application/json:
*               schema:
*                 type: string
*                 description: insert fail, DB오류
*                 example: { code: 501, message: '중복된 slackid 입니다.  DB관리자에게 문의하세요.' }
*/
  .post('/create', createBook);
