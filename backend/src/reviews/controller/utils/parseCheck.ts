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
) : number => (Number.isNaN(page) ? 0 : page);

export const stringQueryParse = (
  stringQuery : any,
) : string => ((stringQuery === undefined || null) ? '' : stringQuery.trim());

export const disabledParse = (
  disabled : number,
) : number => (Number.isNaN(disabled) ? -1 : disabled);
