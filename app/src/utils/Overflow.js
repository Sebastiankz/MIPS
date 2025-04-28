export function checkOverflow(value) {
  const INT32_MIN = -2147483648;
  const INT32_MAX = 2147483647;
  return value < INT32_MIN || value > INT32_MAX;
}
