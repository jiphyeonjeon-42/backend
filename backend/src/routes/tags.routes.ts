import { Router } from 'express';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';
import { wrapAsyncController } from '../middlewares/wrapAsyncController';

export const path = '/tags';
export const router = Router();

router
  /**
     * @openapi
     * /api/tags:
     *    post:
     *      description: 태그를 생성한다. 태그 길이는 42자 미만으로 해야한다.
     *      tags:
     *      - tags
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                bookInfoId:
     *                  type: number
     *                  nullable: false
     *                  required: true
     *                  example: 42
     *                content:
     *                  type: string
     *                  nullable: false
     *                  required: true
     *                  example: "Python"
     *      responses:
     *         '201':
     *            description: 태그가 DB에 정상적으로 insert됨.
     *         '400':
     *            description: 잘못된 요청.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  유효하지 않은 content 길이 :
     *                    value:
     *                      errorCode: 801
     *         '401':
     *            description: 권한 없음.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  토큰 누락 :
     *                    value:
     *                      errorCode: 100
     *                  토큰 유저 존재하지 않음 :
     *                    value :
     *                      errorCode: 101
     *                  토큰 만료 :
     *                    value :
     *                      errorCode: 108
     *                  토큰 유효하지 않음 :
     *                    value :
     *                      errorCode: 109
     */
    .post('/', authValidate(roleSet.all), /*wrapAsyncController(createtags)*/);

router
    /**
     * @openapi
     * /api/tags/{tagsId}:
     *    delete:
     *      description: 책 태그를 삭제한다. 작성자와 사서 권한이 있는 사용자만 삭제할 수 있다.
     *      tags:
     *      - tags
     *      parameters:
     *      - name: tagsId
     *        required: true
     *        in: path
     *        description: 들어온 tagsId에 해당하는 태그를 삭제한다.
     *      responses:
     *         '200':
     *            description: 태그가 DB에서 정상적으로 delete됨.
     *         '400':
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                 적절하지 않는 tagsId 값:
     *                   value:
     *                     errorCode: 800
     *         '401':
     *            description: 권한 없음.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  토큰 누락 :
     *                    value:
     *                      errorCode: 100
     *                  토큰 유저 존재하지 않음 :
     *                    value :
     *                      errorCode: 101
     *                  토큰 만료 :
     *                    value :
     *                      errorCode: 108
     *                  토큰 유효하지 않음 :
     *                    value :
     *                      errorCode: 109
     *                  토큰 userId와 태그 userID 불일치 && 사서 권한 없음 :
     *                    value :
     *                      errorCode: 801
     *         '404':
     *            description: 존재하지 않는 tagsId.
     *            content:
     *              application/json:
     *                schema:
     *                  type: object
     *                examples:
     *                  존재하지 않는 tagsId :
     *                    value:
     *                      errorCode: 804
     */
    .delete('/:reviewsId', authValidate(roleSet.all), /*wrapAsyncController(deleteReviews)*/);

   * @openapi
   * /api/tags:
   *    get:
   *      tags:
   *      - tags
   *      summary: 서브/디폴트 태그 정보를 검색한다.
   *      description: 서브/디폴트 태그 정보를 검색한다. 이는 태그 관리 페이지에서 사용한다.
   *      parameters:
   *        - name: page
   *          in: query
   *          description: 검색 결과의 페이지.
   *          schema:
   *            type: integer
   *            default: 1
   *            example: 1
   *        - name: limit
   *          in: query
   *          description: 검색 결과 한 페이지당 보여줄 결과물의 개수.
   *          schema:
   *            type: integer
   *            default: 10
   *            example: 10
   *        - name: visibility
   *          in: query
   *          description: 공개 및 비공개 여부로, public 이면 공개, private 이면 비공개 서브 태그만 가져온다.
   *          required: true
   *          schema:
   *            type: string
   *            default: public
   *            example: public
   *            enum: [public, private]
   *        - name: title
   *          in: query
   *          description: 검색할 도서의 제목. 검색 결과는 도서 제목에 해당하는 태그들을 반환한다.
   *          schema:
   *            type: string
   *            example: 깐깐하게 배우는 C
   *            nullable: true
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
   *                  meta:
   *                    description: 모든 태그 수와 관련된 정보
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
   *                        example: 10
   *                      totalPages:
   *                        description: 전체 결과 페이지 수
   *                        type: integer
   *                        example: 1
   *                      currentPage:
   *                        description: 현재 페이지
   *                        type: integer
   *                        example: 1
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
   *      description: superTagId에 해당하는 슈퍼 태그에 속한 서브 태그 목록을 가져온다. 태그 병합 페이지에서 슈퍼 태그의
   *                   서브 태그를 가져올 때 사용한다.
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
   * /api/tags/{bookInfoId}:
   *    get:
   *      tags:
   *      - tags
   *      summary: 도서에 등록된 슈퍼 태그, 디폴트 태그 목록을 가져온다.
   *      description: 슈퍼 태그(노출되는 태그), 디폴트 태그(노출되지 않고 분류되지 않은 태그)를 가져온다.
   *                   이는 도서 상세 페이지 및 태그 병합 페이지에서 사용된다.
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
