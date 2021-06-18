<template>
  <modal
    :show="show"
    title="Bulk Transaction"
    class="bpm large"
    cancel-label="Cancel"
    ok-label="Post"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #default>
      <!-- Step 1 -->
      <div
        v-if="currentStep === 1"
        class="bpm__step-1"
      >
        <h2>Step 1: Select a Share Type</h2>

        <p class="bpm__step-1__selected-students">
          <template v-if="loading">
            Please wait...
          </template>
          <strong
            v-else-if="students.length <= 0"
            class="error"
          >
            Please select some students to begin!
          </strong>
          <template v-else>
            You have {{ students.length }} {{ students.length > 1 ? 'students' : 'student' }} selected.
          </template>
        </p>

        <p class="bpm__step-1__share-type-selection">
          Funds will be deposited or withdrawn from the first share of the type you select:
        </p>

        <share-type-selector
          :model-value="selectedShareType"
          :share-type-store="shareTypeStore"
          @update:modelValue="handleShareTypeSelection"
        />

        <p
          v-if="errors[1] !== null"
          class="bpm__step-1__error error"
        >
          {{ errors[1] }}
        </p>
      </div>

      <!-- Step 2 -->
      <div
        v-if="currentStep === 2"
        class="bpm__step-2"
      >
        <h2>Step 2: Choose an Amount</h2>

        <div class="bpm__step-2__fieldset">
          <label for="bpm__step-2--amount">Amount</label>
          <currency-input
            id="bpm__step-2--amount"
            v-model="amountValue"
            v-model:error="amountError"
            :validator="validateAmount"
          />
          <p
            v-if="amountError && amountError.length > 0"
            class="error"
          >
            {{ amountError }}
          </p>
        </div>

        <div class="bpm__step-2__fieldset">
          <label for="bpm__step-2--comment">Comment</label>
          <input
            id="bpm__step-2--comment"
            v-model="commentValue"
            type="text"
            name="comment"
            @update:modelValue="trySetComment"
          />
          <p
            v-if="commentError"
            class="error"
          >
            {{ commentError }}
          </p>
        </div>

        <div class="bpm__step-2__fieldset">
          <h3>Posting Policy</h3>

          <div class="bpm__step-2__fieldset__item">
            <input
              id="bpm__step-2--policy-none"
              type="radio"
              name="postingPolicy"
              :checked="postingPolicy === PostingPolicy.none"
              @click="setPostingPolicy(PostingPolicy.none)"
            />
            <label for="bpm__step-2--policy-none">None</label>
            <span class="light">Fail if any shares are taken negative.</span>
          </div>

          <div class="bpm__step-2__fieldset__item">
            <input
              id="bpm__step-2--policy-take"
              type="radio"
              name="postingPolicy"
              :checked="postingPolicy === PostingPolicy.take"
              @click="setPostingPolicy(PostingPolicy.take)"
            />
            <label for="bpm__step-2--policy-take">Take Negative</label>
            <span class="light">Allow shares to be taken negative.</span>
          </div>

          <div class="bpm__step-2__fieldset__item">
            <input
              id="bpm__step-2--policy-skip"
              type="radio"
              name="postingPolicy"
              :checked="postingPolicy === PostingPolicy.skip"
              @click="setPostingPolicy(PostingPolicy.skip)"
            />
            <label for="bpm__step-2--policy-skip">Skip Negative</label>
            <span class="light">Skip shares that would be taken negative.</span>
          </div>
        </div>

        <p
          v-if="errors[2] !== null"
          class="bpm__step-2__error error"
        >
          {{ errors[2] }}
        </p>
      </div>

      <!-- Step 3 -->
      <div
        v-if="currentStep === 3"
        class="bpm__step-3"
      >
        <h2>Step 3: Review</h2>

        <table class="bpm__step-3__shares selectable">
          <thead>
            <tr>
              <th>Group</th>
              <th>Account Number</th>
              <th>Student Name</th>
              <th>Share</th>
              <th>Current Balance</th>
              <th>Anticipated Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="share in sampleShares"
              :key="share.id"
            >
              <td>{{ getGroupName(share) }}</td>
              <td>{{ getAccountNumber(share) }}</td>
              <td>{{ getStudentName(share) }}</td>
              <td>{{ shareTypeName }}</td>
              <td>
                {{ new Intl.NumberFormat(
                  'en-US',
                  {
                    style: 'currency',
                    currency: 'USD',
                  }
                ).format(share.balance) }}
              </td>
              <td>
                {{ new Intl.NumberFormat(
                  'en-US',
                  {
                    style: 'currency',
                    currency: 'USD',
                  }
                ).format(getEffectiveBalance(share)) }}
              </td>
            </tr>
          </tbody>
        </table>
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
        @click.prevent="incrementStep"
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
          <loading-label>Posting...</loading-label>
        </template>
      </button>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, watchEffect, computed, ref, PropType } from 'vue';

