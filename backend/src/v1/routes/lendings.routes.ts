import { Router } from 'express';
import {
  create, search, lendingId, returnBook,
} from '../lendings/lendings.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/lendings';
export const router = Router();

router
/**
 * @openapi
 * /api/lendings:
 *    post:
 *      tags:
 *      - lendings
 *      summary: 대출 기록 생성
 *      description: 대출 기록을 생성한다.
 *      requestBody:
 *        description: bookId와 userId는 각각 대출할 도서와 대출할 회원의 pk, condition은 대출 당시 책 상태를 의미한다.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                bookId:
 *                  type: integer
 *                  example: 33
 *                userId:
 *                  type: integer
 *                  example: 45
 *                condition:
 *                  type: string
 *                  example: "이상 없음"
 *              required:
 *                - bookId
 *                - userId
 *                - condition
 *      responses:
 *        '200':
 *          description: 생성된 대출기록의 반납일자를 반환.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  dueDate:
 *                    type: date | string
 *                    example: 2022-12-12
 *        '400':
 *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 2
 *        '401':
 *          description: 대출을 생성할 권한이 없는 사용자
 *        '500':
 *          description: db 에러
 * */
  .post('/', authValidate(roleSet.librarian), create)

/**
 * @openapi
 * /api/lendings/search:
 *    get:
 *      tags:
 *      - lendings
 *      summary: 대출 기록 정보 조회
 *      description: 대출 기록의 정보를 검색하여 보여준다.
 *      parameters:
 *      - name: page
 *        in: query
 *        description: 검색 결과의 페이지
 *        schema:
 *          type: integer
 *          default: 1
 *          example: 3
 *      - name: limit
 *        in: query
 *        description: 검색 결과 한 페이지당 보여줄 결과물의 개수
 *        schema:
 *          type: integer
 *          default: 5
 *          example: 3
 *      - name: sort
 *        in: query
 *        description: 검색 결과를 정렬할 기준
 *        schema:
 *          type: string
 *          enum: [new, old]
 *          default: new
 *      - name: query
 *        in: query
 *        description: 대출 기록에서 검색할 단어, 검색 가능한 필드 [user, title, callSign, bookId]
 *        schema:
 *          type: string
 *          example: 파이썬
 *      - name: type
 *        in: query
 *        description: query를 조회할 항목
 *        schema:
 *          type: string
 *          enum: [user, title, callSign, bookId]
 *      responses:
 *        '200':
 *          description: 대출 기록을 반환한다.
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
 *                          description: 대출 고유 id
 *                          type: integer
 *                        condition:
 *                          description: 대출 당시 책 상태
 *                          type: string
 *                        login:
 *                          description: 대출한 카뎃의 인트라 id
 *                          type: string
 *                        penaltyDays:
 *                          description: 현재 대출 기록의 연체 일수
 *                          type: integer
 *                        callSign:
 *                          description: 대출된 책의 청구기호
 *                          type: string
 *                        title:
 *                          description: 대출된 책의 제목
 *                          type: string
 *                        createdAt:
 *                          type: string
 *                          format: date
 *                        dueDate:
 *                          description: 반납기한
 *                          type: string
 *                          format: date
 *                    example:
 *                      - id: 2
 *                        condition: 양호
 *                        login: minkykim
 *                        penaltyDays: 0
 *                        callSign: O40.15.v1.c1
 *                        title: "소프트웨어 장인(로버트 C. 마틴 시리즈)"
 *                        dueDate: 2021.09.20
 *                      - id: 42
 *                        condition: 이상없음
 *                        login: jwoo
 *                        penaltyDays: 2
 *                        callSign: H19.19.v1.c1
 *                        title: "클린 아키텍처: 소프트웨어 구조와 설계의 원칙"
 *                        dueDate: 2022.06.07
 *                  meta:
 *                    description: 대출 조회 결과에 대한 요약 정보
 *                    type: object
 *                    properties:
 *                      totalItems:
 *                        description: 전체 대출 검색 결과 건수
 *                        type: integer
 *                        example: 2
 *                      itemCount:
 *                        description: 현재 페이지 검색 결과 수
 *                        type: integer
 *                        example: 2
 *                      itemsPerPage:
 *                        description: 페이지 당 검색 결과 수
 *                        type: integer
 *                        example: 2
 *                      totalPages:
 *                        description: 전체 결과 페이지 수
 *                        type: integer
 *                        example: 1
 *                      currentPage:
 *                        description: 현재 페이지
 *                        type: integer
 *                        example: 1
 *        '400':
 *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
 *        '401':
 *          description: 대출을 조회할 권한이 없는 사용자
 *        '500':
 *          description: db 에러
 */
  .get('/search', authValidate(roleSet.librarian), search)

/**
 * @openapi
 * /api/lendings/{lendingId}:
 *    get:
 *      tags:
 *      - lendings
 *      summary: 특정 대출 기록 조회
 *      description: 특정 대출 기록의 상세 정보를 보여준다.
 *      parameters:
 *      - name: lendingId
 *        in: path
 *        description: 대출 기록의 고유 아이디
 *        required: true
 *        schema:
 *          type: integer
 *      responses:
 *        '200':
 *          description: 대출 기록을 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 대출 고유 id
 *                    type: integer
 *                    example: 2
 *                  condition:
 *                    description: 대출 당시 책 상태
 *                    type: string
 *                    example: 양호
 *                  createdAt:
 *                    description: 대출 일자(대출 레코드 생성 일자)
 *                    type: string
 *                    format: date
 *                    example: 2021.09.06.
 *                  login:
 *                    description: 대출한 카뎃의 인트라 id
 *                    type: string
 *                    example: minkykim
 *                  penaltyDays:
 *                    description: 현재 대출 기록의 연체 일수
 *                    type: integer
 *                    example: 2
 *                  callSign:
 *                    description: 대출된 책의 청구기호
 *                    type: string
 *                    example: H1.13.v1.c1
 *                  title:
 *                    description: 대출된 책의 제목
 *                    type: string
 *                    example: 소프트웨어 장인(로버트 C. 마틴 시리즈)
 *                  image:
 *                    description: 대출된 책의 표지
 *                    type: string
 *                    example: https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1633934%3Ftimestamp%3D20210706193409
 *                  dueDate:
 *                    description: 반납기한
 *                    type: string
 *                    format: date
 *                    example: 2021.09.20
 *        '400':
 *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 lendingId 등
 *        '401':
 *          description: 대출을 조회할 권한이 없는 사용자
 *        '500':
 *          description: db 에러
 */
  .get('/:id', authValidate(roleSet.librarian), lendingId)

/**
 * @openapi
 * /api/lendings/return:
 *    patch:
 *      tags:
 *      - lendings
 *      summary: 반납 처리
 *      description: 대출 레코드에 반납 처리를 한다.
 *      requestBody:
 *        description: lendingId는 대출 고유 아이디, condition은 반납 당시 책 상태
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                lendingId:
 *                  type: integer
 *                condition:
 *                  type: string
 *              required:
 *                - lendingId
 *                - condition
 *      responses:
 *        '200':
 *          description: 반납처리 완료, 반납된 책이 예약이 되어있는지 알려줌
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  reservedBook:
 *                    description: 반납된 책이 예약이 되어있는지 알려줌
 *                    type: boolean
 *                    example: true
 *        '400':
 *          description: 에러코드 0 dto에러 잘못된 json key, 1 db 에러 알 수 없는 lending id 등
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *        '401':
 *          description: 알 수 없는 사용자 0 로그인 안 된 유저 1 사서권한없음
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 * */

  .patch('/return', authValidate(roleSet.librarian), returnBook);
