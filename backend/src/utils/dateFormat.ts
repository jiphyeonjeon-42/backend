export const formatDate = (date: Date) => {
  const formatted_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return formatted_date;
};
