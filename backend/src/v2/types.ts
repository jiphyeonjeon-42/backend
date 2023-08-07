import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Book {
  id: Generated<number>;
  donator: Generated<string | null>;
  callSign: string;
  status: number;
  createdAt: Generated<Date>;
  infoId: number;
  updatedAt: Generated<Date>;
  donatorId: Generated<number | null>;
}

export interface BookInfo {
  id: Generated<number>;
  title: string;
  author: string;
  publisher: string;
  isbn: Generated<string | null>;
  image: Generated<string | null>;
  publishedAt: Generated<Date | null>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  categoryId: number;
}

export interface Category {
  id: Generated<number>;
  name: string;
}

export interface Lending {
  id: Generated<number>;
  lendingLibrarianId: number;
  lendingCondition: string;
  returningLibrarianId: Generated<number | null>;
  returningCondition: Generated<string | null>;
  returnedAt: Generated<Date | null>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  bookId: number;
  userId: number;
}

export interface Likes {
  id: Generated<number>;
  userId: number;
  bookInfoId: number;
  isDeleted: Generated<number>;
}

export interface Reservation {
  id: Generated<number>;
  endAt: Generated<Date | null>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  status: Generated<number>;
  bookInfoId: number;
  bookId: Generated<number | null>;
  userId: number;
}

export interface Reviews {
  id: Generated<number>;
  userId: number;
  bookInfoId: number;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  updateUserId: number;
  isDeleted: Generated<number>;
  deleteUserId: Generated<number | null>;
  content: string;
  disabled: Generated<number>;
  disabledUserId: Generated<number | null>;
}

export interface SubTag {
  id: Generated<number>;
  userId: number;
  superTagId: number;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  isDeleted: Generated<number>;
  updateUserId: number;
  content: string;
  isPublic: Generated<number>;
}

export interface SuperTag {
  id: Generated<number>;
  userId: number;
  bookInfoId: number;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  isDeleted: Generated<number>;
  updateUserId: number;
  content: string;
}

export interface TypeormMetadata {
  type: string;
  database: Generated<string | null>;
  schema: Generated<string | null>;
  table: Generated<string | null>;
  name: Generated<string | null>;
  value: Generated<string | null>;
}

export interface User {
  id: Generated<number>;
  email: string;
  password: string;
  nickname: Generated<string | null>;
  intraId: Generated<number | null>;
  slack: Generated<string | null>;
  penaltyEndDate: Generated<Date>;
  role: Generated<number>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface UserReservation {
  reservationId: Generated<number>;
  endAt: Generated<Date | null>;
  reservationDate: Generated<Date>;
  reservedBookInfoId: number;
  userId: number;
  title: string | null;
  author: string | null;
  image: Generated<string | null>;
  ranking: Generated<number | null>;
}

export interface VHistories {
  id: Generated<number>;
  returningCondition: Generated<string | null>;
  login: Generated<string | null>;
  callSign: string;
  bookInfoId: Generated<number | null>;
  title: string | null;
  image: Generated<string | null>;
  lendingCondition: string;
  updatedAt: Generated<Date>;
  penaltyDays: Generated<number | null>;
  createdAt: Generated<string | null>;
  returnedAt: Generated<string | null>;
  dueDate: Generated<string | null>;
  lendingLibrarianNickName: Generated<string | null>;
  returningLibrarianNickname: Generated<string | null>;
}

export interface VLending {
  id: Generated<number>;
  lendingCondition: string;
  login: Generated<string | null>;
  bookId: Generated<number | null>;
  callSign: string | null;
  title: string | null;
  image: Generated<string | null>;
  penaltyDays: Generated<number | null>;
  createdAt: Generated<string | null>;
  returnedAt: Generated<string | null>;
  dueDate: Generated<string | null>;
}

export interface VLendingForSearchUser {
  lendingCondition: string;
  lendDate: Generated<Date>;
  userId: Generated<number>;
  bookInfoId: Generated<number | null>;
  title: string | null;
  author: string | null;
  image: Generated<string | null>;
  duedate: Generated<Date | null>;
  overDueDay: Generated<number | null>;
  reservedNum: Generated<number | null>;
}

export interface VSearchBook {
  bookId: Generated<number>;
  donator: Generated<string | null>;
  callSign: string;
  status: number;
  bookInfoId: number;
  title: string | null;
  author: string | null;
  publisher: string | null;
  isbn: Generated<string | null>;
  image: Generated<string | null>;
  categoryId: number | null;
  category: string | null;
  publishedAt: Generated<string | null>;
  isLendable: Generated<number | null>;
}

export interface VSearchBookByTag {
  id: Generated<number>;
  title: string;
  author: string;
  isbn: Generated<string | null>;
  image: Generated<string | null>;
  publishedAt: Generated<Date | null>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  category: string;
  superTagContent: string;
  subTagContent: string | null;
  lendingCnt: Generated<number | null>;
}

export interface VStock {
  bookId: Generated<number>;
  donator: Generated<string | null>;
  callSign: string;
  status: number;
  bookInfoId: number;
  title: string | null;
  author: string | null;
  publisher: string | null;
  isbn: Generated<string | null>;
  image: Generated<string | null>;
  categoryId: number | null;
  category: string | null;
  publishedAt: Generated<string | null>;
  updatedAt: Generated<string | null>;
}

export interface VTagsSubDefault {
  bookInfoId: number;
  title: string;
  id: Generated<number>;
  createdAt: Generated<string | null>;
  login: Generated<string | null>;
  content: string;
  superTagId: Generated<number>;
  superContent: string;
  isPublic: Generated<number>;
  isDeleted: Generated<number>;
  visibility: Generated<string>;
}

export interface VTagsSuperDefault {
  content: Generated<string>;
  count: Generated<number | null>;
  type: Generated<string>;
  createdAt: Generated<string | null>;
}

export interface VUserLending {
  lendingCondition: string;
  userId: number;
  bookInfoId: Generated<number | null>;
  title: string | null;
  image: Generated<string | null>;
  lendDate: Generated<string | null>;
  duedate: Generated<string | null>;
  overDueDay: Generated<number | null>;
}

export interface DB {
  book: Book;
  book_info: BookInfo;
  category: Category;
  lending: Lending;
  likes: Likes;
  reservation: Reservation;
  reviews: Reviews;
  sub_tag: SubTag;
  super_tag: SuperTag;
  typeorm_metadata: TypeormMetadata;
  user: User;
  user_reservation: UserReservation;
  v_histories: VHistories;
  v_lending: VLending;
  v_lending_for_search_user: VLendingForSearchUser;
  v_search_book: VSearchBook;
  v_search_book_by_tag: VSearchBookByTag;
  v_stock: VStock;
  v_tags_sub_default: VTagsSubDefault;
  v_tags_super_default: VTagsSuperDefault;
  v_user_lending: VUserLending;
}
