import injectStrict from '@/common/utils/injectStrict';
import { GLOBAL_STORE } from '@/student/symbols';

export default function useGlobalStore() {
  return injectStrict(GLOBAL_STORE);
}
