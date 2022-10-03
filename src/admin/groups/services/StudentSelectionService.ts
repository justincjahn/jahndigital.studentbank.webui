import { reactive } from 'vue';

import type { Group } from '@/admin/common/services/group';
import type { Student } from '@/common/services/student';

import type {
  StudentsWithSharesQuery,
  StudentsWithSharesQueryVariables,
} from '@/generated/graphql';

import { query } from '@/common/services/apollo';
import gqlStudentsWithShares from '@/common/graphql/queries/studentsWithShares.gql';

/**
 * Possible types for the IStudentSelection object.
 */
enum StudentSelectionType {
  STUDENT = 'Student',
  GROUP = 'Group',
}

/**
 * Wrapper for a Student or Group object that helps facilitate the selection.
 */
interface IStudentSelection {
  type: StudentSelectionType;
  excluded: boolean;
  object: Student | Group;
}

/**
 * Manage the selection and deselection of students, including entire groups
 * and exclusions to those groups.
 */
export class StudentSelection extends Array<IStudentSelection> {
  /**
   * Clear the selection completely
   */
  clear(): void {
    this.splice(0, this.length);
  }

  /**
   * Returns a list of selected group IDs
   */
  getGroups(): Group[] {
    const groups: Group[] = this.filter(
      (item) => item.type === StudentSelectionType.GROUP && !item.excluded
    ).map((item) => item.object as Group);

    return groups;
  }

  /**
   * Returns a list of explicitly selected student IDs.
   */
  getStudents(group: Group | null = null): Student[] {
    if (group !== null) {
      return this.filter(
        (item) =>
          item.type === StudentSelectionType.STUDENT &&
          !item.excluded &&
          (item.object as Student).groupId === group.id
      ).map((item) => item.object as Student);
    }

    return this.filter(
      (item) => item.type === StudentSelectionType.STUDENT && !item.excluded
    ).map((item) => item.object as Student);
  }

  /**
   * Returns a list of students explicitly deselected.
   *
   * Explicit de-selections are excluded from group selections.
   *
   * @param group An optional group to limit the result set.
   */
  getExcludedStudents(group: Group | null = null): Student[] {
    const students: Student[] = [];

    this.forEach((item) => {
      if (item.type === StudentSelectionType.GROUP) {
        return;
      }
      if (item.excluded === false) {
        return;
      }
      if (group !== null && (item.object as Student).groupId !== group.id) {
        return;
      }
      students.push(item.object as Student);
    });

    return students;
  }

  /**
   * Returns true if the provided student object is selected (explicitly or via group).
   *
   * @param student The student object.
   * @param implicit If the student should still be considered if it's implicitly included by a group.
   */
  hasStudent(student: Student | null, implicit = true): boolean {
    if (student === null) return false;
    const hasGroup = this.hasGroup(student.groupId);

    const studentList = this.filter(
      (item) =>
        item.type === StudentSelectionType.STUDENT &&
        item.object.id === student.id
    )[0];

    const excluded = studentList?.excluded === true ?? false;

    if (excluded) {
      return false;
    }
    return (implicit && hasGroup) || studentList !== undefined;
  }

  /**
   * Returns true if the provided student object is excluded.
   *
   * @param student The student object
   */
  isExcluded(student: Student): boolean {
    if (student === null) return false;

    const result = this.find(
      (x) =>
        x.object.id === student.id &&
        x.type === StudentSelectionType.STUDENT &&
        x.excluded
    );

    if (!result) return false;
    return true;
  }

  /**
   * Returns true if the provided group is selected.
   *
   * @param group The Group object.
   */
  hasGroup(group: Group | number | null): boolean {
    if (group === null) return false;

    const groupId = typeof group === 'object' ? group.id : group;

    const groups = this.filter(
      (item) =>
        item.type === StudentSelectionType.GROUP &&
        item.object.id === groupId &&
        item.excluded === false
    );

    return groups.length > 0;
  }

  /**
   * Add a Student object to the selection.
   *
   * @param student The student object to add.
   */
  pushStudent(student: Student): void {
    if (this.hasStudent(student)) {
      return;
    }

    this.push({
      type: StudentSelectionType.STUDENT,
      excluded: false,
      object: student,
    });
  }

