import { Router } from 'express';
import {
  createDefaultTags,
  createSuperTags,
  updateSuperTags,
  mergeTags,
  searchSubDefaultTags,
  searchSubTags,
  searchSuperDefaultTags
} from '../tags/tags.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

export const path = '/tags';
export const router = Router();

router
/**
 * @openapi
 * /api/tags:
 *    patch:
 *      description: 태그를 수정한다.
 *      tags:
 *      - tags
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  description: 수정할 태그의 id
 *                  type: integer
 *                  example: 1
 *                  required: true
 *                content:
 *                  description: 슈퍼 태그 내용
 *                  type: string
 *                  example: "수정할_내용_적기"
 *      responses:
 *        '200':
 *          description: 수정된 슈퍼 태그를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    description: 수정된 슈퍼 태그의 id
 *                    type: integer
 *                    example: 1
 *                  content:
 *                    description: 수정된 슈퍼 태그 내용
 *                    type: string
 *                    example: "수정된_태그"
 *        '900':
 *          description: 태그의 양식이 올바르지 않습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 900
 *        '901':
 *          description: 권한이 없습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 901
 *        '902':
 *          description: 이미 존재하는 태그입니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorCode:
 *                    type: integer
 *                    example: 902
 *        '500':
 *          description: DB Error
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
 */
  .patch('/', authValidate(roleSet.librarian), updateSuperTags);

router
/**
  * @openapi
  * /api/tags/merge:
  *    patch:
  *      description: 태그를 병합한다.
  *      tags:
  *      - tags
  *      requestBody:
  *        required: true
  *        content:
  *          application/json:
  *            schema:
  *              type: object
  *              properties:
  *                subTagIds:
  *                  description: 병합될 서브 태그의 id 리스트
  *                  type: list
  *                  required: true
  *                  example: [1, 2, 3, 5, 10]
  *                superTagId:
  *                  description: 슈퍼 태그의 id
  *                  type: integer
  *                  required: true
  *                  example: 2
  *      responses:
  *        '200':
  *          description: 병합 후의 슈퍼 태그를 반환합니다.
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  id:
  *                    description: 슈퍼 태그의 id
  *                    type: integer
  *                    example: 3
  *                  content:
  *                    description: 태그 내용
  *                    type: string
  *                    example: "병합된_태그"
  *                  count:
  *                    description: 해당 슈퍼 태그에 속한 서브 태그의 개수
  *                    type: integer
  *                    example: 3
  *        '901':
  *          description: 권한이 없습니다.
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  errorCode:
  *                    type: integer
  *                    example: 901
  *        '904':
  *          description: 존재하지 않는 태그 ID 입니다.
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  errorCode:
  *                    type: integer
  *                    example: 904
  *        '910':
  *          description: 유효하지 않은 양식의 태그 ID 입니다.
  *          content:
  *            application/json:
  *              schema:
  *                type: object
  *                properties:
  *                  errorCode:
  *                    type: integer
  *                    example: 910
  *        '500':
  *          description: DB Error
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
  */
  .patch('/merge', authValidate(roleSet.librarian), mergeTags);

router
  /**
   * @openapi
   * /api/tags/default:
   *    post:
   *      description: 디폴트(자식) 태그를 생성한다. 태그 길이는 42자 미만으로 해야한다.
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
  .post('/default', authValidate(roleSet.all), createDefaultTags);

router
  /**
   * @openapi
   * /api/tags/super:
   *    post:
   *      description: 슈퍼(부모) 태그를 생성한다. 태그 길이는 42자 미만으로 해야한다.
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
  .post('/super', authValidate(roleSet.librarian), createSuperTags);

router
  /**
   * @openapi
   * /api/tags/sub/{tagId}:
   *    delete:
   *      description: 서브, 디폴트 태그를 삭제한다. 작성자만 태그를 삭제할 수 있다.
   *      tags:
   *      - tags
   *      parameters:
   *      - name: tagId
   *        required: true
   *        in: path
   *        description: 들어온 tagId에 해당하는 태그를 삭제한다.
   *      responses:
   *         '200':
   *            description: 태그가 DB에서 정상적으로 delete됨.
   *         '400':
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                examples:
   *                 적절하지 않는 tagId 값:
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
  .delete('/:reviewsId', authValidate(roleSet.all) /* (deleteReviews) */);

