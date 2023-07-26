<script lang="ts" setup>
import { defineAsyncComponent, ref, computed, watchEffect } from 'vue';

// Types
import type { GlobalStore } from '@/admin/common/stores/global';
import type { ShareTypeTemplate } from '@/admin/common/types/ShareTypeTemplate';

// Utils
import generatePassword from '@/common/utils/generatePassword';
import Money from '@/common/utils/Money';

// Services
import { newTransaction } from '@/common/services/transaction';
import { newShare } from '@/common/services/share';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

import {
  StudentAddEditForm,
  buildFormData,
  resetFormData,
} from '@/admin/common/components/StudentAddEditForm';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const ShareTypeTemplateBuilder = defineAsyncComponent(
  () => import('@/admin/common/components/ShareTypeTemplateBuilder.vue')
);

const props = defineProps<{
  show: boolean;
  store: GlobalStore;
}>();

const emit = defineEmits<{
  (event: 'cancel'): void;
  (event: 'submit'): void;
}>();

const formData = buildFormData();
const formLoading = ref(false);
const formValid = ref(false);
const shareTypeData = ref<ShareTypeTemplate[]>([]);
const serverLoading = ref(false);

const isLoading = computed(() => formLoading.value || serverLoading.value);

const instanceId = computed(
  () => props.store.instance.selected.value?.id ?? -1
);

async function handleOk() {
  if (!props.store.group.selected.value) {
    props.store.error.setCurrentError('No group is currently selected.');
    return;
  }

  serverLoading.value = true;
  try {
    const res = await props.store.student.create({
      groupId: props.store.group.selected.value.id,
      accountNumber: formData.accountNumber.padStart(10, '0'),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email.length > 0 ? formData.email : undefined,
      password: generatePassword(),
    });

    const sharePromises: ReturnType<typeof newShare>[] = [];
    for (let i = 0; i < shareTypeData.value.length; i += 1) {
      const tpl = shareTypeData.value[i];

      // eslint-disable-next-line no-continue
      if (tpl.shareType === null) continue;

      sharePromises.push(
        newShare({
          shareTypeId: tpl.shareType.id,
          studentId: res.id,
        })
      );
    }

    const shares = await Promise.all(sharePromises);

    const transactions: ReturnType<typeof newTransaction>[] = [];
    for (let i = 0; i < shares.length; i += 1) {
      const tpl = shareTypeData.value[i];
      const share = shares[i];

      if (!tpl.initialDeposit) {
        tpl.initialDeposit = Money.fromNumber(0);
      }

      // eslint-disable-next-line no-continue
      if (!share.newShare || !share.newShare[0]) continue;

      transactions.push(
        newTransaction({
          shareId: share.newShare[0].id,
          amount: tpl.initialDeposit.getAmount(),
          comment: 'Initial Deposit',
        })
      );
    }

    await Promise.all(transactions);
  } catch (e) {
    if (!(e instanceof Error)) return;
    props.store.error.setCurrentError(e?.message ?? e);
  } finally {
    serverLoading.value = false;
  }

  emit('submit');
}

watchEffect(() => {
  if (props.show) {
    resetFormData(formData);
    shareTypeData.value = [
      {
        shareType: null,
        initialDeposit: Money.fromNumber(0),
        error: '',
      },
    ];
  }
});
</script>

<template>
  <modal-dialog
    title="New Student"
    class="large"
    :show="props.show"
    :can-submit="formValid"
    cancel-label="Cancel"
    @cancel="$emit('cancel')"
    @submit="handleOk"
  >
    <template #submitLabel="{ label }">
      <loading-label :show="isLoading">{{ label }}</loading-label>
    </template>

    <student-add-edit-form
      v-model="formData"
      v-model:valid="formValid"
      v-model:loading="formLoading"
      :instance-id="instanceId"
    />

    <h2>Share Types</h2>
    <share-type-template-builder v-model="shareTypeData" :store="props.store" />
  </modal-dialog>
</template>
