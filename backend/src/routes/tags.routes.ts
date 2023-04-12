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
   *      summary: 태그 목록을 가져온다.
   *      description: 슈퍼/서브/디폴트 태그 정보를 검색하여 보여준다.
   *      parameters:
   *        - name: page
   *          in: query
   *          description: 검색 결과의 페이지
   *          schema:
   *            type: integer
   *            default: 1
   *            example: 3
   *        - name: limit
   *          in: query
   *          description: 검색 결과 한 페이지당 보여줄 결과물의 개수
   *          schema:
   *            type: integer
   *            default: 10
   *            example: 10
   *        - name: visibility
   *          in: query
   *          description: 공개 및 비공개 여부로, public 이면 공개, private 이면 비공개 서브 태그만 가져온다.
   *          schema:
   *            type: string
   *            default: public
   *            example: private
   *        - name: type
   *          in: query
   *          description: 태그의 타입으로, super, sub, default 중 하나를 입력한다.
   *          schema:
   *            type: string
   *            default: super
   *            example: super
   *            enum: [super, sub, default]
   *        - name: bookInfoId
   *          in: query
   *          description: 태그가 등록된 도서의 infoId
   *          schema:
   *            type: integer
   *            example: 1
   *      responses:
   *        '200':
   *          description: 슈퍼/서브/디폴트 태그들을 반환한다.
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  items:
   *                    description: 태그 목록
   *                    type: array
   *                    items:
   *                      type: object
   *                      properties:
   *                        bookInfoId:
   *                          description: 태그가 등록된 도서의 infoId
   *                          type: integer
   *                          example: 1
   *                        title:
   *                          description: 태그가 등록된 도서의 제목
   *                          type: string
   *                          example: 깐깐하게 배우는 C
   *                        id:
   *                          description: 태그 고유 id
   *                          type: integer
   *                          example: 1
   *                        createdAt:
   *                          description: 태그가 등록된 시간
   *                          type: string
   *                          example: 2023-04-12
   *                        nickname:
   *                          description: 태그를 작성한 카뎃의 닉네임
   *                          type: string
   *                          example: yena
   *                        content:
   *                          description: 슈퍼 태그의 내용
   *                          type: string
   *                          example: 1서클_추천_책
   *          '400':
   *            description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
   *          '401':
   *            description: 태그 기록을 조회할 권한이 없는 사용자
   *          '500':
   *            description: db 에러
   */
  .get('/tags', authValidate(roleSet.all) /* , searchSubTag */);

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
  .get('/tags/{superTagId}/sub', authValidate(roleSet.librarian) /* , searchSubTag */);

router
  /**
   * @openapi
   * /api/{bookInfoId}/tags:
   *    get:
   *      tags:
   *      - tags
   *      summary: 도서에 등록된 슈퍼 태그, 디폴트 태그 목록을 가져온다.
   *      description: 태그를 병합하기 위한 슈퍼 태그(노출되는 태그),
   *                   디폴트 태그(노출되지 않고 분류되지 않은 태그)를 가져온다.
   *      parameters:
   *        - in: path
   *          name: bookInfoId
   *          description: 태그를 조회할 도서의 infoId
   *          required: true
   *          schema:
   *            type: integer
   *            example: 1
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
   *                            count:
   *                              description: 슈퍼 태그에 속한 서브 태그 개수
   *                              type: integer
   *                              default: 1
   *                        example:
   *                          - id: 0
   *                            content: 1서클_추천_책
   *                            count: 3
   *                          - id: 42
   *                            content: 커리어
   *                            count: 1
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
