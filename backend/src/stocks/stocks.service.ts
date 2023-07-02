import { ZodiosResponseByPath } from '@zodios/core';
import { StockApi } from '@jiphyeonjeon/api';
import { Meta } from '../DTO/common.interface';
import StocksRepository, { StockNotFoundError } from './stocks.repository';
import jipDataSource from '../app-data-source';

type Api = typeof StockApi;
type GetAllStocksResponse = ZodiosResponseByPath<Api, 'get', '/search'>;

export const getAllStocks = async (
  page: number,
  limit: number,
): Promise<GetAllStocksResponse> => {
  const stocksRepo = new StocksRepository();
  const [stocks, totalStocks] = await stocksRepo.getAllStocksAndCount(limit, page);
  stocks.map((item) => item.publishedAt);

  const meta: Meta = {
    totalItems: totalStocks,
    itemCount: stocks.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalStocks / limit),
    currentPage: page + 1,
  };
  const items = stocks
    .map(({ categoryId, ...rest }) => ({ categoryId: Number(categoryId), ...rest }));

  return { items, meta };
};

export const updateBook = async (bookId: number) => {
  const transaction = jipDataSource.createQueryRunner();
  const stocksRepo = new StocksRepository(transaction);
  try {
    await transaction.startTransaction();
    const stock = await stocksRepo.getStockById(bookId);
    await stocksRepo.updateBook(bookId);
    await transaction.commitTransaction();
    return stock;
  } catch (error: unknown) {
    await transaction.rollbackTransaction();
    if (error instanceof StockNotFoundError) {
      return error;
    }
    throw (error);
  } finally {
    await transaction.release();
  }
};
