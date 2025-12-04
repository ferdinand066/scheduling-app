export const getCurrentHourStart = (): string => {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0") + ":00";
};

export const getNextHourStart = (): string => {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return String(nextHour).padStart(2, "0") + ":00";
};