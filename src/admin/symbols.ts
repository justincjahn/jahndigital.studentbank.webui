import type { GlobalStore } from "@/admin/common/stores/global";
import { InjectionKey } from "vue";

export const GLOBAL_STORE: InjectionKey<GlobalStore> = Symbol('global-store');
