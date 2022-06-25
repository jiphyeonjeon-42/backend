import { Router } from 'express';
import {
  cancel, create, search, count, userReservations,
} from '../reservations/reservations.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/reservations';
export const router = Router();
/**
 * @openapi
 *  /api/reservations/count:
 *    get:
 *      tags:
 *      - reservations
 *      summary: 예약 대기 확인
 *      description: 책 예약 대기 수를 확인한다.
 *      parameters:
 *      - in: query
 *        name: bookInfo
 *        schema:
 *            type: string
 *        description: bookInfo에 해당하는 예약 대기 수를 확인할 수 있다.
 *      responses:
 *        '200':
 *          description: 예약 대기 정보를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  count:
 *                    description: 예약 순위
 *                    type: integer
 *                    example: 0
 *        '400':
 *          description: 잘못된 정보를 입력한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    description: 여러 가지 경우의 에러를 나타내는 코드
 *                    type: integer
 *                    example: 2
 */

/**
 * @openapi
 *  /api/reservations:
 *    post:
 *      tags:
 *      - reservations
 *      summary: 유저의 예약 생성
 *      description: jwt로 인증된 유저가 예약을 생성한다.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                bookInfoId:
 *                  description: 예약 대상이 되는 책 정보의 id
 *                  type: integer
 *                  example: 34
 *      responses:
 *        '200':
 *          description: 예약한 책에 걸려있는 예약수를 확인한다. (본인이 방금한거 포함)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  count:
 *                    description: 예약 순위
 *                    type: integer
 *                    example: 2
 *        '400':
 *          description: 잘못된 정보를 입력한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    description:
 *                    type: integer
 *                    example: 2
*        '400_case2':
 *          description:  예약에 실패한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    description:
 *                    type: integer
 *                    example: 502(패널티 기간) || 503(대출이 가능한 책) || 504(이미 예약중) || 505(이미 대출중), ... 
 * */

/**
 * @openapi
 * /api/reservations/search:
 *    get:
 *      tags:
 *      - reservations
 *      summary: 예약 검색
 *      description: 사서는 모든 예약 정보를 조회할 수 있다.
 *      parameters:
 *      - name: query
 *        in: query
 *        description: 조회하기 위한 검색어 (인트라아이디, 책제목, 청구기호 중 일부)
 *        schema:
 *          type: string
 *      - name: page
 *        in: query
 *        description: 페이지 수
 *        schema:
 *          type: integer
 *          default: 1
 *      - name: limit
 *        in: query
 *        description: 한 페이지 표시 개수
 *        schema:
 *          type: integer
 *          default: 5
 *      - name: filter
 *        in: query
 *        description: 조회 범위를 제한하기 위한 필터 옵션
 *        schema:
 *          type: string
 *          enum: [pending, expired, waiting, all]
 *          default: pending
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
 *                        reservationId:
 *                          description: 예약 고유 id
 *                          type: integer
 *                        login:
 *                          description:  예약한 사람의 login ID
 *                          type: string
 *                        penaltyDays:
 *                          description: 예약한 사람의 연체 정보
 *                          type: integer
 *                        title:
 *                          description: 예약된 책 제목
 *                          type: string
 *                        image:
 *                          description: 예약된 책 표지 사진
 *                          type: string
 *                        callSign:
 *                          description: 예약된 책 청구기호
 *                          type: string
 *                        createdAt:
 *                          description: 예약 생성일
 *                          type: string
 *                          format: date
 *                        endAt:
 *                          descrdiption: 예약 만료일
 *                          type: string
 *                          format: date
 *                        status:
 *                          description: 예약 상태
 *                          type: integer
 *                        userId:
 *                          description: 유저 ID
 *                          type: integer
 *                        bookId:
 *                          description: book id
 *                          type: integer
 *                    example:
 *                      - reservationId: 2
 *                        login: "doby"
 *                        penaltyDays: 3
 *                        title: "컴퓨터 구조"
 *                        image: "http://image.kyobobook.co.kr/images/book/xlarge/885/x9791186659885.jpg"
 *                        callSign: "A2.24."
 *                        createdAt: 2022.04.23
 *                        endAt: 2022.05.06
 *                        status: 0
 *                      - reservationId: 3
 *                        login: "tkim"
 *                        penaltyDays: 0
 *                        title: "코딩도장 튜토리얼로 배우는 python"
 *                        image: "http://image.kyobobook.co.kr/images/book/xlarge/885/x9791186659885.jpg"
 *                        callSign: "H19.19.v1.c1"
 *                        createdAt: 2022.04.03
 *                        endAt: 2022.05.06
 *                        status: 0
 *                  meta:
 *                    description: 예약 건수와 관련된 정보
 *                    type: object
 *                    properties:
 *                      totalItems:
 *                        description: 전체 예약 검색 결과 건수
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
 *          description: query, page, limit, filter중 하나에 유효하지 않은 value가 들어온 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                description: error decription
 *                example: query, page, limit, filter 중 하나에 유효하지 않은 value가 들어온 경우
 *        '401':
 *          description: 사서 권한 없는 요청
 * */

/**
 * @openapi
 * /api/reservations/cancel/{id}:
 *    patch:
 *      tags:
 *      - reservations
 *      summary: 예약 취소
 *      description: 예약을 취소한다.
 *      parameters:
 *      - name: id
 *        in: path
 *        description: 예약 고유 아이디
 *        required: true
 *        schema:
 *          type: integer
 *      responses:
 *        '200':
 *          description: 예약 취소처리 완료
 *        '400':
 *          description: 에러코드 0 dto에러 잘못된 json key 1 존재하지 않는 예약 아이디
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *        '401':
 *          description: 알 수 없는 사용자
 * */

router
  .post('/', authValidate(roleSet.service), create)
  .get('/search', authValidate(roleSet.librarian), search)
  .patch('/cancel/:reservationId', authValidate(roleSet.service), cancel)
  .get('/count', authValidate(roleSet.all), count)
  .get('/', authValidate(roleSet.service), userReservations);
