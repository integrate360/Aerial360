export const formatNumber = (
  price,
  format = "en-IN",
  options = { style: "currency", currency: "USD" },
) => {
  return new Intl.NumberFormat(format, {
    style: options?.style,
    currency: options?.currency,
  }).format(price);
};

export const convertTo12HourFormat = (time24) => {
  if (!time24 || typeof time24 !== "string") {
    return "Invalid time";
  }

  const [hours, minutes] = time24.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";

  const adjustedHours = hours % 12 || 12;

  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${adjustedHours}:${formattedMinutes} ${period}`;
};
