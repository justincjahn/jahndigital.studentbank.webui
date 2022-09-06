import { InjectionKey } from 'vue';
import { GlobalStore } from './stores/global';

// eslint-disable-next-line import/prefer-default-export
export const GLOBAL_STORE: InjectionKey<GlobalStore> = Symbol('global-store');
