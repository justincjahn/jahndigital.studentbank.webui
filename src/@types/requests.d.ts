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
