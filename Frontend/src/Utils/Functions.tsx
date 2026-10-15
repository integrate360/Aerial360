export const convertTo12HourFormat = (time24: string) => {
  if (!time24 || typeof time24 !== "string") {
    // Handle the invalid time input here
    return "Invalid time";
  }

  const [hours, minutes] = time24.split(":").map(Number);

  // Determine AM or PM
  const period = hours >= 12 ? "PM" : "AM";

  // Additional logic for 12-hour format conversion
  const adjustedHours = hours % 12 || 12;

  // Ensure minutes are always two digits
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${adjustedHours}:${formattedMinutes} ${period}`;
};

export function getInitials(fullName: string) {
  if (!fullName) return ""; // Handle empty input
  return fullName
    .split(" ") // Split the name into parts
    .map((word) => word[0].toUpperCase()) // Get the first letter of each part and convert to uppercase
    .join(""); // Join the initials
}
export function generatePassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";
  const allChars = uppercase + lowercase + numbers + symbols;

  // Ensure at least one character from each required set
  const randomUppercase =
    uppercase[Math.floor(Math.random() * uppercase.length)];
  const randomLowercase =
    lowercase[Math.floor(Math.random() * lowercase.length)];
  const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest of the password to make it at least 8 characters
  const remainingLength = 8 - 4; // 4 characters already chosen
  let remainingChars = "";
  for (let i = 0; i < remainingLength; i++) {
    remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Combine all characters and shuffle
  const password =
    randomUppercase +
    randomLowercase +
    randomNumber +
    randomSymbol +
    remainingChars;
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
