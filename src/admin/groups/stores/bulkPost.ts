import { reactive, computed } from 'vue';

// Types
import type { StudentSelection } from '@/admin/groups/services/StudentSelectionService';
import type { Student } from '@/common/services/student';
import type { Share } from '@/common/services/share';
import type { ShareType } from '@/admin/common/services/shareType';
import type { Transaction } from '@/common/services/transaction';

// Services
import { newBulkTransaction } from '@/common/services/transaction';

// Utils
import Money from '@/common/utils/Money';
import sample from '@/common/utils/sample';
import useDebounce from '@/common/composables/useDebounce';

// Validators
import validateAmount from '@/common/validators/validateAmount';
import validateTransactionComment from '@/common/validators/validateTransactionComment';

/**
 * Specifies how the system handles shares without funds to cover the transaction.
 */
export enum PostingPolicy {
  // Do nothing.  Shares without the necessary funds will cause an error.
  None,

  // Skip shares without the necessary funds
  Skip,

  // Take shares without the necessary funds negative
  Take,
}

/**
 * Step 1: Select Share Type
 * Step 2: Specify Amount
 * Step 3: Review and Post
 */
const STEP_COUNT = 3;

/**
 * Store that handles the multi-step workflow to post transactions to students' shares.
 */
export function setup(selection: StudentSelection) {
  const store = reactive({
    // State
    loading: false,
    currentStep: 1,

    // Form data
    shareType: null as ShareType | null,
    comment: '',
    amount: '0',
    postingPolicy: PostingPolicy.None,

    // Intermediate data
    selectedShares: [] as Share[],
    selectedStudents: [] as Student[],

    // Validation
    errors: {} as Record<number, string | null>,
    noncompliantShares: [] as Share[],
    sampleShares: [] as Share[],
  });

  // True if the store is loading data
  const loading = computed(() => store.loading);

  // The current form step.
  const currentStep = computed(() => store.currentStep);

  // A dictionary of the step as a key and an error message as a value
  const errors = computed(() => store.errors);

  // An array of current errors, if any.
  const currentErrors = computed(() => store.errors[store.currentStep] ?? []);

  // True if the form has a next step
  const hasNextStep = computed(() => store.currentStep < STEP_COUNT);

  // True if the form has a previous step
  const hasPreviousStep = computed(() => store.currentStep > 1);

  // A list of students affected by the bulk transaction
  const students = computed(() => store.selectedStudents);

  // A sampling of shares affected by this transaction.
  const sampleShares = computed(() => store.sampleShares);

  /**
   * Generate a list of shares to sample.
   */
  function generateSample(count = 10) {
    if (store.selectedShares.length <= 0) {
      store.sampleShares = [];
      return;
    }

    store.sampleShares = sample(
      store.selectedShares,
      Math.min(count, store.selectedShares.length)
    );
  }

  /**
   * Resolve a list of shares for the shareType and students
   */
  function resolve() {
    if (store.shareType === null) return;

    const shareTypeId = store.shareType.id;

    // Select students with at least one share of the selected type
    const studentsWithShare = store.selectedStudents.filter(
      (student) =>
        student.shares.findIndex(
          (share) => share.shareTypeId === shareTypeId
        ) >= 0
    );

    const diff = store.selectedStudents.length - studentsWithShare.length;
    if (diff > 0) {
      store.errors[1] = `Warning: There are ${diff} students without the selected
                         share type and will not receive this transaction.`;
    } else {
      store.errors[1] = null;
    }

    store.selectedShares = studentsWithShare.map(
      (student) =>
        student.shares
          .filter((share) => share.shareTypeId === shareTypeId)
          .sort((a, b) => a.id - b.id)[0]
    );

    generateSample();
  }

  // Get or set the selected share type.
  const shareType = computed({
    get() {
      return store.shareType;
    },

    set(value) {
      store.shareType = value;

      if (value === null) {
        store.selectedShares = [];
      }

      resolve();
    },
  });

  // Ensure that the posting policy, transaction amount, and comment are valid.
  /// Generate additional errors and warnings for the user.
  const validatePostingPolicy = useDebounce(() => {
    const transactionAmount = Money.fromStringOrDefault(
      store.amount
    ).getAmount();

    if (transactionAmount >= 0) {
      store.noncompliantShares = [];
      store.errors[2] = null;
      return;
    }

    store.noncompliantShares = store.selectedShares.filter(
      (share) => share.balance + transactionAmount < 0
    );

    const numNoncompliant = store.noncompliantShares.length;

    if (numNoncompliant === 0) {
      store.errors[2] = null;
      return;
    }

    // Determine what the result of the transaction will be and provide a warning
    let errorMsg = 'An unknown error occurred.';

    if (store.postingPolicy === PostingPolicy.None) {
      errorMsg = `Error: ${numNoncompliant} shares(s) do not have the funds to cover the specified
                  amount and the transaction will fail. Choose another Posting Policy to continue.`;
    } else if (store.postingPolicy === PostingPolicy.Take) {
      errorMsg = `Warning: ${numNoncompliant} share(s) will have a negative balance as a result of
                  this transaction.`;
    } else if (store.postingPolicy === PostingPolicy.Skip) {
      errorMsg = `Warning: ${numNoncompliant} share(s) will be skipped because they do not have the
                  funds to cover the specified amount. An NSF comment will be applied to the
                  affected shares.`;
    }

    store.errors[2] = errorMsg;
  }, 200);

  // Returns true if the store is in a valid state for the given step and provide
  /// the user with a high-level error message if it's in an invalid state.
  const isValid = computed<string | true>(() => {
    if (store.selectedStudents.length === 0) {
      return 'No students are currently selected.';
    }

    if (store.currentStep >= 1 && store.shareType === null) {
      return 'Please select a Share Type.';
    }

    if (store.currentStep >= 2) {
      const validAmount = validateAmount(store.amount);
      if (validAmount !== true) {
        return validAmount.toString();
      }

      if (
        Money.fromStringOrDefault(store.amount).compare(0) === 0 &&
        store.comment.trim().length === 0
      ) {
        return 'Transactions of $0.00 must have a transaction comment.';
      }

      const validComment = validateTransactionComment(store.comment);
      if (validComment !== true) {
        return validComment.toString();
      }

      if (
        store.postingPolicy === PostingPolicy.None &&
        store.noncompliantShares.length > 0
      ) {
        return 'Currently selected posting policy will result in a posting error because shares will be taken negative.';
      }
    }

    return true;
  });

  // Get or set the amount of the transaction
  const amount = computed({
    get() {
      return store.amount;
    },

    set(value) {
      const valid = validateAmount(value);

      if (!valid) {
        store.errors[1] = valid.toString();
        return;
      }

      store.amount = value;
      validatePostingPolicy();
    },
  });

  // Get or set the comment
  const comment = computed({
    get() {
      return store.comment;
    },

    set(value) {
      const valid = validateTransactionComment(value);

      if (!valid) {
        store.errors[1] = valid.toString();
        return;
      }

      store.comment = value;
      validatePostingPolicy();
    },
  });

  // Get or set the posting policy
  const postingPolicy = computed({
    get() {
      return store.postingPolicy;
    },

    set(value) {
      store.postingPolicy = value;
      validatePostingPolicy();
    },
  });

  /**
   * Increment the step.
   */
  function incrementStep() {
    if (hasNextStep.value) store.currentStep += 1;
  }

  /**
   * Decrement the step.
   */
  function decrementStep() {
    if (hasPreviousStep.value) store.currentStep -= 1;
  }

  /**
   * Estimate the effective balance of the given share after the transaction is posted.
   *
   * @param share The share to get the effective balance of.
   * @returns The estimated balance of the share after the transaction is posted.
   */
  function getEffectiveBalance(share: Share) {
    const currentBalance = Money.fromNumber(share.balance);
    const transactionAmount = Money.fromStringOrDefault(store.amount);

    if (transactionAmount.compare(0) >= 0) {
      return transactionAmount.add(currentBalance);
    }

    if (
      store.postingPolicy === PostingPolicy.Skip &&
      currentBalance.compare(transactionAmount.abs()) === -1
    ) {
      return currentBalance;
    }

    return currentBalance.add(transactionAmount);
  }

  /**
   * Fetch students from the selection.
   *
   * @returns
   */
  async function fetchStudents() {
    store.loading = true;

    try {
      store.selectedStudents = await selection.resolve();
    } catch (e) {
      if (!(e instanceof Error)) return;
      store.errors[1] = `Unable to fetch selected students: ${e.message}`;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Post the transactions to the selected students using the properties from previous steps.
   *
   * @returns A Promise containing a list of posted Transactions.
   */
  async function post(): Promise<Transaction[]> {
    if (!isValid.value) {
      throw new Error(
        'Transaction state is not valid.  Please correct errors and try again.'
      );
    }

    store.loading = true;

    const req: Parameters<typeof newBulkTransaction>[0] = {
      shares: [],
      skipNegative: store.postingPolicy === PostingPolicy.Skip,
    };

    const takeNegative = store.postingPolicy === PostingPolicy.Take;

    const transactionAmount = Money.fromStringOrDefault(
      store.amount
    ).getAmount();

    const transactionComment =
      store.comment.trim().length > 0 ? store.comment : undefined;

    req.shares = store.selectedShares.map((share) => ({
      shareId: share.id,
      amount: transactionAmount,
      comment: transactionComment,
      takeNegative,
    }));

    try {
      const data = await newBulkTransaction(req);
      return data.newBulkTransaction;
    } finally {
      store.loading = false;
    }
  }

  return {
    // State
    loading,
    shareType,
    students,
    sampleShares,
    amount,
    comment,
    postingPolicy,
    isValid,
    errors,
    currentErrors,

    // Steps
    currentStep,
    hasNextStep,
    hasPreviousStep,
    incrementStep,
    decrementStep,

    // Actions
    fetchStudents,
    getEffectiveBalance,
    post,
  };
}

export type BulkPostStore = ReturnType<typeof setup>;
