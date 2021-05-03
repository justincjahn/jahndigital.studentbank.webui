/*
 * USERS
 */

interface AuthenticateResponse {
  // Unique ID of the user.
  id: number;

  // JSON Web Token (JWT) for the user.
  jwtToken: string;
}

interface UserLoginResponse {
  userLogin: AuthenticateResponse;
}

/*
 * INSTANCES
 */

interface NewInstanceResponse {
  newInstance: Instance;
}

interface InstanceResponse {
  instances: {
    nodes: Instance[];
  };
}

interface UpdateInstanceResponse {
  updateInstance: Instance[];
}

interface DeleteInstanceResponse {
  deleteInstance: boolean;
}

/*
 * GROUPS
 */

interface NewGroupResponse {
  newGroup: Group[];
}

interface GroupResponse {
  groups: {
    nodes: Group[];
  };
}

interface PagedGroupResponse {
  groups: {
    pageInfo: PageInfo;
    nodes: Group[];
  };
}

interface UpdateGroupResponse {
  updateGroup: Group[];
}

interface DeleteGroupResponse {
  deleteGroup: boolean;
}

/*
 * STUDENTS
 */

interface StudentResponse {
  students: {
    nodes: Student[];
  };
}

interface PagedStudentResponse {
  students: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Student[];
  };
}

interface UpdateStudentResponse {
  updateStudent: Student[];
}

interface UpdateBulkStudentResponse {
  updateBulkStudent: Student[];
}

interface NewStudentResponse {
  newStudent: Student[];
}

interface DeleteStudentResponse {
  deleteStudent: boolean;
}

/*
 * TRANSACTIONS
 */

interface PagedTransactionResponse {
  transactions: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Transaction[];
  };
}

interface NewTransactionResponse {
  newTransaction: Transaction;
}

interface NewBulkTransactionResponse {
  newBulkTransaction: Transaction[];
}

/*
 * SHARES
 */
interface NewShareResponse {
  newShare: Share[];
}

interface DeleteShareResponse {
  deleteShare: boolean;
}

/*
 * SHARE TYPES
 */

interface NewShareTypeResponse {
  newShareType: ShareType[];
}

interface PagedShareTypeResponse {
  shareTypes?: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: ShareType[];
  };

  availableShareTypes?: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: ShareType[];
  };
}

interface UpdateShareTypeResponse {
  updateShareType: ShareType[];
}

interface LinkShareTypeResponse {
  linkShareType: ShareType[];
}

interface UnlinkShareTypeResponse {
  unlinkShareType: ShareType[];
}

interface DeleteShareTypeResponse {
  deleteShareType: boolean;
}

/*
 * DIVIDENDS
 */

interface DividendPostingResponse {
  postDividends: boolean;
}
