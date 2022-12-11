import { Router } from 'express';
import {
  searchBookInfo,
  sortInfo,
  search,
  getInfoId,
  createBook,
  createBookInfo,
  getBookById,
  createLike,
  deleteLike,
  getLikeInfo,
  updateBookInfo,
} from '../books/books.controller';
import authValidate from '../auth/auth.validate';
import authValidateDefaultNullUser from '../auth/auth.validateDefaultNullUser';
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
   *      description: 책 정보를 기준에 따라 정렬한다. 정렬기준이 popular일 경우 당일으로부터 42일간 인기순으로 한다.
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
   *      description: 정보를 검색하여 가져온다. 책이 대출할 수 있는지 확인 할 수 있음
   *      tags:
   *      - books
   *      parameters:
   *      - name: query
   *        in: query
   *        description: 검색어
   *        required: false
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
   *                        bookInfoId:
   *                          description: 고유 bookInfo id
   *                          type: integer
   *                          example: 55
   *                        title:
   *                          description: 제목
   *                          type: string
   *                          example: "chanheki search"
   *                        author:
   *                          description: 저자
   *                          type: string
   *                          example: 김찬희
   *                        publisher:
   *                          description: 출판사
   *                          type: string
   *                          example: DigitalNew
   *                        publishedAt:
   *                          description: 출판일자
   *                          type: string
   *                          example: 20200505
   *                        isbn:
   *                          description: 책의 isbn
   *                          type: string
   *                          example: 9791195982394
   *                        callSign:
   *                          description: 청구 기호
   *                          type: string
   *                          example: "c1.99.v1.c9"
   *                        image:
   *                          description: 이미지 URL 주소
   *                          type: string
   *                          example: "이미지 주소"
   *                        bookId:
   *                          description: Book Id
   *                          type: integer
   *                          example: "1"
   *                        status:
   *                          description: Book status
   *                          type: integer
   *                          example: "2"
   *                        categoryId:
   *                          description: 카데고리 Id
   *                          type: integer
   *                          example: 5
   *                        category:
   *                          description: 카데고리
   *                          type: string
   *                          example: 기술교양
   *                        isLendable:
   *                          description: 대출 가능 여부
   *                          type: boolean
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
  .get('/search', search);

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
   *                  nullable: false
   *                  example: "작별인사 (김영하 장편소설)"
   *                isbn:
   *                  type: string
   *                  nullable: true
   *                  example: 9788065960874
   *                author:
   *                  type: string
   *                  nullable: false
   *                  example: "김영하"
   *                publisher:
   *                  type: string
   *                  nullable: false
   *                  example: "복복서가"
   *                image:
   *                  type: string
   *                  nullable: true
   *                  example: "https://bookthumb-phinf.pstatic.net/cover/223/538/22353804.jpg?type=m1&udate=20220608"
   *                categoryId:
   *                  type: string
   *                  nullable: false
   *                  example: 1
   *                pubdate:
   *                  type: string
   *                  nullable: false
   *                  example: "20220502"
   *                donator:
   *                  type: string
   *                  nullable: true
   *                  example: seongyle
   *      responses:
   *         '200':
   *            description: 책 정보 정상적으로 insert됨.
   *            content:
   *             application/json:
   *               schema:
   *                 type: json
   *                 description: 성공했을 때 삽인된 callsign 값을 반환합니다.
   *                 example: { callsign: 'c11.22.v1.c2' }
   *         '실패 케이스 1':
   *              description: 예상치 못한 에러로 책 정보 insert에 실패함.
   *              content:
   *                application/json:
   *                  schema:
   *                    type: json
   *                    example : { errorCode: 308 }
   *         '실패 케이스 2':
   *              description: 보내준 카테고리 ID에 해당하는 callsign을 찾을 수 없음
   *              content:
   *                application/json:
   *                  schema:
   *                    type: json
   *                    example : { errorCode: 309 }
   *         '실패 케이스 3':
   *              description: 입력한 pubdate가 알맞은 형식이 아님. 기대하는 형식 "20220807"
   *              content:
   *                application/json:
   *                  schema:
   *                    type: json
   *                    example : { errorCode: 311 }
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
   *        '200':
   *          description: 국립중앙도서관에서 ISBN으로 검색한뒤에 책정보를 반환
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                description: ISBN으로 국립중앙도서관에서 검색후에 정보를 반환, 이미지는 교보문고에서 가지고 옴
   *                properties:
   *                  bookInfo:
   *                    type: object
   *                    properties:
   *                      title:
   *                        description: 책의 제목
   *                        nullable: false
   *                        type: string
   *                        example: "작별인사"
   *                      image:
   *                        description: 책 표지 이미지 주소
   *                        nullable: true
   *                        type: string
   *                        example: "http://image.kyobobook.co.kr/images/book/xlarge/225/x9791191114225.jpg"
   *                      author:
   *                        description: 저자
   *                        nullable: false
   *                        type: string
   *                        example: "지은이: 김영하"
   *                      category:
   *                        description: 십진분류법상 대분류
   *                        nullable: true
   *                        type: string
   *                        example: "8"
   *                      isbn:
   *                        description: ISBN 번호
   *                        nullable: false
   *                        type: string
   *                        example: "9791191114225"
   *                      publisher:
   *                        description: 출판사
   *                        nullable: false
   *                        type: string
   *                        example: "복복서가"
   *                      pubdate:
   *                        description: 출판일자
   *                        nullable: false
   *                        type: string
   *                        format: date
   *                        example: "20220502"
   *        '실패 케이스 1':
   *            description: 국립중앙 도서관 API에서 ISBN 검색이 실패
   *            content:
   *              application/json:
   *                schema:
   *                  type: json
   *                  example: { errorCode : 303 }
   *        '실패 케이스 2':
   *            description: 네이버 책검색 API에서 ISBN 검색이 실패
   *            content:
   *              application/json:
   *                schema:
   *                  type: json
   *                  example: { errorCode : 310 }
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

