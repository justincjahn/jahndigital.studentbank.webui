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

  interface IShareState {
    id?: number;
    selectedShare: Share|null;
    transactions: Transaction[];
    totalCount: number;
    pageInfo: PageInfo|null;
    loading: boolean;
  }

  interface IRootState {
    share: IShareState;
    user: IUserState;
    instance: IInstanceState;
    group: IGroupState;
    student: IStudentState;
    global: IGlobalState;
  }
}
