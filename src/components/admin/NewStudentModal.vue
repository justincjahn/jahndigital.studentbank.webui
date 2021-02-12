<template>
  <modal
    :show="show"
    cancelLabel="Cancel"
    okLabel="Create"
    @ok="handleOk"
    @cancel="handleCancel"
    title="New Student"
    customClass="nsm"
  >
    <form @submit.prevent="onSubmit">
      <div class="nsm__fieldset">
        <label :for="`nsm__fieldset--accountNumber--${id}`">Account Number<span class="required">*</span></label>
        <Field name="accountNumber" type="text" :id="`nsm__fieldset--accountNumber--${id}`" />
        <p v-if="errors.accountNumber" class="error">{{errors.accountNumber}}</p>
      </div>
      <div class="nsm__fieldset">
        <label :for="`nsm__fieldset--email--${id}`">Email<span class="required">*</span></label>
        <Field name="email" type="text" :id="`nsm__fieldset--email--${id}`" />
        <p v-if="errors.email" class="error">{{errors.email}}</p>
      </div>
      <div class="nsm__fieldset">
        <label :for="`nsm__fieldset--firstName--${id}`">First Name<span class="required">*</span></label>
        <Field name="firstName" type="text" :id="`nsm__fieldset--firstName--${id}`" />
        <p v-if="errors.firstName" class="error">{{errors.firstName}}</p>
      </div>
      <div class="nsm__fieldset">
        <label :for="`nsm__fieldset--lastName--${id}`">Last Name<span class="required">*</span></label>
        <Field name="lastName" type="text" :id="`nsm__fieldset--lastName--${id}`" />
        <p v-if="errors.lastName" class="error">{{errors.lastName}}</p>
      </div>
    </form>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, PropType } from 'vue';
import Modal from '@/components/Modal.vue';
import { Field, useForm } from 'vee-validate';
import uuid4 from '@/utils/uuid4';
import { GroupStore } from '@/store/group';
import { validateAccountUnique, validateEmail, validateName } from '@/utils/validators';

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
    // Pass in the instanceStore so the validator can check for existing students
    const validateAccount = validateAccountUnique({ instanceStore: props.groupStore.instanceStore });

    // A unique ID for the form
    const id = uuid4();

    // A reference to the form
    const theForm = ref<HTMLFormElement|null>(null);

    // A reference to the form
    const { resetForm, handleSubmit, errors } = useForm<NewStudentForm>({
      validationSchema: {
        accountNumber: validateAccount,
        email: validateEmail,
        firstName: validateName,
        lastName: validateName,
      },
    });

    // Create the new student and emit the OK event
    const onSubmit = handleSubmit(async (values) => {
      const newValues: NewStudentRequest = {
        ...values,
        groupId: props.groupStore.selected.value?.id ?? -1,
      };

      console.log('values', newValues);
      emit('ok');
    });

    // Funnel the OK button to the vee-validate submission logic
    async function handleOk() { onSubmit(null); }

    // Just close the form
    function handleCancel() { emit('cancel'); }

    // Reset the form when the modal opens
    watchEffect(() => { if (props.show === true) resetForm(); });

    return {
      id,
      theForm,
      errors,
      onSubmit,
      handleOk,
      handleCancel,
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
}
</style>
