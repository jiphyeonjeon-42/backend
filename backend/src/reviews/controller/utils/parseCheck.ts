export const sortParse = (
  sort : any,
) : 'asc' | 'desc' => {
  if (sort === 'asc' || sort === 'desc') {
    return sort;
  }
  return 'desc';
};

export const pageParse = (
  page : number,
) : number => {
  return Number.isNaN(page) ? 0 : page;
};
