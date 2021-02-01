/*
 * INSTANCES
 */

interface NewInstanceRequest {
  description: string;
}

interface UpdateInstanceRequest {
  id: number;
  description: string;
  isActive?: boolean;
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

/*
 * STUDENTS
 */

interface UpdateStudentRequest {
  id: number;
  groupId?: number;
  accountNumber?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

type UpdateBulkStudentRequest = UpdateStudentRequest[];

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
  dividendDate?: number;
}

interface LinkUnlinkShareTypeRequest {
  shareTypeId: number;
  instanceId: number;
}
