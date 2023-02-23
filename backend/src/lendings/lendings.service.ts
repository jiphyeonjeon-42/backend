/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
import { IsNull, Like } from 'typeorm';
import { publishMessage } from '../slack/slack.service';
import { Meta } from '../users/users.type';
import { formatDate } from '../utils/dateFormat';
import * as errorCode from '../utils/error/errorCode';
import UsersRepository from '../users/users.repository';
import LendingRepository from './lendings.repository';
import jipDataSource from '../app-data-source';

export const create = async (
  userId: number,
  bookId: number,
  librarianId: number,
  condition: string,
) => {
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const transaction = jipDataSource.createQueryRunner();
  const lendingRepo = new LendingRepository(transaction);
  const usersRepository = new UsersRepository(transaction);
  try {
    await transaction.startTransaction();
    const [users, count] = await usersRepository.searchUserBy({ id: userId }, 0, 0);
    if (!count) { throw new Error(errorCode.NO_USER_ID); }
    if (users[0].role === 0) { throw new Error(errorCode.NO_PERMISSION); }
    // user conditions
    const numberOfLendings = await lendingRepo.searchLendingCount({
      userId,
    }, 0, 0);
    if (numberOfLendings >= 2) { throw new Error(errorCode.LENDING_OVERLOAD); }
    const penaltyEndDate = await lendingRepo.getUsersPenalty(userId);
    const overDueDay = await lendingRepo.getUsersOverDueDay(userId);
    if (penaltyEndDate >= new Date()
      || overDueDay !== undefined) { throw new Error(errorCode.LENDING_OVERDUE); }

    // book conditions
    const countOfBookInLending = await lendingRepo.getLendingCountByBookId(bookId);
    if (countOfBookInLending !== 0) { throw new Error(errorCode.ON_LENDING); }

    // 책이 분실, 파손이 아닌지
    const book = await lendingRepo.searchBookForLending(bookId);
    if (book?.status === 1) {
      throw new Error(errorCode.DAMAGED_BOOK);
    } else if (book?.status === 2) {
      throw new Error(errorCode.LOST_BOOK);
    }

    // 예약된 책이 아닌지
    const reservationOfBook = await lendingRepo.searchReservationByBookId(bookId);
    if (reservationOfBook && reservationOfBook.user.id !== userId) {
      throw new Error(errorCode.ON_RESERVATION);
    }
    // 책 대출 정보 insert
    await lendingRepo.createLending(userId, bookId, librarianId, condition);
    // 예약 대출 시 상태값 reservation status 0 -> 1 변경
    if (reservationOfBook) { await lendingRepo.updateReservationToLended(reservationOfBook.id); }
    await transaction.commitTransaction();
    if (users[0].slack) {
      await publishMessage(users[0].slack, `:jiphyeonjeon: 대출 알림 :jiphyeonjeon: \n대출 하신 \`${book?.info?.title}\`은(는) ${formatDate(dueDate)}까지 반납해주세요.`);
    }
  } catch (e) {
    await transaction.rollbackTransaction();
    if (e instanceof Error) {
      throw e;
    }
  } finally {
    await transaction.release();
  }
  return ({ dueDate: formatDate(dueDate) });
};

