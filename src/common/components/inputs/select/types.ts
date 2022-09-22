import { ComputedRef } from 'vue';

export interface OptionRegistration {
  id: number;
  unregister: () => void;
}

export interface SelectApi {
  register: (el: HTMLElement) => OptionRegistration;

  emit: {
    // Trigger a highlight of an option
    highlight: (id: number) => void;

    // Trigger the selection of an option
    select: (value: unknown) => void;
  };

  // The item thats currently selected
  selected: ComputedRef<unknown | null>;

  // The item that's currently highlighted
  highlighted: ComputedRef<number>;
}
