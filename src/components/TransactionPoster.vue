<template>
  <div class="transaction-poster" v-if="share !== null">
    <form @submit.prevent="onSubmit" autocomplete="off">
      <div class="transaction-poster--form-group">
        <label for="transaction-poster__amount">Amount<span class="required">*</span></label>
        <div class="transaction-poster__amount--wrapper">
          <span class="transaction-poster__amount--currency">$</span>
          <Field
            name="amount"
            type="text"
            id="transaction-poster__amount"
          />
        </div>
        <p class="error" v-if="errors.amount">{{errors.amount}}</p>
      </div>
      <div class="transaction-poster--form-group">
        <label for="transaction-poster__comment">Comment</label>
        <Field
          name="comment"
          type="text"
          id="transaction-poster__comment"
        />
        <p class="error" v-if="errors.comment">{{errors.comment}}</p>
      </div>
      <div class="transaction-poster--submit-group">
        <input
          type="submit"
          class="primary"
          value="Post"
          :disabled="loading"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useForm, Field } from 'vee-validate';
import Money from '@/utils/money';

export default defineComponent({
  props: {
    share: {
      type: Object as () => Share|null,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    Field,
  },
  setup(_, { emit }) {
    const { errors, resetForm, handleSubmit } = useForm({
      validationSchema: {
        amount: (value: string) => {
          if (!value || value.length === 0) return 'Specify an amount.';

          const num = +value;
          if (Number.isNaN(num)) return 'Amount must be a number.';
          if (Money.round(num) === 0) return 'Amount cannot be zero.';

          return true;
        },
        comment: (value: string) => {
          if (value && value.length > 255) return 'Comment can only be 255 characters.';
          return true;
        },
      },
      initialValues: {
        amount: '0.00',
        comment: '',
      },
    });

    /**
     * Fire off an update when the user submits the form.
     */
    const onSubmit = handleSubmit(async (values) => {
      const amount = Money.fromNumber(+values.amount);
      emit('submit', amount, values.comment);
      resetForm();
    });

    return {
      errors,
      onSubmit,
    };
  },
});
</script>

<style lang="scss">
.transaction-poster {
  @include round-border;

  background-color: colorStep(secondary, $step: 0, $darken: false);
  padding: 1em;

  &--form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5em;

    p.error {
      font-style: italic;
      color: map.get($theme, button-destructive, color);
      margin: 0.5em 0;
    }
  }

  &__amount--wrapper {
    position: relative;
  }

  &__amount--currency {
    position: absolute;
    top: calc(0.4em / 2);
    left: 1ch;
    user-select: none;
  }

  label span.required {
    font-size: 0.7em;
    color: map.get($theme, button-destructive, color);
    vertical-align: super;
  }

  input[type=submit] {
    width: 100%;
  }
}

#transaction-poster__amount {
  width: 100%;
  padding-left: 3ch;
}
</style>
