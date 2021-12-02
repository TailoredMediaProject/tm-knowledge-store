export const ISO8601toUTC = (iso: string): string | null => {
  if (iso === "" || isNaN(Date.parse(iso))) {
    return null;
  }
  const date = new Date(iso);
  return date.toUTCString();
};
