<template>
  <modal
    :show="show"
    cancel-label="Cancel"
    ok-label="Create"
    title="New Student"
    class="nsm large"
    :can-submit="canSubmit"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #default>
      <form @submit="onSubmit">
        <div class="nsm__fieldset">
          <label :for="`nsm__fieldset--accountNumber--${id}`">Account Number<span class="required">*</span></label>
          <Field
            :id="`nsm__fieldset--accountNumber--${id}`"
            name="accountNumber"
            type="text"
          />
          <p
            v-if="errors.accountNumber"
            class="error"
          >
            {{ errors.accountNumber }}
          </p>
        </div>
        <div class="nsm__fieldset">
          <label :for="`nsm__fieldset--email--${id}`">Email<span class="required">*</span></label>
          <Field
            :id="`nsm__fieldset--email--${id}`"
            name="email"
            type="text"
          />
          <p
            v-if="errors.email"
            class="error"
          >
            {{ errors.email }}
          </p>
        </div>
        <div class="nsm__fieldset">
          <label :for="`nsm__fieldset--firstName--${id}`">First Name<span class="required">*</span></label>
          <Field
            :id="`nsm__fieldset--firstName--${id}`"
            name="firstName"
            type="text"
          />
          <p
            v-if="errors.firstName"
            class="error"
          >
            {{ errors.firstName }}
          </p>
        </div>
        <div class="nsm__fieldset">
          <label :for="`nsm__fieldset--lastName--${id}`">Last Name<span class="required">*</span></label>
          <Field
            :id="`nsm__fieldset--lastName--${id}`"
            name="lastName"
            type="text"
          />
          <p
            v-if="errors.lastName"
            class="error"
          >
            {{ errors.lastName }}
          </p>
        </div>
      </form>

      <div class="nsm__shares">
        <h2>Share Types</h2>
        <p>Specify the share types you want to open for this student.</p>
        <div
          v-for="(share, index) in shareTemplate"
          :key="index"
          class="nsm__shares__fieldset"
        >
          <share-type-selector
            v-model="shareTemplate[index].shareType"
            class="nsm__shareTypeSelector"
          />

          <Field
            :id="`nsm__shares__initialDeposit__${index}`"
            v-model="shareTemplate[index].initialDeposit"
            :name="`initialDeposit[${index}]`"
            type="text"
            :rules="validateAmount"
          />

          <ErrorMessage :name="`initialDeposit[${index}]`" />

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
    </template>
    <template #okLabel="{okLabel}">
      <loading-icon :show="loading">
        {{ okLabel }}
      </loading-icon>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, computed, PropType } from 'vue';

// Components
import LoadingIcon from '@/components/LoadingIcon.vue';
import ShareTypeSelector from '@/modules/admin/components/ShareTypeSelector.vue';
import Modal from '@/components/Modal.vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { Field, ErrorMessage, useForm } from 'vee-validate';
import { validateAccountUnique, validateEmail, validateName } from '@/utils/validators';
import generatePassword from '@/utils/generatePassword';
import Money from '@/utils/money';

// Store
import errorStore from '@/store/error';
import { setup as defineStudentStore } from '@/modules/admin/stores/student';
import { setup as defineShareStore } from '@/modules/admin/stores/share';
import { GroupStore } from '../stores/group';

interface NewStudentForm {
  accountNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  initialDeposit: string[]|undefined;
}

interface ShareTemplate {
  shareType: ShareType|null;
  initialDeposit: string;
}

export default defineComponent({
  components: {
    Modal,
    Field,
    ErrorMessage,
    ShareTypeSelector,
    LoadingIcon,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    groupStore: {
      type: Object as PropType<GroupStore>,
      required: true,
    },
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    const studentStore = defineStudentStore();

    const shareStore = defineShareStore(studentStore);

    const loading = ref(false);

    // Pass in the instanceStore so the validator can check for existing students
    const validateAccount = validateAccountUnique({ instanceStore: props.groupStore.instanceStore });

    // Ensure the dollar amount for the initial deposit is valid.
    function validateAmount(value: string): string|boolean {
      const num = +value;
      if (Number.isNaN(num)) return 'Amount must be a number.';
      if (num < 0) return 'Amount cannot be negative for initial deposits.';
      return true;
    }

    // An array of new Share Types to create with initial values.  Also holds promise when they are submitted.
    const shareTemplate = ref<ShareTemplate[]>([]);

    // A unique ID for the form
    const id = uuid4();

    // A reference to the form
    const { resetForm, handleSubmit, errors, meta } = useForm<NewStudentForm>({
      validationSchema: {
        accountNumber: validateAccount,
        email: validateEmail,
        firstName: validateName,
        lastName: validateName,
      },
    });

    const canSubmit = computed(() => meta.value.valid && !loading.value);

    // Create the new student and emit the OK event
    const onSubmit = handleSubmit(async (values) => {
      loading.value = true;

      // Vee-validate is shoving initialDeposit form items in here too, delete them.
      const filtered = { ...values };
      delete filtered.initialDeposit;

      const newValues: NewStudentRequest = {
        ...filtered,
        password: generatePassword(),
        groupId: props.groupStore.selected.value?.id ?? -1,
      };

      try {
        const student = await studentStore.newStudent(newValues);

        const sharePromises: Promise<Share>[] = [];
        for (let i = 0; i < shareTemplate.value.length; i += 1) {
          const tpl = shareTemplate.value[i];
          if (tpl === null || tpl.shareType === null) return;

          sharePromises.push(
            shareStore.newShare({
              shareTypeId: tpl.shareType.id,
              studentId: student.id,
            }),
          );
        }

        // Luckilly, promises are returned in-order
        const shares = await Promise.all(sharePromises);

        // Loop through and post transactions, even 0 dollar transactions so there's an initial deposit.
        const transactions: Promise<void>[] = [];
        for (let i = 0; i < shares.length; i += 1) {
          const tpl = shareTemplate.value[i];
          const share = shares[i];

          if (!tpl.initialDeposit || Number.isNaN(+tpl.initialDeposit)) {
            tpl.initialDeposit = '0.00';
          }

          const amount = Money.fromNumber(+tpl.initialDeposit);

          transactions.push(shareStore.postTransaction({
            shareId: share.id,
            amount: amount.getAmount(),
            comment: 'Initial Deposit',
          }));
        }

        await Promise.all(transactions);
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }

      emit('ok');
    });

    // Funnel the OK button to the vee-validate submission logic
    function handleOk($e: MouseEvent|KeyboardEvent) { onSubmit($e); }

    // Just close the form
    function handleCancel() { emit('cancel'); }

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

    // Reset the form when the modal closes
    watchEffect(() => {
      if (props.show === false) {
        shareTemplate.value = [];
        resetForm();
      }
    });

    return {
      id,
      errors,
      onSubmit,
      handleOk,
      handleCancel,
      canSubmit,
      shareTemplate,
      validateAmount,
      removeShareType,
      addShareType,
      loading,
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
