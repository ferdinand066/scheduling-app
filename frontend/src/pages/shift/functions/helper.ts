import { getAmpm, months } from "../../../commons/date";

export const formatPublishedDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = getAmpm(hours);
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `Week published on ${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

export const formatWeekDisplay = (startOfWeek: Date, endOfWeek: Date): string => {
  const startMonth = months[startOfWeek.getMonth()];
  const endMonth = months[endOfWeek.getMonth()];
  const startDay = startOfWeek.getDate();
  const endDay = endOfWeek.getDate();

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getEndOfWeek = (startOfWeek: Date): Date => {
  const d = new Date(startOfWeek);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}