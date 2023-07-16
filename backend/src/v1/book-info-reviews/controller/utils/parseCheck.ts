export const reviewsIdParse = (
  reviewsId : any,
) => {
  let result : number;
  try {
    result = parseInt(reviewsId, 10);
  } catch (error : any) {
    result = NaN;
  }
  return result;
};

export const sortParse = (
  sort : any,
) : 'asc' | 'desc' => {
  if (sort === 'asc' || sort === 'desc') {
    return sort;
  }
  return 'desc';
};
