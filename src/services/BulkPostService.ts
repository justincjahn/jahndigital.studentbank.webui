import Money from '@/utils/money';
import { useField } from 'vee-validate';
import studentSelection from './StudentSelectionService';

const PostingPolicy = ['none', 'skip', 'take'];

/**
 * Handles state data for the Bulk Transaction Posting component.
 */
export default class BulkPostService {
  // The maxiumum number of steps
  static stepCount = 3;

  // The current step
  protected _currentStep = 1;

  // The selected students
  protected _selectedStudents: Student[] = [];

  // The errors
  protected _errors: Record<number, string|null> = {};

  // Field to specify the comment (if any)
  protected _commentField = useField('comment', (value: string) => {
    if (value && value.length > 255) return 'Comment can only be 255 characters.';
    return true;
  }, {
    initialValue: '',
  });

  // Field to specify the amount
  protected _amountField = useField('amount', (value: string) => {
    if (!value || value.length === 0) return 'Specify an amount.';

    const num = +value;
    if (Number.isNaN(num)) return 'Amount must be a number.';
    if (Money.round(num) === 0) return 'Amount cannot be zero.';

    return true;
  }, {
    initialValue: '0.00',
    validateOnMount: true,
  });

  // Field to specify the posting policy
  protected _postingPolicyField = useField('postingPolicy', (value: string) => {
    if (!PostingPolicy.includes(value)) {
      return 'Please select a valid posting policy.';
    }

    return true;
  }, {
    initialValue: PostingPolicy[0],
  });

  // If the values are currently loading.
  protected _loading = false;

  // The Share Type the user wants to post a transaction to
  protected _selectedShareType: ShareType|null = null;

  // The list of shares to post to
  protected _selectedShares: Share[] = [];

  // The list of shares affected by the posting policy
  protected _noncompliantShares: Share[] = [];

  // GET the selected students
  get students() {
    return this._selectedStudents;
  }

  // GET the selected share type
  get selectedShareType() {
    return this._selectedShareType;
  }

  // GET the selected shares
  get selectedShares() {
    return this._selectedShares;
  }

  // GET the currentStep
  get currentStep() {
    return this._currentStep;
  }

  // GET the non-compliant shares affected by the posting policy
  get noncompliantShares() {
    return this._noncompliantShares;
  }

  // GET the errors dict
  get errors() {
    return this._errors;
  }

  // GET if the state is loading data from the server
  get isLoading() {
    return this._loading;
  }

  // GET the amount field's value
  get amountField() {
    return this._amountField;
  }

  // GET the comment field's value
  get commentField() {
    return this._commentField;
  }

  get postingPolicyField() {
    return this._postingPolicyField;
  }

  // Returns true if there's a next step
  hasNextStep() {
    return this.currentStep < BulkPostService.stepCount;
  }

  // Returns true if there's a previous step
  hasPreviousStep() {
    return this.currentStep > 1;
  }

  // Move to the next step (if available)
  incrementStep() {
    if (this.hasNextStep()) this._currentStep += 1;
  }

  // Move to the previous step (if available)
  decrementStep() {
    if (this.hasPreviousStep()) this._currentStep -= 1;
  }

  // Fetch the student objects of the current selection.
  async fetchSelection() {
    this._loading = true;

    try {
      this._selectedStudents = await studentSelection.resolve();
    } catch (e) {
      this.setError(1, `Unable to fetch selected students: ${e?.message ?? e}`);
      throw e;
    }

    this._loading = false;
  }

  /**
   * Set the error message for the given step.
   *
   * @param {number} step The step number the error represents.
   * @param {string|null} error The error message.
   */
  setError(step: number, error: string|null) {
    this._errors[step] = error;
  }

  /**
   * Set the selected share type.
   *
   * @param {ShareType|null} shareType The selected share type.
   */
  setSelectedShareType(shareType: ShareType|null) {
    this._selectedShareType = shareType;
  }

  /**
   * Set the selected shares.
   *
   * @param {Share[]} shares The selected shares.
   */
  setSelectedShares(shares: Share[]) {
    this._selectedShares = shares;
  }

  /**
   * Set the list of shares failing the posting policy check.
   *
   * @param shares The shares that fail posting policy check.
   */
  setNoncompliantShares(shares: Share[]) {
    this._noncompliantShares = shares;
  }

  /**
   * Set the loading state manually.
   *
   * @param loading
   */
  setLoading(loading = false) {
    this._loading = loading;
  }

  // Reset back to the default state
  reset() {
    this._currentStep = 1;
    this._errors = {};
    this._selectedShareType = null;
    this._selectedShares = [];
    this._noncompliantShares = [];
    this._postingPolicyField.resetField();
    this._commentField.resetField();
    this._amountField.resetField();
  }
}
