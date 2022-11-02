<script lang="ts" setup>
import { defineAsyncComponent, computed, watchEffect } from 'vue';

import Money from '@/common/utils/Money';
import type { Student } from '@/common/services/student';
import type { GlobalStore } from '@/admin/common/stores/global';

// Services
import selection from '@/admin/groups/services/StudentSelectionService';

// Stores
import {
  setup as setupBulkPostStore,
  PostingPolicy,
} from '@/admin/groups/stores/bulkPost';

// Components
import LoadingLabel from '@/common/components/LoadingLabel.vue';

import { VInput, VCurrency } from '@/common/components/inputs';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const ShareTypeSelector = defineAsyncComponent(
  () =>
    import('@/admin/common/components/ShareTypeSelector/ShareTypeSelector.vue')
);

type Share = Student['shares'][number];

const props = defineProps<{
  show: boolean;
  store: GlobalStore;
}>();

const emit = defineEmits<{
  (event: 'ok'): void;
  (event: 'cancel'): void;
}>();

const bulkPostStore = setupBulkPostStore(selection);

const {
  loading,
  students,
  isValid,
  currentWarnings,
  currentStep,
  hasNextStep,
  hasPreviousStep,
  incrementStep,
  decrementStep,
  postingPolicy,
  sampleShares,
  getEffectiveBalance,
} = bulkPostStore;

const shareTypeName = computed(
  () =>
    bulkPostStore.shareType.value?.name.toUpperCase().substring(0, 3) ?? 'UNK'
);

const modalOkLabel = computed(() => {
  if (loading.value) return 'Loading...';
  if (hasNextStep.value) return 'Next';
  return 'Post';
});

const modalCancelLabel = computed(() => {
  if (hasPreviousStep.value) return 'Previous';
  return 'Cancel';
});

const canSubmit = computed(() => isValid.value === true && !loading.value);

async function handleOk() {
  if (!isValid.value) {
    return;
  }

  if (hasNextStep.value) {
    incrementStep();
    return;
  }

  try {
    await bulkPostStore.post();
    emit('ok');
  } catch (e) {
    if (!(e instanceof Error)) {
      return;
    }

    props.store.error.setCurrentError(e.message);
  }
}

function handleCancel() {
  if (hasPreviousStep.value) {
    decrementStep();
    return;
  }

  emit('cancel');
}

function getStudentName(share: Share) {
  const student = bulkPostStore.students.value.find(
    (x) => x.id === share.studentId
  );

  if (student) {
    return `${student.lastName}, ${student.firstName}`;
  }

  return 'Unknown';
}

function getAccountNumber(share: Share) {
  const student = bulkPostStore.students.value.find(
    (x) => x.id === share.studentId
  );

  return student?.accountNumber ?? '0000000000';
}

function getGroupName(share: Share) {
  const student = bulkPostStore.students.value.find(
    (x) => x.id === share.studentId
  );

  if (student) {
    const group = props.store.group.groups.value.find(
      (x) => x.id === student.groupId
    );

    if (group) {
      return group.name;
    }
  }

  return 'Unknown';
}

watchEffect(() => {
  if (props.show) {
    bulkPostStore.reset();
    bulkPostStore.fetchStudents();
  }
});
</script>

<template>
  <modal-dialog
    title="Bulk Transaction"
    class="large"
    :show="props.show"
    :can-submit="canSubmit"
    :submit-label="modalOkLabel"
    :can-cancel="!loading"
    :cancel-label="modalCancelLabel"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #okLabel="{ okLabel }">
      <loading-label :show="loading">
        {{ okLabel }}
      </loading-label>
    </template>

    <div v-if="currentStep == 1">
      <h2>Step 1: Select a Share Type</h2>

      <p>
        <template v-if="loading"> Please wait... </template>

        <strong v-else-if="students.length <= 0" class="error">
          Please select some students to begin!
        </strong>

        <template v-else>
          You have {{ students.length }}
          {{ students.length > 1 ? 'students' : 'student' }} selected.
        </template>
      </p>

      <share-type-selector
        v-model="bulkPostStore.shareType.value"
        :store="props.store"
      />
    </div>

    <div v-if="currentStep == 2">
      <h2>Step 2: Choose an Amount</h2>

      <v-currency v-model="bulkPostStore.amount.value" label="Amount" />
      <v-input v-model="bulkPostStore.comment.value" label="Comment" />

      <div class="fieldset">
        <div class="fieldset__item">
          <input
            id="bpm__step-2--policy-none"
            type="radio"
            name="postingPolicy"
            :checked="postingPolicy === PostingPolicy.None"
            @input="postingPolicy = PostingPolicy.None"
          />
          <label for="bpm__step-2--policy-none">None</label>
          <span class="help-text">Fail if any shares are taken negative.</span>
        </div>

        <div class="fieldset__item">
          <input
            id="bpm__step-2--policy-take"
            type="radio"
            name="postingPolicy"
            :checked="postingPolicy === PostingPolicy.Take"
            @input="postingPolicy = PostingPolicy.Take"
          />
          <label for="bpm__step-2--policy-take">Take Negative</label>
          <span class="help-text">Allow shares to be taken negative.</span>
        </div>

        <div class="fieldset__item">
          <input
            id="bpm__step-2--policy-skip"
            type="radio"
            name="postingPolicy"
            :checked="postingPolicy === PostingPolicy.Skip"
            @input="postingPolicy = PostingPolicy.Skip"
          />
          <label for="bpm__step-2--policy-skip">Skip Negative</label>
          <span class="help-text">
            Skip shares that would be taken negative.
          </span>
        </div>
      </div>
    </div>

    <div v-if="currentStep === 3">
      <h2>Step 3: Review</h2>

      <table>
        <thead>
          <tr>
            <th>Group</th>
            <th>Account Number</th>
            <th>Student Name</th>
            <th>Share</th>
            <th>Current Balance</th>
            <th>Anticipated Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="share in sampleShares" :key="share.id">
            <td>{{ getGroupName(share) }}</td>
            <td>{{ getAccountNumber(share) }}</td>
            <td>{{ getStudentName(share) }}</td>
            <td>{{ shareTypeName }}</td>
            <td>{{ Money.fromNumber(share.balance) }}</td>
            <td>{{ getEffectiveBalance(share) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="currentWarnings" class="error">
      {{ currentWarnings }}
    </p>

    <p v-if="isValid !== true" class="error">
      {{ isValid }}
    </p>
  </modal-dialog>
</template>

<style scoped>
h2 {
  margin-bottom: 0.5em;
}

p {
  margin-bottom: 0.5em;
}

p.error {
  margin-top: 0.5em;
}

.fieldset__item :where(.help-text, label) {
  margin-left: 0.25rem;
}
</style>
