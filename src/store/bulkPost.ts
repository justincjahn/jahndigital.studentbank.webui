import Apollo from '@/services/Apollo';
import Money from '@/utils/money';
import { reactive, computed } from 'vue';
import gqlNewBulkTransaction from '@/graphql/newBulkTransaction.mutation.gql';
import studentSelection from '@/services/StudentSelectionService';
import { validateAmountNonzero, validateTransactionComment } from '@/utils/validators';
import debounce from '@/utils/debounce';
import sample from '@/utils/sample';

/**
 * Specifies how the system handles shares without funds to cover the transaction.
 */
export enum PostingPolicy {
  // Do nothing.  Shares without the necessary funds will cause an error.
  none,

  // Skip shares without the necessary funds
  skip,

  // Take shares withou the necessary funds negative
  take,
}

/**
 * Store that handles the multi-step workflow to post transactions to students' shares.
 */
export function setup() {
  /**
   * Step 1: Select Share Type
   * Step 2: Specify Amount
   * Step 3: Review and Post
   */
  const stepCount = 3;

  const store = reactive({
    loading: false,
    currentStep: 1,
    selectedShareType: null as ShareType | null,
    selectedShares: [] as Share[],
    studentMap: new Map<number, Student>(),
    sampleShares: [] as Share[],
    noncompliantShares: [] as Share[],
    selectedStudents: [] as Student[],
    errors: {} as Record<number, string | null>,
    comment: '',
    amount: Money.fromNumber(0),
    postingPolicy: PostingPolicy.none as PostingPolicy,
  });

  /**
   * If the store is currently loading data from the server.
   */
  const loading = computed(() => store.loading);

  /**
   * The current form step.
   */
  const currentStep = computed(() => store.currentStep);

  /**
   * A list of errors with the state.
   */
  const errors = computed(() => store.errors);

  /**
   * If the form has a next step.
   */
  const hasNextStep = computed(() => store.currentStep < stepCount);

  /**
   * If the form has a previous step.
   */
  const hasPreviousStep = computed(() => store.currentStep > 1);

  /**
   * The list of students affected by the bulk transaction.
   */
  const students = computed(() => store.selectedStudents);

  /**
   * The Share Type transactions should be posted to.
   */
  const selectedShareType = computed(() => store.selectedShareType);

  /**
   * The shares which will be posted to.
   */
  const selectedShares = computed(() => store.selectedShares);

  /**
   * The shares which a transaction of the given amount will fail.
   */
  const noncompliantShares = computed(() => store.noncompliantShares);

  /**
   * A sampling of shares affected by this transaction.
   */
  const sampleShares = computed(() => store.sampleShares);

  /**
   * A map of Share IDs to Student objects.
   */
  const studentMap = computed(() => store.studentMap);

  /**
   * The current transaction amount.
   */
  const amount = computed(() => store.amount);

  /**
   * The current comment.
   */
  const comment = computed(() => store.comment);

  /**
   * The current posting policy.
   */
  const postingPolicy = computed(() => store.postingPolicy);

  /**
   * Returns true if the store is in a valid state for the given step.
   */
  const isValid = computed<string|true>(() => {
    if (store.loading) return 'Please wait...';
    if (store.selectedStudents.length === 0) return 'No students are currently selected.';

    if (store.currentStep >= 1) {
      if (store.selectedShareType === null) return 'Please select a Share Type.';
    }

    if (store.currentStep >= 2) {
      const validAmount = validateAmountNonzero(store.amount.getAmount().toString());
      if (validAmount !== true) return validAmount.toString();

      const validComment = validateTransactionComment(store.comment);
      if (validComment !== true) return validComment.toString();

      if (store.postingPolicy === PostingPolicy.none && store.noncompliantShares.length > 0) {
        return 'Currently selected posting policy will result in a posting error because shares will be taken negative.';
      }
    }

    return true;
  });

  /**
   * Reset the store back to the default state.
   */
  function reset() {
    store.currentStep = 1;
    store.errors = {};
    store.selectedShareType = null;
    store.selectedShares = [];
    store.noncompliantShares = [];
    store.postingPolicy = PostingPolicy.none;
    store.amount = Money.fromNumber(0);
    store.comment = '';
    store.studentMap = new Map<number, Student>();
  }

  /**
   * Set the error message for the given step.
   *
   * @param {number} step The step number the error represents.
   * @param {string|null} error The error message.
   */
  function setError(step: number, error: string | null) {
    store.errors[step] = error;
  }

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
   * Fetch the student object of the currently selected students and groups.
   */
  async function fetchSelection() {
    store.loading = true;

    try {
      store.selectedStudents = await studentSelection.resolve();
    } catch (e) {
      setError(1, `Unable to fetch selected students: ${e?.message ?? e}`);
      throw e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Select a group of Shares that should appear in the summary step.
   */
  function generateSample(count = 10) {
    if (store.selectedShares.length <= 0) {
      store.sampleShares = [];
      return;
    }

    store.sampleShares = sample(store.selectedShares, Math.min(count, store.selectedShares.length));
  }

  /**
   * Set the selected share type and compute the affected shares.
   *
   * @param {ShareType|null} shareType The selected share type.
   */
  function setSelectedShareType(shareType: ShareType | null) {
    store.selectedShareType = shareType;

    if (shareType === null) {
      store.selectedShares = [];
      return;
    }

    // Loop throuch each selected student and pull out those with at least one of the given share type
    const studentsWithShares = store.selectedStudents.filter(
      (student) => (student.shares?.findIndex((share) => share.shareTypeId === shareType.id) ?? -1) >= 0,
    );

    // Get a list of shares from that list with the correct type, and create a map that links a share ID
    /// back to its original Student.
    // TODO: Refactor GQL queries and TS types to include Share.studentId.
    const shares: Share[] = [];
    const map = new Map<number, Student>();
    studentsWithShares.forEach((student) => {
      if (typeof student.shares === 'undefined') return;

      const studentShares = [...student.shares];
      studentShares.sort((a, b) => a.id - b.id);
      const share = studentShares.find((sh) => sh.shareTypeId === shareType.id);

      if (share) {
        shares.push(share);
        map.set(share.id, student);
      }
    });

    // Determine if any of the selected students didn't have the share type chosen
    const diff = store.selectedStudents.length - studentsWithShares.length;
    if (diff > 0) {
      setError(1,
        `Warning: There are ${diff} students without the selected share type and will not receive this transaction.`);
    } else {
      setError(1, null);
    }

    store.selectedShares = shares;
    store.studentMap = map;
    generateSample();
  }

  /**
   * Ensure that the current amount complies with the selected posting policy.
   */
  function validateAmount() {
    // Posting policies only affect withdrawals
    if (store.amount.getAmount() >= 0) {
      setError(2, null);
      store.noncompliantShares = [];
      store.loading = false;
      return;
    }

    // Get a list of shares that will be taken negative
    const shares: Share[] = [];
    store.selectedShares.forEach((share) => {
      if (share.balance < store.amount.getAmount()) shares.push(share);
    });

    store.noncompliantShares = shares;

    // If there weren't any, then we're all good!
    if (shares.length === 0) {
      setError(2, null);
      store.loading = false;
      return;
    }

    // Determine what the result of the transaction will be and provide a warning
    let errorMsg = '';
    switch (store.postingPolicy) {
      case PostingPolicy.none:
        errorMsg = `Error: ${shares.length} shares(s) do not have the funds to cover the specified amount and the transaction will fail.
        Choose another Posting Policy to continue.`;
        break;
      case PostingPolicy.take:
        errorMsg = `Warning: ${shares.length} share(s) will have a negative balance as a result of this transaction.`;
        break;
      case PostingPolicy.skip:
        errorMsg = `Warning: ${shares.length} share(s) will be skipped because they do not have the funds to cover the specified amount.
        An NSF comment will be applied to the affected shares.`;
        break;
      default:
        errorMsg = 'An unknown error occurred.';
    }

    setError(2, errorMsg);
    store.loading = false;
  }

  /**
   * Called every time setAmount is called, which may be every keystroke.
   */
  const validateAmountDebounced = debounce(validateAmount, 200);

  /**
   * Set the amount and validate that it won't cause an error when posting.
   *
   * @param {string} value The amount.
   * @throws {Error} If the amount is invalid.
   */
  function setAmount(value: string) {
    const valid = validateAmountNonzero(value);
    if (valid !== true) throw new Error(valid.toString());
    store.amount = Money.fromNumber(+value);
    store.loading = true;
    validateAmountDebounced();
  }

  /**
   * Set the transaction comment and validate that it won't cause an error when posting.
   *
   * @param {string} value The comment.
   * @throws {Error} If the comment is invalid.
   */
  function setComment(value: string) {
    const valid = validateTransactionComment(value);
    if (valid !== true) throw new Error(valid.toString());
    store.comment = value;
  }

  /**
   * Set the posting policy and validate that it won't cause an error when posting.
   *
   * @param {PostingPolicy} value
   */
  function setPostingPolicy(value: PostingPolicy) {
    store.postingPolicy = value;
    store.loading = true;
    validateAmountDebounced();
  }

  /**
   * Estimate the effective balance of the given share after the transaction is posted.
   *
   * @param {Share} share The share to get the effective balance of.
   * @returns The estimated balance of the share after the transaction is posted.
   */
  function getEffectiveBalance(share: Share) {
    const curBalance = share.balance;
    const amnt = store.amount.getAmount();

    if (amnt >= 0) {
      return curBalance + amnt;
    }

    if (store.postingPolicy === PostingPolicy.skip && curBalance < Math.abs(amnt)) {
      return curBalance;
    }

    return curBalance + amnt;
  }

  /**
   * Post the transactions to the selected students using the properties from previous steps.
   *
   * @returns A Promise containing a list of posted Transactions.
   */
  async function post(): Promise<Transaction[]> {
    store.loading = true;

    const req: NewBulkTransactionRequest = {
      shares: [],
      skipNegative: store.postingPolicy === PostingPolicy.skip,
    };

    const takeNegative = store.postingPolicy === PostingPolicy.take;
    const cmnt = store.comment.length > 0 ? store.comment : undefined;
    store.selectedShares.forEach((share) => {
      req.shares.push({
        shareId: share.id,
        amount: store.amount.getAmount(),
        comment: cmnt,
        takeNegative,
      });
    });

    try {
      const res = await Apollo.mutate<NewBulkTransactionResponse>({
        mutation: gqlNewBulkTransaction,
        variables: req,
      });

      if (res.data) {
        return res.data.newBulkTransaction;
      }

      throw new Error('Unable to post transaction: unknown error.');
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  return {
    loading,
    currentStep,
    hasNextStep,
    hasPreviousStep,
    students,
    selectedShareType,
    selectedShares,
    noncompliantShares,
    sampleShares,
    studentMap,
    amount,
    comment,
    postingPolicy,
    errors,
    isValid,
    reset,
    incrementStep,
    decrementStep,
    fetchSelection,
    setSelectedShareType,
    setAmount,
    setComment,
    setPostingPolicy,
    generateSample,
    getEffectiveBalance,
    post,
  };
}

const store = setup();
export type BulkPostStore = ReturnType<typeof setup>;
export default store;
