import type { Ref } from 'vue';
import { ref } from 'vue';

export default function validateStringLength(length: Ref<number> | number) {
  return (value: string): string | boolean => {
    const refLength = ref(length);

    if (value.trim().length < refLength.value) {
      return `Must be a minimum of ${refLength.value} characters.`;
    }

    return true;
  };
}
