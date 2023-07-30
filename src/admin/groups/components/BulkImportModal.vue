<script setup lang="ts">
import { defineAsyncComponent, ref, computed, watchEffect } from 'vue';

// Stores
import { setup as setupGlobalStore } from '@/admin/common/stores/global';

import {
  setup as setupBulkImportStore,
  BulkImportStep,
} from '@/admin/groups/stores/bulkImport';

// Components
import DollarIcon from '@/common/components/DollarIcon.vue';
import LoadingLabel from '@/common/components/LoadingLabel.vue';

const ModalDialog = defineAsyncComponent(
  () => import('@/common/components/ModalDialog.vue')
);

const ShareTypeTemplateBuilder = defineAsyncComponent(
  () => import('@/admin/common/components/ShareTypeTemplateBuilder.vue')
);

const InstanceSelector = defineAsyncComponent(
  () => import('@/admin/common/components/InstanceSelector.vue')
);

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (event: 'submit'): void;
  (event: 'cancel'): void;
}>();

const globalStore = setupGlobalStore();
const bulkImportStore = setupBulkImportStore(globalStore);

// Used by the import step
const fileUploader = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// Used by the final step
const isPosting = ref(false);

// Computed properties to roll up the store's data and make it easier to use
/// within the template.
const isLoading = computed(() => bulkImportStore.loading.value);

const errors = computed(() => bulkImportStore.errors.value);

const currentStep = computed(() => bulkImportStore.currentStep.value);

const students = computed(() => bulkImportStore.students.value);

const samples = computed(() => bulkImportStore.samples.value);

const errorMessage = computed(() =>
  bulkImportStore.isValid.value !== true ? bulkImportStore.isValid.value : ''
);

const canSubmit = computed(
  () => bulkImportStore.isValid.value === true && isLoading.value === false
);

const selectedInstance = computed({
  get() {
    return bulkImportStore.instance.value;
  },

  set(value) {
    globalStore.instance.selected.value = value;
    bulkImportStore.setInstance(value);
  },
});

const shareTypeData = computed({
  get() {
    return bulkImportStore.shareTemplates.value;
  },

  set(value) {
    bulkImportStore.setShareTypeTemplate(value);
  },
});

const cancelLabel = computed(() =>
  bulkImportStore.hasPreviousStep.value ? 'Previous' : 'Cancel'
);

const submitLabel = computed(() => {
  if (isLoading.value) {
    return 'Loading...';
  }

  if (bulkImportStore.hasNextStep.value) {
    return 'Next';
  }

  return 'Import';
});

/**
 * Generate samples, provided the store's state is valid.
 */
function generateSample() {
  if (bulkImportStore.isValid.value === true) {
    bulkImportStore.generateSample();
  }
}

/**
 * Increment the step or perform the final posting.
 */
async function handleModalOk() {
  if (bulkImportStore.isValid.value !== true) {
    return;
  }

  if (currentStep.value === BulkImportStep.shareTypes) {
    generateSample();
  }

  if (bulkImportStore.hasNextStep.value) {
    bulkImportStore.incrementStep();
  } else {
    try {
      isPosting.value = true;
      await bulkImportStore.post();
      emit('submit');
    } catch (e) {
      if (e instanceof Error) {
        globalStore.error.setCurrentError(e?.message ?? e);
      }
    }
  }
}

/**
 * Decrement the step or cancel the dialog.
 */
function handleModalCancel() {
  if (bulkImportStore.hasPreviousStep.value) {
    bulkImportStore.decrementStep();
  } else {
    emit('cancel');
  }
}

/**
 * Pass the file to the BulkImportStore for processing.
 *
 * @param fileInfo The File object returned by the input control or drop.
 */
async function processFile(fileInfo: File) {
  try {
    await bulkImportStore.processFile(fileInfo);
  } catch (e) {
    if (e instanceof Error) {
      globalStore.error.setCurrentError(e?.message ?? e);
    }
  }
}

/**
 * Handle a click event on the anchor tag that opens the file browser.
 */
function handleUploadClick() {
  if (fileUploader.value === null) return;
  fileUploader.value.click();
}

/**
 * Handle the drop operation.
 *
 * @param e
 */
function handleDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (!file) return;
  processFile(file);
}

/**
 * Handle a change event on the hidden file input.
 *
 * @param e
 */
function handleFileChange(e: Event) {
  const input = e.target as null | HTMLInputElement;
  if (!input) return;

  const file = input.files ? input.files[0] : null;
  if (!file) return;

  processFile(file);

  input.value = '';
  input.blur();
}

watchEffect(() => {
  if (props.show === true) {
    bulkImportStore.reset();
  }
});
</script>

