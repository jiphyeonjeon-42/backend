function leftPad(value: number) {
  if (value >= 10) {
    return `${value}`;
  }
  return `0${value}`;
}

export const formatDate = (date: Date) => {
  const formatted_date = `${date.getFullYear()}-${leftPad(date.getMonth() + 1)}-${leftPad(date.getDate())}`;
  return formatted_date;
};
