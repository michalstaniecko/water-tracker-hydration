import dayjs from "@/plugins/dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";

export function getToday(format = DEFAULT_DATE_FORMAT) {
  return dayjs().format(format);
}

export function convertDateFormat(
  date: string,
  from: string | string[],
  to: string,
) {
  if (dayjs(date, to, true).isValid()) {
    return date;
  }
  return dayjs(date, from).format(to);
}
