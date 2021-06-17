// Global typings for common objects throughout the application.

/**
 * GLOBAL OBJECTS
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OneKey<K extends string, V = any> = {
  [P in K]: (Record<P, V> &
    Partial<Record<Exclude<K, P>, never>>) extends infer O
    ? { [Q in keyof O]: O[Q] }
    : never
}[K];

/**
 * BASE OBJECTS
 */

interface Instance {
  id: number;
  inviteCode: string;
  description: string;
  isActive: boolean;
}

interface Group {
  id: number;
  instanceId: number;
  name: string;
  students?: Student[];
  instance?: Instance;
}

interface Student {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateLastLogin: string;
  dateRegistered: string;
  groupId: number;
  shares?: Share[];
  group?: Group;
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

interface ShareTypeTemplate {
 shareType: ShareType|null;
 initialDeposit: string;
 error: string;
}

interface Share {
  id: number;
  studentId: number;
  shareTypeId: number;
  balance: number;
  shareType?: ShareType;
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
  stockInstances?: StockInstance[];
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
  stock: Stock;
}

interface StudentStockHistory {
  id: number;
  count: number;
  amount: number;
  datePosted: string;
  transaction: Transaction;
}

/**
 * AUTHENTICATION
 */

interface PersistedData {
  // Is student?
  iss: boolean;

  // Is preauthenticated?
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
  utyp: 'user' | 'student';

  // Preauthentication flag
  pre?: 'Y' | 'N';

  // JWT Not Before
  nbf: number;

  // JWT Expiration
  exp: number;

  // JWT Issued At
  iat: number;

  // JWT Issuer
  iss: string;
}

/**
 * AUTHORIZATION
 */

interface Privilege {
  name: string;
  description: string;
}

interface Role {
  description: name;
  rolePrivileges: Privilege[];
}

/**
 * LOGIN INFORMATION
 */

interface UserInfo {
  id: number;
  email: string;
  role: Role;
}

interface StudentInfo {
  id: number;
  accountNumber: string;
  email: string;
  group: Group;
}

/**
 * PAGINATION
 */

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

/// <reference path="./requests.d.ts" />
/// <reference path="./responses.d.ts" />
/// <reference path="./gql.d.ts" />
