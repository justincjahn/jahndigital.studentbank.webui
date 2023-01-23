/* eslint-disable no-param-reassign */

import useValidation from '@/common/composables/useValidation';
import { Student } from '@/common/services/student';
import validateAccountUnique from '@/common/validators/validateAccountUnique';
import validateEmailOptional from '@/common/validators/validateEmailOptional';
import validateStringLength from '@/common/validators/validateStringLength';
import { computed, ComputedRef, isReactive, reactive, Ref, toRefs } from 'vue';

export interface StudentDTO {
  id: number;
  groupId: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StudentErrorsDTO {
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UseStudentForm {
  data: StudentDTO;
  errors: StudentErrorsDTO;
  isValid: ComputedRef<boolean>;
  loading: Ref<boolean>;
  reset: (student?: Student | StudentDTO) => void;
}

export function buildFormData(): StudentDTO {
  return reactive<StudentDTO>({
    id: -1,
    groupId: -1,
    accountNumber: '',
    firstName: '',
    lastName: '',
    email: '',
  });
}

export function buildErrorData() {
  return reactive<StudentErrorsDTO>({
    accountNumber: '',
    firstName: '',
    lastName: '',
    email: '',
  });
}

export function resetFormData(
  formData: StudentDTO,
  student?: Student | StudentDTO
) {
  formData.id = student?.id ?? -1;
  formData.groupId = student?.groupId ?? -1;
  formData.accountNumber = student?.accountNumber ?? '';
  formData.firstName = student?.firstName ?? '';
  formData.lastName = student?.lastName ?? '';
  formData.email = student?.email ?? '';
}

export default function useStudentForm(
  instanceId: Ref<number>,
  d?: StudentDTO,
  e?: StudentErrorsDTO
): UseStudentForm {
  if (d && !isReactive(d)) {
    throw new Error('[useStudentForm] Data must be reactive.');
  }

  if (e && !isReactive(e)) {
    throw new Error('[useStudentForm] Errors must be reactive.');
  }

  const data = d ?? buildFormData();

  const dataRefs = toRefs(data);

  const errors = e ?? buildErrorData();

  const errorRefs = toRefs(errors);

  const { loading } = useValidation(
    validateAccountUnique(instanceId, dataRefs.id),

    {
      value: dataRefs.accountNumber,
      error: errorRefs.accountNumber,
      immediate: true,
      debounceTime: 250,
    }
  );

  useValidation(validateStringLength(3), {
    value: dataRefs.firstName,
    error: errorRefs.firstName,
    immediate: true,
  });

  useValidation(validateStringLength(3), {
    value: dataRefs.lastName,
    error: errorRefs.lastName,
    immediate: true,
  });

  useValidation(validateEmailOptional, {
    value: dataRefs.email,
    error: errorRefs.email,
    immediate: true,
  });

  const isValid = computed(
    () => !Object.values(errors).some((x) => x.length > 0)
  );

  function reset(student?: Student | StudentDTO) {
    resetFormData(data, student);
  }

  return {
    data,
    errors,
    loading,
    isValid,
    reset,
  };
}
