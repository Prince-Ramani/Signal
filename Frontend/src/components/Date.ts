import { format, formatDate, getYear, isToday, parseISO } from "date-fns";

export const FormateDate = (
  givenDate = "2024-11-29T08:04:18.250Z",
  getyear = false
) => {
  const parsedDate = parseISO(givenDate);
  const now = new Date();

  if (isToday(parsedDate)) {
    const time = format(parsedDate, "hh:mm a");
    return time;
  }

  const currentYear = now.getFullYear();
  const specificYear = getYear(parsedDate);

  if (specificYear === currentYear && !getyear)
    return formatDate(parsedDate, "MMM dd");
  else return formatDate(parsedDate, "MMM dd, yyyy");
};
