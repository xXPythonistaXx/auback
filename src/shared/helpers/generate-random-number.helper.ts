export function generateRandomNumber(maxNumber = 900000) {
  return String(Math.floor(100000 + Math.random() * maxNumber));
}