<template>
  <modal-dialog
    title="Bulk Import"
    class="large bulk-import-modal"
    :show="props.show"
    :submit-label="submitLabel"
    :cancel-label="cancelLabel"
    :can-submit="canSubmit"
    @submit="handleModalOk"
    @cancel="handleModalCancel"
  >
    <!-- Step 1: Choose an instance-->
    <div v-if="currentStep === BulkImportStep.selectInstance">
      <h1>Step 1: Choose an instance</h1>
      <p>
        Select or create an instance that new groups and students will be
        created.
      </p>

      <suspense>
        <instance-selector
          v-model="selectedInstance"
          :store="globalStore"
          class="bulk-import-modal-instance-selector"
        />
      </suspense>
    </div>

    <!-- Step 2: Import Data-->
    <div v-if="currentStep === BulkImportStep.uploadData">
      <h1>Step 2: Import Data</h1>
      <p>
        Drag and Drop or click the link below to upload your CSV file. Download
        a copy of the
        <a href="/bulk-import-template.csv" target="_blank">here</a>.
      </p>

      <div
        class="bit__step__file-upload"
        :class="{ 'bit__step__file-upload--hover-ok': isDragging }"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
      >
        <p>
          Drop your CSV here or
          <a href="#" @click.prevent="handleUploadClick">click to upload</a>.
        </p>
      </div>

      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <input
        v-show="false"
        ref="fileUploader"
        type="file"
        @change.prevent="handleFileChange"
      />

      <h2 v-if="students.length > 0 && errors.length === 0">
        Import Succeeded
      </h2>

      <h2 v-if="students.length > 0 && errors.length > 0">
        Import Succeeded with Errors
      </h2>

      <ul v-if="errors.length > 0" class="error-list">
        <li v-for="(error, index) of errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- Step 3: Share Type Templates -->
    <div v-if="currentStep === BulkImportStep.shareTypes">
      <h1>Step 3: Configure Share Types</h1>

      <p>
        Add one or more <em>Share Types</em> using the controls below. During
        the import, each <em>Student</em> will have an account opened with the
        initial deposits you choose here. You can use the
        <em>Share Type</em> drop down to create and link or unlink
        <em>Share Types</em> to your <em>Instance</em>.
      </p>

      <suspense>
        <share-type-template-builder
          v-model="shareTypeData"
          :store="globalStore"
        />
      </suspense>

      <div v-if="errorMessage !== ''">
        <p class="error">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Step 4: Validate and commit -->
    <div v-if="currentStep === BulkImportStep.validate">
      <h1>Step 4: Validate and commit</h1>

      <template v-if="!isPosting">
        <p>
          Review the tables below to ensure the data looks right. When you are
          ready, hit <em>Import</em>.
        </p>

        <ul class="bit__summary">
          <li>
            <strong>Instance:</strong>
            {{ bulkImportStore.instance.value?.description }}
          </li>
          <li>
            <strong>Number of groups to create:</strong>
            {{ bulkImportStore.groups.value.length }}
          </li>
          <li>
            <strong>Number of students to create:</strong> {{ students.length }}
          </li>
        </ul>

        <button type="button" @click="generateSample()">Refresh Samples</button>

        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Account Number</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Shares</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sample in samples" :key="sample.accountNumber">
              <td>{{ sample.group }}</td>
              <td>{{ sample.accountNumber }}</td>
              <td>{{ sample.firstName }}</td>
              <td>{{ sample.lastName }}</td>
              <td v-if="sample.shares.length > 0">
                <div v-for="(share, index) in sample.shares" :key="index">
                  <div>
                    {{ share.shareType?.name ?? '#ERROR' }}
                  </div>
                  <div>
                    {{ share.initialDeposit }}
                  </div>
                </div>
              </td>
              <td v-else class="left">
                <em>No shares will be created.</em>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <dollar-icon class="bulk-import-modal__loading-label" />
        <p>
          Please wait while data is imported. This may take a few minutes. Do
          close or refresh your browser until the import is complete.
        </p>
      </template>
    </div>

    <template #submitLabel="{ label }">
      <loading-label :show="isLoading">{{ label }}</loading-label>
    </template>
  </modal-dialog>
</template>

<style>
/*
 * The first step of the modal is really short, so it would cause a scroll
 * when opened.
 */
.bulk-import-modal-instance-selector .select__items {
  position: fixed;
}

.bulk-import-modal__loading-label {
  font-size: 8rem;
  display: block;
  margin: 0.25em auto;
}

.bulk-import-modal__loading-label div {
  margin-left: 0;
}
</style>

<style scoped>
h2 {
  margin-top: 0.5em;
}

p.error {
  margin-top: 1em;
}

.bit__step__file-upload {
  margin-top: 1em;
  padding: 2em;
  border: 1px solid hsl(var(--clr-neutral-600));
  border-radius: var(--border-radius);
  text-align: center;
}

.error-list {
  color: hsl(var(--clr-destructive-500));
}

.bit__step__file-upload--hover-ok {
  border-style: dashed;
}
</style>
