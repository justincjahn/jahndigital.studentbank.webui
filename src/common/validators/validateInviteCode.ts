/**
 * Ensure that the provided value is a valid invite code.
 *
 * @param value
 * @returns true or an error message.
 */
export default function validateInviteCode(value: string): string | boolean {
  if (!value) {
    return 'Invite code is required.';
  }

  if (!/^[0-9A-Za-z]+$/.test(value.trim())) {
    return 'Invite codes can only contain letters and numbers.';
  }

  return true;
}
