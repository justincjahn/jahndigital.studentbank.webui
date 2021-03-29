<template>
  <modal
    :show="show"
    cancel-label="Cancel"
    ok-label="Ok"
    title="Bulk Import Tool"
    class="bit large"
    :can-submit="canSubmit"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #default>
      <!-- Step 1: Choose an instance -->
      <div
        v-if="state.currentStep === 1"
        class="bit__step bit__step--1"
      >
        <h1>Step 1: Choose an instance</h1>
        <p>Select or create an instance that new groups and students will be created.</p>
        <instance-selector
          v-model="state.selectedInstance"
          :instance-store="instanceStore"
        />
      </div>

      <!-- Step 2: Import data -->
      <div
        v-if="state.currentStep === 2"
        class="bit__step bit__step--2"
      >
        <h1>Step 2: Import data</h1>
        <p>Drag and Drop or click the link below to upload your CSV file.</p>

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

        <p v-if="state.students.length > 0" class="bit__step__import-info">
          <template v-if="state.errors.length > 0">
            Import succeeded with error(s).
          </template>

          <template v-else>
            Import succeeded.
          </template>

          {{ state.students.length }} student(s) will be imported into {{ state.groups.length }} group(s).

          <template v-if="state.errors.length > 0">
            Here's a summary of the errors found in the import file:
          </template>
        </p>

        <ul
          v-if="state.errors.length > 0"
          class="errors"
        >
          <li v-for="(error, index) of state.errors" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <!-- Step 3: Configure Share Types -->
      <div
        v-if="state.currentStep === 3"
        class="bit__step bit__step--3"
      >
        <h1>Step 3: Configure Share Types</h1>
        <p>
          Add one or more <em>Share Types</em> using the controls below.  During the import, each
          <em>Student</em> will have an account opened with the initial deposits you choose here.
          You can use the <em>Share Type</em> drop down to create and link or unlink <em>Share Types</em>
          to your <em>Instance</em>.
        </p>
      </div>

      <!-- Step 4: Validate and import -->
      <div
        v-if="state.currentStep === 4"
        class="bit__step bit__step--4"
      >
        <h1>Step 4: Validate and commit</h1>
        <p>Review the tables below to ensure the data looks right.  When you are ready, hit <em>Import</em>.</p>
      </div>
    </template>

    <template #buttons="{ okLabel, handleOk, cancelLabel, handleCancel }">
      <button @click.prevent="handleCancel">
        {{ cancelLabel }}
      </button>
      <button
        v-if="state.hasPreviousStep()"
        @click.prevent="state.decrementStep()"
      >
        Previous
      </button>
      <button
        v-if="state.hasNextStep()"
        :disabled="!isValid"
        @click.prevent="state.incrementStep()"
      >
        Next
      </button>
      <button
        v-if="!state.hasNextStep()"
        class="primary"
        :disabled="!isValid || state.isLoading"
        @click.prevent="handleOk"
      >
        <template v-if="!state.isLoading">
          {{ okLabel }}
        </template>
        <template v-else>
          <loading-icon>Importing...</loading-icon>
        </template>
      </button>
    </template>
  </modal>
</template>

<script lang="ts">
import { computed, ref, reactive, defineComponent } from 'vue';
import BulkImportService from '@/services/BulkImportService';
import { setup as defineInstance } from '@/store/instance';
import errorStore from '@/store/error';
import Modal from '@/components/Modal.vue';
import InstanceSelector from '@/components/InstanceSelector.vue';
import LoadingIcon from '@/components/LoadingIcon.vue';

export default defineComponent({
  components: {
    Modal,
    InstanceSelector,
    LoadingIcon,
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

  setup(_, { emit }) {
    // A fresh InstanceStore we can use for the modal
    const instanceStore = defineInstance();

    // If the form can be submitted
    const canSubmit = computed(() => true);

    // The state of the modal
    const state = reactive(new BulkImportService());

    // True if the user is dragging a file
    const isDragging = ref(false);

    // A reference to the hidden field used to trigger the open file dialog
    const fileUploader = ref<HTMLInputElement|null>(null);

    // True if the form is valid for the current state.
    const isValid = computed(() => {
      if (state.selectedInstance === null) return false;
      if (state.isLoading) return false;

      if (state.currentStep >= 2) {
        if (state.students.length === 0) return false;
      }

      return true;
    });

    // Commit the import
    function handleOk() {
      emit('ok');
    }

    // Cancel the import
    function handleCancel() {
      state.reset();
      emit('cancel');
    }

    // Click the hidden file upload input box.
    function handleUploadClick() {
      if (fileUploader.value === null) return;
      fileUploader.value.click();
    }

    // Ensure that the file is a CSV and pass it to the state for processing
    function processFile(fileInfo: File) {
      state.resetImportData();

      const extIndex = fileInfo.name.lastIndexOf('.');
      const extension = fileInfo.name.substring(extIndex).toLowerCase();
      const isCSV = extension.toLowerCase() === '.csv';
      if (!isCSV) {
        errorStore.setCurrentError(`Import requires a .csv file and you provided ${extension}.`);
        return;
      }

      state.setLoading(true);
      fileInfo.text().then((value) => {
        try {
          const numErrors = state.importCSV(value);

          if (numErrors > 0) {
            errorStore.setCurrentError(`${numErrors} error(s) have occurred during import. Please review and correct them or some students may not be imported.`);
          }
        } catch (e) {
          errorStore.setCurrentError(e.message ?? e);
        } finally {
          state.setLoading(false);
        }
      });
    }

    // Process the dropped file
    function handleDrop(e: DragEvent) {
      const file = e.dataTransfer?.files[0];
      if (!file) return;

      processFile(file);
    }

    // Process the file from the file brow
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

    return {
      canSubmit,
      handleOk,
      handleCancel,
      state,
      isValid,
      instanceStore,
      isDragging,
      handleDrop,
      handleUploadClick,
      handleFileChange,
      fileUploader,
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

      &__import-info {
        margin-top: 1em;
      }

      ul.errors {
        margin-left: 2em;
      }
    }
  }
</style>
