<template>
  <modal
    :show="show"
    cancel-label="Cancel"
    ok-label="Create"
    title="New Student"
    class="nsm large"
    @ok="handleOk"
    @cancel="handleCancel"
  >
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
          v-model="shareTemplate[index]"
          class="nsm__sharTypeSelector"
        />
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
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, PropType } from 'vue';
import Modal from '@/components/Modal.vue';
import uuid4 from '@/utils/uuid4';
import { GroupStore } from '@/store/group';
import { setup as setupStudentStore } from '@/store/student';
import { setup as setupShareStore } from '@/store/share';
import errorStore from '@/store/error';
import { validateAccountUnique, validateEmail, validateName } from '@/utils/validators';
import generatePassword from '@/utils/generatePassword';
import { Field, useForm } from 'vee-validate';
import ShareTypeSelector from '../ShareTypeSelector.vue';

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
    ShareTypeSelector,
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

    const shareTemplate = ref<(ShareType|null)[]>([]);

    // A unique ID for the form
    const id = uuid4();

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
        password: generatePassword(),
        groupId: props.groupStore.selected.value?.id ?? -1,
      };

      const studentStore = setupStudentStore();
      const shareStore = setupShareStore(studentStore);

      try {
        const student = await studentStore.newStudent(newValues);

        const results: Promise<Share>[] = [];
        shareTemplate.value.forEach((tpl) => {
          if (tpl === null) return;

          results.push(shareStore.newShare({
            shareTypeId: tpl.id,
            studentId: student.id,
          }));
        });

        await Promise.all(results);

        // TODO: Initial amounts for new shares.
        // TODO: Refresh selected group to add students?
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }

      emit('ok');
    });

    // Funnel the OK button to the vee-validate submission logic
    function handleOk($e: MouseEvent|KeyboardEvent) { onSubmit($e); }

    // Just close the form
    function handleCancel() { emit('cancel'); }

    // Add a new element to the shareTemplate array, triggering a share type selector
    function addShareType() {
      shareTemplate.value = [...shareTemplate.value, null];
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
      shareTemplate,
      removeShareType,
      addShareType,
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
