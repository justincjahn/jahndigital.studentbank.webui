<template>
  <modal
    title="New Share"
    ok-label="Create"
    cancel-label="Cancel"
    class="nshm large"
    :show="show"
    :can-submit="canSubmit"
    :can-cancel="!loading"
    :handle-enter="!loading"
    :handle-escape="!loading"
    @cancel.prevent="handleCancel"
    @ok.prevent="handleOk"
  >
    <p>
      Use the controls below to specify the Shares you'd like to create for each Student currenly
      selected.  Checking the <em>Allow Duplicate Shares to be Created?</em> box allows the shares
      you define here to be created even if the Student already has a Share of that type.
    </p>

    <p v-if="students.length">
      {{ students.length }} student(s) currently selected.
    </p>

    <p v-else>
      Loading...
    </p>

    <share-type-template-builder
      v-model="templates"
      class="nshm--fieldset"
      :store="store"
    />

    <div class="nshm--fieldset">
      <label
        for="nshm-allow-duplicates"
      >
        Allow Duplicate Shares to be Created?
      </label>

      <input
        id="nshm-allow-duplicates"
        v-model="allowDuplicates"
        type="checkbox"
      />
    </div>

    <div v-if="errors.length > 0">
      <h2 class="nshm--fieldset">
        One or more error(s) were found
      </h2>

      <ul class="errors">
        <li v-for="(error, index) in errors" :key="index">
          {{ error }}
        </li>
      </ul>
    </div>
  </modal>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';
import { API_MAX_CONCURRENCY } from '@/constants';

// Utils
import selection from '@/services/StudentSelectionService';
import Money from '@/utils/money';

// Components
import Modal from '@/components/Modal.vue';
import ShareTypeTemplateBuilder from '@/modules/admin/components/ShareTypeTemplateBuilder.vue';

// Stores
import { GlobalStore } from '../../stores/global';

export default defineComponent({
  components: {
    Modal,
    ShareTypeTemplateBuilder,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    store: {
      type: Object as PropType<GlobalStore>,
      required: true,
    },
  },
  emits: [
    'ok',
  ],
  setup(props, { emit }) {
    const loading = ref(false);
    const templates = ref<ShareTypeTemplate[]>([]);
    const students = ref<Student[]>([]);
    const allowDuplicates = ref(false);

    // Every time the share templates change, re-calculate the error messages
    const errors = computed(() => {
      const errs: string[] = [];

      templates.value.forEach((template) => {
        const shareTypeId = template.shareType?.id ?? -1;
        const shareTypeName = template.shareType?.name ?? '';
        if (shareTypeId === -1) return;

        let iDuplicates = 0;
        students.value.forEach((student) => {
          const shares = student.shares ?? [];

          if (shares.find((x) => x.shareTypeId === shareTypeId)) {
            iDuplicates += 1;
          }
        });

        if (iDuplicates > 0 && !allowDuplicates.value) {
          errs.push(`Warning: ${iDuplicates} students already have the '${shareTypeName}' Share Type.`);
        }
      });

      return errs;
    });

    // True if there are no errors in the ShareTemplate array and all share types are selected
    const shareTemplateValid = computed(() => {
      let i = 0;

      templates.value.forEach((x) => {
        if (x.error !== '') i += 1;
        if (x.shareType === null) i += 1;
      });

      return i === 0;
    });

    // True if the form can be submitted
    const canSubmit = computed(() => shareTemplateValid.value && !loading.value);

    /**
     * Resolve the currently selected students.
     */
    async function resolveSelection() {
      loading.value = true;

      try {
        students.value = await selection.resolve();
      } catch (e) {
        props.store.error.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    /**
     * Reset values back to default
     */
    function reset() {
      templates.value = [];
      students.value = [];
    }

    /**
     * Tell the parent to close
     */
    function handleCancel() {
      reset();
      emit('ok');
    }

    /**
     * Create the shares then tell the parent to close.
     */
    async function handleOk() {
      loading.value = true;
      const shareRequests: NewShareRequest[] = [];

      students.value.forEach((student) => {
        templates.value.forEach((template) => {
          const shareTypeId = template.shareType?.id ?? -1;
          if (shareTypeId === -1) return;

          // Skip share creation if student already has it and duplicates isn't selected
          const currentShares = student.shares ?? [];
          if (currentShares.find((x) => x.shareTypeId === shareTypeId) && !allowDuplicates.value) return;

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
            shareRequests.splice(0, API_MAX_CONCURRENCY)
              .map((newShareRequest) => props.store.share.newShare(newShareRequest)),
          );

          res.forEach((share) => {
            console.debug('[New Share]: Share Created.', share);
            createdShares.push(share);
          });
        } catch (e) {
          loading.value = false;
          throw new Error(`Unable to create one or more shares on students: ${e?.message ?? e}.`);
        }
      }

      console.debug('[New Share]: Share creation complete.', createdShares);

      // Initial transactions
      const transactionsToPost: NewTransactionRequest[] = [];
      templates.value.forEach((template) => {
        const { shareType } = template;
        if (!shareType) return;

        const shareTypeId = shareType.id;
        const initialDeposit = Money.fromStringOrDefault(template.initialDeposit).round();

        createdShares
          .filter((share) => share.shareTypeId === shareTypeId)
          .forEach((share) => transactionsToPost.push({
            shareId: share.id,
            amount: initialDeposit,
            comment: 'Initial Deposit',
          }));
      });

      const bulkTransactionReq: NewBulkTransactionRequest = {
        shares: transactionsToPost,
        skipNegative: true,
      };

      try {
        const transactions = await props.store.share.postBulkTransaction(bulkTransactionReq);
        console.debug('[New Share]: Share transactions posted.', transactions);
      } catch (e) {
        props.store.error.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }

      emit('ok');
    }

    // When the modal is shown, reset the templates and resolve the selection
    watchEffect(() => {
      if (props.show) {
        reset();
        resolveSelection();
      }
    });

    return {
      loading,
      templates,
      students,
      allowDuplicates,
      errors,
      canSubmit,
      handleCancel,
      handleOk,
    };
  },
});
</script>

<style lang="scss">
  .nshm {
    p {
      margin-bottom: 1em;
    }

    &--fieldset {
      margin-top: 1em;
    }

    .errors {
      margin-left: 2em;
    }
  }
</style>