  /**
   * Add a Group object to the selection.
   *
   * @param group The group object to add.
   */
  pushGroup(group: Group): void {
    if (this.hasGroup(group.id)) {
      return;
    }

    const students = this.getStudents(group);
    students.forEach((x) => this.toggleStudent(x));

    this.push({
      type: StudentSelectionType.GROUP,
      excluded: false,
      object: group,
    });
  }

  /**
   * Remove a student from the selection.
   *
   * @param student The student object to remove.
   */
  popStudent(student: Student): void {
    const implicit = this.hasGroup(student.groupId);

    // The student is part of a selected group
    if (implicit) {
      // Modify the existing student
      if (this.hasStudent(student, false)) {
        const oldIndex: number = this.findIndex(
          (item) =>
            item.type === StudentSelectionType.STUDENT &&
            item.object.id === student.id
        );

        const newObject: IStudentSelection = {
          ...this[oldIndex],
          excluded: true,
        };

        this.splice(oldIndex, 1, newObject);
      } else if (this.isExcluded(student)) {
        const oldIndex: number = this.findIndex(
          (item) =>
            item.type === StudentSelectionType.STUDENT &&
            item.object.id === student.id
        );

        this.splice(oldIndex, 1);
      } else {
        this.push({
          type: StudentSelectionType.STUDENT,
          excluded: true,
          object: student,
        });
      }
    } else {
      const oldIndex: number = this.findIndex(
        (item) =>
          item.type === StudentSelectionType.STUDENT &&
          item.object.id === student.id
      );

      this.splice(oldIndex, 1);
    }
  }

  /**
   * Remove a group (and excluded students) from the selection.
   *
   * @param group The group object to remove.
   */
  popGroup(group: Group): void {
    const oldIndex: number = this.findIndex(
      (item) =>
        item.type === StudentSelectionType.GROUP && item.object.id === group.id
    );

    this.getExcludedStudents(group).forEach((student) => {
      const oldStudentIndex = this.findIndex(
        (item) =>
          item.type === StudentSelectionType.STUDENT &&
          item.object.id === student.id
      );

      this.splice(oldStudentIndex, 1);
    });

    this.splice(oldIndex, 1);
  }

  /**
   * Add or remove the provided student object from the selection.
   *
   * @param student The student to select/deselect.
   */
  toggleStudent(student: Student | null): void {
    if (student == null) return;

    const excluded: IStudentSelection | undefined = this.find(
      (x) =>
        x.type === StudentSelectionType.STUDENT &&
        x.object.id === student.id &&
        x.excluded === true
    );

    if (this.hasStudent(student) || excluded) {
      this.popStudent(student);
    } else {
      this.pushStudent(student);
    }
  }

  /**
   * Add or remove the provided group object from the selection.
   *
   * @param group The group to select/deselect.
   */
  toggleGroup(group: Group | null): void {
    if (group == null) return;

    if (this.hasGroup(group)) {
      this.popGroup(group);
    } else {
      this.pushGroup(group);
    }
  }

  /**
   * Resolve the list of selections into an array of Student objects.
   */
  async resolve(): Promise<Student[]> {
    let students: Student[] = [];

    // Resolve the groups first (will need to fetch from server)
    const groups = this.getGroups();

    await Promise.all(
      groups.map(async (group) => {
        const studentList = await query<
          StudentsWithSharesQuery,
          StudentsWithSharesQueryVariables
        >(gqlStudentsWithShares, {
          groupId: group.id,
        });

        students = [...students, ...(studentList.students?.nodes ?? [])];
      })
    );

    // Resolve students not excluded
    students = [...students, ...this.getStudents()];

    // Resolve excluded
    this.filter((item) => item.excluded).forEach((item) => {
      if (item.type === StudentSelectionType.GROUP) {
        students = students.filter(
          (filter) => filter.groupId !== item.object.id
        );
      } else {
        students = students.filter((filter) => filter.id !== item.object.id);
      }
    });

    // Make sure the selection is unique
    students.filter((item, i) => students.indexOf(item) === i);

    return students;
  }
}

const selection = reactive(new StudentSelection());
export default selection;
