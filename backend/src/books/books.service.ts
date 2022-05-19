import { executeQuery } from "../mysql";
import { StringRows } from "../utils/types";
import * as models from "./books.model";

export const createBook = async (book: models.Book): Promise<void> => {
  const result = (await executeQuery(
    `
    SELECT
      isbn
    FROM book_info
    WHERE isbn = ?
  `,
    [book.isbn]
  )) as StringRows[];
  if (result.length === 0) {
    let image = null;
    if (!book.image) {
      image = `https://image.kyobobook.co.kr/images/book/xlarge/${book.isbn.slice(
        -3
      )}/x${book.isbn}.jpg`;
    }
    await executeQuery(
      `
    INSERT INTO book_info(
      title,
      author,
      publisher,
      isbn,
      image,
      categoryId,
      publishedAt
    ) VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      (
        SELECT
          id
        FROM category
        WHERE name = ?
      ),
      ?
    )`,
      [
        book.title,
        book.author,
        book.publisher,
        book.isbn,
        book.image ?? image,
        book.category,
        book.publishedAt,
      ]
    );
  }
  await executeQuery(
    `
    INSERT INTO book(
      donator,
      donatorId,
      callSign,
      status,
      infoId
    ) VALUES (
      ?,
      (
        SELECT id
        FROM user
        WHERE login = ?
      ),
      ?,
      ?,
      (
        SELECT id
        FROM book_info
        WHERE isbn = ?
      )
    )
  `,
    [
      book.donator ?? "null",
      book.donator ?? "0",
      book.callSign,
      book.status,
      book.isbn,
    ]
  );
};

export const deleteBook = async (book: models.Book): Promise<boolean> => {
  const result = (await executeQuery(
    `
    SELECT *
    FROM book
    WHERE callSign = ?
  `,
    [book.callSign]
  )) as models.BookEach[];
  if (result.length === 0) {
    return false;
  }
  await executeQuery(
    `
    DELETE FROM book
    WHERE callSign = ?
  `,
    [book.callSign]
  );
  if (result.length === 1) {
    await executeQuery(
      `
      DELETE FROM book_info
      WHERE id = ?
    `,
      [result[0].infoId]
    );
  }
  return true;
};

export const sortInfo = async (sort: string, limit: number) => {
  let ordering = "";
  console.log("sort : ", sort);
  switch (sort) {
    case "popular":
      ordering = "ORDER BY lendingCnt DESC";
      break;
    default:
      ordering = "ORDER BY book_info.createdAt DESC";
  }

  const bookList = (await executeQuery(
    `
    SELECT
      book_info.id AS id,
      book_info.title AS title,
      book_info.author AS author,
      book_info.publisher AS publisher,
      book_info.isbn AS isbn,
      book_info.image AS image,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      book_info.publishedAt as publishedAt,
      book_info.createdAt as createdAt,
      book_info.updatedAt as updatedAt,
      COUNT(lending.id) as lendingCnt
    FROM book_info, lending
    WHERE book_info.id = lending.bookId
    GROUP BY book_info.id
    ${ordering}
    LIMIT ?;
  `,
    [limit]
  )) as models.BookInfo[];

  return { items: bookList };
};

