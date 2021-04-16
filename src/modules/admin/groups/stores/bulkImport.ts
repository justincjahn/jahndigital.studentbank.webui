/* eslint-disable @typescript-eslint/camelcase */

import { computed, reactive } from 'vue';

// Utils
import { parseCSV } from '@/utils/csv';
import sample from '@/utils/sample';
import Money from '@/utils/money';

// API
import Apollo from '@/services/Apollo';
import { gql } from '@apollo/client/core';
import { setup as defineInstanceStore } from '@/modules/admin/stores/instance';
import { setup as defineGroupStore } from './group';

/**
 * Enum that describes the steps for the Bulk Import multi-part form.
 */
export enum BulkImportStep {
  // An Instance is selected
  selectInstance = 1,

  // A CSV file is uploaded
  uploadData = 2,

  // Share Types are selected with initial balances
  shareTypes = 3,

  // Users review the import before posting
  validate = 4,
}

/**
 * The columns expected in the CSV file.
 */
export const StudentImportColumns: StudentImportKeys = {
  account_number: true,
  email: true,
  first_name: true,
  last_name: true,
  group: true,
};

/**
 * The object used to describe what shares to create.
 */
export interface ShareTemplate {
  shareType: ShareType|null;
  initialDeposit: string;
  error: string | boolean;
}

/**
 * Represents the columns expected within the import CSV.
 */
export interface StudentImport {
  account_number?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  group?: string;
}

/**
 * An interface for sampling students.
 */
export interface BulkImportSample extends StudentImport {
  shares: ShareTemplate[];
}

/**
 * A type that helps gurantee a JS object has all of the fields of the StudentImport interface.
 */
type StudentImportKeys = { [key in keyof Required<StudentImport>]: true };

/**
 * DTO for parsed student information.
 */
interface StudentInfo {
  accountNumber: string;
  email: string | undefined;
  firstName: string;
  lastName: string;
  group: string;
}

/**
 * The format of the student information stored in state before it's imported.
 */
type StudentInfoMap = Record<string, StudentInfo>;

/**
 * Filter for group IDs
 */
interface GroupIdFilter {
  groupId: number;
}

/**
 * Used to build a graphql query that lists all students by groupId.
 */
interface StudentFilter {
  OR: GroupIdFilter[];
}

/**
 * Minimal student information for GQL
 */
interface StudentAccountNumber {
  accountNumber: string;
}

/**
 * Apollo res.data response
 */
interface StudentFilterResponse {
  students: {
    nodes: StudentAccountNumber[];
  };
}

/**
 * Store that handles the multi-step workflow to post transactions to students' shares.
 */