router
/**
   * @openapi
   * /api/books/info/{bookInfoId}/like:
   *    post:
   *      tags:
   *      - like
   *      summary: Add a new like to the book
   *      operationId: addLike
   *      parameters:
   *      - name: bookInfoId
   *        in: path
   *        description: book_info 테이블의 id
   *        required: true
   *        schema:
   *          type: integer
   *      responses:
   *        '실패 케이스 1':
   *          description: bookInfoId가 유효하지 않음
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                example : { errorCode: 601}
   *        '실패 케이스 2':
   *          description: 중복된 like데이터가 이미 존재함.
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                example : { errorCode: 602}
   *        '200':
   *          description: Success
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                description: 성공했을 때 생성된 like 데이터를 반환합니다.
   *                properties:
   *                  userId:
   *                   type: integer
   *                   description: 좋아요를 누른 유저의 id
   *                  bookInfoId:
   *                   type: integer
   *                   description: 좋아요할 bookInfo의 id
   *                example : { userId: 123, bookInfoId: 456 }
   */
  .post('/info/:bookInfoId/like', authValidate(roleSet.service), createLike);

router
/**
   * @openapi
   * /api/books/info/{bookInfoId}/like:
   *    delete:
   *      tags:
   *       - like
   *      summary: Delete a like
   *      operationId: deleteLike
   *      parameters:
   *      - name: bookInfoId
   *        in: path
   *        description: book_info 테이블의 id
   *        required: true
   *        schema:
   *          type: integer
   *      responses:
   *        '204':
   *          description: No Content
   *          content:
   *            application/json:
   *              schema:
   *                type:
   *                description:
   *        'errorcase-1':
   *          description: bookInfoId가 유효하지 않음
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                example : { errorCode: 601}
   *        'errorcase-2':
   *          description: 존재하지 않는 좋아요데이터를 삭제하려 함.
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                example : { errorCode: 603}
   */
  .delete('/info/:bookInfoId/like', authValidate(roleSet.service), deleteLike);

