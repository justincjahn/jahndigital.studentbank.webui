import { InjectionKey } from 'vue';
import { GroupStore } from './stores/group';

// eslint-disable-next-line import/prefer-default-export
export const GROUP_STORE_SYMBOL: InjectionKey<GroupStore> = Symbol('group-store');
