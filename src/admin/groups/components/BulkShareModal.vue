<!-- eslint-disable no-console -->
<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watchEffect } from 'vue';

import type {
  NewBulkTransactionMutationVariables,
  NewShareMutationVariables,
  NewTransactionMutationVariables,
} from '@/generated/graphql';

import type { GlobalStore } from '@/admin/common/stores/global';
import type { Student } from '@/common/services/student';
import type { Share } from '@/common/services/share';
import type { ShareTypeTemplate } from '@/admin/common/components/ShareTypeTemplateBuilder.vue';

// Services
import { API_MAX_CONCURRENCY } from '@/common/constants';
import selection from '@/admin/groups/services/StudentSelectionService';
import { newShare } from '@/common/services/share';
import { newBulkTransaction } from '@/common/services/transaction';

// Components
import { VCheckbox } from '@/common/components/inputs';

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
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const loading = ref(false);
const students = ref<Student[]>([]);
const allowDuplicates = ref(false);
const shareTemplates = ref<ShareTypeTemplate[]>([]);

const errors = computed(() => {
  const errs: string[] = [];

  shareTemplates.value.forEach((tpl) => {
    const shareTypeId = tpl.shareType?.id ?? -1;
    const shareTypeName = tpl.shareType?.name ?? '';

    if (shareTypeId === -1) return;

    let iDuplicates = 0;
    students.value.forEach((student) => {
      const shares = student.shares ?? [];

      if (shares.find((x) => x.shareTypeId === shareTypeId)) {
        iDuplicates += 1;
      }
    });

    if (iDuplicates > 0 && !allowDuplicates.value) {
      errs.push(
        `Warning: ${iDuplicates} students already have the '${shareTypeName}' Share Type.`
      );
    }
  });

  return errs;
});

const shareTemplateValid = computed(() => {
  let i = 0;

  shareTemplates.value.forEach((x) => {
    if (x.error !== '') {
      i += 1;
    }

    if (x.shareType === null) {
      i += 1;
    }
  });

  return i === 0;
});

const canSubmit = computed(() => shareTemplateValid.value && !loading.value);

async function resolveSelection() {
  loading.value = true;

  try {
    students.value = await selection.resolve();
  } catch (e) {
    if (!(e instanceof Error)) return;
    props.store.error.setCurrentError(e?.message ?? e);
  } finally {
    loading.value = false;
  }
}

async function handleOk() {
  loading.value = true;
  const shareRequests: NewShareMutationVariables[] = [];

  students.value.forEach(async (student) => {
    shareTemplates.value.forEach((tpl) => {
      const shareTypeId = tpl.shareType?.id ?? -1;
      if (shareTypeId === -1) return;

      // Skip share creation if student already has it and duplicates isn't selected
      const currentShares = student.shares ?? [];
      if (
        currentShares.find((x) => x.shareTypeId === shareTypeId) &&
        !allowDuplicates.value
      ) {
        return;
      }

      shareRequests.push({
        studentId: student.id,
        shareTypeId,
      });
    });
  });

  const createdShares: Share[] = [];
  while (shareRequests.length) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await Promise.all(
        shareRequests
          .splice(0, API_MAX_CONCURRENCY)
          .map((newShareRequest) => newShare(newShareRequest))
      );

      res.forEach((share) => {
        console.debug('[New Share]: Share Created.', share);
        createdShares.push(share.newShare[0]);
      });
    } catch (e) {
      loading.value = false;

      if (!(e instanceof Error)) throw e;

      throw new Error(
        `Unable to create one or more shares on students: ${e?.message ?? e}.`
      );
    }
  }

  console.debug('[New Share]: Share creation complete.', createdShares);

  const transactionsToPost: NewTransactionMutationVariables[] = [];
  shareTemplates.value.forEach((tpl) => {
    const { shareType } = tpl;
    if (!shareType) return;

    const shareTypeId = shareType.id;
    const initialDeposit = tpl.initialDeposit.getAmount();

    createdShares
      .filter((share) => share.shareTypeId === shareTypeId)
      .forEach((share) =>
        transactionsToPost.push({
          shareId: share.id,
          amount: initialDeposit,
          comment: 'Initial Deposit',
        })
      );
  });

  const bulkTransactionReq: NewBulkTransactionMutationVariables = {
    shares: transactionsToPost,
    skipNegative: true,
  };

  try {
    const transactions = await newBulkTransaction(bulkTransactionReq);
    console.debug('[New Share]: Share transactions posted.', transactions);
  } catch (e) {
    if (!(e instanceof Error)) return;
    props.store.error.setCurrentError(e?.message ?? e);
  } finally {
    loading.value = false;
  }

  emit('submit');
}

function handleCancel() {
  emit('cancel');
}

watchEffect(() => {
  if (props.show) {
    students.value = [];
    shareTemplates.value = [];
    resolveSelection();
  }
});
</script>

<template>
  <modal-dialog
    title="New Share"
    submit-label="Create"
    cancel-label="Cancel"
    class="large bsm"
    :show="props.show"
    :can-submit="canSubmit"
    :can-cancel="!loading"
    @submit="handleOk"
    @cancel="handleCancel"
  >
    <p>
      Use the controls below to specify the Shares you'd like to create for each
      Student currenly selected. Checking the
      <em>Allow Duplicate Shares to be Created?</em> box allows the shares you
      define here to be created even if the Student already has a Share of that
      type.
    </p>

    <p>
      <template v-if="students.length">
        {{ students.length }} student(s) currently selected.
      </template>

      <template v-else> Loading... </template>
    </p>

    <share-type-template-builder
      v-model="shareTemplates"
      :store="props.store"
      class="bsm__sttb"
    />

    <v-checkbox
      v-model="allowDuplicates"
      label="Allow duplicate shares to be created?"
      class="bsm--fieldset inline"
    />

    <div v-if="errors.length > 0">
      <h2>One or more error(s) were found</h2>

      <ul class="error">
        <li v-for="(error, index) in errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </div>
  </modal-dialog>
</template>

<style scoped>
p,
.bsm__sttb,
div.bsm--fieldset {
  margin-bottom: 1em;
}
</style>
