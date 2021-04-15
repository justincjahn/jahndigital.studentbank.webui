import { InjectionKey } from 'vue';
import { InstanceStore } from './stores/instance';
import { ShareTypeStore } from './stores/shareType';

export const INSTANCE_STORE_SYMBOL: InjectionKey<InstanceStore> = Symbol('instance-store');

export const SHARE_TYPE_STORE_SYMBOL: InjectionKey<ShareTypeStore> = Symbol('share-type-store');
