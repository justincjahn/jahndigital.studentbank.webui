import { computed } from 'vue';
import userStore from '@/stores/user';

export default function useShareName(share: () => Share|null) {
  const name = computed(() => {
    const sh = share();
    const accountNumber = (userStore.username.value ?? '').toString().padStart(10, '0');
    const shType = sh?.shareType?.name ?? 'Unknown';
    return `${shType} (${accountNumber}S${sh?.id ?? 0})`;
  });

  return {
    name,
  };
}
