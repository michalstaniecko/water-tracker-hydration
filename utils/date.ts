import dayjs from "@/plugins/dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import { logWarning } from "@/utils/errorLogging";

export function getToday(format = DEFAULT_DATE_FORMAT) {
  try {
    return dayjs().format(format);
  } catch (error) {
    logWarning('Error formatting today date, using default', {
      operation: 'getToday',
      data: { format },
    });
    return dayjs().format(DEFAULT_DATE_FORMAT);
  }
}

export function convertDateFormat(
  date: string,
  from: string | string[],
  to: string,
) {
  try {
    if (dayjs(date, to, true).isValid()) {
      return date;
    }
    const converted = dayjs(date, from, true);
    if (!converted.isValid()) {
      logWarning('Invalid date conversion', {
        operation: 'convertDateFormat',
        data: { date, from, to },
      });
      return date;
    }
    return converted.format(to);
  } catch (error) {
    logWarning('Error converting date format', {
      operation: 'convertDateFormat',
      data: { date, from, to },
    });
    return date;
  }
}

export function convertDateToFormat(
  date: string | Date,
  format = DEFAULT_DATE_FORMAT,
) {
  try {
    const converted = dayjs(date);
    if (!converted.isValid()) {
      logWarning('Invalid date in convertDateToFormat', {
        operation: 'convertDateToFormat',
        data: { date, format },
      });
      return dayjs().format(format);
    }
    return converted.format(format);
  } catch (error) {
    logWarning('Error converting date to format', {
      operation: 'convertDateToFormat',
      data: { date, format },
    });
    return dayjs().format(format);
  }
}