export function setup() {
  const stepCount = Object.keys(BulkImportStep).length / 2;

  const store = reactive({
    loading: false,
    currentStep: 1,
    errors: [] as string[],
    instance: null as Instance | null,

    // Groups that already exist in the database
    dbGroups: [] as Group[],

    // Values from the CSV file that don't exist in the database
    groupsToCreate: [] as string[],
    studentsToCreate: {} as StudentInfoMap,

    // Share Types that will be created for each student
    shareTypes: [] as ShareTemplate[],

    // Sampling
    samples: [] as BulkImportSample[],
  });

  /**
   * The current step in the multi-part workflow.
   */
  const currentStep = computed(() => store.currentStep);

  /**
   * True if there is another step in the workflow.
   */
  const hasNextStep = computed(() => store.currentStep < stepCount);

  /**
   * True if there is a previous step in the workflow.
   */
  const hasPreviousStep = computed(() => store.currentStep > 1);

  /**
   * True if the store is currently loading or processing data.
   */
  const loading = computed(() => store.loading);

  /**
   * A list of errors, if any.
   */
  const errors = computed(() => store.errors);

  /**
   * The instance selected for import.
   */
  const instance = computed(() => store.instance);

  /**
   * A list of groups that must be created from the provided data.
   */
  const groups = computed(() => store.groupsToCreate);

  /**
   * A list of students that must be created from the provided data.
   */
  const students = computed(() => Object.values(store.studentsToCreate));

  /**
   * A list of Share Types and initial balances.
   */
  const shareTemplates = computed(() => store.shareTypes);

  /**
   * A list of sample accounts from the import process.
   */
  const samples = computed(() => store.samples);

  /**
   * True if the store is valid for the current step.
   */
  const isValid = computed(() => {
    if (store.loading) return 'Store is loading.';
    if (store.instance === null) return 'Please select an instance.';

    // Validate that there are students to import if we're on or after step 2
    if (store.currentStep >= 2) {
      if (Object.values(store.studentsToCreate).length === 0) return 'There are no students to import.';
    }

    // Validate the Share Type templates if we're on or after step 3.
    if (store.currentStep >= 3) {
      for (let i = 0; i < store.shareTypes.length; i += 1) {
        const shareType = store.shareTypes[i];
        if (shareType.shareType === null) return 'One or more Share Type templates is missing a Share Type selection.';

        try {
          const amount = Money.fromString(shareType.initialDeposit);
          if (amount.round() < 0) return 'One or more Share Type templates has a negative amount.';
        } catch {
          return 'One or more Share Type templates has an invalid amount.';
        }
      }
    }

    return true;
  });

  /**
   * Clear the share type template data
   */
  function resetShareTypeData() {
    store.shareTypes = [];
  }

  /**
   * Reset import data, clearing student and group lists.
   */
  function resetImportData() {
    store.errors = [];
    store.studentsToCreate = {};
    store.groupsToCreate = [];
    store.samples = [];
  }

  /**
   * Reset the store to its default state
   */
  function reset() {
    store.currentStep = 1;
    store.instance = null;
    resetImportData();
    resetShareTypeData();
  }

  /**
   * Fetch groups for the currently selected instance
   */
  async function getGroups() {
    if (store.instance === null) {
      throw new Error('No instance has been selected!');
    }

    // Fetch instance groups
    store.loading = true;

    try {
      const groupStore = defineGroupStore(defineInstanceStore());
      await groupStore.fetchGroups(store.instance.id);
      store.dbGroups = [...groupStore.groups.value];
    } catch (e) {
      throw new Error(e?.message ?? e);
    } finally {
      store.loading = false;
    }
  }

  /**
   * Set the instance that data will be imported into.
   *
   * @param value The instance to import data into.
   * @throws {Error} If a network call fails.
   */
  async function setInstance(value: Instance | null) {
    if (store.instance !== value) {
      resetImportData();
      resetShareTypeData();
      store.instance = value;
    }

    if (store.instance !== null) {
      await getGroups();
    }
  }

  /**
   * Queries the GQL endpoint for a list of students and returns a filtered list
   * of students that don't exist in the database.
   *
   * @throws {Error} If there was an error fetching data from the server.
   */
  async function filterStudents(csvStudents: StudentInfoMap): Promise<StudentInfoMap> {
    // If there are no groups in the DB, there are no students
    if (store.dbGroups.length === 0) return csvStudents;

    // Fetch instance students
    const query = gql`
      query students($where: StudentFilter) {
        students(where: $where) {
          nodes {
            accountNumber
          }
        }
      }
    `;

    const where: StudentFilter = {
      OR: store.dbGroups.map((x) => ({ groupId: x.id })),
    };

    const sRes = await Apollo.query<StudentFilterResponse>({
      query,
      variables: {
        where,
      },
    });

    if (sRes.data) {
      const dbStudents = sRes.data.students.nodes.map((x) => x.accountNumber);
      const diff = dbStudents.filter((x) => Object.keys(csvStudents).includes(x));

      // If there are students in both the CSV and the database with the same account number,
      /// don't import them.
      const csvAccounts = { ...csvStudents };
      if (diff.length > 0) {
        diff.forEach((accountNumber) => {
          delete csvAccounts[accountNumber];
          store.errors.push(`Warning: Student with account number ${accountNumber} was found in the database, they will not be imported.`);
        });
      }

      return csvAccounts;
    }

    return csvStudents;
  }

  /**
   * Parse CSV data and validate it. During the processing, if one or more validation errors
   * occur, it will fill the store's error array.
   *
   * @param {string} contents The CSV contents to parse and process.
   * @throws {Error} If a critical error occurs during processing.
   */
  async function importCSV(contents: string) {
    const csv = parseCSV<StudentImport>(contents);

    // Ensure the CSV is valid
    const first = csv[0] ?? null;
    if (!first) {
      throw new Error(
        'The file you provided wasn\'t int he correct format. Are you using the correct template?',
      );
    }

    // Loop through each line in the CSV file
    const tmpStudents: Record<string, StudentInfo> = {};

    for (let i = 0; i < csv.length; i += 1) {
      let numErrors = 0;
      const student = csv[i];
      let accountNumber = (student.account_number ?? '').trim();
      const firstName = (student.first_name ?? '').trim();
      const lastName = (student.last_name ?? '').trim();
      const group = (student.group ?? '').trim();
      const email = (student.email ?? '').trim();
      const lineNum = i + 2; // Zero-index + Header Row

      const msg = `Line {0}: {1} is a required field, but an empty value was detected.
      Student will not be imported.`;

      if (accountNumber.length === 0) {
        store.errors.push(msg.replace('{0}', lineNum.toString()).replace('{1}', 'account_number'));
        numErrors += 1;
      }

      // Format the account number correctly to 10 digits
      accountNumber = accountNumber.padStart(10, '0');

      // Validate that the student isn't already in the list
      if (Object.keys(tmpStudents).includes(accountNumber)) {
        store.errors.push(
          `Line ${lineNum}: Duplicate account number '${accountNumber}' detected.  Student will
          not be imported.`,
        );

        numErrors += 1;
      }

      if (firstName.length === 0) {
        store.errors.push(msg.replace('{0}', lineNum.toString()).replace('{1}', 'first_name'));
        numErrors += 1;
      }

      if (lastName.length === 0) {
        store.errors.push(msg.replace('{0}', lineNum.toString()).replace('{1}', 'last_name'));
        numErrors += 1;
      }

      if (group.length === 0) {
        store.errors.push(msg.replace('{0}', lineNum.toString()).replace('{1}', 'group'));
        numErrors += 1;
      }

      if (numErrors === 0) {
        tmpStudents[accountNumber] = {
          accountNumber,
          email: email.length === 0 ? undefined : email,
          firstName,
          lastName,
          group,
        };
      }
    }

    // Validate that we didn't have duplicate account numbers or errors.
    const numStudents = Object.keys(tmpStudents).length;
    if (csv.length !== numStudents) {
      store.errors.push(
        `There were ${csv.length} records in the file, but only ${numStudents} will be imported.
        Consider correcting errors before moving forward.`,
      );
    }

    // Filter students being imported with the records already in the database.
    try {
      store.studentsToCreate = await filterStudents(tmpStudents);
    } catch (e) {
      throw new Error(`Unable to fetch student data from the server: ${e?.message ?? e}.`);
    }

    // Validate that we didn't have any students already in the database.
    const numInDatabase = numStudents - Object.keys(store.studentsToCreate).length;
    if (numInDatabase > 0) {
      store.errors.push(
        `There are ${numInDatabase} students that already exist in the database and
        will not be imported.`,
      );
    }

    // Determine which groups need to be created
    const groupNames = store.dbGroups.map((x) => x.name.toLowerCase());
    const csvGroups = new Set(Object.values(store.studentsToCreate).map((x) => x.group));
    store.groupsToCreate = Array.from(csvGroups).filter((x) => !groupNames.includes(x.toLowerCase()));
  }

  /**
   * Process a CSV uploaded by the user.
   *
   * @param {File} f The JS File object to pull content from.
   * @throws {Error} If there was a critical error when processing the file.
   */
  async function processFile(f: File) {
    resetImportData();

    // Ensure the CSV file has the correct extension
    const extIndex = f.name.lastIndexOf('.');
    const ext = f.name.substring(extIndex).toLowerCase();

    if (ext !== '.csv') {
      throw new Error(`Import requires a .csv file and you provided ${ext}.`);
    }

    store.loading = true;
    const contents = await f.text();

    try {
      await importCSV(contents);
    } catch (e) {
      throw e?.message ?? e;
    } finally {
      store.loading = false;
    }
  }

  /**
   * Set the list of Share Types that will be created on import.
   *
   * @param value
   */
  function setShareTypeTemplate(value: ShareTemplate[]) {
    store.shareTypes = value;
  }

  /**
   * Resolves the group name provided with a database value or pending group.
   *
   * @param name The group name.
   */
  function resolveGroupName(name: string) {
    const dbGroup = store.dbGroups.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (dbGroup) return dbGroup.name;

    const groupName = store.groupsToCreate.find((x) => x.toLowerCase() === name.toLowerCase());
    if (groupName) return groupName;

    throw new Error(`Unable to resolve group '${name}.`);
  }

  /**
   * Select a group of students that should appear in the summary step.
   */
  function generateSample(count = 10) {
    if (students.value.length <= 0) {
      store.samples = [];
      return;
    }

    const keys = Object.keys(store.studentsToCreate);
    const accountNumbers = sample(keys, Math.min(count, keys.length));
    const ret: BulkImportSample[] = [];

    accountNumbers.forEach((accountNumber) => {
      const student = store.studentsToCreate[accountNumber.toString()];
      student.group = resolveGroupName(student.group);
      ret.push({
        ...student,
        shares: [...store.shareTypes],
      });
    });

    store.samples = ret;
  }

  /**
   * Increment the multi-part workflow to the next step.
   */
  function incrementStep() {
    if (hasNextStep.value) store.currentStep += 1;
  }

  /**
   * Decrement the multi-part workflow to the previous step.
   */
  function decrementStep() {
    if (hasPreviousStep.value) store.currentStep -= 1;
  }

  return {
    currentStep,
    hasNextStep,
    hasPreviousStep,
    loading,
    errors,
    instance,
    groups,
    students,
    samples,
    shareTemplates,
    isValid,
    incrementStep,
    decrementStep,
    setInstance,
    processFile,
    setShareTypeTemplate,
    generateSample,
    reset,
  };
}

export type BulkImportStore = ReturnType<typeof setup>;
