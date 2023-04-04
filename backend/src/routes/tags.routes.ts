import { Router } from 'express';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/tags';
export const router = Router();

router
  /**
   * @openapi
   * /api/tags:
   *    get:
   *      tags:
   *      - tags
   *      summary: 메인 페이지의 슈퍼 태그 목록을 가져온다.
   *      description: 메인 페이지에서 보여줄 슈퍼 태그 정보를 검색하여 보여준다.
   *      parameters:
   *      responses:
   *        '200':
   *          description: 슈퍼 태그들을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 슈퍼 태그 목록
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        title:
   *                          description: 슈퍼 태그가 등록된 도서의 제목
   *                          type: string
   *                        content:
   *                          description: 슈퍼 태그의 내용
   *                          type: string
   *                    example:
   *                      - title: 깐깐하게 배우는 C
   *                        content: 1서클_추천_책
   *                      - title: 나는 LINE 개발자입니다
   *                        content: 커리어
   *        '400':
   *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
   *        '401':
   *          description: 태그 기록을 조회할 권한이 없는 사용자
   *        '500':
   *          description: db 에러
   */
  .get('/tags', authValidate(roleSet.all) /* , searchSubTag */);

router
  /**
   * @openapi
   * /api/tags/sub:
   *    get:
   *      tags:
   *      - tags
   *      summary: 서브 태그 목록을 가져온다.
   *      description: 태그 관리 페이지에서 보여줄 서브 태그 정보를 검색하여 보여준다.
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
   *          default: 10
   *          example: 10
   *      - name: private
   *        in: query
   *        description: 공개 및 비공개 여부로, 1이면 공개, 0이면 비공개 서브 태그만 가져온다.
   *        schema:
   *          type: integer
   *          example: 1
   *      responses:
   *        '200':
   *          description: 서브 태그들을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 서브 태그 목록
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 서브 태그 고유 id
   *                          type: integer
   *                        title:
   *                          description: 서브 태그가 등록된 도서의 제목
   *                          type: string
   *                        content:
   *                          description: 서브 태그의 내용
   *                          type: string
   *                        login:
   *                          description: 서브 태그를 작성한 카뎃의 인트라 id
   *                          type: string
   *                    example:
   *                      - id: 0
   *                        title: 깐깐하게 배우는 C
   *                        content: 1서클_추천_책
   *                        login: yena
   *                      - id: 42
   *                        title: 나는 LINE 개발자입니다
   *                        content: 커리어
   *                        login: yena
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
  .get('/tags/sub', authValidate(roleSet.librarian) /* , searchSubTag */);

router
  /**
   * @openapi
   * /api/tags/merge:
   *    get:
   *      tags:
   *      - tags
   *      summary: 슈퍼 태그, 디폴트 태그 목록을 가져온다.
   *      description: 태그를 병합하기 위한 슈퍼 태그(노출되는 태그),
   *                   디폴트 태그(노출되지 않고 분류되지 않은 태그)를 가져온다.
   *      parameters:
   *      responses:
   *        '200':
   *          description: 슈퍼 태그, 디폴트 태그들을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 슈퍼 태그, 디폴트 태그 목록
   *                    type: object
   *                    properties:
   *                      superTags:
   *                        description: 슈퍼 태그 목록
   *                        type: array
   *                        items:
   *                          type: object
   *                          properties:
   *                            id:
   *                              description: 슈퍼 태그 고유 id
   *                              type: integer
   *                            content:
   *                              description: 슈퍼 태그 내용
   *                              type: string
   *                        example:
   *                          - id: 0
   *                            content: 1서클_추천_책
   *                          - id: 42
   *                            content: 커리어
   *                      defaultTags:
   *                        description: 디폴트 태그 목록
   *                        type: array
   *                        items:
   *                          type: object
   *                          properties:
   *                            id:
   *                              description: 디폴트 태그 고유 id
   *                              type: integer
   *                            content:
   *                              description: 디폴트 태그 내용
   *                              type: string
   *                        example:
   *                          - id: 0
   *                            content: yena가_추천하는
   *                          - id: 42
   *                            content: 마법같은_파이썬
   *        '400':
   *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
   *        '401':
   *          description: 태그 기록을 조회할 권한이 없는 사용자
   *        '500':
   *          description: db 에러
   */
  .get('/tags/merge', authValidate(roleSet.librarian) /* , searchSubTag */);

router
  /**
   * @openapi
   * /api/tags/{superTagId}/sub:
   *    get:
   *      tags:
   *      - tags
   *      summary: 슈퍼 태그에 속한 서브 태그 목록을 가져온다.
   *      description: 태그를 병합하기 위한 슈퍼 태그(노출되는 태그),
   *                   서브 태그(노출되지 않는 태그)를 가져온다.
   *      parameters:
   *        - in: path
   *          name: superTagId
   *          description: 서브 태그를 조회할 슈퍼 태그의 id
   *          required: true
   *      responses:
   *        '200':
   *          description: 슈퍼 태그에 속한 서브 태그들을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 슈퍼 태그에 속한 서브 태그 목록
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        id:
   *                          description: 서브 태그 고유 id
   *                          type: integer
   *                        content:
   *                          description: 서브 태그의 내용
   *                          type: string
   *                        login:
   *                          description: 서브 태그를 작성한 카뎃의 인트라 id
   *                          type: string
   *                    example:
   *                    - id: 0
   *                      content: 도커_쿠버네티스
   *                      login: yena
   *                    - id: 42
   *                      content: 도커
   *                      login: yena
   *                    - id: 50
   *                      content: 도커
   *                      login: jang-cho
   *        '400':
   *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
   *        '401':
   *          description: 태그 기록을 조회할 권한이 없는 사용자
   *        '500':
   *          description: db 에러
   */
  .get('/api/tags/{superTagId}/sub', authValidate(roleSet.librarian) /* , searchSubTag */);
