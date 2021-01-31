<template>
  <modal
    :show="show"
    cancelLabel="Cancel"
    okLabel="Post"
    @ok="handleOk"
    @cancel="handleCancel"
    title="Bulk Transaction"
    customClass="bpm large"
  >
    <template #default>
      <!-- Step 1 -->
      <div class="bpm__step-1" v-if="state.currentStep === 1">
        <h2>Step 1: Select a Share Type</h2>

        <p class="bpm__step-1__selected-students">
          <template v-if="state.isLoading">Please wait...</template>
          <strong v-else-if="state.students.length <= 0" class="error">Please select some students to begin!</strong>
          <template v-else>
            You have {{state.students.length}} {{state.students.length > 1 ? 'students' : 'student'}} selected.
          </template>
        </p>

        <p class="bpm__step-1__share-type-selection">
          Funds will be deposited or withdrawn from the first share of the type you select:
        </p>

        <share-type-selector :modelValue="state.selectedShareType" @update:modelValue="handleShareTypeSelection" />

        <p class="bpm__step-1__error error" v-if="state.errors[1] !== null">{{state.errors[1]}}</p>
      </div>

      <!-- Step 2 -->
      <div class="bpm__step-2" v-if="state.currentStep === 2">
        <h2>Step 2: Choose an Amount</h2>

        <div class="bpm__step-2__fieldset">
          <label for="bpm__step-2--amount">Amount</label>
          <div class="bpm__step-2__fieldset__amount-wrapper">
            <span class="bpm__step-2__fieldset__amount-wrapper__currency">$</span>
            <input
              type="text"
              name="amount"
              id="bpm__step-2--amount"
              @focus="$event.target.select()"
              v-model="state.amountField.value" />
          </div>
          <p class="error" v-if="state.amountField.errorMessage">{{state.amountField.errorMessage}}</p>
        </div>

        <div class="bpm__step-2__fieldset">
          <label for="bpm__step-2--comment">Comment</label>
          <input
            type="text"
            name="comment"
            id="bpm__step-2--comment"
            v-model="state.commentField.value" />
          <p class="error" v-if="state.commentField.errorMessage">{{state.commentField.errorMessage}}</p>
        </div>

        <div class="bpm__step-2__fieldset">
          <h3>Posting Policy</h3>

          <div class="bpm__step-2__fieldset__item">
            <input
              type="radio"
              name="postingPolicy"
              id="bpm__step-2--policy-none"
              v-model="state.postingPolicyField.value"
              value="none" />
            <label for="bpm__step-2--policy-none">None</label>
            <span class="light">Fail if any shares are taken negative.</span>
          </div>

          <div class="bpm__step-2__fieldset__item">
            <input
              type="radio"
              name="postingPolicy"
              id="bpm__step-2--policy-take"
              v-model="state.postingPolicyField.value"
              value="take" />
            <label for="bpm__step-2--policy-take">Take Negative</label>
            <span class="light">Allow shares to be taken negative.</span>
          </div>

          <div class="bpm__step-2__fieldset__item">
            <input
              type="radio"
              name="postingPolicy"
              id="bpm__step-2--policy-skip"
              v-model="state.postingPolicyField.value"
              value="skip" />
            <label for="bpm__step-2--policy-skip">Skip Negative</label>
            <span class="light">Skip shares that would be taken negative.</span>
          </div>
        </div>

        <p class="bpm__step-2__error error" v-if="state.errors[2] !== null">{{state.errors[2]}}</p>
      </div>

      <!-- Step 3 -->
      <div class="bpm__step-3" v-if="state.currentStep === 3">
        <h2>Step 3: Review</h2>

        <table class="bpm__step-3__shares">
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
            <tr v-for="share in randomShares" :key="share.id">
              <td>{{getGroupName(share)}}</td>
              <td>{{getAccountNumber(share)}}</td>
              <td>{{getStudentName(share)}}</td>
              <td>{{shareTypeName}}</td>
              <td>
                {{new Intl.NumberFormat(
                  'en-US',
                  {
                    style: 'currency',
                    currency: 'USD',
                  }
                ).format(share.balance)}}
              </td>
              <td>
                {{new Intl.NumberFormat(
                  'en-US',
                  {
                    style: 'currency',
                    currency: 'USD',
                  }
                ).format(getEffectiveBalance(share))}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template #buttons="{ okLabel, handleOk, cancelLabel, handleCancel }">
      <button @click.prevent="handleCancel">{{cancelLabel}}</button>
      <button @click.prevent="state.decrementStep()" v-if="state.hasPreviousStep()">Previous</button>
      <button :disabled="!isValid" @click.prevent="state.incrementStep()" v-if="state.hasNextStep()">Next</button>
      <button class="primary" :disabled="!isValid" @click.prevent="handleOk" v-if="!state.hasNextStep()">
        <template v-if="!state.isLoading">{{okLabel}}</template>
        <template v-else><loading-icon>Posting...</loading-icon></template>
      </button>
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, watchEffect, computed, reactive, ref } from 'vue';
import sample from '@/utils/sample';
import BulkPostService from '@/services/BulkPostService';
import Modal from '@/components/Modal.vue';
import ShareTypeSelector from '@/components/ShareTypeSelector.vue';
import Money from '@/utils/money';
import groupStore from '@/store/group';
import LoadingIcon from '@/components/LoadingIcon.vue';
import errorStore from '@/store/error';

