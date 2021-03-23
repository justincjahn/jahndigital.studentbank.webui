/**
 * Class to manage a bulk post operation.
 */
export default class BulkImportService {
  // The total of steps
  static stepCount = 4;

  // The current step
  protected _currentStep = 1;

  // A list of errors
  protected _errors: Record<number, string|null> = {};

  // If the class is loading or posting data from the server
  protected _loading = false;

  // The selected instance
  public selectedInstance: Instance|null = null;

  // GETs the current step
  get currentStep() {
    return this._currentStep;
  }

  // Returns true if there is a next step.
  hasNextStep() {
    return this.currentStep < BulkImportService.stepCount;
  }

  // Returns true if there is a previous step.
  hasPreviousStep() {
    return this.currentStep > 1;
  }

  // Increment the step by one, if possible.
  incrementStep() {
    if (this.hasNextStep()) this._currentStep += 1;
  }

  // Decrement the step by one, if possible.
  decrementStep() {
    if (this.hasPreviousStep()) this._currentStep -= 1;
  }

  // GETs a list of errors
  get errors() {
    return this._errors;
  }

  // GETs the current loading state.
  get isLoading() {
    return this._loading;
  }

  // Reset the state back to one and clear all data.
  reset() {
    this._currentStep = 1;
    this._errors = {};
    this.selectedInstance = null;
  }
}
