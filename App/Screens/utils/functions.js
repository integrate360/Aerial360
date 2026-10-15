export const convertTo12HourFormat = time24 => {
  if (!time24 || typeof time24 !== 'string') {
    // Handle the invalid time input here
    return 'Invalid time';
  }

  const [hours, minutes] = time24.split(':').map(Number);

  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Additional logic for 12-hour format conversion
  const adjustedHours = hours % 12 || 12;

  // Ensure minutes are always two digits
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${adjustedHours}:${formattedMinutes} ${period}`;
};
