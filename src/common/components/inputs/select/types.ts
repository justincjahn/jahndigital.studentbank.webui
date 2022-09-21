import { ComputedRef } from 'vue';

export interface SelectApi {
  register: (value: unknown, el: HTMLElement) => () => void;
  highlight: (option: unknown) => void;
  select: (option: unknown) => void;
  selected: ComputedRef<unknown>;
  highlighted: ComputedRef<unknown | null>;
}
