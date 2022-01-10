import { Ref } from 'vue';
import Apollo from '@/services/Apollo';
import gqlSearchAccounts from '@/graphql/queries/studentsByAccountNumber.gql';
import { StudentStore } from '@/modules/admin/stores/student';
import { InstanceStore } from '@/modules/admin/stores/instance';
import Money from './money';
import Rate from './rate';

/**
 * Ensure that the provided value is a valid password, and optionally matches the provided field.
 *
 * @param repeat The password ref to compare against.
 * @returns A function that may be used to validate a password and a repeat password.
 */
export function validatePassword(repeat?: Ref<string>): (value: string) => string | boolean {
  return (value: string) => {
    if (!value) {
      return 'Password is required.';
    }

    if (value.trim().length < 8) {
      return 'Password must be at least 8 characters in length.';
    }

    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one digit.';
    }

    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter.';
    }

    // Magic happens here whereby the input of repeat triggers this to run again!
    if (!repeat) return true;
    if (!repeat.value || value !== repeat.value) {
      return 'Passwords do not match.';
    }

    return true;
  };
}

/**
 * Ensure that the provided value is a valid invite code.
 *
 * @param value
 * @returns true or an error message.
 */
export function validateInviteCode(value: string): string | boolean {
  if (!value) {
    return 'Invite code is required.';
  }

  if (!/^[0-9A-Za-z]+$/.test(value.trim())) {
    return 'Invite codes can only contain letters and numbers.';
  }

  return true;
}

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
 * Validate an email address if it's specified, otherwise return true.
 *
 * @param value
 */
export function validateEmailOptional(value: string): string | boolean {
  if (typeof value === 'undefined' || value.length === 0) return true;
  return validateEmail(value);
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
 * Ensure the count is valid.
 */
export function validateCount(value: string): string | boolean {
  if (!value || value.trim().length === 0) {
    return 'Count is required.';
  }

  if (value.indexOf('.') >= 0) {
    return 'Count must be a whole number.';
  }

  if (Number.isNaN(+value)) {
    return 'Count must be a number.';
  }

  return true;
}

/**
 * Ensure the count is valid and greater than zero.
 *
 * @param value
 */
export function validateCountNotNegative(value: string): string | boolean {
  const isValid = validateCount(value);
  if (isValid !== true) return isValid;
  if (+value < 0) return 'Count cannot be negative.';
  return true;
}

/**
 * Ensure the count is valid and not zero.
 *
 * @param value
 */
export function validateCountNonzero(value: string): string | boolean {
  const isValid = validateCount(value);
  if (isValid !== true) return isValid;
  if (+value === 0) return 'Count cannot be zero.';
  return true;
}

/**
 * Ensures that the provided string is a valid monetary value.
 *
 * @param value
 */
export function validateAmount(value: string): string | boolean {
  if (!value || value.length === 0) return 'Specify an amount.';

  try {
    Money.fromString(value);
  } catch {
    return 'Amount must be a number.';
  }

  return true;
}

/**
 * Ensures that the provided string is a valid monetary value that is not negative.
 *
 * @param value
 */
export function validateAmountNotNegative(value: string): string | boolean {
  if (!value || value.length === 0) return 'Specify an amount.';

  try {
    const num = Money.fromString(value);
    if (num.round() < 0) return 'Amount cannot be negative.';
  } catch {
    return 'Amount must be a number.';
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

  try {
    const num = Money.fromString(value);
    if (Money.round(num.getAmount()) === 0) return 'Amount cannot be zero.';
  } catch {
    return 'Amount must be a number.';
  }

  return true;
}

/**
 * Ensures that the rate is valid.
 *
 * @param {string} value
 * @returns true or an error message.
 */
export function validateRate(value: string): string|boolean {
  if (!value || !value.trim()) return 'Rate is required.';

  try {
    Rate.fromString(value);
  } catch (e) {
    return e.message;
  }

  return true;
}

/**
 * Ensures that thge provided string is a valid rate with a non-zero value.
 *
 * @param {string} value
 * @returns true or an error message.
 */
export function validateRateNonzero(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'Specify a rate.';

  try {
    const rate = Rate.fromString(value);
    if (rate.getRate() === 0) return 'Rate cannot be zero.';
  } catch (e) {
    return e.message;
  }

  return true;
}

/**
 * Ensures that the provided string is a valid rate greater than zero.
 *
 * @param {string} value
 * @returns true or an error message.
 */
export function validateRateNotNegative(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'Specify a rate.';

  try {
    const rate = Rate.fromString(value);
    if (rate.getRate() < 0.0) return 'Rate cannot be negative.';
  } catch (e) {
    return e.message;
  }

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

/**
 * Ensures that the provided string is a valid transaction comment.
 *
 * @param {string} value
 * @returns true or an error messsage
 */
export function validateShareTypeName(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'Share Type Name is required.';
  if (value.length < 3) return 'Share Type Name must be at least 3 characters.';
  if (value.length > 64) return 'Share Type Name can only be 64 characters.';
  return true;
}

/**
 * Ensures that the provided string is a valid stock name.
 *
 * @param value
 * @returns true or an error message
 */
export function validateStockName(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'A Name is required';
  if (value.length < 3) return 'Stock names should be at least three characters.';
  if (value.length > 32) return 'Stock names can be a maximum of ten chatacters.';
  return true;
}

/**
 * Ensures that the provided string is a valid stock symbol.
 *
 * @param value
 * @returns true or an error message
 */
export function validateStockSymbol(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'A Symbol is required.';
  if (value.length < 3) return 'Stock symbols should be at least three characters.';
  if (value.length > 10) return 'Stock symbols can be a maximum of ten characters.';
  if (!value.match(/^[a-zA-Z0-9]{3,10}$/)) return 'Stock symbols can only be letters or numbers.';
  return true;
}

/**
 * Ensures that the provided string is a valid stock quantity.
 *
 * @param value
 * @returns true or an error message
 */
export function validateStockSharesNotNegative(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'Total Shares is required';

  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return 'Total Shares must be a number.';
  if (num <= 0) return 'Total Shares must be a number greater than zero.';

  return true;
}

export function validateDate(value: string): string | boolean {
  if (!value || value.trim().length === 0) return 'Date cannot be empty.';
  if (!value.match(/\d{4}-\d{2}-\d{2}/)) return 'Date must be in the format yyyy-mm-dd.';
  return true;
}