// Components
import Modal from '@/components/Modal.vue';
import ShareTypeSelector from '@/modules/admin/components/ShareTypeSelector.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';
import LoadingLabel from '@/components/LoadingLabel.vue';

// Stores
import errorStore from '@/stores/error';
import { setup as defineBulkPostStore, PostingPolicy } from '@/modules/admin/groups/stores/bulkPost';
import { ShareTypeStore } from '@/modules/admin/stores/shareType';
import { GroupStore } from '../stores/group';

export default defineComponent({
  components: {
    Modal,
    ShareTypeSelector,
    CurrencyInput,
    LoadingLabel,
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
    shareTypeStore: {
      type: Object as PropType<ShareTypeStore>,
      required: true,
    },
  },
  emits: [
    'ok',
    'cancel',
  ],
  setup(props, { emit }) {
    // Create a new instance of the bulk post store
    const bulkPostStore = defineBulkPostStore();

    // Generate a shorthand name for the selected share
    const shareTypeName = computed(() => bulkPostStore.selectedShareType.value?.name.toUpperCase().substring(0, 3) ?? 'UNK');

    // Form value for the amount
    const amountValue = ref('0.00');

    // Error message for the amount field, if any.
    const amountError = ref('');

    // Form value for the comment
    const commentValue = ref('');

    // Error message for the comment field, if any.
    const commentError = ref('');

    /**
     * Tries to set the amount and sets an error if it's invalid.
     */
    function validateAmount(value: string): string|boolean {
      try {
        bulkPostStore.setAmount(value);
      } catch (e) {
        return (e?.message ?? e) as string;
      }

      return true;
    }

    /**
     * Tries to set the comment and sets an error if it's invalid.
     */
    function trySetComment(value: string) {
      commentValue.value = value;

      try {
        bulkPostStore.setComment(value);
        commentError.value = '';
      } catch (e) {
        commentError.value = e?.message ?? e;
      }
    }

    /**
     * Get the first and last name of the student who owns the provided share.
     */
    function getStudentName(share: Share) {
      const student = bulkPostStore.studentMap.value.get(share.id);

      if (student) {
        return `${student.lastName}, ${student.firstName}`;
      }

      return 'Unknown';
    }

    /**
     * Get the account number of the student who owns the provided share.
     */
    function getAccountNumber(share: Share) {
      const student = bulkPostStore.studentMap.value.get(share.id);

      if (student) {
        return student.accountNumber;
      }

      return '0000000000';
    }

    /**
     * Get the group name for the given student.
     */
    function getGroupName(share: Share) {
      const student = bulkPostStore.studentMap.value.get(share.id);

      if (student) {
        const group = props.groupStore.groups.value.find((x) => x.id === student.groupId);
        if (group) return group.name;
      }

      return 'Unknown';
    }

    /**
     * Fired when the user clicks 'OK', or hits Enter.  Either moves to the next step
     * or attempts to post the transactions and emits an 'ok' event.
     */
    async function handleOk() {
      // Only allow the posting logic to run if there is a valid state.
      if (bulkPostStore.isValid.value !== true) return;

      if (bulkPostStore.hasNextStep.value) {
        bulkPostStore.incrementStep();
        return;
      }

      // We're on the last step
      try {
        const data = await bulkPostStore.post();
        emit('ok', data);
      } catch (e) {
        errorStore.setCurrentError(e?.message ?? e);
      }
    }

    /**
     * Fired when the user clicks 'Cancel', or hits Esc.
     */
    function handleCancel() {
      emit('cancel');
    }

    /**
     * When a share type is selected, select the first share for each student.
     */
    function handleShareTypeSelection(item: ShareType|null) {
      bulkPostStore.setSelectedShareType(item);
    }

    // Fetch the selected students and refresh share types when the modal is shown.
    watchEffect(() => {
      if (props.show) {
        bulkPostStore.reset();
        amountValue.value = '0.00';
        commentValue.value = '';
        bulkPostStore.fetchSelection();
        props.shareTypeStore.fetch();
      }
    });

    return {
      handleOk,
      handleCancel,
      handleShareTypeSelection,
      getStudentName,
      getAccountNumber,
      getGroupName,
      shareTypeName,
      amountValue,
      amountError,
      validateAmount,
      commentValue,
      commentError,
      trySetComment,
      PostingPolicy,
      ...bulkPostStore,
    };
  },
});
</script>

<style lang="scss">
  .bpm {
    &__step-1 {
      &__selected-students {
        margin-bottom: .75em;
      }

      &__error {
        margin-top: 1em;
        font-weight: bold;
      }
    }

    &__step-2 {
      &__fieldset {
        display: flex;
        flex-direction: column;
        margin-bottom: 1em;

        .currency-input input {
          width: 100%;
        }

        &__item {
          input, label {
            margin-right: 0.5em;
          }

          .light {
            font-size: 0.8em;
            font-weight: 300;
          }
        }
      }

      h3 {
        margin-bottom: 0.25em;
      }
    }

    &__step-3 {
      &__shares {
        @include round-border;
      }
    }
  }
</style>
