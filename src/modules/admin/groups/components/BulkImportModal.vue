<template>
  <modal
    :show="show"
    cancel-label="Cancel"
    ok-label="Ok"
    title="Bulk Import Tool"
    class="bit large"
    :can-submit="isValid"
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
          :instance-store="instanceStore"
          @update:modelValue="handleSetInstance"
        />
      </div>

      <!-- Step 2: Import data -->
      <div
        v-if="currentStep === BulkImportStep.uploadData"
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
        <p>
          Add one or more <em>Share Types</em> using the controls below.  During the import, each
          <em>Student</em> will have an account opened with the initial deposits you choose here.
          You can use the <em>Share Type</em> drop down to create and link or unlink <em>Share Types</em>
          to your <em>Instance</em>.
        </p>

        <div
          v-for="(share, index) in shareTemplate"
          :key="index"
          class="nsm__shares__fieldset"
        >
          <share-type-selector
            v-model="shareTemplate[index].shareType"
            :share-type-store="shareTypeStore"
            class="nsm__shareTypeSelector"
          />

          <input
            :id="`nsm__shares__initialDeposit__${index}`"
            v-model="shareTemplate[index].initialDeposit"
            :name="`initialDeposit[${index}]`"
            type="text"
          />

          <!--<ErrorMessage :name="`initialDeposit[${index}]`" />-->

          <button
            type="button"
            @click="removeShareType(index)"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="addShareType()"
        >
          Add Share
        </button>
      </div>

      <!-- Step 4: Validate and import -->
      <div
        v-if="currentStep === BulkImportStep.validate"
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
        v-if="hasPreviousStep"
        @click.prevent="decrementStep"
      >
        Previous
      </button>
      <button
        v-if="hasNextStep"
        :disabled="isValid !== true"
        @click.prevent="handleIncrement"
      >
        Next
      </button>
      <button
        v-if="!hasNextStep"
        class="primary"
        :disabled="isValid !== true"
        @click.prevent="handleOk"
      >
        <template v-if="!loading">
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
import { ref, defineComponent } from 'vue';
import { setup as defineInstance } from '@/store/instance';
import { setup as defineShareType } from '@/store/shareType';
import bulkImportStore, { BulkImportStep, ShareTemplate } from '@/store/bulkImport';
import errorStore from '@/store/error';
import Modal from '@/components/Modal.vue';
import InstanceSelector from '@/modules/admin/components/InstanceSelector.vue';
import ShareTypeSelector from '@/modules/admin/components/ShareTypeSelector.vue';
import LoadingIcon from '@/components/LoadingIcon.vue';

export default defineComponent({
  components: {
    Modal,
    InstanceSelector,
    ShareTypeSelector,
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

    // A fresh ShareTypeStore we can use for the modal
    const shareTypeStore = defineShareType(instanceStore);

    // True if the user is dragging a file
    const isDragging = ref(false);

    // A reference to the hidden field used to trigger the open file dialog
    const fileUploader = ref<HTMLInputElement|null>(null);

    // An array of new Share Types to create with initial values.  Also holds promise when they are submitted.
    const shareTemplate = ref<ShareTemplate[]>([]);

    // Set the instance for both stores
    function handleSetInstance(value: Instance|null) {
      instanceStore.setSelected(value);
      bulkImportStore.setInstance(value);
    }

    // Move to the next step
    function handleIncrement() {
      if (bulkImportStore.currentStep.value === BulkImportStep.shareTypes) {
        bulkImportStore.setShareTypeTemplate(shareTemplate.value);
      }

      console.log(bulkImportStore.shareTemplates.value);
      bulkImportStore.incrementStep();
    }

    // Commit the import
    function handleOk() {
      emit('ok');
    }

    // Cancel the import
    function handleCancel() {
      bulkImportStore.reset();
      shareTemplate.value = [];
      emit('cancel');
    }

    // Click the hidden file upload input box.
    function handleUploadClick() {
      if (fileUploader.value === null) return;
      fileUploader.value.click();
    }

    // Ensure that the file is a CSV and pass it to the state for processing
    function processFile(fileInfo: File) {
      try {
        bulkImportStore.processFile(fileInfo);
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
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

    // Add a new element to the shareTemplate array, triggering a share type selector
    function addShareType() {
      shareTemplate.value = [
        ...shareTemplate.value,

        {
          shareType: null,
          initialDeposit: '0.00',
        },
      ];
    }

    // Remove the provided index from the array
    function removeShareType(index: number) {
      shareTemplate.value = [
        ...shareTemplate.value.slice(0, index),
        ...shareTemplate.value.slice(index + 1),
      ];
    }

    return {
      handleOk,
      handleCancel,
      instanceStore,
      shareTypeStore,
      isDragging,
      handleSetInstance,
      handleDrop,
      handleUploadClick,
      handleFileChange,
      handleIncrement,
      fileUploader,
      shareTemplate,
      addShareType,
      removeShareType,
      BulkImportStep,
      ...bulkImportStore,
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

      h2 {
        margin-top: 1em;
      }

      ul.errors {
        margin-left: 2em;
      }
    }
  }
</style>
