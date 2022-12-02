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

export const titleParse = (
  title : any,
) : string => (title === undefined || null) ? '' : title.trim();

export const intraIdParse = (
  intraId : any,
) : string => ((intraId === undefined || null) ? '' : intraId.trim());

export const disabledParse = (
  disabled : boolean,
) : boolean => ((disabled == null) ? false : disabled);
