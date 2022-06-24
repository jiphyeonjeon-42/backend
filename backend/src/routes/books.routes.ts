import { Router } from 'express';
import {
  searchBookInfo,
  sortInfo,
  search,
  getInfoId,
  createBook,
  createBookInfo,
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
  .get('/info', sortInfo)

  /**
   * @openapi
   * /api/books/info/{id}:
   *    get:
   *      description: 책 한 종류의 정보를 가져온다.
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
   *                          example: seongyle
   *                        dueDate:
   *                          description: 반납 예정 일자, 대출가능 시 '-'
   *                          type: date
   *                          example: 21.08.05
   *                        isLendable:
   *                          description: 책의 대출가능여부
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
   *                        isLenderable:
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
   *                callSign:
   *                  type: string
   *                  example: e7.79.v2.c3
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
   *         '200_case1':
   *            description: 네이버 ISBN 검색결과도 없고, 집현전 DB에도 비슷한게 없다.
   *            content:
   *             application/json:
   *               schema:
   *                 type: string
   *                 description: 네이버 ISBN 검색결과가 없고, 집현전 DB에도 없을 때
   *                 example: { "isbnInNaver": [], "isbnInBookInfo": [], "sameTitleOrAuthor": [] }
   *         '200_case2':
   *            description: 네이버 ISBN 검색결과있고, 집현전 DB에도 비슷한게 없다.
   *            content:
   *             application/json:
   *               schema:
   *                 type: string
   *                 description: 네이버 ISBN 검색결과가 있고, 집현전 DB에도 없을 때
   *                 example: {"isbnInNaver": [{"title": "작별인사 (김영하 장편소설)","link": "http://book.naver.com/bookdb/book_detail.php?bid=22353804","image": "https://bookthumb-phinf.pstatic.net/cover/223/538/22353804.jpg?type=m1&udate=20220608","author": "김영하","price": "14000","discount": "12600","publisher": "복복서가","pubdate": "20220502","isbn": "1191114228 9791191114225","description": "누구도 도와줄 수 없는 상황, 혼자 헤쳐나가야 한다\n지켜야 할 약속, 붙잡고 싶은 온기\n\n김영하가 『살인자의 기억법』 이후 9 년 만에 내놓는 장편소설 『작별인사』는 그리 멀지 않은 미래를 배경으로, 별안간 삶이 송두리째 뒤흔들린 한 소년의 여정을 좇는다. 유명한 IT 기업의 연구원인 아버지와 쾌적하고... " }], "isbnInBookInfo": [], "sameTitleOrAuthor": []}
   *         '200_case3':
   *            description: 네이버 ISBN 검색결과있고, 집현전 DB에 일치하는 ISBN이 있다.
   *            content:
   *             application/json:
   *               schema:
   *                 type: JSON
   *                 description: 네이버 ISBN 검색결과있고, 집현전 DB에 일치하는 ISBN이 있다
   *                 example: {"isbnInNaver": [ {"title": "모두의 알고리즘 with 파이썬 (컴퓨팅 사고를 위한 기초 알고리즘)","link": "http://book.naver.com/bookdb/book_detail.php?bid=12057147","image": "https://bookthumb-phinf.pstatic.net/cover/120/571/12057147.jpg?type=m1&udate=20210508","author": "이승찬","price": "16000","discount": "14400","publisher": "길벗","pubdate": "20170518","isbn": "1160501726 9791160501728","description": "남녀노소 누구나 즐겁게 프로그래밍을 시작하세요!\n남녀노소 누구나 즐겁게 프로그래밍을 시작하세요!\n4차 산업혁명이 가져올 일자리와 삶의 변화 그 중심에 있는 알고리즘을 배워 보자! 인공지능이 일자리를 대체하는 시대가 되면서, 코딩 교육과 컴퓨팅 사고의 중요성이 나날이 커지고 있다. 그리고 그... "}], "isbnInBookInfo": [ {"callSign": "I9.17.v1.c1","title": "모두의 알고리즘 with 파이썬","author": "이승찬","publisher": "길벗","pubdate": "2017-05-17T15:00:00.000Z","isbn": "9791160501728","category": "자료구조/알고리즘"}, {"callSign": "I9.17.v1.c2","title": "모두의 알고리즘 with 파이썬","author": "이승찬","publisher": "길벗","pubdate": "2017-05-17T15:00:00.000Z","isbn": "9791160501728","category": "자료구조/알고리즘" }], "sameTitleOrAuthor": [ {"id": 180, "callSign": "I9.17.v1.c1","title": "모두의 알고리즘 with 파이썬", "author": "이승찬", "publisher": "길벗", "isbn": "9791160501728","category": "자료구조/알고리즘"},{"id": 181,"callSign": "I9.17.v1.c2","title": "모두의 알고리즘 with 파이썬","author": "이승찬","publisher": "길벗","isbn": "9791160501728","category": "자료구조/알고리즘"}]}
   *         '200_case4':
   *            description: 네이버 ISBN 검색결과있고, 집현전 DB에 ISBN가 같은게 없고, (같은 저자의 책 or 같은 제목의 책)이 있을 때
   *            content:
   *             application/json:
   *               schema:
   *                 type: JSON
   *                 description: 네이버 ISBN 검색결과가 없고, 집현전 DB에도 없을 때
   *                 example: {"isbnInNaver": [ { "title": "모두의 파이썬 (20일 만에 배우는 프로그래밍 기초)", "link": "http://book.naver.com/bookdb/book_detail.php?bid=10541921",  "image": "https://bookthumb-phinf.pstatic.net/cover/105/419/10541921.jpg?type=m1&udate=20181102", "author": "이승찬", "price": "12000", "discount": "", "publisher": "길벗", "pubdate": "20160509", "isbn": "1186978899 9791186978894", "description": "즐겁게 시작하는 나의 첫 프로그래밍!\n\n프로그래밍을 한 번도 해본 적이 없어도 괜찮다. 파이썬이 무엇인지 몰라도 상관 없다. 《모두의 파이썬》은 어려운 개념과 복잡한 이론 설명은 최대한 줄이고, 초보자가 프로그래밍을 쉽게 배울 수 있도록 짧고 간단한 예제로 내용을 구성했다. \n\n처음부터 모든 것을 다... " }  ], "isbnInBookInfo": [], "sameTitleOrAuthor": [ { "id": 180,"callSign": "I9.17.v1.c1", "title": "모두의 알고리즘 with 파이썬", "author": "이승찬", "publisher": "길벗", "isbn": "9791160501728", "category": "자료구조/알고리즘" }, {"id": 181, "callSign": "I9.17.v1.c2", "title": "모두의 알고리즘 with 파이썬", "author": "이승찬", "publisher": "길벗", "isbn": "9791160501728", "category": "자료구조/알고리즘"}]}
   *
   */
  .get('/create', authValidate(roleSet.librarian), createBookInfo);
