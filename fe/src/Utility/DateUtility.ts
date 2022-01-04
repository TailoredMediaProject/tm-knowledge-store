import moment from 'moment';

export const ISO8601toUTC = (dateString: string): string | null => {
  if (dateString === "" || isNaN(Date.parse(dateString))) {
    return null;
  }
  const date = new Date(dateString);
  const ms = date.getMilliseconds() < 100 ? `0${date.getMilliseconds()}` : date.getMilliseconds();
  return `${date.toUTCString().split(' GMT')[0]}.${ms} GMT`; // Add MS to UTCString. leading zeros are important
};

export const formatDate = (date: Date) => {
  return moment(date).format("hh:mm:ss DD.MM.YYYY");
};
