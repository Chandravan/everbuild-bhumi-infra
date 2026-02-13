// utils/format.js
export const formatTruckNumber = (input) => {
  // Remove everything except letters and numbers
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Match pattern: 2 letters - 2 digits - 2 letters - 4 digits
  const match = cleaned.match(/^([A-Z]{0,2})(\d{0,2})([A-Z]{0,2})(\d{0,4})$/);

  if (!match) return cleaned;

  const [, part1, part2, part3, part4] = match;
  let formatted = part1;
  if (part2) formatted += "-" + part2;
  if (part3) formatted += "-" + part3;
  if (part4) formatted += "-" + part4;
  return formatted;
};