export const returnBook = async (
  librarianId: number,
  lendingId: number,
  condition: string,
) => {
  const transaction = jipDataSource.createQueryRunner();
  const lendingRepo = new LendingRepository(transaction);
  try {
    await transaction.startTransaction();
    const lendingInfo = await lendingRepo.findOneBy({ id: lendingId });
    if (!lendingInfo) {
      throw new Error(errorCode.NONEXISTENT_LENDING);
    } else if (lendingInfo.returnedAt) {
      throw new Error(errorCode.ALREADY_RETURNED);
    }
    await lendingRepo.updateLending(librarianId, condition, lendingId);

    // 연체 반납이라면 penaltyEndDate부여
    const today = new Date().setHours(0, 0, 0, 0);
    const createdDate = new Date(lendingInfo.createdAt);
    // eslint-disable-next-line max-len
    const expecetReturnDate = new Date(createdDate.setDate(createdDate.getDate() + 14)).setHours(0, 0, 0, 0);
    if (today > expecetReturnDate) {
      const todayDate = new Date();
      const overDueDays = (today - expecetReturnDate) / 1000 / 60 / 60 / 24;
      let confirmedPenaltyEndDate;
      const penaltyEndDateInDB = await lendingRepo.getUsersPenalty(lendingInfo.userId);
      // eslint-disable-next-line max-len
      const originPenaltyEndDate = new Date(penaltyEndDateInDB);
      if (today < originPenaltyEndDate.setHours(0, 0, 0, 0)) {
        confirmedPenaltyEndDate = new Date(originPenaltyEndDate.setDate(originPenaltyEndDate.getDate() + overDueDays)).toISOString().split('T')[0];
      } else {
        confirmedPenaltyEndDate = new Date(todayDate.setDate(todayDate.getDate() + overDueDays)).toISOString().split('T')[0];
      }
      await lendingRepo.updateUserPenaltyEndDate(confirmedPenaltyEndDate, lendingInfo.userId);
    }
    const lendedBook = await lendingRepo.searchBookForLending(lendingInfo.bookId);
    const reservationInfo = await lendingRepo.searchReservedBook(lendedBook!.infoId);
    if (reservationInfo) {
      const updateResult = await lendingRepo.updateReservationEndDate(
        lendedBook!.id,
        reservationInfo.id,
      );
      const slackIdReservedUser = reservationInfo.user.slack;
      if (updateResult && slackIdReservedUser) {
        // 예약자에게 슬랙메시지 보내기
        const bookTitle = reservationInfo.bookInfo.title;
        if (slackIdReservedUser) { await publishMessage(slackIdReservedUser, `:jiphyeonjeon: 예약 알림 :jiphyeonjeon:\n예약하신 도서 \`${bookTitle}\`(이)가 대출 가능합니다. 3일 내로 집현전에 방문해 대출해주세요.`); }
      }
    }
    await transaction.commitTransaction();
    if (reservationInfo) {
      return ({ reservedBook: true });
    }
    return ({ reservedBook: false });
  } catch (error) {
    await transaction.rollbackTransaction();
    if (error instanceof Error) {
      throw error;
    }
  } finally {
    await transaction.release();
  }
};

export const search = async (
  query: string,
  page: number,
  limit: number,
  sort:string,
  type: string,
) => {
  const lendingRepo = new LendingRepository();
  const filterQuery: Array<object> = [];
  switch (type) {
    case 'user':
      filterQuery.push({ returnedAt: IsNull(), login: Like(`%${query}%`) });
      break;
    case 'title':
      filterQuery.push({ returnedAt: IsNull(), title: Like(`%${query}%`) });
      break;
    case 'callSign':
      filterQuery.push({ returnedAt: IsNull(), callSign: Like(`%${query}%`) });
      break;
    case 'bookId':
      filterQuery.push({ returnedAt: IsNull(), bookId: Like(`%${query}%`) });
      break;
    default:
      filterQuery.push([
        { returnedAt: IsNull(), login: Like(`%${query}%`) },
        { returnedAt: IsNull(), title: Like(`%${query}%`) },
        { returnedAt: IsNull(), callSign: Like(`%${query}%`) },
      ]);
  }
  const orderQuery = sort === 'new' ? { createdAt: 'DESC' } : { createdAt: 'ASC' };
  const [items, count] = await lendingRepo.searchLending(
    filterQuery,
    limit,
    page,
    orderQuery,
  );
  const meta: Meta = {
    totalItems: count,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(count / limit),
    currentPage: page + 1,
  };
  return { items, meta };
};

export const lendingId = async (id:number) => {
  const lendingRepo = new LendingRepository();
  const data = (await lendingRepo.searchLending({ id }, 0, 0, {}))[0];
  return data[0];
};
