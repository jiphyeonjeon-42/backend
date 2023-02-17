import {
  IsNull, MoreThan, QueryRunner, Repository,
} from 'typeorm';
import jipDataSource from '../app-data-source';
import BookInfo from '../entity/entities/BookInfo';
import User from '../entity/entities/User';
import Lending from '../entity/entities/Lending';
import Book from '../entity/entities/Book';
import reservation from '../entity/entities/Reservation';
import { Meta } from '../users/users.type';

class ReservationsRepository extends Repository<reservation> {
  private readonly bookInfo: Repository<BookInfo>;

  private readonly book: Repository<Book>;

  private readonly user: Repository<User>;

  private readonly lending: Repository<Lending>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(reservation, entityManager);

    this.bookInfo = new Repository<BookInfo>(
      BookInfo,
      entityManager,
    );
    this.user = new Repository<User>(
      User,
      entityManager,
    );
    this.lending = new Repository<Lending>(
      Lending,
      entityManager,
    );
  }

  // 유저가 대출 패널티 중인지 확인
  async isPenaltyUser(userId: number): Promise<boolean> {
    const userItem = this.user.find({
      where: {
        id: userId,
        penaltyEndDate: MoreThan(new Date()),
      },
    });
    if (userItem === undefined) return false;
    return true;
  }

  // 유저가 연체 중인지 확인
  async isOverdueUser(userId: number) {
    const overdueUser = this.user
      .createQueryBuilder('u', this.queryRunner)
      .select('u.id')
      .addSelect('count(u.id)', 'overdueLendingCnt')
      .leftJoin('lending', 'l', 'l.userId = u.id AND l.returnedAt IS NULL AND DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) > 0')
      .where(`id = ${userId}`)
      .groupBy('u.id');
    if (overdueUser === null) return false;
    return true;
  }

  // 유저가 2권 이상 예약 중인지 확인
  async isAllRenderUser(userId: number): Promise<boolean> {
    const allRenderUser = this.user
      .createQueryBuilder('u', this.queryRunner)
      .select('u.id')
      .addSelect('count(r.id)')
      .innerJoin('resetvation', 'r', 'r.userId = u.id AND r.status = 0')
      .where(`u.id = ${userId}`)
      .groupBy('u.id');
    if (allRenderUser === null) return false;
    return true;
  }

  // 유저가 예약 가능한지 확인
  async isRenderableUser(userId: number): Promise<boolean> {
    const renderableUser = this.user
      .createQueryBuilder('u', this.queryRunner)
      .select('u.id')
      .addSelect('u.nickname')
      .from('user', 'u')
      .leftJoin('lending', 'l', 'l.userId = u.id AND l.returnedAt IS NULL AND DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY) > 0')
      .leftJoin('reservation', 'r', 'r.userId = u.id AND r.status = 0')
      .groupBy('u.id')
      .having('count(l.id) = 0 AND count(DISTINCT r.id) < 2')
      .where(`id = ${userId}`);
    if (renderableUser === null) return false;
    return true;
  }

  // bookinfoid 가 전부 대출되어있는지 확인
  async getlenderableBookNum(bookInfoId: number): Promise<number> {
    const lenderableBookItemNum = this.book
      .createQueryBuilder('book', this.queryRunner)
      .select('count(*)', 'count')
      .leftJoin('leading', 'l', 'leading.bookId = book.id and lending.returnedAt IS NULL')
      .leftJoin('reservation', 'r', 'reservation.bookId = lending.bookId AND reservation.status = 0')
      .where(`book.infoID = ${bookInfoId} AND book.status = 0`)
      .getCount();
    return lenderableBookItemNum;
  }

  async alreadyLendedBooks(userId: number, bookInfoId: number) {
    const lendedBooks = this.lending
      .createQueryBuilder('l', this.queryRunner)
      .select('book.id')
      .leftJoin('book', 'b', 'book.id = l.bookId')
      .where('l.returnedAt IS NULL')
      .andWhere('l.userId = :usdrId', { userId })
      .andWhere('book.infoId = :bookInfoId', { bookInfoId });
    return lendedBooks;
  }

  async getReservedBooks(userId: number, bookInfoId: number) {
    const reservedBooks = this
      .createQueryBuilder('r', this.queryRunner)
      .select('r.id', 'id')
      .where('r.bookInfoId = :bookInfoId', { bookInfoId })
      .andWhere('r.userId = :userId', { userId })
      .andWhere('r.status = 0');
    return reservedBooks;
  }

  async createReservation(userId: number, bookInfoId:number) {
    await this.createQueryBuilder()
      .insert()
      .into(reservation)
      .values([{ userId }, { bookInfoId }])
      .execute();
  }

  async searchReservations(query: string, filter: string, page: number, limit: number) {
    const searchAll = this
      .createQueryBuilder('r', this.queryRunner)
      .select('r.*')
      .addSelect('u.nickname', 'login')
      .addSelect('CASE WHEN NOW() > u.penaltyEndDate THEN 0 ELSE DATEDIFF(u.penaltyEndDate, NOW()) END', 'penaltyDays')
      .addSelect('bi.title')
      .addSelect('bi.image')
      .addSelect('b.callSign')
      .addSelect('u.id', 'userId')
      .addSelect('(SELECT COUNT(*) FROM reservation)', 'count')
      .leftJoin('user', 'u', 'r.userId = u.id')
      .leftJoin('book_info', 'bi', 'r.bookInfoId = bi.id)')
      .leftJoin('book', 'b', 'b.id = r.bookId')
      .having(`title LIKE %${query}%`)
      .orHaving(`login LIKE %${query}%`)
      .orHaving(`callSign LIKE %${query}%`)
      .limit(limit)
      .offset(limit * page);
    switch (filter) {
      case 'waiting':
        searchAll.andWhere({ status: 0, bookId: IsNull() });
        break;
      case 'expired':
        searchAll.andWhere({ status: MoreThan(0) });
        break;
      case 'all':
        break;
      default:
        searchAll.andWhere({ status: 0, bookId: IsNull() });
    }
    const [items, totalItems] = await searchAll.getManyAndCount();
    const meta : Meta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page + 1,
    };
    return { items, meta };
  }
}

export default ReservationsRepository;
