import type { GlobalStore } from '@/admin/common/stores/global';
import { InjectionKey } from 'vue';

// eslint-disable-next-line import/prefer-default-export
export const GLOBAL_STORE: InjectionKey<GlobalStore> = Symbol('global-store');
