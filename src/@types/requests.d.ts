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
