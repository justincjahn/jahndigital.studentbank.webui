<template>
  <modal
    cancel-label="Cancel"
    ok-label="Ok"
    title="Bulk Import Tool"
    class="bit large"
    :show="show"
    :can-submit="!isPosting"
    :can-cancel="!isPosting"
    :handle-enter="!isPosting"
    :handle-escape="!isPosting"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #default>
      <!-- Step 1: Choose an instance -->
      <div
        v-if="currentStep === BulkImportStep.selectInstance"
        class="bit__step bit__step--1"
      >
        <h1>Step 1: Choose an instance</h1>
        <p>Select or create an instance that new groups and students will be created.</p>
        <instance-selector
          :model-value="instance"
          :store="globalStore"
          @update:modelValue="handleSetInstance"
        />
      </div>

      <!-- Step 2: Import data -->
      <div
        v-if="currentStep === BulkImportStep.uploadData"
        class="bit__step bit__step--2"
      >
        <h1>Step 2: Import data</h1>
        <p>
          Drag and Drop or click the link below to upload your CSV file. Download a copy of the template,
          <a href="/bulk-import-template.csv" target="_blank">here</a>.
        </p>

        <div
          class="bit__step__file-upload"
          :class="{ 'bit__step__file-upload--hover-ok': isDragging }"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @dragenter.prevent="isDragging = true;"
          @dragleave.prevent="isDragging = false"
        >
          <p>Drop your CSV here or <a href="#" @click.prevent="handleUploadClick">click to upload</a>.</p>
        </div>
        <input
          v-show="false"
          ref="fileUploader"
          type="file"
          @change.prevent="handleFileChange"
        />

        <h2 v-if="students.length > 0 && errors.length === 0">
          Import Suceeded
        </h2>

        <h2 v-if="errors.length > 0">
          Import Suceeded with Errors
        </h2>

        <ul
          v-if="errors.length > 0"
          class="bit__step__import-info errors"
        >
          <li v-for="(error, index) of errors" :key="index">
            {{ error }}
          </li>
        </ul>

        <p v-if="students.length > 0" class="bit__step__import-info">
          Press <strong>Next</strong> to continue.
        </p>
      </div>

      <!-- Step 3: Configure Share Types -->
      <div
        v-if="currentStep === BulkImportStep.shareTypes"
        class="bit__step bit__step--3"
      >
        <h1>Step 3: Configure Share Types</h1>
        <p class="bit__step--description">
          Add one or more <em>Share Types</em> using the controls below.  During the import, each
          <em>Student</em> will have an account opened with the initial deposits you choose here.
          You can use the <em>Share Type</em> drop down to create and link or unlink <em>Share Types</em>
          to your <em>Instance</em>.
        </p>

        <share-type-template-builder
          v-model="shareTemplate"
          :store="globalStore"
        />
      </div>

      <!-- Step 4: Validate and import -->
      <div
        v-if="currentStep === BulkImportStep.validate"
        class="bit__step bit__step--4"
      >
        <h1>Step 4: Validate and commit</h1>

        <template v-if="!isPosting">
          <p>Review the tables below to ensure the data looks right.  When you are ready, hit <em>Import</em>.</p>

          <ul class="bit__summary">
            <li><strong>Instance:</strong> {{ instance?.description }}</li>
            <li><strong>Number of groups to create:</strong> {{ groups.length }}</li>
            <li><strong>Number of students to create:</strong> {{ students.length }}</li>
          </ul>

          <button class="secondary" @click="generateSample()">
            Refresh Samples
          </button>

          <table class="bit__samples">
            <thead>
              <tr>
                <th>Group</th>
                <th>Account Number</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th :class="(samples[0]?.shares.length ?? -1) > 0 ? 'center' : 'left'">
                  Shares
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sample in samples" :key="sample.accountNumber">
                <td>{{ sample.group }}</td>
                <td>{{ sample.accountNumber }}</td>
                <td>{{ sample.firstName }}</td>
                <td>{{ sample.lastName }}</td>
                <td v-if="sample.shares.length > 0">
                  <div v-for="(share, index) in sample.shares" :key="index" class="bit__samples__share">
                    <div class="bit__samples__share__name">
                      {{ share.shareType?.name ?? '#ERROR' }}
                    </div>
                    <div class="bit__samples__share__amount">
                      {{ Money.fromStringOrDefault(share.initialDeposit).toString() }}
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
          <loading-label :show="isPosting" class="bit__post-loading">
            Please wait while data is imported.  This may take a few minutes.
            Do not close or refresh your browser until the import is complete.
          </loading-label>
        </template>
      </div>
    </template>

    <template #buttons="{ okLabel, handleOk, cancelLabel, handleCancel }">
      <button
        :disabled="isPosting"
        @click.prevent="handleCancel"
      >
        {{ cancelLabel }}
      </button>
      <button
        v-if="hasPreviousStep"
        :disabled="isPosting"
        @click.prevent="decrementStep"
      >
        Previous
      </button>
      <button
        v-if="hasNextStep"
        :disabled="canContinue !== true || isPosting"
        @click.prevent="handleIncrement"
      >
        Next
      </button>
      <button
        v-if="!hasNextStep"
        class="primary"
        :disabled="canContinue !== true || isPosting"
        @click.prevent="handleOk"
      >
        <template v-if="!loading">
          {{ okLabel }}
        </template>
        <template v-else>
          <loading-label>Importing...</loading-label>
        </template>
      </button>
    </template>
  </modal>
</template>

