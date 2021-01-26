interface NewInstanceRequest {
  description: string;
}

interface UpdateInstanceRequest {
  id: number;
  description: string;
  isActive?: boolean;
}

interface UpdateGroupRequest {
  id: number;
  name?: string;
  instanceId?: number;
}

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
