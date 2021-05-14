interface Instance {
  id: number;
  inviteCode: string;
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
  studentId: number;
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

interface PersistedData {
  iss: boolean;
  pre: boolean;
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

  // Preauthentication flas (Y|N)
  pre: string;

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

/**
 * Used to describe a Share Type that should be created for a specific Student
 * or group of Students.
 */
interface ShareTypeTemplate {
  shareType: ShareType|null;
  initialDeposit: string; // Form input
  error: string;
}

interface StockInstance {
  instanceId: number;
  instance: Instance;
}

interface Stock {
  id: number;
  name: string;
  symbol: string;
  availableShares: number;
  totalShares: number;
  currentValue: number;
  stockInstances: StockInstance[];
}

interface StockHistory {
  id: number;
  stockId: number;
  dateChanged: string;
  value: number;
}

interface StudentStock {
  id: number;
  stockId: number;
  studentId: number;
  sharesOwned: number;
  dateCreated: string;
  dateLastActive: string;
}

interface StudentStockHistory {
  id: number;
  count: number;
  amount: number;
  datePosted: string;
  transaction: Transaction;
}

/// <reference path="./requests.d.ts" />
/// <reference path="./responses.d.ts" />
/// <reference path="./state.d.ts" />
