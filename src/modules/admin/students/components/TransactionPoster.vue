<template>
  <form class="transaction-poster" @submit.prevent="handleSubmit">
    <currency-input
      v-model="amount"
      v-model:error="amountError"
      label="Amount"
      help-text="Enter 0.00 to post a comment-only transaction."
      required
    />

    <base-input
      v-model="comment"
      v-model:error="commentError"
      label="Comment"
      :validator="validateTransactionComment"
    />

    <div class="fieldset">
      <button
        type="submit"
        class="primary"
        :disabled="loading || !isValid"
      >
        Post
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

// Utils
import Money from '@/utils/money';
import { validateTransactionComment } from '@/utils/validators';

// Components
import BaseInput from '@/components/BaseInput.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';

export default defineComponent({
  components: {
    BaseInput,
    CurrencyInput,
  },
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: [
    'submit',
  ],
  setup(props, { emit }) {
    const amount = ref('0.00');
    const amountError = ref('');
    const comment = ref('');
    const commentError = ref('');

    const isValid = computed(() => {
      if (amountError.value) return false;
      if (commentError.value) return false;
      return true;
    });

    function handleSubmit() {
      const mAmount = Money.fromStringOrDefault(amount.value);
      const sComment = comment.value ?? undefined;
      emit('submit', mAmount, sComment);
    }

    watch(() => props.loading, (newValue, oldValue) => {
      if (oldValue && !newValue) {
        amount.value = '0.00';
        comment.value = '';
      }
    });

    return {
      validateTransactionComment,
      amount,
      amountError,
      comment,
      commentError,
      isValid,
      handleSubmit,
    };
  },
});
</script>
