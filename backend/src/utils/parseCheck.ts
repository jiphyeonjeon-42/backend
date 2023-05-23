export const sortParse = (
  sort : any,
) : 'ASC' | 'DESC' => {
  if (sort === 'asc' || sort === 'desc' || sort === 'ASC' || sort === 'DESC') {
    return sort.toUpperCase();
  }
  return 'DESC';
};

export const pageParse = (
  page : number,
) : number => (Number.isNaN(page) ? 0 : page);

export const limitParse = (
  limit : number,
) : number => (Number.isNaN(limit) ? 10 : limit);

export const stringQueryParse = (
  stringQuery : any,
) : string => ((stringQuery === undefined || null) ? '' : stringQuery.trim());

export const booleanQueryParse = (
  booleanQuery : any,
) : boolean => (booleanQuery === 'true');

export const disabledParse = (
  disabled : number,
) : number => (Number.isNaN(disabled) ? -1 : disabled);

export const visibilityParse = (
  visibility : string,
) : string => ((visibility === undefined || null) ? '' : visibility);
