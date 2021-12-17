import moment from "moment";

export const ISO8601toUTC = (iso: string): string | null => {
  if (iso === "" || isNaN(Date.parse(iso))) {
    return null;
  }
  const date = new Date(iso);
  return date.toUTCString();
};

export const formatDate = (date: Date) => {
  return moment(date).format("hh:mm:ss DD.MM.YYYY");
};
