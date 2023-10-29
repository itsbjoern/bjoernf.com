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

export const formatDate = (timestamp: Date) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let dayAddon = "th";
  if (day === 1) {
    dayAddon = "st";
  } else if (day === 2) {
    dayAddon = "nd";
  } else if (day === 3) {
    dayAddon = "rd";
  }

  return `${months[month]} ${day}${dayAddon}, ${year}`;
};