router
  /**
   * @openapi
   * /api/tags/super/{tagId}:
   *    delete:
   *      description: 슈퍼 태그를 삭제한다. 사서 권한이 있는 사용자만 삭제할 수 있다.
   *      tags:
   *      - tags
   *      parameters:
   *      - name: tagId
   *        required: true
   *        in: path
   *        description: 들어온 tagId에 해당하는 태그를 삭제한다.
   *      responses:
   *         '200':
   *            description: 태그가 DB에서 정상적으로 delete됨.
   *         '400':
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                examples:
   *                 적절하지 않는 tagId 값:
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
  .delete('/:reviewsId', authValidate(roleSet.librarian) /* (deleteReviews) */);

router
  /**
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
   *            default: 0
   *            example: 0
   *        - name: limit
   *          in: query
   *          description: 검색 결과 한 페이지당 보여줄 결과물의 개수.
   *          schema:
   *            type: integer
   *            default: 10
   *            example: 10
   *        - name: visibility
   *          in: query
   *          description: 공개 및 비공개 여부로, public 이면 공개, private 이면 비공개, null이면 모든 서브 및 디폴트 태그만 가져온다.
   *          schema:
   *            type: string
   *            default:
   *            example: null
   *            enum: [null, public, private]
   *        - name: title
   *          in: query
   *          description: 검색할 도서의 제목. 검색 결과는 도서 제목에 해당하는 태그들을 반환한다.
   *          schema:
   *            type: string
   *            example: 개발자의 코드
   *            nullable: true
   *      responses:
   *        '200':
   *          description: 서브/디폴트 태그들을 반환한다. 디폴트 태그라면 superContent에 null이 들어가고, 서브 태그라면 superContent에 super 태그의 내용이 들어간다.
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
   *                          example: 개발자의 코드
   *                        id:
   *                          description: 태그 고유 id
   *                          type: integer
   *                          example: 1
   *                        createdAt:
   *                          description: 태그가 등록된 시간
   *                          type: string
   *                          example: 2023-04-12
   *                        login:
   *                          description: 태그를 작성한 카뎃의 닉네임
   *                          type: string
   *                          example: yena
   *                        content:
   *                          description: 서브/디폴트 태그의 내용
   *                          type: string
   *                          example: yena가_추천하는
   *                        superContent:
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
  .get('/', authValidate(roleSet.librarian), searchSubDefaultTags);

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
  .get('/:superTagId/sub', authValidate(roleSet.librarian), searchSubTags);

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
   *                      id:
   *                        description: 슈퍼 태그 고유 id
   *                        type: integer
   *                      content:
   *                        description: 슈퍼 태그 내용
   *                        type: string
   *                      count:
   *                        description: 슈퍼 태그에 속한 서브 태그 개수. 슈퍼 태그는 기본값이 1이며, 0이면 디폴트 태그를 의미한다.
   *                        type: integer
   *                    example:
   *                    - id: 0
   *                      content: 1서클_추천_책
   *                      count: 3
   *                    - id: 42
   *                      content: 커리어
   *                      count: 1
   *                    - id: 0
   *                      content: yena가_추천하는
   *                      count: 0
   *                    - id: 42
   *                      content: 마법같은_파이썬
   *                      count: 0
   *        '400':
   *          description: 잘못된 요청. 잘못 입력된 json key, 유효하지 않은 value 등
   *        '401':
   *          description: 태그 기록을 조회할 권한이 없는 사용자
   *        '500':
   *          description: db 에러
   */
  .get('/:bookInfoId', authValidate(roleSet.librarian), searchSuperDefaultTags);