<script lang="ts">
import { ref, computed, defineComponent, watch } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import InstanceSelector from '@/modules/admin/components/InstanceSelector.vue';
import ShareTypeTemplateBuilder from '@/modules/admin/components/ShareTypeTemplateBuilder.vue';
import LoadingLabel from '@/components/LoadingLabel.vue';

// Utils
import Money from '@/utils/money';

// Stores
import { setup as defineBulkImportStore, BulkImportStep } from '@/modules/admin/groups/stores/bulkImport';
import { setup as defineGlobalStore } from '../../stores/global';

export default defineComponent({
  components: {
    Modal,
    InstanceSelector,
    LoadingLabel,
    ShareTypeTemplateBuilder,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const globalStore = defineGlobalStore();
    const instanceStore = globalStore.instance;
    const shareTypeStore = globalStore.shareType;
    const setCurrentError = (value: string|null) => globalStore.error.setCurrentError(value);

    // The store we'll use to do the import
    const bulkImportStore = defineBulkImportStore();

    // True if the user is dragging a file
    const isDragging = ref(false);

    // A reference to the hidden field used to trigger the open file dialog
    const fileUploader = ref<HTMLInputElement|null>(null);

    // An array of new Share Types to create with initial values.  Also holds promise when they are submitted.
    const shareTemplate = ref<ShareTypeTemplate[]>([]);

    // Tells the UI that we are posting and to disable a bunch of stuff so the user doesn't close it
    const isPosting = ref(false);

    // True if the form is valid for the current state.  Enhances bulkImportStore with Share Type Template validation.
    const canContinue = computed(() => {
      const isValid = bulkImportStore.isValid.value;
      if (isValid !== true) return isValid;

      if (bulkImportStore.currentStep.value >= BulkImportStep.shareTypes) {
        for (let i = 0; i < shareTemplate.value.length; i += 1) {
          const template = shareTemplate.value[i];
          if (template.shareType === null) return 'Please ensure all Share Type templates have a Share Type selected.';
          if (template.error) return 'Please verify initial balances and correct any errors to continue.';
        }
      }

      return true;
    });

    /**
     * Set the selected instance for both stores.
     */
    function handleSetInstance(value: Instance|null) {
      instanceStore.selected.value = value;
      bulkImportStore.setInstance(value);
    }

    /**
     * Move to the next step in the workflow.  If we hit the share type template step, update the store with
     * computed share types.
     */
    async function handleIncrement() {
      if (bulkImportStore.currentStep.value === BulkImportStep.shareTypes) {
        bulkImportStore.setShareTypeTemplate(shareTemplate.value);
        bulkImportStore.generateSample();
      }

      bulkImportStore.incrementStep();
    }

    /**
     * Commit the import.
     */
    async function handleOk() {
      // We're on the last step
      try {
        isPosting.value = true;
        await bulkImportStore.post();
        emit('ok', bulkImportStore);
      } catch (e) {
        setCurrentError(e?.message ?? e);
      } finally {
        isPosting.value = false;
      }
    }

    /**
     * Cancel the import.
     */
    function handleCancel() {
      emit('cancel');
    }

    /**
     * Click the hidden file uplod input.
     */
    function handleUploadClick() {
      if (fileUploader.value === null) return;
      fileUploader.value.click();
    }

    /**
     * Ensure that the file is a CSV and pass it to the state for processing.
     */
    function processFile(fileInfo: File) {
      try {
        bulkImportStore.processFile(fileInfo);
      } catch (e) {
        setCurrentError(e?.message ?? e);
      }
    }

    /**
     * Process the dropped file
     */
    function handleDrop(e: DragEvent) {
      const file = e.dataTransfer?.files[0];
      if (!file) return;

      processFile(file);
    }

    /**
     * Process the file from the file browser
     */
    function handleFileChange(e: Event) {
      const input = e.target as null|HTMLInputElement;
      if (!input) return;

      const file = input.files ? input.files[0] : null;
      if (!file) return;

      processFile(file);

      // Reset the form so a change is triggered again
      input.value = '';
      input.blur();
    }

    /**
     * When the modal is opened, clear it
     */
    watch(() => props.show, () => {
      if (props.show) {
        bulkImportStore.reset();
        shareTemplate.value = [];
      }
    });

    return {
      Money,
      handleOk,
      handleCancel,
      globalStore,
      shareTypeStore,
      isDragging,
      handleSetInstance,
      handleDrop,
      handleUploadClick,
      handleFileChange,
      handleIncrement,
      fileUploader,
      shareTemplate,
      canContinue,
      BulkImportStep,
      ...bulkImportStore,
      isPosting,
    };
  },
});
</script>

<style lang="scss">
  .bit {
    &__step {
      &__file-upload {
        @include round-border();

        min-height: 10vh;
        margin-top: 1em;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &--hover-ok {
          border-style: dashed;
        }
      }

      &--description {
        margin-bottom: 1em;
      }

      &__import-info {
        margin-top: 1em;
      }

      h2 {
        margin-top: 1em;
      }

      ul.errors {
        margin-left: 2em;
      }
    }

    &__shareTypeSelector {
      margin-right: 0.25em;
    }

    &__summary {
      margin: 1em 0;

      li {
        margin-left: 3em;
      }
    }

    &__shares {
      &--add-button {
        margin: 1em 0 0 0;
      }
    }

    &__samples {
      margin-top: 1em;

      &__share {
        display: flex;
        flex-direction: row;
        padding: 0 !important;

        &__name {
          text-align: left;
          width: 100%;
          font-weight: bold;
        }
      }
    }

    &__post-loading {
      margin-top: 1em;
      font-size: 1.6em;
    }
  }
</style>
