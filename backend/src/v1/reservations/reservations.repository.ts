import { Brackets, IsNull, MoreThan, Not, QueryRunner, Repository } from 'typeorm';

import { BookInfo, User, Lending, Book, Reservation } from '~/entity/entities';
import jipDataSource from '~/app-data-source';
import { Meta } from '../DTO/common.interface';

class ReservationsRepository extends Repository<Reservation> {
  private readonly bookInfo: Repository<BookInfo>;

  private readonly book: Repository<Book>;

  private readonly user: Repository<User>;

  private readonly lending: Repository<Lending>;

  constructor(transactionQueryRunner?: QueryRunner) {
    const queryRunner: QueryRunner | undefined = transactionQueryRunner;
    const entityManager = jipDataSource.createEntityManager(queryRunner);
    super(Reservation, entityManager);

    this.bookInfo = new Repository<BookInfo>(BookInfo, entityManager);
    this.user = new Repository<User>(User, entityManager);
    this.lending = new Repository<Lending>(Lending, entityManager);
  }

  // 유저가 대출 패널티 중인지 확인
  async isPenaltyUser(userId: number): Promise<boolean> {
    const userItem = await this.user.find({
      where: {
        id: userId,
        penaltyEndDate: MoreThan(new Date()),
      },
    });
    if (userItem.length === 0) return false;
    return true;
  }

  // 유저가 연체 중인지 확인
  async isOverdueUser(userId: number): Promise<boolean> {
    return this.user
      .createQueryBuilder('u')
      .select('u.id')
      .addSelect('count(u.id)', 'overdueLendingCnt')
      .innerJoin(
        'lending',
        'l',
        'l.userId = u.id AND l.returnedAt IS NULL AND DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY)) > 0',
      )
      .where('u.id = :userId', { userId })
      .groupBy('u.id')
      .getExists();
  }

  // 유저가 2권 이상 예약 중인지 확인
  async isAllRenderUser(userId: number): Promise<boolean> {
    const [rendUser] = await Promise.all([
      this.user
        .createQueryBuilder('u')
        .select('u.id', 'id')
        .addSelect('COUNT(r.id)', 'count')
        .innerJoin('reservation', 'r', 'r.userId = u.id AND r.status = 0')
        .where(`u.id = ${userId}`)
        .groupBy('u.id')
        .getRawOne(),
    ]);
    if (rendUser?.count >= 2) {
      return true;
    }
    return false;
  }

  // 유저가 예약 가능한지 확인
  async isRenderableUser(userId: number): Promise<boolean> {
    const renderableUser = this.user
      .createQueryBuilder('u')
      .select('u.id')
      .addSelect('u.nickname')
      .leftJoin(
        'lending',
        'l',
        'l.userId = u.id AND l.returnedAt IS NULL AND DATEDIFF(now(), DATE_ADD(l.createdAt, INTERVAL 14 DAY) > 0',
      )
      .leftJoin('reservation', 'r', 'r.userId = u.id AND r.status = 0')
      .groupBy('u.id')
      .having('count(l.id) = 0 AND count(DISTINCT r.id) < 2')
      .where(`id = ${userId}`);
    if (renderableUser === null) return false;
    return true;
  }

  // bookinfoid 가 전부 대출되어있는지 확인
  async getlenderableBookNum(bookInfoId: number): Promise<number> {
    const lenderableBookItemNum = this.bookInfo
      .createQueryBuilder('bi')
      .select('bi.id')
      .addSelect('count(b.id)', 'count')
      .leftJoin('book', 'b', 'b.infoId = bi.id')
      .leftJoin('lending', 'l', 'l.bookId = b.id and l.returnedAt IS NULL')
      .leftJoin('reservation', 'r', 'r.bookId = l.bookId AND r.status = 0')
      .where(`bi.id = ${bookInfoId}`)
      .andWhere('b.status = 0')
      .getCount();
    return lenderableBookItemNum;
  }

  // Todo: return 값 수정할 것
  async alreadyLendedBooks(userId: number, bookInfoId: number) {
    const lendedBooks = this.lending
      .createQueryBuilder('l')
      .select('b.id')
      .leftJoin('book', 'b', 'b.id = l.bookId')
      .where('l.returnedAt IS NULL')
      .andWhere('l.userId = :userId', { userId })
      .andWhere('b.infoId = :bookInfoId', { bookInfoId });
    return lendedBooks;
  }

  // Todo: return 값 수정할 것
  async getReservedBooks(userId: number, bookInfoId: number) {
    const reservedBooks = this.createQueryBuilder('r')
      .select('r.id', 'id')
      .where('r.bookInfoId = :bookInfoId', { bookInfoId })
      .andWhere('r.userId = :userId', { userId })
      .andWhere('r.status = 0');
    return reservedBooks;
  }

  async createReservation(userId: number, bookInfoId: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(Reservation)
      .values([{ userId, bookInfoId }])
      .execute();
  }

  async searchReservations(
    query: string,
    filter: string,
    page: number,
    limit: number,
  ): Promise<{ meta: Meta; items: Reservation[] }> {
    const searchAll = this.createQueryBuilder('r')
      .select('r.id', 'reservationsId')
      .addSelect('r.endAt', 'endAt')
      .addSelect('r.createdAt', 'createdAt')
      .addSelect('r.status', 'status')
      .addSelect('r.userId', 'userId')
      .addSelect('r.bookId', 'bookId')
      .addSelect('u.nickname', 'login')
      .addSelect(
        'CASE WHEN NOW() > u.penaltyEndDate THEN 0 ELSE DATEDIFF(u.penaltyEndDate, NOW()) END',
        'penaltyDays',
      )
      .addSelect('bi.title', 'title')
      .addSelect('bi.image', 'image')
      .addSelect('(SELECT COUNT(*) FROM reservation)', 'count')
      .addSelect('b.callSign', 'callSign')
      .leftJoin('user', 'u', 'r.userId = u.id')
      .leftJoin('book_info', 'bi', 'r.bookInfoId = bi.id')
      .leftJoin('book', 'b', 'r.bookId = b.id')
      .where(
        new Brackets((qb) => {
          qb.where('bi.title like :query', { query: `%${query}%` })
            .orWhere('u.nickname like :query', { query: `%${query}%` })
            .orWhere('b.callSign like :query', { query: `%${query}%` });
        }),
      );
    switch (filter) {
      case 'waiting':
        searchAll.andWhere({ status: 0, bookId: IsNull() });
        break;
      case 'expired':
        searchAll.andWhere({ status: MoreThan(0) });
        break;
      case 'all':
        break;
      case 'pending':
        searchAll.andWhere({ status: 0, bookId: Not(IsNull()) });
        break;
      default:
        searchAll.andWhere({ status: 0, bookId: IsNull() });
    }
    const items = await searchAll
      .offset(limit * page)
      .limit(limit)
      .getRawMany<Reservation>();
    const totalItems = await searchAll.getCount();
    const meta: Meta = {
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
