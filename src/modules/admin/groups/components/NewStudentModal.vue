<template>
  <modal
    cancel-label="Cancel"
    ok-label="Create"
    title="New Student"
    class="nsm large"
    :show="show"
    :can-submit="canSubmit"
    :can-cancel="!loading"
    :handle-enter="canSubmit"
    :handle-escape="!loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #default>
      <form @submit.prevent>
        <base-input
          v-model="formData.data.accountNumber"
          v-model:error="formData.errors.accountNumber"
          label="Account Number"
          required
          :validator="validateAccount"
        />

        <base-input
          v-model="formData.data.firstName"
          v-model:error="formData.errors.firstName"
          label="First Name"
          required
          :validator="validateName"
        />

        <base-input
          v-model="formData.data.lastName"
          v-model:error="formData.errors.lastName"
          label="Last Name"
          required
          :validator="validateName"
        />

        <base-input
          v-model="formData.data.email"
          v-model:error="formData.errors.email"
          label="Email Address"
          :validator="validateEmailOptional"
        />
      </form>

      <div class="nsm__shares">
        <h2>Share Types</h2>

        <p class="help-text">
          Specify the share types you want to open for this student.
        </p>

        <share-type-template-builder
          v-model="shareTemplate"
          :store="store"
        />
      </div>
    </template>
    <template #okLabel="{okLabel}">
      <loading-label :show="loading">
        {{ okLabel }}
      </loading-label>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watchEffect, computed, PropType } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import BaseInput from '@/components/BaseInput.vue';
import LoadingLabel from '@/components/LoadingLabel.vue';
import ShareTypeTemplateBuilder from '@/modules/admin/components/ShareTypeTemplateBuilder.vue';

// Utils
import { validateAccountUnique, validateEmailOptional, validateName, validateAmountNotNegative } from '@/utils/validators';
import generatePassword from '@/utils/generatePassword';
import Money from '@/utils/money';

// Store
import { GlobalStore } from '../../stores/global';

interface NewStudentForm {
  accountNumber: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default defineComponent({
  components: {
    BaseInput,
    Modal,
    LoadingLabel,
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
    'cancel',
  ],
  setup(props, { emit }) {
    // True when the modal is posting to the API
    const loading = ref(false);

    // Pass in the instanceStore so the validator can check for existing students
    const validateAccount = validateAccountUnique({ instanceStore: props.store.instance });

    // An array of new Share Types to create with initial values.
    const shareTemplate = ref<ShareTypeTemplate[]>([]);

    // Initial values for the form
    const initialValues = {
      data: {
        accountNumber: '',
        firstName: '',
        lastName: '',
        email: '',
      },
      errors: {
        accountNumber: '',
        firstName: '',
        lastName: '',
        email: '',
      },
    };

    // Data by the form
    const formData = reactive({
      ...initialValues,
    });

    // True if there are no errors in the ShareTemplate array and all share types are selected
    const shareTemplateValid = computed(() => {
      let i = 0;

      shareTemplate.value.forEach((x) => {
        if (x.error !== '') i += 1;
        if (x.shareType === null) i += 1;
      });

      return i === 0;
    });

    // True if the modal can be submitted
    const canSubmit = computed(() => {
      if (loading.value) return false;
      if (!shareTemplateValid.value) return false;
      return Object.values(formData.errors).filter((error) => error.length !== 0).length === 0;
    });

    // Create the new student and emit the OK event
    async function handleOk() {
      loading.value = true;

      const newValues: NewStudentRequest = {
        ...formData.data,
        password: generatePassword(),
        groupId: props.store.group.selected.value?.id ?? -1,
      };

      try {
        const student = await props.store.student.newStudent(newValues);

        // Create every share
        const sharePromises: Promise<Share>[] = [];
        for (let i = 0; i < shareTemplate.value.length; i += 1) {
          const tpl = shareTemplate.value[i];
          if (tpl === null || tpl.shareType === null) return;

          sharePromises.push(props.store.share.newShare({
            shareTypeId: tpl.shareType.id,
            studentId: student.id,
          }));
        }

        // Promises are returned in order
        const shares = await Promise.all(sharePromises);

        // Post initial balances
        const transactions: Promise<void>[] = [];
        for (let i = 0; i < shares.length; i += 1) {
          const tpl = shareTemplate.value[i];
          const share = shares[i];

          if (!tpl.initialDeposit) {
            tpl.initialDeposit = '0.00';
          }

          const amount = Money.fromStringOrDefault(tpl.initialDeposit);

          transactions.push(props.store.share.postTransaction({
            shareId: share.id,
            amount: amount.getAmount(),
            comment: 'Initial Deposit',
          }));
        }

        await Promise.all(transactions);
        emit('ok', student);
      } catch (e) {
        props.store.error.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    }

    /**
     * Tell the parent the user wants to cancel the operation
     */
    function handleCancel() { emit('cancel'); }

    /**
     * Reset the form to default values
     */
    function reset() {
      shareTemplate.value = [];
      formData.data = { ...initialValues.data };
      formData.errors = { ...initialValues.errors };
    }

    // Reset the form when the modal opens and fetch share types
    watchEffect(async () => {
      if (props.show) {
        reset();

        loading.value = true;

        try {
          await props.store.shareType.fetch();
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      validateAccount,
      validateName,
      validateEmailOptional,
      validateAmount: validateAmountNotNegative,
      loading,
      shareTemplate,
      formData,
      handleOk,
      handleCancel,
      canSubmit,
    };
  },
});
</script>

<style lang="scss">
.nsm {
  &__fieldset {
    display: flex;
    flex-direction: column;
    margin: 0.5em;
  }

  &__shares {
    margin: 0.5em;
  }
}
</style>
