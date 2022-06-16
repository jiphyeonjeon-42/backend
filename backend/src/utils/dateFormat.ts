export const formatDate = (date: Date) => {
  const formatted_date = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  return formatted_date;
};
