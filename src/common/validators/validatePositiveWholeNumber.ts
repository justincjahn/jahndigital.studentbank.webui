export default function validatePositiveWholeNumber(
  value: string
): string | boolean {
  const numValue = +value;

  if (Number.isNaN(numValue)) {
    return 'Must be a numeric value.';
  }

  if (numValue < 0) {
    return 'Must be a positive number.';
  }

  if (numValue % 1 !== 0) {
    return 'Must be a whole number.';
  }

  return true;
}
