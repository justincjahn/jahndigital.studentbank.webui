/**
 * Ensures that the provided string is a valid transaction comment.
 *
 * @param value
 * @returns true or an error message.
 */
export default function validateTransactionComment(
  value: string
): string | boolean {
  if (value && value.length > 255) return 'Comment can only be 255 characters.';
  return true;
}
