import { match } from 'ts-pattern';
import { db } from '~/kysely/mod.ts';
import { Visibility } from '~/kysely/shared.js';
import { SqlBool } from 'kysely';
import { Simplify } from 'kysely';
import { executeWithOffsetPagination } from 'kysely-paginate';
import { metaPaginated } from '~/kysely/paginated';

export const bookInfoExistsById = (id: number) =>
  db.selectFrom('book_info').where('id', '=', id).executeTakeFirst();

export const getReviewById = (id: number) =>
  db
    .selectFrom('reviews')
    .where('id', '=', id)
    .select(['userId', 'isDeleted', 'disabled', 'disabledUserId'])
    .executeTakeFirst();

type SearchOption = {
  search?: string;
  page: number;
  perPage: number;
  visibility: Visibility;
  sort: 'asc' | 'desc';
};

const queryReviews = () =>
  db
    .selectFrom('reviews')
    .leftJoin('user', 'user.id', 'reviews.userId')
    .leftJoin('book_info', 'book_info.id', 'reviews.bookInfoId')
    .select([
      'reviews.id',
      'reviews.userId',
      'reviews.disabled',
      'reviews.bookInfoId',
      'reviews.content',
      'reviews.createdAt',
      'book_info.title',
      'user.nickname',
    ]);

export const searchReviews = async ({
  search,
  sort,
  visibility,
  page,
  perPage,
}: SearchOption) => {
  const searchQuery = queryReviews()
    .$if(search !== undefined, qb =>
      qb.where(eb =>
        eb.or([
          eb('user.nickname', 'like', `%${search}%`),
          eb('book_info.title', 'like', `%${search}%`),
        ]),
      ),
    )
    .orderBy('reviews.createdAt', sort);

  const withVisibility = match(visibility)
    .with('public', () => searchQuery.where('disabled', '=', false))
    .with('hidden', () => searchQuery.where('disabled', '=', true))
    .with('all', () => searchQuery)
    .exhaustive();

  return metaPaginated(withVisibility, { page, perPage });
};

type InsertOption = {
  userId: number;
  bookInfoId: number;
  content: string;
};
export const insertReview = ({ userId, bookInfoId, content }: InsertOption) =>
  db
    .insertInto('reviews')
    .values({
      userId,
      updateUserId: userId,
      bookInfoId,
      content,
      disabled: false,
      isDeleted: false,
      createdAt: new Date(),
    })
    .executeTakeFirst();

type DeleteOption = {
  reviewsId: number;
  deleteUserId: number;
};
export const deleteReviewById = ({ reviewsId, deleteUserId }: DeleteOption) =>
  db
    .updateTable('reviews')
    .where('id', '=', reviewsId)
    .set({ deleteUserId, isDeleted: true })
    .executeTakeFirst();

type ToggleVisibilityOption = {
  reviewsId: number;
  userId: number;
  disabled: SqlBool;
};
export const toggleVisibilityById = ({
  reviewsId,
  userId,
  disabled,
}: ToggleVisibilityOption) =>
  db
    .updateTable('reviews')
    .where('id', '=', reviewsId)
    .set({ disabled: !disabled, disabledUserId: userId })
    .executeTakeFirst();

type UpdateOption = {
  reviewsId: number;
  userId: number;
  content: string;
};

export const updateReviewById = ({
  reviewsId,
  userId,
  content,
}: UpdateOption) =>
  db
    .updateTable('reviews')
    .where('id', '=', reviewsId)
    .set({ content, updateUserId: userId })
    .executeTakeFirst();
