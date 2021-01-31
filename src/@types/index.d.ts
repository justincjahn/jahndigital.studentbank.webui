interface Instance {
  id: number;
  description: string;
  isActive: boolean;
}

interface Transaction {
  id: number;
  targetShareId: number;
  transactionType: string;
  effectiveDate: string;
  comment?: string;
  amount: number;
  newBalance: number;
}

interface Share {
  id: number;
  shareTypeId: number;
  balance: number;
  shareType?: ShareType;
}

interface Student {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  groupId: number;
  shares?: Share[];
  group?: Group;
}

interface Group {
  id: number;
  instanceId: number;
  name: string;
  students?: Student[];
  instance?: Instance;
}

interface JwtData {
  // User ID
  nameid: string;

  // Username
  unique_name: string;

  // Email address
  email: string;

  // User role (if user)
  role?: string;

  // Type of user (user || student)
  utyp: string;

  // JWT Not Before
  nbf: number;

  // JWT Expiration
  exp: number;

  // JWT Issued At
  iat: number;

  // JWT Issuer
  iss: string;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface ShareTypeInstances {
  instanceId: number;
}

interface ShareType {
  id: number;
  name: string;
  dividendRate: number;
  shareTypeInstances: ShareTypeInstances[];
}

/// <reference path="./requests.d.ts" />
/// <reference path="./responses.d.ts" />
/// <reference path="./state.d.ts" />
