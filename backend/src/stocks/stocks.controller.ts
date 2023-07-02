import { ZodiosRequestHandler } from '@zodios/express';
import { StockApi } from '@jiphyeonjeon/api';
import { P, match } from 'ts-pattern';
import * as stocksService from './stocks.service';
import { StockNotFoundError } from './stocks.repository';
import { EmptyContext } from '../utils/EmptyContext';

type Api = typeof StockApi;
type Search = ZodiosRequestHandler<Api, EmptyContext, 'get', '/search'>
export const stockSearch: Search = async ({ query: { page, limit } }, res, next) => {
  try {
    const result = await stocksService.getAllStocks(page, limit);

    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
};

type Update = ZodiosRequestHandler<Api, EmptyContext, 'patch', '/update'>
export const stockUpdate: Update = async ({ params: { id } }, res, next) => {
  try {
    const stock = await stocksService.updateBook(id);

    match(stock)
      .with(P.instanceOf(StockNotFoundError), () => res.status(401).send())
      .otherwise(() => res.status(200).send());
  } catch (e) {
    next(e);
  }
};
