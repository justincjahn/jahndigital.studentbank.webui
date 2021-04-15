import { InjectionKey } from 'vue';
import { StudentStore } from '../stores/student';

// eslint-disable-next-line import/prefer-default-export
export const STUDENT_STORE_SYMBOL: InjectionKey<StudentStore> = Symbol('student-store');
