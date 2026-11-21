const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ordinals: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };

export const formatDate = (timestamp: Date) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // 11th, 12th, 13th are exceptions; otherwise the last digit decides (1st, 22nd, 23rd, 31st)
  let dayAddon = "th";
  if (day % 100 < 11 || day % 100 > 13) {
    dayAddon = ordinals[day % 10] ?? "th";
  }

  return `${months[month]} ${day}${dayAddon}, ${year}`;
};
