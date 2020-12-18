interface AuthenticateResponse {
  // Unique ID of the user.
  id: number;

  // JSON Web Token (JWT) for the user.
  jwtToken: string;
}

interface DeleteGroupResponse {
  deleteGroup: boolean;
}

interface DeleteInstanceResponse {
  deleteInstance: boolean;
}

type GroupResponse = {
  groups: {
    nodes: Group[];
  };
}

interface GroupResponse {
  groups: {
    nodes: Group[];
  };
}

interface InstanceResponse {
  instances: {
    nodes: Instance[];
  };
}

interface NewGroupRequest {
  instanceId: number;
  name: string;
}

interface NewGroupResponse {
  newGroup: Group[];
}

interface NewInstanceResponse {
  newInstance: Instance;
}

interface PagedGroupResponse {
  groups: {
    pageInfo: PageInfo;
    nodes: Group[];
  };
}

interface PagedStudentResponse {
  students: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Student[];
  };
}

interface PagedTransactionResponse {
  transactions: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Transaction[];
  };
}

interface StudentResponse {
  students: {
    nodes: Student[];
  };
}

interface UpdateGroupResponse {
  updateGroup: Group[];
}

interface UpdateInstanceResponse {
  updateInstance: Instance[];
}

interface UpdateStudentResponse {
  updateStudent: Student[];
}

interface UpdateStudentResponse {
  updateStudent: Student[];
}

interface UserLoginResponse {
  userLogin: AuthenticateResponse;
}

interface NewTransactionResponse {
  newTransaction: Transaction;
}
