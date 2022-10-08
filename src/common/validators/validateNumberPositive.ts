export default function validatePositiveNumber(
  value: string
): string | boolean {
  const numValue = +value;

  if (Number.isNaN(numValue)) {
    return 'Must be a numeric value.';
  }

  if (numValue < 0) {
    return 'Must be a positive number.';
  }

  return true;
}
