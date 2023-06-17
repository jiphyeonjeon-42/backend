// import ErrorResponse from "../utils/error/errorResponse";
// import * as errorCode from "../utils/error/errorCode";
// import * as status from "http-status";
//
// const id = String(req.query.id) !== 'undefined' ? parseInt(String(req.query.id), 10) : 0;
// const nicknameOrEmail = String(req.query.nicknameOrEmail) !== 'undefined' ? String(req.query.nicknameOrEmail) : '';
// const page = parseInt(String(req.query.page), 10) ? parseInt(String(req.query.page), 10) : 0;
// const limit = parseInt(String(req.query.limit), 10) ? parseInt(String(req.query.limit), 10) : 5;
// let items;
//
// if (limit <= 0 || page < 0) {
//   return next(new ErrorResponse(errorCode.INVALID_INPUT, status.BAD_REQUEST));
// }
import { z } from 'zod';

export const UserSearchRequestQuerySchema = z.object({
  id: z.coerce.number().optional(),
  nicknameOrEmail: z.string().optional(),
  page: z.coerce.number().min(0).optional().default(0),
  limit: z.coerce.number().min(1).optional().default(5),
});

export const UserCreateRequestQuerySchema = z.object( {

});