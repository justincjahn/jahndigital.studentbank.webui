// Objects mirroring GraphQL responses for queries and mutations.

/*
 * USERS
 */

interface AuthenticateResponse {
  jwtToken: string;
}

interface UserLoginResponse {
  userLogin: AuthenticateResponse;
}

interface StudentLoginResponse {
  studentLogin: AuthenticateResponse;
}

interface StudentPreregistrationResponse {
  studentPreregistration: string;
}

interface UserPreregistrationResponse {
  userPreregistration: string;
}

interface StudentRegistrationResponse {
  studentRegistration: boolean;
}

interface CurrentUserResponse {
  currentUser: UserInfo[];
}

interface CurrentStudentResponse {
  currentStudent: StudentInfo[];
}

interface RevokeStudentRefreshTokenResponse {
  studentRevokeRefreshToken: boolean;
}

interface RevokeUserRefreshTokenResponse {
  userRevokeRefreshToken: boolean;
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

interface RestoreInstanceResponse {
  restoreInstance: Instance[];
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

interface RestoreGroupResponse {
  restoreGroup: Group[];
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

interface StudentAccountNumber {
  accountNumber: string;
}

interface StudentFilterResponse {
  students: {
    nodes: StudentAccountNumber[];
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

interface RestoreStudentResponse {
  restoreStudent: Student[];
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

interface NewTransferResponse {
  newTransfer: {
    item1: Transaction;
    item2: Transaction;
  };
}

/*
 * SHARES
 */
interface NewShareResponse {
  newShare: Share[];
}

interface UpdateShareResponse {
  updateShare: Share[];
}

interface DeleteShareResponse {
  deleteShare: boolean;
}

interface RestoreShareResponse {
  restoreShare: Share[];
}

interface PagedShareResponse {
  shares: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Share[];
  };
}

/*
 * SHARE TYPES
 */

interface NewShareTypeResponse {
  newShareType: ShareType[];
}

interface PagedShareType {
  pageInfo: PageInfo;
  totalCount: number;
  nodes: ShareType[];
}

interface PagedShareTypeResponse {
  shareTypes: PagedShareType;
}

interface PagedAvailableShareTypeResponse {
  availableShareTypes: PagedShareType;
}

interface CombinedPagedShareTypeResponse {
  shareTypes?: PagedShareType;
  availableShareTypes?: PagedShareType;
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

interface RestoreShareTypeResponse {
  restoreShareType: ShareType[];
}

/*
 * DIVIDENDS
 */

interface DividendPostingResponse {
  postDividends: boolean;
}

/*
 * STOCKS
 */

interface NewStockResponse{
  newStock: Stock[];
}

interface PagedStockResponse {
  stocks: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Stock[];
  };
}

interface PagedStockHistoryResponse {
  stockHistory: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: StockHistory[];
  };
}

interface PagedStudentStockResponse {
  studentStocks: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: StudentStock[];
  };
}

interface PagedStudentStockHistoryResponse {
  studentStockHistory: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: StudentStockHistory[];
  };
}

interface NewStockPurchaseResponse {
  newStockPurchase: StudentStock[];
}

interface UpdateStockResponse {
  updateStock: Stock[];
}

interface LinkStockResponse {
  linkStock: Stock[];
}

interface UnlinkStockResponse {
  unlinkStock: Stock[];
}

interface DeleteStockResponse {
  deleteStock: boolean;
}

interface RestoreStockResponse {
  restoreStock: Stock[];
}
