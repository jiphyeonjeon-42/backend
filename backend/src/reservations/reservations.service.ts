import { pool } from '../mysql';
import { paginate } from '../paginate';

export const search = async (page: string, limit: string, filter: string[]) => {
  console.log(`page: ${page}`);
  console.log(`limit: ${limit}`);
  console.log(`filter: ${filter}`);
  if (!filter) filter = []; // query에 filter가 없을 시 나타나는 에러 방지
  if (!filter.includes('proceeding') && !filter.includes('finish')) { // 둘다 선택 x
    console.log('둘다 선택 x');
  }
  if (filter.includes('proceeding') && filter.includes('finish')) { // 둘다 선택 x
    console.log('둘다 선택 O');
  } else if (filter.includes('proceeding')) // proceeding
  {
    console.log('proceeding');
  } else if (filter.includes('finish')) // finish
  {
    console.log('finish');
  }
  const data = await pool.query('SELECT * FROM book');
  const item = JSON.parse(JSON.stringify(data[0]));
  console.log(paginate(item, 150, parseInt(page)));
  return paginate(item, 150, parseInt(page));
};
