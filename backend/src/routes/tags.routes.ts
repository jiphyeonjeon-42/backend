import { Router } from 'express';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/tags';
export const router = Router();

router
  /**
   * @openapi
   * /api/tags/search:
   *    get:
   *      tags:
   *      - tags
   *      summary: 전체 태그 조회
   *      description: 태그 정보를 검색하여 보여준다.
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
   *        description: 태그 목록에서 검색할 단어, 검색 가능한 필드 [user, title, bookInfoId]
   *        schema:
   *          type: string
   *          example: yena
   *      - name: type
   *        in: query
   *        description: query를 조회할 항목
   *        schema:
   *          type: string
   *          enum: [user, title, bookInfoId]
   *      responses:
   *        '200':
   *          description: 태그 기록을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 검색된 태그들의 목록
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 태그 고유 id
   *                          type: integer
   *                        content:
   *                          description: 태그의 내용
   *                          type: string
   *                        login:
   *                          description: 태그를 작성한 카뎃의 인트라 id
   *                          type: string
   *                        bookInfoId:
   *                          description: 태그가 작성된 책의 bookInfoId
   *                          type: integer
   *                        count:
   *                          description: 태그의 개수
   *                          type: integer
   *                        createdAt:
   *                          description: 태그가 작성된 날짜
   *                          type: string
   *                          format: date
   *                        updatedAt:
   *                          description: 태그가 수정된 날짜
   *                          type: string
   *                          format: date
   *                    example:
   *                      - id: 0
   *                        content: 1서클_추천_책
   *                        login: yena
   *                        bookInfoId: 1
   *                        count: 1
   *                        createdAt: 2023.03.27
   *                        updatedAt: 2023.03.27
   *                      - id: 42
   *                        content: minirt
   *                        login: yena, jang-cho
   *                        bookInfoId: 42
   *                        count: 2
   *                        createdAt: 2023.03.27
   *                        updatedAt: 2023.03.27
   *                  meta:
   *                    description: 태그 조회 결과에 대한 요약 정보
   *                    type: object
   *                    properties:
   *                      totalItems:
   *                        description: 전체 태그 검색 결과 건수
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
   *          description: 태그 기록을 조회할 권한이 없는 사용자
   *        '500':
   *          description: db 에러
   */
  .get('/search', authValidate(roleSet.librarian) /* , search */);
