import type { InjectionKey } from 'vue';
import type { SelectApi } from './types';

// eslint-disable-next-line import/prefer-default-export
export const SELECT_API: InjectionKey<SelectApi> = Symbol('select-api');
