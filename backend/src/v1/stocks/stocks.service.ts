import jipDataSource from '~/app-data-source';
import { Meta } from '../DTO/common.interface';
import StocksRepository from './stocks.repository';

export const getAllStocks = async (page: number, limit: number) => {
  const stocksRepo = new StocksRepository();
  const [items, totalItems] = await stocksRepo.getAllStocksAndCount(limit, page);
  const meta: Meta = {
    totalItems,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
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
  } catch (error: any) {
    await transaction.rollbackTransaction();
    throw error;
  } finally {
    await transaction.release();
  }
};
