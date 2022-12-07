import { Router } from 'express';
import {
  histories,
} from '../histories/histories.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/histories';
export const router = Router();

router
  /**
   * @openapi
   * /api/histories:
   *     get:
   *       description: 현재까지의 대출 기록을 최신순으로 가져온다. 사서라면 모든 사용자의 기록을, 사서가 아니라면 본인의 기록만 볼  수 있다.
   *       tags:
   *       - histories
   *       parameters:
   *       - name: who
   *         in: query
   *         description: 대출/반납의 기록 범위
   *         required: true
   *         schema:
   *           type: string
   *           enum: [all, my]
   *       - name: query
   *         in: query
   *         description: 검색어
   *         required: false
   *         schema:
   *           type: string
   *       - name: type
   *         in: query
   *         description: 어떤 값들로 검색하고 싶은지 결정하는 필터
   *         required: false
   *         schema:
   *           type: string
   *           enum: [user, title, callsign, bookId]
   *       - name: page
   *         in: query
   *         description: 페이지 수
   *         required: false
   *         schema:
   *           type: integer
   *       - name: limit
   *         in: query
   *         description: 한 페이지 표시 개수
   *         required: false
   *         schema:
   *           type: integer
   *       responses:
   *         '200':
   *          description: 대출 기록을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 검색된 대출 기록들의 목록
   *                    type: array
   *                    example: [{"id": 135,"lendingCondition": "","login": "chanheki","returningCondition": "","penaltyDays": 0,"callSign": "K23.17.v1.c1","title": "모두의 데이터 과학 with 파이썬","bookInfoId":"123","createdAt": "2022-12-07T10:24:57.708Z", "returnedAt": "2022-12-07T10:24:57.708Z","dueDate": "2022-12-21T10:24:57.708Z","lendingLibrarianNickName": "chanheki", "returningLibrarianNickname" : null}, {"id": 136,"lendingCondition": "","login": "seongyle1","penaltyDays": 0,"callSign": "C5.13.v1.c1","title": "TCP IP 윈도우 소켓 프로그래밍(IT Cookbook 한빛 교재 시리즈 124)","bookInfoId":"123","createdAt": "2022-10-28T10:24:57.708Z", "returnedAt": null, "dueDate": "2022-11-11T10:24:57.708Z","lendingLibrarianNickName": "chanheki", "returningLibrarianNickname": "seongyle",  "image": "https://image.kyobobook.co.kr/images/book/xlarge/444/x9788998756444.jpg" }]
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 고유 id
   *                          type: integer
   *                          example: 777
   *                        lendingCondition:
   *                          description: 대출시 책 상태
   *                          type: string
   *                          example: "이상 없음"
   *                        login:
   *                          description: 대출자 아이디
   *                          type: string
   *                          example: chanheki
   *                        returningCondition:
   *                          description: 반납시 책 상태
   *                          type: string
   *                          example: "이상 없음"
   *                        penaltyDays:
   *                          description: 연체 일
   *                          type: integer
   *                          example: 777
   *                        callSign:
   *                          description: 청구 기호
   *                          type: string
   *                          example: C5.13.v1.c1
   *                        title:
   *                          description: 책 제목
   *                          type: TCP IP 윈도우 소켓 프로그래밍(IT Cookbook 한빛 교재 시리즈 )
   *                          example: 777
   *                        bookInfoId:
   *                          description: book_info의 id
   *                          type: integer
   *                          example: 123
   *                        createdAt:
   *                          description: lending 생성 일시
   *                          type: Date
   *                          example: 2022-05-05
   *                        returnedAt:
   *                          description: 반납 일시
   *                          type: Date
   *                          example: 2022-05-05
   *                        dueDate:
   *                          description: 반납 마감 일시
   *                          type: Date
   *                          example: 2022-05-05
   *                        lendingLibrarianNickName:
   *                          description: 대출해준 사서 이름
   *                          type: string
   *                          example: chanheki
   *                        returningLibrarianNickname:
   *                          decripttion: 반납해준 사서 이름(없으면 null)
   *                          type: string
   *                          example: seongyle
   *                        image:
   *                          decription: 책의 이미지 주소
   *                          type: string
   *                          example: https://image.kyobobook.co.kr/images/book/xlarge/444/x9788998756444.jpg
   *                  meta:
   *                    description: 대출 기록 수와 관련된 정보
   *                    type: object
   *                    properties:
   *                      totalItems:
   *                        description: 전체 대출 기록 결과 수
   *                        type: integer
   *                        example: 25
   *                      itemCount:
   *                        description: 현재 대출 기록 결과 수
   *                        type: integer
   *                        example: 5
   *                      itemsPerPage:
   *                        description: 페이지 대출 기록 결과 수
   *                        type: integer
   *                        example: 5
   *                      totalPages:
   *                        description: 전체 대출 기록 페이지 수
   *                        type: integer
   *                        example: 5
   *                      currentPage:
   *                        description: 현재 대출 기록 페이지
   *                        type: integer
   *                        example: 1
   *         '401':
   *           description: 사서권한 없은 유저가 전체 대출/반납 기록을 조회하려고 함
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   errorCode:
   *                     type: integer
   *                     example: 700
   */
  .get('/', authValidate(roleSet.all), histories);
