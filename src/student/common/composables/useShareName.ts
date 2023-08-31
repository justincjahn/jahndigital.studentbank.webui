import type { Share } from '@/common/services/share';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import useGlobalStore from './useGlobalStore';

export default function useShareName(share: () => Share | null): {
  name: ComputedRef<string>;
} {
  const globalStore = useGlobalStore();

  const name = computed(() => {
    const sh = share();
    const accountNumber = globalStore.user.username.value.padStart(10, '0');
    const type = sh?.shareType.name ?? 'Unknown';
    const shId = sh?.id ?? '0';

    return `${type} (${accountNumber}S${shId})`;
  });

  return {
    name,
  };
}
