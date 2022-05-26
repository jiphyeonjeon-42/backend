import { NextFunction, Request, RequestHandler, Response } from "express";
import * as status from "http-status";
import ErrorResponse from "../errorResponse";
import * as BooksService from "./books.service";
import * as types from "./books.type";


export const searchBookInfo = async (
  req: Request<{}, {}, {}, types.SearchBookInfoQuery>,
  res: Response,
  next: NextFunction
) => {
  const { query, sort, page, limit, category } = req.query;
  if (!(query && page && limit)) {
    next(
      new ErrorResponse(
        status.BAD_REQUEST,
        "query, page, limit 중 하나 이상이 없습니다."
      )
    );
  } else {
    res
      .status(status.OK)
      .json(
        await BooksService.searchInfo(
          query,
          sort,
          parseInt(page, 10),
          parseInt(limit, 10),
          category
        )
      );
  }
};

export const getInfoId: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = parseInt(req.params.id, 10);
  if (Number.isNaN(bookId)) {
    next(new ErrorResponse(status.BAD_REQUEST, "id가 숫자가 아닙니다."));
  } else {
    res.status(status.OK).json(await BooksService.getInfo(bookId));
  }
};
export const sortInfo = async (
  req: Request<{}, {}, {}, types.SortInfoType>,
  res: Response
) => {
  const { sort, limit } = req.query;
  if (!(sort && limit)) {
    res
      .status(400)
      .send(
        new ErrorResponse(
          status.BAD_REQUEST,
          "sort, limit 중 하나 이상이 없습니다."
        )
      );
  } else {
    res
      .status(status.OK)
      .json(await BooksService.sortInfo(sort, parseInt(limit, 10)));
  }
};

export const booker: RequestHandler = (req: Request, res: Response) => {
  res.send("hello express");
  // search 함수
};

export const search: RequestHandler = (req: Request, res: Response) => {
  res.send("hello express");
};
