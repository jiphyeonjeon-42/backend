import { Router } from 'express';
import {
  searchBookInfo,
  sortInfo,
  search,
  getInfoId,
  createBook,
  createBookInfo,
  getBookById,
} from '../books/books.controller';
import authValidate from '../auth/auth.validate';
import { roleSet } from '../auth/auth.type';

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
   *                        lendingCnt:
   *                          description: 대출 횟수
   *                          type: integer
   *                          example: 0
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
   *                type: json
   *                description: error decription
   *                example: { errorCode: 300 }
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
   *                type: json
   *                description: error decription
   *                example: { errorCode: 300 }
   */
  .get('/info', sortInfo);

router
  /**
   * @openapi
   * /api/books/info/{id}:
   *    get:
   *      description: book_info테이블의 ID기준으로 책 한 종류의 정보를 가져온다.
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
   *                    type:  string
   *                    nullable: true
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
   *                        donator:
   *                          description: 책의 기부자
   *                          type: string
   *                          nullable: true
   *                          example: seongyle
   *                        status:
   *                          description: 책의 상태 (0:양호 1:분실 2:파손 3:지정도서)
   *                          type: number
   *                          example: 1
   *                        dueDate:
   *                          description: 반납 예정 일자, 대출가능 시 '-'
   *                          type: date
   *                          example: 21.08.05
   *                        isLendable:
   *                          description: 책의 대출가능여부
   *                          type: boolean
   *                          example: 1
   *                        isReserved:
   *                          description: 책의 예약 여부
   *                          type: boolean
   *                          example: 1
   *        '400_case1':
   *          description: id가 숫자가 아니다.
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { errorCode: 300 }
   *        '400_case2':
   *          description: 유효하지않은 infoId 값.
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { errorCode: 304 }
   */
  .get('/info/:id', getInfoId);

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
   *                        isLendable:
   *                          description: 대출 가능 여부
   *                          type: boolean
   *                          example: 1
   *                        callSign:
   *                          description: 청구 기호
   *                          type: string
   *                          example: "c1.99.v1.c1"
   *                        image:
   *                          description: 이미지 URL 주소
   *                          type: string
   *                          example: "이미지 주소"
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
   *                type: json
   *                description: error decription
   *                example: { errorCode: 300 }
   */
  .get('/search', authValidate(roleSet.librarian), search);

router
  /**
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
   *                title:
   *                  type: string
   *                  example: "작별인사 (김영하 장편소설)"
   *                isbn:
   *                  type: string
   *                  example: 9788065960874
   *                author:
   *                  type: string
   *                  example: "김영하"
   *                publisher:
   *                  type: string
   *                  example: "복복서가"
   *                image:
   *                  type: string
   *                  example: "https://bookthumb-phinf.pstatic.net/cover/223/538/22353804.jpg?type=m1&udate=20220608"
   *                categoryId:
   *                  type: integer
   *                  example: 1
   *                pubdate:
   *                  type: string
   *                  example: "20220502"
   *                donator:
   *                  type: string
   *                  example: seongyle
   *      responses:
   *         '200':
   *            description: 책 정보 정상적으로 insert됨.
   *            content:
   *             application/json:
   *               schema:
   *                 type: string
   *                 description: insert success
   *                 example: { code: 200, message: 'DB에 insert 성공하였습니다.' }
   *         '400_case1':
   *            description: 클라이언트 오류.
   *            content:
   *             application/json:
   *              schema:
   *                type: json
   *                description: error decription
   *                example: { errorCode: 300 }
   *         '400_case2':
   *            description: callsign 형식이 유효하지 않습니다.
   *            content:
   *             application/json:
   *               schema:
   *                 type: json
   *                 description: callsign 형식이 유효하지 않습니다.
   *                 example: { errorCode: 306 }
   *         '400_case3':
   *            description: naver open API에서 ISBN 검색결과가 없음.
   *            content:
   *             application/json:
   *               schema:
   *                 type: json
   *                 description: naver open API에서 ISBN 검색결과가 없음.
   *                 example: { errorCode: 302 }
   *         '400_case4':
   *            description: naver openapi에서 못 찾음
   *            content:
   *             application/json:
   *               schema:
   *                 type: json
   *                 description: naver open API에서 ISBN 검색 자체 실패
   *                 example: { errorCode: 302 }
   */
  .post('/create', authValidate(roleSet.librarian), createBook);

router
  /**
   * @openapi
   * /api/books/create:
   *    get:
   *      description: 책 생성을 위한 정보를 반환합니다.
   *      tags:
   *      - books
   *      parameters:
   *      - name: isbnQuery
   *        in: query
   *        description: isbn번호
   *        required: true
   *        schema:
   *          type: string
   *          example: 9791191114225
   *      responses:
   *         '200':
   *            description: 국립중앙도서관에서 ISBN으로 검색한뒤에 책정보를 반환
   *            content:
   *             application/json:
   *               schema:
   *                 type: JSON
   *                 description: 국립중앙도서관에서 가지고 온 데이터를 보여줌. category는 십진분류의 대분류
   *                 example: {"bookInfo": {  "title": "작별인사",  "image": "https://www.nl.go.kr/seoji/fu/ecip/dbfiles/CIP_FILES_TBL/2022/04/07/9791191114225.jpg",  "author": "지은이: 김영하",  "category": "8"}}
   *
   */
  .get('/create', authValidate(roleSet.librarian), createBookInfo);

router
/**
   * @openapi
   * /api/books/{id}:
   *    get:
   *      description: book테이블의 ID기준으로 책 한 종류의 정보를 가져온다.
   *      tags:
   *      - books
   *      parameters:
   *      - name: id
   *        in: path
   *        description: book 테이블의 id
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
   *                    description: book테이블의 id
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
   *                  callSign:
   *                    description: 청구기호
   *                    type: string
   *                    example: h1.18.v1.c1
   *                  donator:
   *                    description: 책의 기부자
   *                    type: string
   *                    example: seongyle
   *                  dueDate:
   *                    description: 반납 예정 일자, 대출가능 시 '-'
   *                    type: date
   *                    example: 21.08.05
   *                  isLendable:
   *                    description: 책의 대출가능여부
   *                    type: boolean
   *                    example: 1
   */
  .get('/:id', getBookById);
