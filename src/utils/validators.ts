import Apollo from '@/services/Apollo';
import gqlSearchAccounts from '@/graphql/studentsByAccountNumber.gql';
import { StudentStore } from '@/store/student';
import { InstanceStore } from '@/store/instance';
import Money from './money';

/**
 * Ensure the account number is less than 10 digits, and only digits.
 */
export function validateAccount(value: string): string|boolean {
  if (!value) {
    return 'Account number is required.';
  }

  if (value.length > 10) {
    return 'Account numbers cannot be more than 10 characters.';
  }

  if (!/^[0-9]+$/.test(value)) {
    return 'Account numbers can only contain numbers.';
  }

  return true;
}

/**
 * Ensure the account is unique across the instance.  Returns a validator function.
 *
 * @param ops.studentStore? Used to find the selected student's instance for duplicate detection.
 * @param ops.instanceStore? Used to find the selected instance for duplicate detection.
 */
export function validateAccountUnique(ops: {studentStore?: StudentStore; instanceStore?: InstanceStore}) {
  return async (value: string): Promise<string|boolean> => {
    const isValid = validateAccount(value);
    if (isValid !== true) return isValid;

    try {
      const res = await Apollo.query<PagedStudentResponse>({
        query: gqlSearchAccounts,
        variables: {
          accountNumber: value.padStart(10, '0'),
        },
      });

      if (!res.data || res.data.students.totalCount <= 0) return true;

      let i = 0;
      res.data.students.nodes.forEach((x) => {
        if (ops.studentStore) {
          // Skip accounts not in the student's instance
          if (x.group?.instanceId !== ops.studentStore.selected.value?.group?.instanceId ?? false) {
            return;
          }

          if (x.id !== ops.studentStore.selected.value?.id ?? true) i += 1;
        } else if (ops.instanceStore) {
          if (x.group?.instanceId !== ops.instanceStore.selected?.value?.id ?? false) {
            return;
          }

          i += 1;
        } else {
          i += 1;
        }
      });

      if (i > 0) return 'A student with the same account number already exists.';
    } catch {
      return 'Unable to contact server please try again later.';
    }

    return true;
  };
}

/**
 * Ensure the email address is valid.
 */
export function validateEmail(value: string): string|boolean {
  if (!value) {
    return 'Email is required.';
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.]+\.[a-zA-Z-]+$/.test(value)) {
    return ' Email is invalid.';
  }

  return true;
}

/**
 * Ensure the names are valid.
 */
export function validateName(value: string): string|boolean {
  if (!value) {
    return 'First and last name are required.';
  }

  return true;
}

/**
 * Ensures that the provided string is a valid monetary amount that's non-zero.
 *
 * @param value
 */
export function validateAmountNonzero(value: string): string | boolean {
  if (!value || value.length === 0) return 'Specify an amount.';

  const num = +value;
  if (Number.isNaN(num)) return 'Amount must be a number.';
  if (Money.round(num) === 0) return 'Amount cannot be zero.';

  return true;
}

/**
 * Ensures that the provided string is a valid transaction comment.
 *
 * @param value
 * @returns true or an error message.
 */
export function validateTransactionComment(value: string): string | boolean {
  if (value && value.length > 255) return 'Comment can only be 255 characters.';
  return true;
}