export default defineComponent({
  components: {
    Modal,
    ShareTypeSelector,
    LoadingIcon,
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
    const bulkPostState = reactive(new BulkPostService());
    const timerFunc = ref<number>(-1);
    const sampleStudents = ref<Map<number, Student>>(new Map<number, Student>());

    // Computed property to ensure the form is valid and postable.
    const isValid = computed(() => {
      // eslint-disable-next-line no-unreachable
      if (bulkPostState.isLoading) return false;
      if (bulkPostState.students.length === 0) return false;

      if (bulkPostState.currentStep >= 1) {
        if (bulkPostState.selectedShareType === null) return false;
      }

      if (bulkPostState.currentStep >= 2) {
        if (bulkPostState.amountField.errorMessage) return false;
        if (bulkPostState.commentField.errorMessage) return false;

        if (
          bulkPostState.postingPolicyField.value === 'none'
          && bulkPostState.noncompliantShares.length > 0
        ) {
          return false;
        }
      }

      return true;
    });

    // Generates a selection of random shares for the verification step and map them to students.
    const randomShares = computed<Share[]>(() => {
      if (bulkPostState.selectedShares.length <= 0) return [];
      const shares = sample(bulkPostState.selectedShares, Math.min(10, bulkPostState.selectedShares.length));

      const students: Map<number, Student> = new Map<number, Student>();
      shares.forEach((share) => {
        const student = bulkPostState.students.find((x) => (x.shares?.findIndex((y) => y.id === share.id) ?? -1) >= 0);
        if (typeof student === 'undefined') {
          console.log('Error: Cannot find student for sample share.', share);
          return;
        }

        students.set(share.id, student);
      });

      sampleStudents.value = students;
      return shares;
    });

    // Generate a shorthand name for the selected share
    const shareTypeName = computed(() => bulkPostState.selectedShareType?.name.toUpperCase().substring(0, 3) ?? 'UNK');

    /**
     * Get the first and last name of the student who owns the provided share.
     */
    function getStudentName(share: Share) {
      const student = sampleStudents.value.get(share.id);

      if (student) {
        return `${student.lastName}, ${student.firstName}`;
      }

      return 'Unknown';
    }

    /**
     * Get the account number of the student who owns the provided share.
     */
    function getAccountNumber(share: Share) {
      const student = sampleStudents.value.get(share.id);

      if (student) {
        return student.accountNumber;
      }

      return '0000000000';
    }

    /**
     * Get the group name for the given student.
     */
    function getGroupName(share: Share) {
      const student = sampleStudents.value.get(share.id);

      if (student) {
        const group = groupStore.groups.value.find((x) => x.id === student.groupId);
        if (group) return group.name;
      }

      return 'Unknown';
    }

    /**
     * Estimate the effective balance of the share after the transaction was posted.
     */
    function getEffectiveBalance(share: Share) {
      const curBalance = share.balance;
      const amount = +bulkPostState.amountField.value;
      const policy = bulkPostState.postingPolicyField.value;

      if (amount >= 0) {
        return curBalance + amount;
      }

      if (policy === 'skip' && curBalance < Math.abs(amount)) {
        return curBalance;
      }

      return curBalance + amount;
    }

    /**
     * Fired when the user clicks 'OK', or hits Enter.  Either moves to the next step
     * or attempts to post the transactions and emits an 'ok' event.
     */
    async function handleOk() {
      // Only allow the posting logic to run if there is a valid state.
      if (!isValid.value) return;

      if (bulkPostState.hasNextStep()) {
        bulkPostState.incrementStep();
        return;
      }

      // We're on the last step
      try {
        const data = await bulkPostState.post();
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
      if (item === null) return;

      // Filter only students that have a share with the correct type
      const studentsWithShares = bulkPostState.students.filter(
        (student) => (student.shares?.findIndex((share) => share.shareTypeId === item.id) ?? -1) >= 0,
      );

      // Get a list of shares from that list with the correct type
      const shares: Share[] = [];
      studentsWithShares.forEach((student) => {
        const studentShares = student.shares?.sort((a, b) => a.id - b.id) ?? [];
        const share = studentShares?.find((sh) => sh.shareTypeId === item.id);
        if (share) shares.push(share);
      });

      const diff = bulkPostState.students.length - studentsWithShares.length;
      if (diff > 0) {
        bulkPostState.setError(1,
          `Warning: There are ${diff} students without the selected share type and will not incur the transaction.`);
      } else {
        bulkPostState.setError(1, null);
      }

      bulkPostState.setSelectedShareType(item);
      bulkPostState.setSelectedShares(shares);
    }

    /**
     * Ensure that the selected shares comply with the selected posting policy.
     */
    function checkShares() {
      // Posting policy only affects withdrawals
      if (+bulkPostState.amountField.value >= 0) {
        bulkPostState.setError(2, null);
        bulkPostState.setNoncompliantShares([]);
        bulkPostState.setLoading(false);
        return;
      }

      // Get a list of shares that will be taken negative
      const noncompliantShares: Share[] = [];
      const amount = Money.fromNumber(Math.abs(+bulkPostState.amountField.value));
      bulkPostState.selectedShares.forEach((share) => {
        if (share.balance < amount.getAmount()) noncompliantShares.push(share);
      });

      bulkPostState.setNoncompliantShares(noncompliantShares);

      // Skip error generation if there were no noncompliant shares
      if (noncompliantShares.length === 0) {
        bulkPostState.setError(2, null);
        bulkPostState.setLoading(false);
        return;
      }

      if (bulkPostState.postingPolicyField.value === 'none') {
        bulkPostState.setError(2,
          `Error: ${noncompliantShares.length} shares(s) do not have the funds to cover the specified amount and the transaction will fail.
          Choose another Posting Policy to continue.`);
      } else if (bulkPostState.postingPolicyField.value === 'take') {
        bulkPostState.setError(2,
          `Warning: ${noncompliantShares.length} share(s) will have a negative balance as a result of this transaction.`);
      } else if (bulkPostState.postingPolicyField.value === 'skip') {
        bulkPostState.setError(2,
          `Warning: ${noncompliantShares.length} share(s) will be skipped because they do not have the funds to cover the specified amount.`);
      }

      bulkPostState.setLoading(false);
    }

    // When the user enters a negative amount, validate the shares can handle it (debounced)
    watchEffect(() => {
      const amount = +bulkPostState.amountField.value;
      const policy = bulkPostState.postingPolicyField.value;

      if (bulkPostState.currentStep === 2) {
        window.clearTimeout(timerFunc.value);
        bulkPostState.setLoading(true);
        timerFunc.value = window.setTimeout(checkShares, 200);
        return;
      }

      if (amount < 0) {
        window.clearTimeout(timerFunc.value);
        bulkPostState.setLoading(true);
        timerFunc.value = window.setTimeout(checkShares, 200);
        return;
      }

      if (policy !== null) {
        window.clearTimeout(timerFunc.value);
        bulkPostState.setLoading(true);
        timerFunc.value = window.setTimeout(checkShares, 200);
      }
    });

    // Fetch the selected students when the modal is shown.
    watchEffect(() => {
      if (props.show) {
        bulkPostState.reset();
        bulkPostState.fetchSelection();
      }
    });

    return {
      handleOk,
      handleCancel,
      handleShareTypeSelection,
      isValid,
      state: bulkPostState,
      randomShares,
      getStudentName,
      getAccountNumber,
      getGroupName,
      getEffectiveBalance,
      shareTypeName,
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

        &__amount-wrapper {
          min-width: 100%;
          position: relative;

          input {
            width: 100%;
            padding-left: 3ch !important;
          }

          &__currency {
            position: absolute;
            font-size: 0.9em;
            top: .35em;
            left: 1ch;
            user-select: none;
            color: #999;
          }
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
        @include table;
      }
    }
  }
</style>