export const searchInfo = async (
  query: string,
  sort: string,
  page: number,
  limit: number,
  category: string | null
) => {
  let ordering = "";
  switch (sort) {
    case "title":
      ordering = "ORDER BY book_info.title";
      break;
    case "popular":
      ordering = "ORDER BY lendingCnt DESC";
      break;
    default:
      ordering = "ORDER BY book_info.createdAt DESC";
  }
  const categoryResult = (await executeQuery(
    `
    SELECT name
    FROM category
    WHERE name = ?
  `,
    [category]
  )) as StringRows[];
  const categoryName = categoryResult?.[0]?.name;
  const categoryWhere = categoryName
    ? `category.name = '${categoryName}'`
    : "TRUE";
  const categoryList = (await executeQuery(
    `
    SELECT
      category.name AS name,
      count(name) AS count
    FROM book_info
    LEFT JOIN category ON book_info.categoryId = category.id
    WHERE (
      book_info.title LIKE ?
      OR book_info.author LIKE ?
      OR book_info.isbn LIKE ?
      ) AND (
        ${categoryWhere}
      )
    GROUP BY name;
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  )) as models.categoryCount[];
  const categoryHaving = categoryName ? `category = '${categoryName}'` : "TRUE";
  const bookList = (await executeQuery(
    `
    SELECT
      book_info.id AS id,
      book_info.title AS title,
      book_info.author AS author,
      book_info.publisher AS publisher,
      book_info.isbn AS isbn,
      book_info.image AS image,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      book_info.publishedAt as publishedAt,
      book_info.createdAt as createdAt,
      book_info.updatedAt as updatedAt,
      COUNT(lending.id) as lendingCnt
    FROM book_info, lending
    WHERE book_info.id = lending.bookId 
    AND (
      (book_info.title like ?
      OR book_info.author like ?
      OR book_info.isbn like ?)
      )
    GROUP BY book_info.id
    HAVING ${categoryHaving}
    ${ordering}
    LIMIT ?
    OFFSET ?;
  `,
    [`%${query}%`, `%${query}%`, `%${query}%`, limit, page * limit]
  )) as models.BookInfo[];

  const totalItems = categoryList.reduce((prev, curr) => prev + curr.count, 0);
  const meta = {
    totalItems,
    itemCount: bookList.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page + 1,
  };
  return { items: bookList, categories: categoryList, meta };
};

const statusConverter = (status: number, dueDate: string) => {
  if (status === 0) {
    if (dueDate !== "-") return "대출 중";
    return "비치 중";
  }
  if (status === 1) return "분실";
  if (status === 2) return "파손";
  return "알 수 없음";
};

const getDueDate = (lendingData: models.lending[]) => {
  if (lendingData && lendingData.length === 0) return "-";
  const lastLending = lendingData.sort(
    (a, b) =>
      new Date(b.lendingCreatedAt).getTime() -
      new Date(a.lendingCreatedAt).getTime()
  )[0];
  if (lastLending.returningCreatedAt) {
    return "-";
  }
  const tDate = new Date(lastLending.lendingCreatedAt);
  tDate.setDate(tDate.getDate() + 14);
  return tDate.toJSON().substring(2, 10).split("-").join(".");
};

export const getInfo = async (id: number) => {
  const [bookSpec] = (await executeQuery(
    `
    SELECT
      id,
      title,
      author,
      publisher,
      isbn,
      image,
      (
        SELECT name
        FROM category
        WHERE id = book_info.categoryId
      ) AS category,
      book_info.publishedAt as publishedAt
    FROM book_info
    WHERE
      id = ?
  `,
    [id]
  )) as models.BookInfo[];
  if (bookSpec.publishedAt) {
    const date = new Date(bookSpec.publishedAt);
    bookSpec.publishedAt = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  }

  const eachBook = (await executeQuery(
    `
    SELECT
      id,
      callSign,
      status,
      donator
    FROM book
    WHERE
      infoId = ?
  `,
    [id]
  )) as models.BookEach[];

  const donators: string[] = [];
  const books = await Promise.all(
    eachBook.map(async (val) => {
      const lendingData = (await executeQuery(
        `
      SELECT
        lending.createdAt AS lendingCreatdAt,
        returning.createdAt AS returningCreatedAt
      FROM lending
      LEFT JOIN returning ON lending.id = returning.lendingId
      WHERE
        bookId = ?
    `,
        [val.id]
      )) as models.lending[];
      const dueDate = getDueDate(lendingData);
      const status = statusConverter(val.status, dueDate);

      if (val.donator) {
        donators.push(val.donator);
      }
      const { donator, ...rest } = val;
      return { ...rest, dueDate, status };
    })
  );
  if (donators.length === 0) {
    bookSpec.donators = "-";
  } else {
    bookSpec.donators = donators.join(", ");
  }
  bookSpec.books = books;
  return bookSpec;
};
