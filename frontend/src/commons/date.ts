export const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
] as const;

export const ampm = {
    AM: "AM",
    PM: "PM",
} as const;

export const getMonth = (month: number) => {
    return months[month];
}

export const getAmpm = (hour: number) => {
    return hour >= 12 ? ampm.PM : ampm.AM;
}

export const getHour = (hour: number) => {
    return hour % 12;
}