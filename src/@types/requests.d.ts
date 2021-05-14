/*
 * USERS
 */

interface LoginRequest {
  username: string;
  password: string;
}

interface StudentPreregistrationRequest {
  inviteCode: string;
  accountNumber: string;
}

/*
 * INSTANCES
 */

interface NewInstanceRequest {
  description: string;
}

interface UpdateInstanceRequest {
  id: number;
  description?: string;
  isActive?: boolean;
}

interface DeleteRestoreInstanceRequest {
  id: number;
}

/*
 * GROUPS
 */

interface NewGroupRequest {
  instanceId: number;
  name: string;
}

interface UpdateGroupRequest {
  id: number;
  name?: string;
  instanceId?: number;
}

interface DeleteRestoreGroupRequest {
  id: number;
}

/*
 * TRANSACTIONS
 */

interface NewTransactionRequest {
  shareId: number;
  amount: number;
  comment?: string;
  takeNegative?: boolean = false;
}

interface NewBulkTransactionRequest {
  shares: NewTransactionRequest[];
  skipNegative: boolean;
}

interface NewTransferRequest {
  sourceShareId: number;
  destinationShareId: number;
  amount: number;
  comment?: string;
}

/*
 * STUDENTS
 */

interface UpdateStudentRequest {
  id: number;
  groupId?: number;
  accountNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

interface NewStudentRequest {
  groupId: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  email?: string;
}

type UpdateBulkStudentRequest = UpdateStudentRequest[];

interface DeleteRestoreStudentRequest {
  id: number;
}

/*
 * SHARES
 */

interface NewShareRequest {
  shareTypeId: number;
  studentId: number;
}

interface UpdateShareRequest {
  id: number;
  shareTypeId: number;
}

interface DeleteRestoreShareRequest {
  id: number;
}

/*
 * SHARE TYPES
 */

interface NewShareTypeRequest {
  name: string;
  dividendRate: number;
}

interface UpdateShareTypeRequest {
  id: number;
  name?: string;
  dividendRate?: number;
}

interface LinkUnlinkShareTypeRequest {
  shareTypeId: number;
  instanceId: number;
}

interface DeleteRestoreShareTypeRequest {
  id: number;
}

/*
 * DIVIDENDS
 */

interface DividendPostingRequest {
  instances: number[];
  shareTypeId: number;
}

/*
 * STOCKS
 */

interface NewStockRequest {
  name: string;
  symbol: string;
  totalShares: number;
  currentValue: number;
}

interface UpdateStockRequest {
  id: number;
  name?: string;
  symbol?: string;
  totalShares?: number;
  currentValue?: number;
}

interface LinkUnlinkStockRequest {
  stockId: number;
  instanceId: number;
}

interface DeleteRestoreStockRequest {
  id: number;
}

interface NewStockPurchaseRequest {
  shareId: number;
  stockId: number;
  quantity: number;
}
