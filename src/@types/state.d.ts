declare namespace State {
  interface IGlobalState {
    currentError: string|null;
    topmostModal: HTMLElement|null;
  }

  interface IGroupState {
    groups: Group[];
    selectedGroup: Group|null;
    loading: boolean;
  }

  interface IInstanceState {
    instances: Instance[];
    selectedInstance: Instance | null;
    loading: boolean;
  }

  interface IStudentState {
    students: Student[];
    selectedStudent: Student|null;
    totalCount: number;
    pageInfo: PageInfo|null;
    loading: boolean;
    studentPageCount: number;
  }

  interface IUserState {
    id?: number;
    username?: string;
    token?: string;
    isStudent: boolean;
    loading: boolean;
  }

  interface IRootState {
    user: IUserState;
    instance: IInstanceState;
    group: IGroupState;
    student: IStudentState;
    global: IGlobalState;
  }
}
