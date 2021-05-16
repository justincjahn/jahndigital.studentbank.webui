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

        <div class="nsm__fieldset">
          <label :for="`nsm__fieldset--email--${id}`">Email</label>

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
      </form>

      <div class="nsm__shares">
        <h2>Share Types</h2>
        <p>Specify the share types you want to open for this student.</p>

        <share-type-template-builder
          v-model="shareTemplate"
          :share-type-store="shareTypeStore"
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
import { defineComponent, ref, watchEffect, computed, PropType } from 'vue';

// Components
import LoadingLabel from '@/components/LoadingLabel.vue';
import ShareTypeTemplateBuilder from '@/modules/admin/components/ShareTypeTemplateBuilder.vue';
import Modal from '@/components/Modal.vue';

// Utils
import uuid4 from '@/utils/uuid4';
import { Field, useForm } from 'vee-validate';
import { validateAccountUnique, validateEmailOptional, validateName, validateAmountNotNegative } from '@/utils/validators';
import generatePassword from '@/utils/generatePassword';
import Money from '@/utils/money';

// Store
import errorStore from '@/store/error';
import { setup as defineStudentStore } from '@/modules/admin/stores/student';
import { setup as defineShareStore } from '@/modules/admin/stores/share';
import { setup as defineShareTypeStore } from '@/modules/admin/stores/shareType';
import { GroupStore } from '../stores/group';

interface NewStudentForm {
  accountNumber: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default defineComponent({
  components: {
    Modal,
    Field,
    LoadingLabel,
    ShareTypeTemplateBuilder,
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
    // Used to manage Share Types
    const shareTypeStore = defineShareTypeStore(props.groupStore.instanceStore);

    // Used to create new students
    const studentStore = defineStudentStore();

    // Used to create new shares on the student
    const shareStore = defineShareStore(studentStore);

    // True when the modal is posting to the API
    const loading = ref(false);

    // Pass in the instanceStore so the validator can check for existing students
    const validateAccount = validateAccountUnique({ instanceStore: props.groupStore.instanceStore });

    // An array of new Share Types to create with initial values.
    const shareTemplate = ref<ShareTypeTemplate[]>([]);

    // A unique ID for the form
    const id = uuid4();

    // A reference to the form
    const { resetForm, handleSubmit, errors, meta } = useForm<NewStudentForm>({
      validationSchema: {
        accountNumber: validateAccount,
        email: validateEmailOptional,
        firstName: validateName,
        lastName: validateName,
      },
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
    const canSubmit = computed(() => meta.value.valid && !loading.value && shareTemplateValid.value);

    // Create the new student and emit the OK event
    const onSubmit = handleSubmit(async (values) => {
      loading.value = true;

      // Vee-validate is shoving initialDeposit form items in here too, delete them.
      const filtered = { ...values };

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

        // Promises are returned in-order
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
        emit('ok', student);
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      } finally {
        loading.value = false;
      }
    });

    // Funnel the OK button to the vee-validate submission logic
    function handleOk($e: MouseEvent|KeyboardEvent) { onSubmit($e); }

    // Just close the form
    function handleCancel() { emit('cancel'); }

    // Reset the form when the modal opens and fetch share types
    watchEffect(() => {
      if (props.show) {
        shareTemplate.value = [];
        shareTypeStore.fetch();
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
      validateAmount: validateAmountNotNegative,
      loading,
      shareTypeStore,
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
