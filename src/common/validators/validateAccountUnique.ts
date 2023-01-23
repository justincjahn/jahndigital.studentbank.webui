import { Ref, unref } from 'vue';
import { getStudentsByAccountNumber } from '@/common/services/student';
import validateAccount from './validateAccount';

/**
 * Ensure the account is unique across a given instance.
 *
 * @param instanceId The instance to use when searching for account numbers.
 * @param studentId The current student's ID
 */
export default function validateAccountUnique(
  instanceId: Ref<number>,
  studentId?: Ref<number>
) {
  return async (value: string): Promise<string | boolean> => {
    const isValid = validateAccount(value);
    if (isValid !== true) return isValid;

    try {
      const res = await getStudentsByAccountNumber({
        accountNumber: value.padStart(10, '0'),
      });

      if (
        !res.students ||
        !res.students.nodes ||
        res.students.totalCount <= 0
      ) {
        return true;
      }

      let i = 0;
      res.students.nodes.forEach((x) => {
        if (x.group.instanceId !== unref(instanceId)) {
          return;
        }

        if (typeof studentId !== 'undefined') {
          if (x.id !== unref(studentId)) {
            i += 1;
          }
        } else {
          i += 1;
        }
      });

      if (i > 0) {
        return 'A student with the same account number already exists.';
      }
    } catch {
      return 'Unable to contact server, please try again later.';
    }

    return true;
  };
}
