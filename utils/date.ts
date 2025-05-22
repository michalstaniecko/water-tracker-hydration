import dayjs from "dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";

export function getToday(format = DEFAULT_DATE_FORMAT) {
  return dayjs().format(format);
}

export function getDisplayToday() {
  return dayjs().format(DEFAULT_DATE_FORMAT);
}
