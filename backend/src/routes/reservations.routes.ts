import { Router } from 'express';
import { create, search } from '../reservations/reservations.controller';

export const path = '/reservations';
export const router = Router();

/**
 * @openapi
 *  /api/reservations/search:
 *    get:
 *      summary: 예약 검색
 *      description: 책 예약을 확인합니다.
 *      parameters:
 *          - in: query
 *            name: proceeding
 *            schema:
 *                type: string
 *            description: 클라이언트는 진행중인 예약을 확인할 수 있다.
 *          - in: query
 *            name: finish
 *            schema:
 *                type: string
 *            description: 클라이언트는 마감된 예약을 확인할 수 있다.
 *      responses:
 *        200:
 *          description: 예약 정보를 반환한다.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                   type: object
 *                   properties:
 *                     login:
 *                       description: 예약한 카뎃 아이디
 *                       type: string
 *                     penaltyDays:
 *                       description: 예약 불가 기간
 *                       type: string
 *                       format: date-time
 *                     title:
 *                       description: 예약할 책 이름
 *                       type: string
 *                     image:
 *                       description: 예약할 책 이미지
 *                       type: string
 *                     callSign:
 *                       description: 예약할 책 청구번호
 *                       type: string
 *                     dueDate:
 *                       description: 책 반납일
 *                       type: string
 *                       format: date-time
 *                     endAt:
 *                       description: 예약 종료일
 *                       type: string
 *                       format: date-time
 *                     canceledAt:
 *                       description: 예약 취소일
 *                       type: string
 *                       format: date-time
 *        401:
 *          description: 예약정보가 올바르지 않다.
 */

router.post('/', create).get('/search', search);

//	"items": [
//	  {
//			"login": "doby"
//			  "penaltyDays": 0,
//			  "title": "코딩도장 듀토리얼로 배우는 python",
//			  "image": "http://image.kyobobook.co.kr/images/book/xlarge/885/x9791186659885.jpg"
//			  "callSign": "42.AC42",
//			  "dueDate": "2021.06.23",
//			  "endAt": "2021.06.26",
//			  "canceledAt": null,
//	  },
//	  {
//			"login": "tkim"
//			  "penaltyDays": 0,
//			  "title": "컴퓨터 구조",
//			  "image": "http://image.kyobobook.co.kr/images/book/xlarge/885/x9791186659885.jpg"
//			  "callSign": "42.AC42",
//			  "dueDate": "2021.06.23",
//			  "endAt": "2021.06.26",
//			  "canceledAt": null,
//	  },
//	],
//	"meta": {
//	  "totalItems": 3,
//	  "itemCount": 3,
//	  "itemsPerPage": 10,
//	  "totalPages": 1,
//	  "currentPage": 1
//	}
//  }