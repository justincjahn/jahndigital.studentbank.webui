<template>
  <modal
    :show="show"
    cancelLabel="Cancel"
    okLabel="Post"
    @ok="handleOk"
    @cancel="handleCancel"
    title="Bulk Transaction"
    customClass="bulk-post-modal"
  >
    <template #default>
      <p>
        <template v-if="loading">Please wait...</template>
        <strong v-else-if="students.length <= 0" class="error">Please select some students to begin!</strong>
        <template v-else>
          This transaction will post to a total of {{students.length}}
          {{students.length > 1 ? 'students' : 'student'}}.
        </template>
      </p>

      <div class="bulk-post-modal__share-type" v-if="step > 0">
        <h2>Step 1: Select a Share Type</h2>
        <p>Funds will be deposited or withdrawn from the first share of the type you select.</p>
        <share-type-selector :selectedValue="shareType" @select="handleShareTypeSelection" />
        <p class="error" v-if="stepOneError !== null">{{stepOneError}}</p>
      </div>

      <div class="bulk-post-modal__amount" v-if="step > 1">
        <h2>Step 2: Choose an Amount</h2>
        <form @click.prevent>
          <div class="bulk-post-modal__amount--fieldset">
            <label for="bulk-post-modal__amount--fieldset--amount">Amount</label>
            <input id="bulk-post-modal__amount--fieldset--amount" type="text" name="amount" v-model="amount" />
            <p class="error" v-if="amountError">{{amountError}}</p>
          </div>
          <div class="bulk-post-modal__amount--fieldset">
            <label for="bulk-post-modal__amount--fieldset--comment">Comment</label>
            <input id="bulk-post-modal__amount--fieldset--comment" type="text" name="comment" v-model="comment" />
            <p class="error" v-if="commentError">{{commentError}}</p>
          </div>
        </form>
      </div>
    </template>
    <template #buttons="{ okLabel, handleOk, cancelLabel, handleCancel }">
      <button @click.prevent="handleCancel">{{cancelLabel}}</button>
      <button class="primary" :disabled="!isValid || loading" @click.prevent="handleOk">{{okLabel}}</button>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { useField } from 'vee-validate';
import Money from '@/utils/money';
import selection from '@/services/StudentSelectionService';
import Modal from '@/components/Modal.vue';
import ShareTypeSelector from '@/components/ShareTypeSelector.vue';

export default defineComponent({
  components: {
    Modal,
    ShareTypeSelector,
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
    const loading = ref(false);
    const students = ref<Student[]>([]);
    const selectedShares = ref<Share[]>([]);
    const shareType = ref<ShareType|null>(null);
    const step = ref<number>(1);
    const stepOneError = ref<string|null>(null);

    // Field to specify the amount
    const amountField = useField('amount', (value: string) => {
      if (!value || value.length === 0) return 'Specify an amount.';

      const num = +value;
      if (Number.isNaN(num)) return 'Amount must be a number.';
      if (Money.round(num) === 0) return 'Amount cannot be zero.';

      return true;
    }, {
      initialValue: '0.00',
    });

    // Field to specify the comment (if any)
    const commentField = useField('comment', (value: string) => {
      if (value && value.length > 255) return 'Comment can only be 255 characters.';
      return true;
    }, {
      initialValue: '',
    });

    // Computed property to ensure the form is valid and postable.
    const isValid = computed(() => {
      if (loading.value) return false;
      if (students.value.length === 0) return false;
      if (shareType.value === null) return false;
      return true;
    });

    /**
     * Fired when the user clicks 'OK', or hits Enter.
     */
    function handleOk() {
      // Only allow the posting logic to run if there is a valid state.
      if (!isValid.value) return;
      emit('ok');
    }

    /**
     * Fired when the user clicks 'Cancel', or hits Esc.
     */
    function handleCancel() {
      emit('cancel');
    }

    /**
     * When a share type is selected, select the first share for each student and move on
     * to step 2.
     */
    function handleShareTypeSelection(item: ShareType|null) {
      if (item === null) {
        stepOneError.value = null;
        return;
      }

      // Filter only students that have a share with the correct type
      const studentsWithShares = students.value?.filter(
        (student) => (student.shares?.findIndex((share) => share.shareTypeId === item.id) ?? -1) >= 0
      );

      // Get a list of shares from that list with the correct type
      const shares: Share[] = [];
      studentsWithShares.forEach((student) => {
        const studentShares = student.shares?.sort((a, b) => a.id - b.id) ?? [];
        const share = studentShares?.find((sh) => sh.shareTypeId === item.id);
        if (share) shares.push(share);
      });

      const diff = students.value.length - studentsWithShares.length;
      if (diff > 0) {
        stepOneError.value = `Warning: There are ${diff} students without the selected share type.`;
      } else {
        stepOneError.value = null;
      }

      shareType.value = item;
      step.value = 2;
      selectedShares.value = shares;
    }

    // Fetch the selected students when the modal is shown.
    watchEffect(async () => {
      if (props.show) {
        step.value = 1;
        shareType.value = null;
        amountField.resetField();
        commentField.resetField();
        loading.value = true;
        students.value = await selection.resolve();
        loading.value = false;
      }
    });

    return {
      handleOk,
      handleCancel,
      handleShareTypeSelection,
      isValid,
      selection,
      students,
      loading,
      step,
      stepOneError,
      amount: amountField.value,
      amountError: amountField.errorMessage,
      comment: commentField.value,
      commentError: commentField.errorMessage,
      shareType,
    };
  },
});
</script>

<style lang="scss">
.bulk-post-modal {
  p + p, h2 {
    margin-top: 1em;
  }
}
</style>
