import { ComputedRef } from 'vue';

export interface SelectApi {
  register: (value: unknown) => () => void;
  selected: ComputedRef<unknown>;
  select: (option: unknown) => void;
}
