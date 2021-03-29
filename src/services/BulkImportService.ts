/* eslint-disable @typescript-eslint/camelcase */
import { parseCSV } from '@/utils/csv';

/**
 * Represents the expected contents of the CSV file.
 */
export interface StudentImport {
  account_number?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  group?: string;
}

/**
 * Used when a student is parsed from CSV as an intermediate model
 */
export interface StudentInfo {
  accountNumber: string;
  email: string|undefined;
  firstName: string;
  lastName: string;
}

// The expected columns in the CSV, uses typing to gurantee parity
type StudentImportKeys = { [key in keyof Required<StudentImport>]: true };
export const StudentImportColumns: StudentImportKeys = {
  account_number: true,
  email: true,
  first_name: true,
  last_name: true,
  group: true,
};

/**
 * Class to manage a bulk post operation.
 */
export default class BulkImportService {
  // The total of steps
  static stepCount = 4;

  // The current step
  protected _currentStep = 1;

  // A list of errors
  protected _errors: string[] = new Array<string>();

  // If the class is loading or posting data from the server
  protected _loading = false;

  // The selected instance
  public selectedInstance: Instance|null = null;

  // A list of groups found in the import file
  protected _groups = new Set<string>();

  // A list of students found in the import file
  protected _students: Record<string, StudentInfo> = {};

  /**
   * Import the CSV, throwing an error on a critical failure.  May be called multiple times if needed.
   * Use resetImportData() to clear the list of students and groups.
   *
   * @param fileContents The file contents to import.
   */
  importCSV(fileContents: string): number {
    let totalErrors = 0;
    const csv = parseCSV<StudentImport>(fileContents);

    // Ensure the CSV is valid
    const first = csv[0] ?? null;
    if (!first) {
      throw new Error('The file you provided wasn\'t in the correct format. Are you using the correct template?');
    }

    // Make sure the file has the correct columns
    const columns = Object.keys(StudentImportColumns);
    for (let i = 0; i < columns.length; i += 1) {
      if (typeof first[columns[i] as keyof StudentImport] === 'undefined') {
        throw new Error('The file you provided wasn\'t in the correct format. Are you using the correct template?');
      }
    }

    for (let i = 0; i < csv.length; i += 1) {
      let numErrors = 0;
      const student = csv[i];
      const accountNumber = (student.account_number ?? '').trim();
      const firstName = (student.first_name ?? '').trim();
      const lastName = (student.last_name ?? '').trim();
      const group = (student.group ?? '').trim();
      const email = (student.email ?? '').trim();
      const errorMessage = 'Line {0}: {1} is a required field, but an empty value was detected.  Student will not be imported.';
      const lineNum = i + 2; // Zero-Index + Header Row

      if (accountNumber.length === 0) {
        this._errors.push(errorMessage.replace('{0}', lineNum.toString()).replace('{1}', 'account_number'));
        numErrors += 1;
      }

      if (firstName.length === 0) {
        this._errors.push(errorMessage.replace('{0}', lineNum.toString()).replace('{1}', 'first_name'));
        numErrors += 1;
      }

      if (lastName.length === 0) {
        this._errors.push(errorMessage.replace('{0}', lineNum.toString()).replace('{1}', 'last_name'));
        numErrors += 1;
      }

      if (group.length === 0) {
        this._errors.push(errorMessage.replace('{0}', lineNum.toString()).replace('{1}', 'group'));
        numErrors += 1;
      }

      // Skip if this record has errors
      if (numErrors > 0) {
        totalErrors += numErrors;
        // eslint-disable-next-line no-continue
        continue;
      }

      this._groups.add(group);
      this._students[accountNumber] = {
        accountNumber,
        email: email.length === 0 ? undefined : email,
        firstName,
        lastName,
      };
    }

    return totalErrors;
  }

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

  // SETs the loading property
  setLoading(loading = false) {
    this._loading = loading;
  }

  // GETs a list of errors
  get errors() {
    return this._errors;
  }

  // GETs the current loading state.
  get isLoading() {
    return this._loading;
  }

  // GETs a list of groups to import
  get groups() {
    return Array.from(this._groups);
  }

  // GETs a list of students to import
  get students() {
    return Object.values(this._students) as Student[];
  }

  // Reset the import data
  resetImportData() {
    this._errors = [];
    this._students = {};
    this._groups = new Set<string>();
  }

  // Reset the state back to one and clear all data.
  reset() {
    this._currentStep = 1;
    this.resetImportData();
    this.selectedInstance = null;
  }
}