router
/**
   * @openapi
   * /api/books/info/{bookInfoId}/like:
   *    get:
   *      tags:
   *      - like
   *      summary: Get like info
   *      description: Get info about likenum and whether user press like button
   *      operationId: findLikeInfo
   *      parameters:
   *      - name: bookInfoId
   *        in: path
   *        description: book_info 테이블의 id
   *        required: true
   *        schema:
   *          type: integer
   *      responses:
   *        '200':
   *          description: successful operation
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                description: 책에 대한 좋아요 정보를 가져옵니다.
   *                example : { "bookInfoId": 123, "isLiked" : true, "likeNum" : 15 }
   *                properties:
   *                  bookInfoId:
   *                   type: integer
   *                   description: 좋아요할 bookInfo의 id
   *                  isLiked:
   *                   type: bool
   *                   description: 사용자가 이 책에 대하여 좋아요를 눌렀는 지 여부
   *                  likeNum:
   *                   type: integer
   *                   description: 이 책에 눌린 좋아요의 수
   *        'errorcase-1':
   *          description: bookInfoId가 유효하지 않음
   *          content:
   *            application/json:
   *              schema:
   *                type: json
   *                example : { errorCode: 601}
   */
  .get('/info/:bookInfoId/like', authValidateDefaultNullUser(roleSet.all), getLikeInfo);

router
/**
 * @openapi
 * /api/books/update:
 *    patch:
 *      description: 책 정보를 수정합니다. book_info table or book table
 *      tags:
 *      - books
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                bookInfoId:
 *                  description: bookInfoId
 *                  type: integer
 *                  nullable: false
 *                  example: 1
 *                categoryId:
 *                  description: categoryId
 *                  type: integer
 *                  nullable: false
 *                  example: 1
 *                title:
 *                  description: 제목
 *                  type: string
 *                  nullable: true
 *                  example: "작별인사 (김영하 장편소설)"
 *                author:
 *                  description: 저자
 *                  type: string
 *                  nullable: true
 *                  example: "김영하"
 *                publisher:
 *                  description: 출판사
 *                  type: string
 *                  nullable: true
 *                  example: "복복서가"
 *                publishedAt:
 *                  description: 출판연월
 *                  type: string
 *                  nullable: true
 *                  example: "20200505"
 *                image:
 *                  description: 표지이미지
 *                  type: string
 *                  nullable: true
 *                  example: "https://bookthumb-phinf.pstatic.net/cover/223/538/22353804.jpg?type=m1&udate=20220608"
 *                bookId:
 *                  description: bookId
 *                  type: integer
 *                  nullable: false
 *                  example: 1
 *                callSign:
 *                  description: 청구기호
 *                  type: string
 *                  nullable: true
 *                  example: h1.18.v1.c1
 *                status:
 *                  description: 도서 상태
 *                  type: integer
 *                  nullable: false
 *                  example: 0
 *      responses:
 *         '204':
 *            description: 성공했을 때 http 상태코드 204(NO_CONTENT) 값을 반환.
 *            content:
 *             application:
 *               schema:
 *                 type:
 *                 description: 성공했을 때 http 상태코드 204 값을 반환.
 *         '실패 케이스 1':
 *              description: 예상치 못한 에러로 책 정보 patch에 실패.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: json
 *                    example : { errorCode: 312 }
 *         '실패 케이스 2':
 *              description: 수정할 DATA가 적어도 한 개는 필요. 수정할 DATA가 없음"
 *              content:
 *                application/json:
 *                  schema:
 *                    type: json
 *                    example : { errorCode: 313 }
 *         '실패 케이스 3':
 *              description: 입력한 publishedAt filed가 알맞은 형식이 아님. 기대하는 형식 "20220807"
 *              content:
 *                application/json:
 *                  schema:
 *                    type: json
 *                    example : { errorCode: 311 }
 */
  .patch('/update', authValidate(roleSet.librarian), updateBookInfo);
