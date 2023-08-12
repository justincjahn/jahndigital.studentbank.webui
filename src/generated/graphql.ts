export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `DateTime` scalar represents an ISO-8601 compliant date time type. */
  DateTime: { input: string; output: string; }
  /** The built-in `Decimal` scalar type. */
  Decimal: { input: number; output: number; }
  /** The `Long` scalar type represents non-fractional signed whole 64-bit numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: { input: number; output: number; }
  /** US Currency as a float (preferred) or string without the dollar symbol. E.g 10.33 is $10.33. */
  Money: { input: number; output: number; }
  /** API/Interest Rate represented as a float.  E.g. 0.02 is 0.02% */
  Rate: { input: number; output: number; }
};

export enum ApplyPolicy {
  AfterResolver = 'AFTER_RESOLVER',
  BeforeResolver = 'BEFORE_RESOLVER'
}

export type AuthenticateRequestInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type AuthenticateResponse = {
  __typename?: 'AuthenticateResponse';
  id: Scalars['Long']['output'];
  jwtToken: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type BooleanOperationFilterInput = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  neq?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ComparableDateTimeOperationFilterInput = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
  ngt?: InputMaybe<Scalars['DateTime']['input']>;
  ngte?: InputMaybe<Scalars['DateTime']['input']>;
  nin?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  nlt?: InputMaybe<Scalars['DateTime']['input']>;
  nlte?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ComparableDecimalOperationFilterInput = {
  eq?: InputMaybe<Scalars['Decimal']['input']>;
  gt?: InputMaybe<Scalars['Decimal']['input']>;
  gte?: InputMaybe<Scalars['Decimal']['input']>;
  in?: InputMaybe<Array<Scalars['Decimal']['input']>>;
  lt?: InputMaybe<Scalars['Decimal']['input']>;
  lte?: InputMaybe<Scalars['Decimal']['input']>;
  neq?: InputMaybe<Scalars['Decimal']['input']>;
  ngt?: InputMaybe<Scalars['Decimal']['input']>;
  ngte?: InputMaybe<Scalars['Decimal']['input']>;
  nin?: InputMaybe<Array<Scalars['Decimal']['input']>>;
  nlt?: InputMaybe<Scalars['Decimal']['input']>;
  nlte?: InputMaybe<Scalars['Decimal']['input']>;
};

export type ComparableInt32OperationFilterInput = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
  ngt?: InputMaybe<Scalars['Int']['input']>;
  ngte?: InputMaybe<Scalars['Int']['input']>;
  nin?: InputMaybe<Array<Scalars['Int']['input']>>;
  nlt?: InputMaybe<Scalars['Int']['input']>;
  nlte?: InputMaybe<Scalars['Int']['input']>;
};

export type ComparableInt64OperationFilterInput = {
  eq?: InputMaybe<Scalars['Long']['input']>;
  gt?: InputMaybe<Scalars['Long']['input']>;
  gte?: InputMaybe<Scalars['Long']['input']>;
  in?: InputMaybe<Array<Scalars['Long']['input']>>;
  lt?: InputMaybe<Scalars['Long']['input']>;
  lte?: InputMaybe<Scalars['Long']['input']>;
  neq?: InputMaybe<Scalars['Long']['input']>;
  ngt?: InputMaybe<Scalars['Long']['input']>;
  ngte?: InputMaybe<Scalars['Long']['input']>;
  nin?: InputMaybe<Array<Scalars['Long']['input']>>;
  nlt?: InputMaybe<Scalars['Long']['input']>;
  nlte?: InputMaybe<Scalars['Long']['input']>;
};

export type ComparableNullableOfDateTimeOperationFilterInput = {
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  neq?: InputMaybe<Scalars['DateTime']['input']>;
  ngt?: InputMaybe<Scalars['DateTime']['input']>;
  ngte?: InputMaybe<Scalars['DateTime']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  nlt?: InputMaybe<Scalars['DateTime']['input']>;
  nlte?: InputMaybe<Scalars['DateTime']['input']>;
};

/** A connection to a list of items. */
export type DeletedGroupsConnection = {
  __typename?: 'DeletedGroupsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedGroupsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Group>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedGroupsEdge = {
  __typename?: 'DeletedGroupsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Group;
};

/** A connection to a list of items. */
export type DeletedInstancesConnection = {
  __typename?: 'DeletedInstancesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedInstancesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Instance>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedInstancesEdge = {
  __typename?: 'DeletedInstancesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Instance;
};

/** A connection to a list of items. */
export type DeletedProductsConnection = {
  __typename?: 'DeletedProductsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedProductsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Product>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedProductsEdge = {
  __typename?: 'DeletedProductsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Product;
};

/** A connection to a list of items. */
export type DeletedShareTypesConnection = {
  __typename?: 'DeletedShareTypesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedShareTypesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<ShareType>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedShareTypesEdge = {
  __typename?: 'DeletedShareTypesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: ShareType;
};

/** A connection to a list of items. */
export type DeletedSharesConnection = {
  __typename?: 'DeletedSharesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedSharesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Share>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedSharesEdge = {
  __typename?: 'DeletedSharesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Share;
};

/** A connection to a list of items. */
export type DeletedStocksConnection = {
  __typename?: 'DeletedStocksConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedStocksEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Stock>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedStocksEdge = {
  __typename?: 'DeletedStocksEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Stock;
};

/** A connection to a list of items. */
export type DeletedStudentsConnection = {
  __typename?: 'DeletedStudentsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<DeletedStudentsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Student>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type DeletedStudentsEdge = {
  __typename?: 'DeletedStudentsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Student;
};

export type Group = {
  __typename?: 'Group';
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Long']['output'];
  instance: Instance;
  instanceId: Scalars['Long']['output'];
  name: Scalars['String']['output'];
  students: Array<Student>;
};

export type GroupFilterInput = {
  and?: InputMaybe<Array<GroupFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  instance?: InputMaybe<InstanceFilterInput>;
  instanceId?: InputMaybe<ComparableInt64OperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<GroupFilterInput>>;
  students?: InputMaybe<ListFilterInputTypeOfStudentFilterInput>;
};

export type GroupSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  instance?: InputMaybe<InstanceSortInput>;
  instanceId?: InputMaybe<SortEnumType>;
  name?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type GroupsConnection = {
  __typename?: 'GroupsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<GroupsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Group>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type GroupsEdge = {
  __typename?: 'GroupsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Group;
};

export type Instance = {
  __typename?: 'Instance';
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  groups: Array<Group>;
  id: Scalars['Long']['output'];
  inviteCode: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  productInstances: Array<ProductInstance>;
  shareTypeInstances: Array<ShareTypeInstance>;
  stockInstances: Array<StockInstance>;
};

export type InstanceFilterInput = {
  and?: InputMaybe<Array<InstanceFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  description?: InputMaybe<StringOperationFilterInput>;
  groups?: InputMaybe<ListFilterInputTypeOfGroupFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  inviteCode?: InputMaybe<StringOperationFilterInput>;
  isActive?: InputMaybe<BooleanOperationFilterInput>;
  or?: InputMaybe<Array<InstanceFilterInput>>;
  productInstances?: InputMaybe<ListFilterInputTypeOfProductInstanceFilterInput>;
  shareTypeInstances?: InputMaybe<ListFilterInputTypeOfShareTypeInstanceFilterInput>;
  stockInstances?: InputMaybe<ListFilterInputTypeOfStockInstanceFilterInput>;
};

export type InstanceSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  description?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  inviteCode?: InputMaybe<SortEnumType>;
  isActive?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type InstancesConnection = {
  __typename?: 'InstancesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<InstancesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Instance>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type InstancesEdge = {
  __typename?: 'InstancesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Instance;
};

export type LinkProductRequestInput = {
  instanceId: Scalars['Long']['input'];
  productId: Scalars['Long']['input'];
};

/** Request to link or unlink a share type to an Instance. */
export type LinkShareTypeRequestInput = {
  /** The instance to link to. */
  instanceId: Scalars['Long']['input'];
  /** The share type to link. */
  shareTypeId: Scalars['Long']['input'];
};

/** Request to link or unlink a stock to an Instance. */
export type LinkStockRequestInput = {
  /** The instance to link to. */
  instanceId: Scalars['Long']['input'];
  /** The stock to link. */
  stockId: Scalars['Long']['input'];
};

export type ListFilterInputTypeOfGroupFilterInput = {
  all?: InputMaybe<GroupFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<GroupFilterInput>;
  some?: InputMaybe<GroupFilterInput>;
};

export type ListFilterInputTypeOfProductImageFilterInput = {
  all?: InputMaybe<ProductImageFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ProductImageFilterInput>;
  some?: InputMaybe<ProductImageFilterInput>;
};

export type ListFilterInputTypeOfProductInstanceFilterInput = {
  all?: InputMaybe<ProductInstanceFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ProductInstanceFilterInput>;
  some?: InputMaybe<ProductInstanceFilterInput>;
};

export type ListFilterInputTypeOfRefreshTokenFilterInput = {
  all?: InputMaybe<RefreshTokenFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<RefreshTokenFilterInput>;
  some?: InputMaybe<RefreshTokenFilterInput>;
};

export type ListFilterInputTypeOfRolePrivilegeFilterInput = {
  all?: InputMaybe<RolePrivilegeFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<RolePrivilegeFilterInput>;
  some?: InputMaybe<RolePrivilegeFilterInput>;
};

export type ListFilterInputTypeOfShareFilterInput = {
  all?: InputMaybe<ShareFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ShareFilterInput>;
  some?: InputMaybe<ShareFilterInput>;
};

export type ListFilterInputTypeOfShareTypeInstanceFilterInput = {
  all?: InputMaybe<ShareTypeInstanceFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<ShareTypeInstanceFilterInput>;
  some?: InputMaybe<ShareTypeInstanceFilterInput>;
};

export type ListFilterInputTypeOfStockHistoryFilterInput = {
  all?: InputMaybe<StockHistoryFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StockHistoryFilterInput>;
  some?: InputMaybe<StockHistoryFilterInput>;
};

export type ListFilterInputTypeOfStockInstanceFilterInput = {
  all?: InputMaybe<StockInstanceFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StockInstanceFilterInput>;
  some?: InputMaybe<StockInstanceFilterInput>;
};

export type ListFilterInputTypeOfStudentFilterInput = {
  all?: InputMaybe<StudentFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StudentFilterInput>;
  some?: InputMaybe<StudentFilterInput>;
};

export type ListFilterInputTypeOfStudentPurchaseFilterInput = {
  all?: InputMaybe<StudentPurchaseFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StudentPurchaseFilterInput>;
  some?: InputMaybe<StudentPurchaseFilterInput>;
};

export type ListFilterInputTypeOfStudentPurchaseItemFilterInput = {
  all?: InputMaybe<StudentPurchaseItemFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StudentPurchaseItemFilterInput>;
  some?: InputMaybe<StudentPurchaseItemFilterInput>;
};

export type ListFilterInputTypeOfStudentStockFilterInput = {
  all?: InputMaybe<StudentStockFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StudentStockFilterInput>;
  some?: InputMaybe<StudentStockFilterInput>;
};

export type ListFilterInputTypeOfStudentStockHistoryFilterInput = {
  all?: InputMaybe<StudentStockHistoryFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<StudentStockHistoryFilterInput>;
  some?: InputMaybe<StudentStockHistoryFilterInput>;
};

export type ListFilterInputTypeOfTransactionFilterInput = {
  all?: InputMaybe<TransactionFilterInput>;
  any?: InputMaybe<Scalars['Boolean']['input']>;
  none?: InputMaybe<TransactionFilterInput>;
  some?: InputMaybe<TransactionFilterInput>;
};

export type MoneyFilterInput = {
  amount?: InputMaybe<ComparableDecimalOperationFilterInput>;
  and?: InputMaybe<Array<MoneyFilterInput>>;
  databaseAmount?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<MoneyFilterInput>>;
};

export type MoneySortInput = {
  amount?: InputMaybe<SortEnumType>;
  databaseAmount?: InputMaybe<SortEnumType>;
};

/** CRUD operations for User entities. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Delete a Group. */
  deleteGroup: Scalars['Boolean']['output'];
  /** Soft-delete an Instance. */
  deleteInstance: Scalars['Boolean']['output'];
  /** Soft-delete a Product. */
  deleteProduct: Scalars['Boolean']['output'];
  /** Soft-delete a Share . */
  deleteShare: Scalars['Boolean']['output'];
  /** Soft-delete a ShareType. */
  deleteShareType: Scalars['Boolean']['output'];
  /** Soft-delete a stock. */
  deleteStock: Scalars['Boolean']['output'];
  /** Delete a student. */
  deleteStudent: Scalars['Boolean']['output'];
  /** Delete a user. */
  deleteUser: Scalars['Boolean']['output'];
  /** Link a Product with the provided Group. */
  linkProduct: Array<Product>;
  /** Link a ShareType to an Instance.abstract */
  linkShareType: Array<ShareType>;
  /** Link a Stock to an Instance. */
  linkStock: Array<Stock>;
  /** Perform a bulk transaction and return transaction information. */
  newBulkTransaction: Array<Transaction>;
  /** Create a new Group. */
  newGroup: Array<Group>;
  /** Create an Instance. */
  newInstance: Instance;
  /** Create a new Product. */
  newProduct: Array<Product>;
  /** Make a new purchase, if authorized. */
  newPurchase: Array<StudentPurchase>;
  /** Create a new Share . */
  newShare: Array<Share>;
  /** Create a new ShareType. */
  newShareType: Array<ShareType>;
  /** Create a new stock. */
  newStock: Array<Stock>;
  /** Attempt to buy or sell the provided stock. */
  newStockPurchase: Array<StudentStock>;
  /** Create a new student. */
  newStudent: Array<Student>;
  /** Post a Transaction to the provided share, if authorized. */
  newTransaction: Transaction;
  /** Transfer funds from one share to another, if authorized. */
  newTransfer: TupleOfTransactionAndTransaction;
  /** Create a new user. */
  newUser: Array<User>;
  /** Post dividends for a specific ShareType and a group of Instance. */
  postDividends: Scalars['Boolean']['output'];
  /** Purge stock history for a given stock to a given date. */
  purgeStockHistory: Array<StockHistory>;
  /** Restore a soft-deleted Group. */
  restoreGroup: Array<Group>;
  /** Restore a soft-deleted Instance. */
  restoreInstance: Array<Instance>;
  /** Restore a soft-deleted Product. */
  restoreProduct: Array<Product>;
  /** Restore a soft-deleted Share. */
  restoreShare: Array<Share>;
  /** Restore a soft-deleted ShareType. */
  restoreShareType: Array<ShareType>;
  /** Restore a deleted stock. */
  restoreStock: Array<Stock>;
  /** Restore a deleted student. */
  restoreStudent: Array<Student>;
  /** Log the student in using a username and password and return JWT tokens. */
  studentLogin: AuthenticateResponse;
  /**
   * Attempt to generate a preauthorization token from the provided input.
   *
   *
   * **Returns:**
   * A temporary JWT token if preauthorization is successful.
   */
  studentPreregistration: Scalars['String']['output'];
  /** Obtain a new JWT token using a refresh token. */
  studentRefreshToken: AuthenticateResponse;
  /**
   * Register a student using the preauthorization token and provided input.
   *
   *
   * **Returns:**
   * True if registration is successful, otherwise an error message.
   */
  studentRegistration: Scalars['Boolean']['output'];
  /** Revoke a refresh token. */
  studentRevokeRefreshToken: Scalars['Boolean']['output'];
  /** Unlink a Product from the provided Group. */
  unlinkProduct: Array<Product>;
  /** Unlink a ShareType from an Instance. */
  unlinkShareType: Array<ShareType>;
  /** Unlink a Stock from an Instance. */
  unlinkStock: Array<Stock>;
  /** Update a group of students at once. */
  updateBulkStudent: Array<Student>;
  /** Update a Group. */
  updateGroup: Array<Group>;
  /** Update an Instance. */
  updateInstance: Array<Instance>;
  /** Update a Product. */
  updateProduct: Array<Product>;
  /** Update a Share . */
  updateShare: Array<Share>;
  /** Update a ShareType. */
  updateShareType: Array<ShareType>;
  /** Update a Stock. */
  updateStock: Array<Stock>;
  /** Update an existing student. */
  updateStudent: Array<Student>;
  /** Update a user. */
  updateUser: Array<User>;
  /** Log the user in using a username and password and return JWT tokens. */
  userLogin: AuthenticateResponse;
  /** Obtain a new JWT token using a refresh token. */
  userRefreshToken: AuthenticateResponse;
  /** Revoke a refresh token. */
  userRevokeRefreshToken: Scalars['Boolean']['output'];
};


/** CRUD operations for User entities. */
export type MutationDeleteGroupArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteInstanceArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteProductArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteShareArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteShareTypeArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteStockArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteStudentArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationDeleteUserArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationLinkProductArgs = {
  input: LinkProductRequestInput;
};


/** CRUD operations for User entities. */
export type MutationLinkShareTypeArgs = {
  input: LinkShareTypeRequestInput;
};


/** CRUD operations for User entities. */
export type MutationLinkStockArgs = {
  input: LinkStockRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewBulkTransactionArgs = {
  input: Array<NewTransactionRequestInput>;
  skipBelowNegative?: Scalars['Boolean']['input'];
};


/** CRUD operations for User entities. */
export type MutationNewGroupArgs = {
  input: NewGroupRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewInstanceArgs = {
  input: NewInstanceRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewProductArgs = {
  input: NewProductRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewPurchaseArgs = {
  input: PurchaseRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewShareArgs = {
  input: NewShareRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewShareTypeArgs = {
  input: NewShareTypeRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewStockArgs = {
  input: NewStockRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewStockPurchaseArgs = {
  input: PurchaseStockRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewStudentArgs = {
  input: NewStudentRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewTransactionArgs = {
  input: TransactionRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewTransferArgs = {
  input: NewTransferRequestInput;
};


/** CRUD operations for User entities. */
export type MutationNewUserArgs = {
  input: NewUserRequestInput;
};


/** CRUD operations for User entities. */
export type MutationPostDividendsArgs = {
  input: PostDividendsRequestInput;
};


/** CRUD operations for User entities. */
export type MutationPurgeStockHistoryArgs = {
  input: PurgeStockRequestInput;
};


/** CRUD operations for User entities. */
export type MutationRestoreGroupArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationRestoreInstanceArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationRestoreProductArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationRestoreShareArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationRestoreShareTypeArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationRestoreStockArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationRestoreStudentArgs = {
  id: Scalars['Long']['input'];
};


/** CRUD operations for User entities. */
export type MutationStudentLoginArgs = {
  input: AuthenticateRequestInput;
};


/** CRUD operations for User entities. */
export type MutationStudentPreregistrationArgs = {
  input: StudentPreauthenticationRequestInput;
};


/** CRUD operations for User entities. */
export type MutationStudentRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


/** CRUD operations for User entities. */
export type MutationStudentRegistrationArgs = {
  input: StudentRegisterRequestInput;
};


/** CRUD operations for User entities. */
export type MutationStudentRevokeRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


/** CRUD operations for User entities. */
export type MutationUnlinkProductArgs = {
  input: LinkProductRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUnlinkShareTypeArgs = {
  input: LinkShareTypeRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUnlinkStockArgs = {
  input: LinkStockRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateBulkStudentArgs = {
  input: Array<UpdateStudentRequestInput>;
};


/** CRUD operations for User entities. */
export type MutationUpdateGroupArgs = {
  input: UpdateGroupRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateInstanceArgs = {
  input: UpdateInstanceRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateProductArgs = {
  input: UpdateProductRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateShareArgs = {
  input: UpdateShareRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateShareTypeArgs = {
  input: UpdateShareTypeRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateStockArgs = {
  input: UpdateStockRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateStudentArgs = {
  input: UpdateStudentRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUpdateUserArgs = {
  input: UpdateUserRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUserLoginArgs = {
  input: AuthenticateRequestInput;
};


/** CRUD operations for User entities. */
export type MutationUserRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};


/** CRUD operations for User entities. */
export type MutationUserRevokeRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};

/** Request data to create a group. */
export type NewGroupRequestInput = {
  /** Get or set the Instance ID of the group. */
  instanceId: Scalars['Long']['input'];
  /** Get or set the name of the group. */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type NewInstanceRequestInput = {
  /** Get or set the description of the instance. */
  description?: InputMaybe<Scalars['String']['input']>;
};

export type NewProductRequestInput = {
  cost?: InputMaybe<Scalars['Money']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isLimitedQuantity: Scalars['Boolean']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Int']['input'];
};

export type NewShareRequestInput = {
  shareTypeId: Scalars['Long']['input'];
  studentId: Scalars['Long']['input'];
};

/** Request data to create a Share Type. */
export type NewShareTypeRequestInput = {
  /** Get or set the dividend rate. */
  dividendRate: Scalars['Rate']['input'];
  /** Get or set the name of the share type. */
  name: Scalars['String']['input'];
  /** Get or set the number of withdrawals allowed per period.  Use zero to disable. */
  withdrawalLimitCount?: InputMaybe<Scalars['Int']['input']>;
  /** Get or set the amount to fee if WithdrawalLimitShouldFee is true. */
  withdrawalLimitFee?: InputMaybe<Scalars['Money']['input']>;
  /** Get or set the withdrawal limit period to use when resetting the withdrawal limit counters. */
  withdrawalLimitPeriod?: InputMaybe<Period>;
  /** Get or set if withdrawals over the WithdrawalLimitCount should fee instead of being declined. */
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NewStockRequestInput = {
  /** The current value of the stock. */
  currentValue: Scalars['Money']['input'];
  /** Name of the company */
  name: Scalars['String']['input'];
  /** The description of the stock. */
  rawDescription?: InputMaybe<Scalars['String']['input']>;
  /** Unique symbol of the stock. */
  symbol: Scalars['String']['input'];
};

/** Data fields for a new student. */
export type NewStudentRequestInput = {
  /** Get or set the student's account number. */
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's email address. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's first name. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's group ID. */
  groupId: Scalars['Long']['input'];
  /** Get or set the student's last name. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's password. */
  password?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a request to post a monetary transaction. */
export type NewTransactionRequestInput = {
  /** Get or set the amount to post. */
  amount: Scalars['Money']['input'];
  /** Get or set an optional comment for the transaction. */
  comment?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the Share ID to post to. */
  shareId: Scalars['Long']['input'];
  /** Allow the transaction to take the account negative. */
  takeNegative?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Request to transfer funds from one share to another. */
export type NewTransferRequestInput = {
  /** The amount to transfer. */
  amount: Scalars['Money']['input'];
  /** Get or set an optional comment. */
  comment?: InputMaybe<Scalars['String']['input']>;
  /** The destination Share ID. */
  destinationShareId: Scalars['Long']['input'];
  /** The source Share ID. */
  sourceShareId: Scalars['Long']['input'];
};

/** Data fields to create a user. */
export type NewUserRequestInput = {
  /** Get or set the user's email address. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the user's password. */
  password?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the user's role. */
  roleId: Scalars['Long']['input'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Indicates whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Indicates whether more edges exist prior the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum Period {
  Annually = 'ANNUALLY',
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Weekly = 'WEEKLY'
}

export type PeriodOperationFilterInput = {
  eq?: InputMaybe<Period>;
  in?: InputMaybe<Array<Period>>;
  neq?: InputMaybe<Period>;
  nin?: InputMaybe<Array<Period>>;
};

export type PostDividendsRequestInput = {
  instances: Array<Scalars['Long']['input']>;
  shareTypeId: Scalars['Long']['input'];
};

export type Privilege = {
  __typename?: 'Privilege';
  dateCreated: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Long']['output'];
  name: Scalars['String']['output'];
  rolePrivileges: Array<RolePrivilege>;
};

export type PrivilegeFilterInput = {
  and?: InputMaybe<Array<PrivilegeFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  description?: InputMaybe<StringOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<PrivilegeFilterInput>>;
  rolePrivileges?: InputMaybe<ListFilterInputTypeOfRolePrivilegeFilterInput>;
};

export type Product = {
  __typename?: 'Product';
  cost: Scalars['Money']['output'];
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['Long']['output'];
  images: Array<ProductImage>;
  isLimitedQuantity: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  productInstances: Array<ProductInstance>;
  quantity: Scalars['Int']['output'];
  rawCost: Scalars['Long']['output'];
};

export type ProductFilterInput = {
  and?: InputMaybe<Array<ProductFilterInput>>;
  cost?: InputMaybe<MoneyFilterInput>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  description?: InputMaybe<StringOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  images?: InputMaybe<ListFilterInputTypeOfProductImageFilterInput>;
  isLimitedQuantity?: InputMaybe<BooleanOperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<ProductFilterInput>>;
  productInstances?: InputMaybe<ListFilterInputTypeOfProductInstanceFilterInput>;
  quantity?: InputMaybe<ComparableInt32OperationFilterInput>;
  rawCost?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type ProductImage = {
  __typename?: 'ProductImage';
  id: Scalars['Long']['output'];
  url: Scalars['String']['output'];
};

export type ProductImageFilterInput = {
  and?: InputMaybe<Array<ProductImageFilterInput>>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<ProductImageFilterInput>>;
  url?: InputMaybe<StringOperationFilterInput>;
};

export type ProductInstance = {
  __typename?: 'ProductInstance';
  instance: Instance;
  instanceId: Scalars['Long']['output'];
  product: Product;
  productId: Scalars['Long']['output'];
};

export type ProductInstanceFilterInput = {
  and?: InputMaybe<Array<ProductInstanceFilterInput>>;
  instance?: InputMaybe<InstanceFilterInput>;
  instanceId?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<ProductInstanceFilterInput>>;
  product?: InputMaybe<ProductFilterInput>;
  productId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type ProductSortInput = {
  cost?: InputMaybe<MoneySortInput>;
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  description?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  isLimitedQuantity?: InputMaybe<SortEnumType>;
  name?: InputMaybe<SortEnumType>;
  quantity?: InputMaybe<SortEnumType>;
  rawCost?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type ProductsConnection = {
  __typename?: 'ProductsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<ProductsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Product>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type ProductsEdge = {
  __typename?: 'ProductsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Product;
};

export type PurchaseRequestInput = {
  items: Array<PurchaseRequestItemInput>;
  shareId: Scalars['Long']['input'];
};

export type PurchaseRequestItemInput = {
  count: Scalars['Int']['input'];
  productId: Scalars['Long']['input'];
};

export enum PurchaseStatus {
  Cancelled = 'CANCELLED',
  Complete = 'COMPLETE',
  InProgress = 'IN_PROGRESS',
  Placed = 'PLACED'
}

export type PurchaseStatusOperationFilterInput = {
  eq?: InputMaybe<PurchaseStatus>;
  in?: InputMaybe<Array<PurchaseStatus>>;
  neq?: InputMaybe<PurchaseStatus>;
  nin?: InputMaybe<Array<PurchaseStatus>>;
};

export type PurchaseStockRequestInput = {
  quantity: Scalars['Int']['input'];
  shareId: Scalars['Long']['input'];
  stockId: Scalars['Long']['input'];
};

/** A connection to a list of items. */
export type PurchasesConnection = {
  __typename?: 'PurchasesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<PurchasesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<StudentPurchase>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type PurchasesEdge = {
  __typename?: 'PurchasesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: StudentPurchase;
};

/** A request to purge the history of a given stock. */
export type PurgeStockRequestInput = {
  /** A cutoff date.  Stock history entries older than this date will be purged. */
  date: Scalars['DateTime']['input'];
  /** The stock for which to purge history. */
  stockId: Scalars['Long']['input'];
};

/** Allows students to list their purchases and admins to list all purchases. */
export type Query = {
  __typename?: 'Query';
  /** Get the currently logged in student's information (if the user is a student). */
  currentStudent: Array<Student>;
  /** Get the currently logged in user information (if the user is a user). */
  currentUser: Array<User>;
  /** Get deleted groups if authorized (Manage Groups). */
  deletedGroups?: Maybe<DeletedGroupsConnection>;
  /** Get instances if authorized (Manage Instances) */
  deletedInstances?: Maybe<DeletedInstancesConnection>;
  /** Get a list of deleted products if authorized (Manage Products). */
  deletedProducts?: Maybe<DeletedProductsConnection>;
  /** Get share type information. */
  deletedShareTypes?: Maybe<DeletedShareTypesConnection>;
  /** Get deleted shares (if authorized). */
  deletedShares?: Maybe<DeletedSharesConnection>;
  /** Get all deleted stocks. */
  deletedStocks?: Maybe<DeletedStocksConnection>;
  /** Get all deleted students matching criteria. */
  deletedStudents?: Maybe<DeletedStudentsConnection>;
  /** Get groups if authorized (Manage Groups). */
  groups?: Maybe<GroupsConnection>;
  /** Get instances if authorized (Manage Instances) */
  instances?: Maybe<InstancesConnection>;
  /** Returns true if the user is authenticated. */
  isAuthenticated: Scalars['Boolean']['output'];
  /** Lists all products available to a given student. */
  products?: Maybe<ProductsConnection>;
  /** Get the purchases the user has available to them. */
  purchases?: Maybe<PurchasesConnection>;
  /** Get share type information available to the student or user. */
  shareTypes?: Maybe<ShareTypesConnection>;
  /** Get shares for the currently active user. */
  shares?: Maybe<SharesConnection>;
  /** Get a list of history for a given stock. */
  stockHistory?: Maybe<StockHistoryConnection>;
  /** Get a list of stocks available to the user. */
  stocks?: Maybe<StocksConnection>;
  /** Fetch information about a specific student. */
  student: Array<Student>;
  /** Get the purchase history for a student's stock. */
  studentStockHistory?: Maybe<StudentStockHistoryConnection>;
  /** Get the stocks purchased by the student specified. */
  studentStocks?: Maybe<StudentStocksConnection>;
  /** Get all students matching the criteria. */
  students?: Maybe<StudentsConnection>;
  /** Get transactions by Student ID and Share ID */
  transactions?: Maybe<TransactionsConnection>;
  /** Gets a list of users in the system. */
  users?: Maybe<UsersConnection>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<GroupSortInput>>;
  where?: InputMaybe<GroupFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedInstancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InstanceSortInput>>;
  where?: InputMaybe<InstanceFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ProductSortInput>>;
  where?: InputMaybe<ProductFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedShareTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ShareTypeSortInput>>;
  where?: InputMaybe<ShareTypeFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedSharesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ShareSortInput>>;
  where?: InputMaybe<ShareFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedStocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StockSortInput>>;
  where?: InputMaybe<StockFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedStudentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StudentSortInput>>;
  where?: InputMaybe<StudentFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<GroupSortInput>>;
  where?: InputMaybe<GroupFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryInstancesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InstanceSortInput>>;
  where?: InputMaybe<InstanceFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ProductSortInput>>;
  where?: InputMaybe<ProductFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryPurchasesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StudentPurchaseSortInput>>;
  where?: InputMaybe<StudentPurchaseFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryShareTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  instances?: InputMaybe<Array<Scalars['Long']['input']>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ShareTypeSortInput>>;
  where?: InputMaybe<ShareTypeFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QuerySharesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<ShareSortInput>>;
  where?: InputMaybe<ShareFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStockHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StockHistorySortInput>>;
  stockId: Scalars['Long']['input'];
  where?: InputMaybe<StockHistoryFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  instances?: InputMaybe<Array<Scalars['Long']['input']>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StockSortInput>>;
  where?: InputMaybe<StockFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentArgs = {
  studentId: Scalars['Long']['input'];
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentStockHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StudentStockHistorySortInput>>;
  studentStockId: Scalars['Long']['input'];
  where?: InputMaybe<StudentStockHistoryFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentStocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StudentStockSortInput>>;
  studentId: Scalars['Long']['input'];
  where?: InputMaybe<StudentStockFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<StudentSortInput>>;
  where?: InputMaybe<StudentFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<TransactionSortInput>>;
  shareId: Scalars['Long']['input'];
  where?: InputMaybe<TransactionFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<UserSortInput>>;
  where?: InputMaybe<UserFilterInput>;
};

export type RateFilterInput = {
  and?: InputMaybe<Array<RateFilterInput>>;
  databaseValue?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<RateFilterInput>>;
  value?: InputMaybe<ComparableDecimalOperationFilterInput>;
};

export type RateSortInput = {
  databaseValue?: InputMaybe<SortEnumType>;
  value?: InputMaybe<SortEnumType>;
};

export type RefreshTokenFilterInput = {
  and?: InputMaybe<Array<RefreshTokenFilterInput>>;
  created?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  createdByIpAddress?: InputMaybe<StringOperationFilterInput>;
  expires?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  isActive?: InputMaybe<BooleanOperationFilterInput>;
  isExpired?: InputMaybe<BooleanOperationFilterInput>;
  or?: InputMaybe<Array<RefreshTokenFilterInput>>;
  replacedByToken?: InputMaybe<StringOperationFilterInput>;
  revoked?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  revokedByIpAddress?: InputMaybe<StringOperationFilterInput>;
  token?: InputMaybe<StringOperationFilterInput>;
};

export type Role = {
  __typename?: 'Role';
  dateCreated: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Long']['output'];
  isBuiltIn: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  rolePrivileges: Array<RolePrivilege>;
};

export type RoleFilterInput = {
  and?: InputMaybe<Array<RoleFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  description?: InputMaybe<StringOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  isBuiltIn?: InputMaybe<BooleanOperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<RoleFilterInput>>;
  rolePrivileges?: InputMaybe<ListFilterInputTypeOfRolePrivilegeFilterInput>;
};

export type RolePrivilege = {
  __typename?: 'RolePrivilege';
  privilege: Privilege;
  privilegeId: Scalars['Long']['output'];
  role: Role;
  roleId: Scalars['Long']['output'];
};

export type RolePrivilegeFilterInput = {
  and?: InputMaybe<Array<RolePrivilegeFilterInput>>;
  or?: InputMaybe<Array<RolePrivilegeFilterInput>>;
  privilege?: InputMaybe<PrivilegeFilterInput>;
  privilegeId?: InputMaybe<ComparableInt64OperationFilterInput>;
  role?: InputMaybe<RoleFilterInput>;
  roleId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type RoleSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  description?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  isBuiltIn?: InputMaybe<SortEnumType>;
  name?: InputMaybe<SortEnumType>;
};

export type Share = {
  __typename?: 'Share';
  balance: Scalars['Money']['output'];
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  dateLastActive: Scalars['DateTime']['output'];
  dividendLastAmount: Scalars['Money']['output'];
  id: Scalars['Long']['output'];
  limitedWithdrawalCount: Scalars['Int']['output'];
  rawBalance: Scalars['Long']['output'];
  rawDividendLastAmount: Scalars['Long']['output'];
  rawTotalDividends: Scalars['Long']['output'];
  shareType: ShareType;
  shareTypeId: Scalars['Long']['output'];
  student: Student;
  studentId: Scalars['Long']['output'];
  totalDividends: Scalars['Money']['output'];
};

export type ShareFilterInput = {
  and?: InputMaybe<Array<ShareFilterInput>>;
  balance?: InputMaybe<MoneyFilterInput>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  dateLastActive?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dividendLastAmount?: InputMaybe<MoneyFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  limitedWithdrawalCount?: InputMaybe<ComparableInt32OperationFilterInput>;
  or?: InputMaybe<Array<ShareFilterInput>>;
  rawBalance?: InputMaybe<ComparableInt64OperationFilterInput>;
  rawDividendLastAmount?: InputMaybe<ComparableInt64OperationFilterInput>;
  rawTotalDividends?: InputMaybe<ComparableInt64OperationFilterInput>;
  shareType?: InputMaybe<ShareTypeFilterInput>;
  shareTypeId?: InputMaybe<ComparableInt64OperationFilterInput>;
  student?: InputMaybe<StudentFilterInput>;
  studentId?: InputMaybe<ComparableInt64OperationFilterInput>;
  totalDividends?: InputMaybe<MoneyFilterInput>;
  transactions?: InputMaybe<ListFilterInputTypeOfTransactionFilterInput>;
};

export type ShareSortInput = {
  balance?: InputMaybe<MoneySortInput>;
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  dateLastActive?: InputMaybe<SortEnumType>;
  dividendLastAmount?: InputMaybe<MoneySortInput>;
  id?: InputMaybe<SortEnumType>;
  limitedWithdrawalCount?: InputMaybe<SortEnumType>;
  rawBalance?: InputMaybe<SortEnumType>;
  rawDividendLastAmount?: InputMaybe<SortEnumType>;
  rawTotalDividends?: InputMaybe<SortEnumType>;
  shareType?: InputMaybe<ShareTypeSortInput>;
  shareTypeId?: InputMaybe<SortEnumType>;
  student?: InputMaybe<StudentSortInput>;
  studentId?: InputMaybe<SortEnumType>;
  totalDividends?: InputMaybe<MoneySortInput>;
};

export type ShareType = {
  __typename?: 'ShareType';
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  dividendRate: Scalars['Rate']['output'];
  id: Scalars['Long']['output'];
  name: Scalars['String']['output'];
  rawDividendRate: Scalars['Long']['output'];
  rawWithdrawalLimitFee: Scalars['Long']['output'];
  shareTypeInstances: Array<ShareTypeInstance>;
  shares: Array<Share>;
  withdrawalLimitCount: Scalars['Int']['output'];
  withdrawalLimitFee: Scalars['Money']['output'];
  withdrawalLimitLastReset: Scalars['DateTime']['output'];
  withdrawalLimitPeriod: Period;
  withdrawalLimitShouldFee: Scalars['Boolean']['output'];
};

export type ShareTypeFilterInput = {
  and?: InputMaybe<Array<ShareTypeFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  dividendRate?: InputMaybe<RateFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<ShareTypeFilterInput>>;
  rawDividendRate?: InputMaybe<ComparableInt64OperationFilterInput>;
  rawWithdrawalLimitFee?: InputMaybe<ComparableInt64OperationFilterInput>;
  shareTypeInstances?: InputMaybe<ListFilterInputTypeOfShareTypeInstanceFilterInput>;
  shares?: InputMaybe<ListFilterInputTypeOfShareFilterInput>;
  withdrawalLimitCount?: InputMaybe<ComparableInt32OperationFilterInput>;
  withdrawalLimitFee?: InputMaybe<MoneyFilterInput>;
  withdrawalLimitLastReset?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  withdrawalLimitPeriod?: InputMaybe<PeriodOperationFilterInput>;
  withdrawalLimitShouldFee?: InputMaybe<BooleanOperationFilterInput>;
};

export type ShareTypeInstance = {
  __typename?: 'ShareTypeInstance';
  instance: Instance;
  instanceId: Scalars['Long']['output'];
  shareType: ShareType;
  shareTypeId: Scalars['Long']['output'];
};

export type ShareTypeInstanceFilterInput = {
  and?: InputMaybe<Array<ShareTypeInstanceFilterInput>>;
  instance?: InputMaybe<InstanceFilterInput>;
  instanceId?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<ShareTypeInstanceFilterInput>>;
  shareType?: InputMaybe<ShareTypeFilterInput>;
  shareTypeId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type ShareTypeSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  dividendRate?: InputMaybe<RateSortInput>;
  id?: InputMaybe<SortEnumType>;
  name?: InputMaybe<SortEnumType>;
  rawDividendRate?: InputMaybe<SortEnumType>;
  rawWithdrawalLimitFee?: InputMaybe<SortEnumType>;
  withdrawalLimitCount?: InputMaybe<SortEnumType>;
  withdrawalLimitFee?: InputMaybe<MoneySortInput>;
  withdrawalLimitLastReset?: InputMaybe<SortEnumType>;
  withdrawalLimitPeriod?: InputMaybe<SortEnumType>;
  withdrawalLimitShouldFee?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type ShareTypesConnection = {
  __typename?: 'ShareTypesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<ShareTypesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<ShareType>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type ShareTypesEdge = {
  __typename?: 'ShareTypesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: ShareType;
};

/** A connection to a list of items. */
export type SharesConnection = {
  __typename?: 'SharesConnection';
  /** A list of edges. */
  edges?: Maybe<Array<SharesEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Share>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type SharesEdge = {
  __typename?: 'SharesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Share;
};

export enum SortEnumType {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Stock = {
  __typename?: 'Stock';
  currentValue: Scalars['Money']['output'];
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  formattedDescription: Scalars['String']['output'];
  history: Array<StockHistory>;
  id: Scalars['Long']['output'];
  name: Scalars['String']['output'];
  rawCurrentValue: Scalars['Long']['output'];
  rawDescription: Scalars['String']['output'];
  stockInstances: Array<StockInstance>;
  studentStock: Array<StudentStock>;
  symbol: Scalars['String']['output'];
};

export type StockFilterInput = {
  and?: InputMaybe<Array<StockFilterInput>>;
  currentValue?: InputMaybe<MoneyFilterInput>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  formattedDescription?: InputMaybe<StringOperationFilterInput>;
  history?: InputMaybe<ListFilterInputTypeOfStockHistoryFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  name?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<StockFilterInput>>;
  rawCurrentValue?: InputMaybe<ComparableInt64OperationFilterInput>;
  rawDescription?: InputMaybe<StringOperationFilterInput>;
  stockInstances?: InputMaybe<ListFilterInputTypeOfStockInstanceFilterInput>;
  studentStock?: InputMaybe<ListFilterInputTypeOfStudentStockFilterInput>;
  symbol?: InputMaybe<StringOperationFilterInput>;
};

export type StockHistory = {
  __typename?: 'StockHistory';
  dateChanged: Scalars['DateTime']['output'];
  id: Scalars['Long']['output'];
  rawValue: Scalars['Long']['output'];
  stock: Stock;
  stockId: Scalars['Long']['output'];
  value: Scalars['Money']['output'];
};

/** A connection to a list of items. */
export type StockHistoryConnection = {
  __typename?: 'StockHistoryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<StockHistoryEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<StockHistory>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type StockHistoryEdge = {
  __typename?: 'StockHistoryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: StockHistory;
};

export type StockHistoryFilterInput = {
  and?: InputMaybe<Array<StockHistoryFilterInput>>;
  dateChanged?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<StockHistoryFilterInput>>;
  rawValue?: InputMaybe<ComparableInt64OperationFilterInput>;
  stock?: InputMaybe<StockFilterInput>;
  stockId?: InputMaybe<ComparableInt64OperationFilterInput>;
  value?: InputMaybe<MoneyFilterInput>;
};

export type StockHistorySortInput = {
  dateChanged?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  rawValue?: InputMaybe<SortEnumType>;
  stock?: InputMaybe<StockSortInput>;
  stockId?: InputMaybe<SortEnumType>;
  value?: InputMaybe<MoneySortInput>;
};

export type StockInstance = {
  __typename?: 'StockInstance';
  instance: Instance;
  instanceId: Scalars['Long']['output'];
  stock: Stock;
  stockId: Scalars['Long']['output'];
};

export type StockInstanceFilterInput = {
  and?: InputMaybe<Array<StockInstanceFilterInput>>;
  instance?: InputMaybe<InstanceFilterInput>;
  instanceId?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<StockInstanceFilterInput>>;
  stock?: InputMaybe<StockFilterInput>;
  stockId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type StockSortInput = {
  currentValue?: InputMaybe<MoneySortInput>;
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  formattedDescription?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  name?: InputMaybe<SortEnumType>;
  rawCurrentValue?: InputMaybe<SortEnumType>;
  rawDescription?: InputMaybe<SortEnumType>;
  symbol?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type StocksConnection = {
  __typename?: 'StocksConnection';
  /** A list of edges. */
  edges?: Maybe<Array<StocksEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Stock>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type StocksEdge = {
  __typename?: 'StocksEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Stock;
};

export type StringOperationFilterInput = {
  and?: InputMaybe<Array<StringOperationFilterInput>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  ncontains?: InputMaybe<Scalars['String']['input']>;
  nendsWith?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  nstartsWith?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<StringOperationFilterInput>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
  startsWithInvariant?: InputMaybe<Scalars['String']['input']>;
};

export type Student = {
  __typename?: 'Student';
  accountNumber: Scalars['String']['output'];
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  dateLastLogin?: Maybe<Scalars['DateTime']['output']>;
  dateRegistered?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  group: Group;
  groupId: Scalars['Long']['output'];
  id: Scalars['Long']['output'];
  lastName: Scalars['String']['output'];
  purchases: Array<StudentPurchase>;
  shares: Array<Share>;
};

export type StudentFilterInput = {
  accountNumber?: InputMaybe<StringOperationFilterInput>;
  and?: InputMaybe<Array<StudentFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  dateLastLogin?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  dateRegistered?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  email?: InputMaybe<StringOperationFilterInput>;
  firstName?: InputMaybe<StringOperationFilterInput>;
  group?: InputMaybe<GroupFilterInput>;
  groupId?: InputMaybe<ComparableInt64OperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  lastName?: InputMaybe<StringOperationFilterInput>;
  or?: InputMaybe<Array<StudentFilterInput>>;
  password?: InputMaybe<StringOperationFilterInput>;
  purchases?: InputMaybe<ListFilterInputTypeOfStudentPurchaseFilterInput>;
  refreshTokens?: InputMaybe<ListFilterInputTypeOfRefreshTokenFilterInput>;
  shares?: InputMaybe<ListFilterInputTypeOfShareFilterInput>;
};

export type StudentPreauthenticationRequestInput = {
  accountNumber: Scalars['String']['input'];
  inviteCode: Scalars['String']['input'];
};

export type StudentPurchase = {
  __typename?: 'StudentPurchase';
  dateCreated: Scalars['DateTime']['output'];
  id: Scalars['Long']['output'];
  items: Array<StudentPurchaseItem>;
  rawTotalCost: Scalars['Long']['output'];
  status: PurchaseStatus;
  student: Student;
  studentId: Scalars['Long']['output'];
  totalCost: Scalars['Money']['output'];
};

export type StudentPurchaseFilterInput = {
  and?: InputMaybe<Array<StudentPurchaseFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  items?: InputMaybe<ListFilterInputTypeOfStudentPurchaseItemFilterInput>;
  or?: InputMaybe<Array<StudentPurchaseFilterInput>>;
  rawTotalCost?: InputMaybe<ComparableInt64OperationFilterInput>;
  status?: InputMaybe<PurchaseStatusOperationFilterInput>;
  student?: InputMaybe<StudentFilterInput>;
  studentId?: InputMaybe<ComparableInt64OperationFilterInput>;
  totalCost?: InputMaybe<MoneyFilterInput>;
};

export type StudentPurchaseItem = {
  __typename?: 'StudentPurchaseItem';
  id: Scalars['Long']['output'];
  product: Product;
  productId: Scalars['Long']['output'];
  purchasePrice: Scalars['Money']['output'];
  quantity: Scalars['Int']['output'];
  rawPurchasePrice: Scalars['Long']['output'];
  studentPurchase: StudentPurchase;
  studentPurchaseId: Scalars['Long']['output'];
};

export type StudentPurchaseItemFilterInput = {
  and?: InputMaybe<Array<StudentPurchaseItemFilterInput>>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<StudentPurchaseItemFilterInput>>;
  product?: InputMaybe<ProductFilterInput>;
  productId?: InputMaybe<ComparableInt64OperationFilterInput>;
  purchasePrice?: InputMaybe<MoneyFilterInput>;
  quantity?: InputMaybe<ComparableInt32OperationFilterInput>;
  rawPurchasePrice?: InputMaybe<ComparableInt64OperationFilterInput>;
  studentPurchase?: InputMaybe<StudentPurchaseFilterInput>;
  studentPurchaseId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type StudentPurchaseSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  rawTotalCost?: InputMaybe<SortEnumType>;
  status?: InputMaybe<SortEnumType>;
  student?: InputMaybe<StudentSortInput>;
  studentId?: InputMaybe<SortEnumType>;
  totalCost?: InputMaybe<MoneySortInput>;
};

export type StudentRegisterRequestInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type StudentSortInput = {
  accountNumber?: InputMaybe<SortEnumType>;
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  dateLastLogin?: InputMaybe<SortEnumType>;
  dateRegistered?: InputMaybe<SortEnumType>;
  email?: InputMaybe<SortEnumType>;
  firstName?: InputMaybe<SortEnumType>;
  group?: InputMaybe<GroupSortInput>;
  groupId?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  lastName?: InputMaybe<SortEnumType>;
  password?: InputMaybe<SortEnumType>;
};

export type StudentStock = {
  __typename?: 'StudentStock';
  calculatePurchaseAmount: Scalars['Money']['output'];
  dateCreated: Scalars['DateTime']['output'];
  dateLastActive: Scalars['DateTime']['output'];
  history: Array<StudentStockHistory>;
  id: Scalars['Long']['output'];
  netContribution: Scalars['Money']['output'];
  rawNetContribution: Scalars['Long']['output'];
  sharesOwned: Scalars['Long']['output'];
  stock: Stock;
  stockId: Scalars['Long']['output'];
  student: Student;
  studentId: Scalars['Long']['output'];
};


export type StudentStockCalculatePurchaseAmountArgs = {
  quantity: Scalars['Int']['input'];
};

export type StudentStockFilterInput = {
  and?: InputMaybe<Array<StudentStockFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateLastActive?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  history?: InputMaybe<ListFilterInputTypeOfStudentStockHistoryFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  netContribution?: InputMaybe<MoneyFilterInput>;
  or?: InputMaybe<Array<StudentStockFilterInput>>;
  rawNetContribution?: InputMaybe<ComparableInt64OperationFilterInput>;
  sharesOwned?: InputMaybe<ComparableInt64OperationFilterInput>;
  stock?: InputMaybe<StockFilterInput>;
  stockId?: InputMaybe<ComparableInt64OperationFilterInput>;
  student?: InputMaybe<StudentFilterInput>;
  studentId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type StudentStockHistory = {
  __typename?: 'StudentStockHistory';
  amount: Scalars['Money']['output'];
  count: Scalars['Int']['output'];
  datePosted: Scalars['DateTime']['output'];
  id: Scalars['Long']['output'];
  rawAmount: Scalars['Long']['output'];
  studentStock: StudentStock;
  studentStockId: Scalars['Long']['output'];
  transaction: Transaction;
  transactionId: Scalars['Long']['output'];
};

/** A connection to a list of items. */
export type StudentStockHistoryConnection = {
  __typename?: 'StudentStockHistoryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<StudentStockHistoryEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<StudentStockHistory>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type StudentStockHistoryEdge = {
  __typename?: 'StudentStockHistoryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: StudentStockHistory;
};

export type StudentStockHistoryFilterInput = {
  amount?: InputMaybe<MoneyFilterInput>;
  and?: InputMaybe<Array<StudentStockHistoryFilterInput>>;
  count?: InputMaybe<ComparableInt32OperationFilterInput>;
  datePosted?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<StudentStockHistoryFilterInput>>;
  rawAmount?: InputMaybe<ComparableInt64OperationFilterInput>;
  studentStock?: InputMaybe<StudentStockFilterInput>;
  studentStockId?: InputMaybe<ComparableInt64OperationFilterInput>;
  transaction?: InputMaybe<TransactionFilterInput>;
  transactionId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type StudentStockHistorySortInput = {
  amount?: InputMaybe<MoneySortInput>;
  count?: InputMaybe<SortEnumType>;
  datePosted?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  rawAmount?: InputMaybe<SortEnumType>;
  studentStock?: InputMaybe<StudentStockSortInput>;
  studentStockId?: InputMaybe<SortEnumType>;
  transaction?: InputMaybe<TransactionSortInput>;
  transactionId?: InputMaybe<SortEnumType>;
};

export type StudentStockSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  dateLastActive?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  netContribution?: InputMaybe<MoneySortInput>;
  rawNetContribution?: InputMaybe<SortEnumType>;
  sharesOwned?: InputMaybe<SortEnumType>;
  stock?: InputMaybe<StockSortInput>;
  stockId?: InputMaybe<SortEnumType>;
  student?: InputMaybe<StudentSortInput>;
  studentId?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type StudentStocksConnection = {
  __typename?: 'StudentStocksConnection';
  /** A list of edges. */
  edges?: Maybe<Array<StudentStocksEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<StudentStock>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type StudentStocksEdge = {
  __typename?: 'StudentStocksEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: StudentStock;
};

/** A connection to a list of items. */
export type StudentsConnection = {
  __typename?: 'StudentsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<StudentsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Student>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type StudentsEdge = {
  __typename?: 'StudentsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Student;
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Money']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  effectiveDate: Scalars['DateTime']['output'];
  id: Scalars['Long']['output'];
  newBalance: Scalars['Money']['output'];
  rawAmount: Scalars['Long']['output'];
  rawNewBalance: Scalars['Long']['output'];
  targetShare: Share;
  targetShareId: Scalars['Long']['output'];
  transactionType: Scalars['String']['output'];
};

export type TransactionFilterInput = {
  amount?: InputMaybe<MoneyFilterInput>;
  and?: InputMaybe<Array<TransactionFilterInput>>;
  comment?: InputMaybe<StringOperationFilterInput>;
  effectiveDate?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  newBalance?: InputMaybe<MoneyFilterInput>;
  or?: InputMaybe<Array<TransactionFilterInput>>;
  rawAmount?: InputMaybe<ComparableInt64OperationFilterInput>;
  rawNewBalance?: InputMaybe<ComparableInt64OperationFilterInput>;
  targetShare?: InputMaybe<ShareFilterInput>;
  targetShareId?: InputMaybe<ComparableInt64OperationFilterInput>;
  transactionType?: InputMaybe<StringOperationFilterInput>;
};

export type TransactionRequestInput = {
  amount: Scalars['Money']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  effectiveDate?: InputMaybe<Scalars['DateTime']['input']>;
  shareId: Scalars['Long']['input'];
  takeNegative?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  withdrawalLimit?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TransactionSortInput = {
  amount?: InputMaybe<MoneySortInput>;
  comment?: InputMaybe<SortEnumType>;
  effectiveDate?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  newBalance?: InputMaybe<MoneySortInput>;
  rawAmount?: InputMaybe<SortEnumType>;
  rawNewBalance?: InputMaybe<SortEnumType>;
  targetShare?: InputMaybe<ShareSortInput>;
  targetShareId?: InputMaybe<SortEnumType>;
  transactionType?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type TransactionsConnection = {
  __typename?: 'TransactionsConnection';
  /** A list of edges. */
  edges?: Maybe<Array<TransactionsEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Transaction>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type TransactionsEdge = {
  __typename?: 'TransactionsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Transaction;
};

export type TupleOfTransactionAndTransaction = {
  __typename?: 'TupleOfTransactionAndTransaction';
  item1: Transaction;
  item2: Transaction;
};

/** Request data to update a group. */
export type UpdateGroupRequestInput = {
  /** Get or set the ID number of the group. */
  id: Scalars['Long']['input'];
  /** Get or set the Instance ID of the group. */
  instanceId?: InputMaybe<Scalars['Long']['input']>;
  /** Get or set the name of the group. */
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInstanceRequestInput = {
  /** Get or set the description of the instance. */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the ID number of the instance. */
  id: Scalars['Long']['input'];
  /** Get or set if the instance is active. */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateProductRequestInput = {
  cost?: InputMaybe<Scalars['Money']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Long']['input'];
  isLimitedQuantity?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShareRequestInput = {
  id: Scalars['Long']['input'];
  shareTypeId: Scalars['Long']['input'];
};

/** Request data to update a Share Type. */
export type UpdateShareTypeRequestInput = {
  /** Get or set the dividend rate. */
  dividendRate?: InputMaybe<Scalars['Rate']['input']>;
  /** Get or set the ID number of the share type. */
  id: Scalars['Long']['input'];
  /** Get or set the name of the share type. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the number of withdrawals allowed per period.  Use zero to disable. */
  withdrawalLimitCount?: InputMaybe<Scalars['Int']['input']>;
  /** Get or set the amount to fee if WithdrawalLimitShouldFee is true. */
  withdrawalLimitFee?: InputMaybe<Scalars['Money']['input']>;
  /** Get or set the withdrawal limit period to use when resetting the withdrawal limit counters. */
  withdrawalLimitPeriod?: InputMaybe<Period>;
  /** Get or set if withdrawals over the WithdrawalLimitCount should fee instead of being declined. */
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateStockRequestInput = {
  /** The current value of the stock. */
  currentValue?: InputMaybe<Scalars['Money']['input']>;
  /** The ID number of the stock */
  id: Scalars['Long']['input'];
  /** Name of the company */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Description of the stock. */
  rawDescription?: InputMaybe<Scalars['String']['input']>;
  /** Unique symbol of the stock. */
  symbol?: InputMaybe<Scalars['String']['input']>;
};

/** Data fields to update a student. */
export type UpdateStudentRequestInput = {
  /** Get or set the student's account number. */
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's current password. */
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's email address. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's first name. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's group ID. */
  groupId?: InputMaybe<Scalars['Long']['input']>;
  /** Get or set the student ID. Required when updating students. */
  id: Scalars['Long']['input'];
  /** Get or set the student's last name. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the student's password. */
  password?: InputMaybe<Scalars['String']['input']>;
};

/** Data fields to update a user. */
export type UpdateUserRequestInput = {
  /** If a password change is requested, then this field must be set to the user's current password. */
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the user's email address. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the user's ID. */
  id: Scalars['Long']['input'];
  /** Get or set the user's password. */
  password?: InputMaybe<Scalars['String']['input']>;
  /** Get or set the user's role. */
  roleId?: InputMaybe<Scalars['Long']['input']>;
};

export type User = {
  __typename?: 'User';
  dateCreated: Scalars['DateTime']['output'];
  dateDeleted?: Maybe<Scalars['DateTime']['output']>;
  dateLastLogin?: Maybe<Scalars['DateTime']['output']>;
  dateRegistered?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['Long']['output'];
  role: Role;
  roleId: Scalars['Long']['output'];
};

export type UserFilterInput = {
  and?: InputMaybe<Array<UserFilterInput>>;
  dateCreated?: InputMaybe<ComparableDateTimeOperationFilterInput>;
  dateDeleted?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  dateLastLogin?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  dateRegistered?: InputMaybe<ComparableNullableOfDateTimeOperationFilterInput>;
  email?: InputMaybe<StringOperationFilterInput>;
  id?: InputMaybe<ComparableInt64OperationFilterInput>;
  or?: InputMaybe<Array<UserFilterInput>>;
  password?: InputMaybe<StringOperationFilterInput>;
  refreshTokens?: InputMaybe<ListFilterInputTypeOfRefreshTokenFilterInput>;
  role?: InputMaybe<RoleFilterInput>;
  roleId?: InputMaybe<ComparableInt64OperationFilterInput>;
};

export type UserSortInput = {
  dateCreated?: InputMaybe<SortEnumType>;
  dateDeleted?: InputMaybe<SortEnumType>;
  dateLastLogin?: InputMaybe<SortEnumType>;
  dateRegistered?: InputMaybe<SortEnumType>;
  email?: InputMaybe<SortEnumType>;
  id?: InputMaybe<SortEnumType>;
  password?: InputMaybe<SortEnumType>;
  role?: InputMaybe<RoleSortInput>;
  roleId?: InputMaybe<SortEnumType>;
};

/** A connection to a list of items. */
export type UsersConnection = {
  __typename?: 'UsersConnection';
  /** A list of edges. */
  edges?: Maybe<Array<UsersEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<User>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type UsersEdge = {
  __typename?: 'UsersEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: User;
};

export type GroupPartsFragment = { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } };

export type InstancePartsFragment = { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean };

export type PageInfoPartsFragment = { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null };

export type PrivilegePartsFragment = { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string };

export type RolePartsFragment = { __typename?: 'Role', id: number, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } }> };

export type RolePrivilegePartsFragment = { __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } };

export type SharePartsFragment = { __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } };

export type ShareTypePartsFragment = { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> };

export type StockPartsFragment = { __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> };

export type StockBasePartsFragment = { __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string };

export type StockHistoryPartsFragment = { __typename?: 'StockHistory', id: number, stockId: number, dateChanged: string, value: number };

export type StudentPartsFragment = { __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } };

export type StudentBasePartsFragment = { __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } };

export type StudentStockPartsFragment = { __typename?: 'StudentStock', id: number, stockId: number, studentId: number, sharesOwned: number, netContribution: number, dateCreated: string, dateLastActive: string, stock: { __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string } };

export type StudentStockHistoryPartsFragment = { __typename?: 'StudentStockHistory', id: number, count: number, amount: number, datePosted: string, transaction: { __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number } };

export type TransactionPartsFragment = { __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number };

export type UserPartsFragment = { __typename?: 'User', id: number, email: string, roleId: number, dateCreated: string, dateRegistered?: string | null, dateLastLogin?: string | null, role: { __typename?: 'Role', id: number, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } }> } };

export type NewGroupMutationVariables = Exact<{
  instanceId: Scalars['Long']['input'];
  name: Scalars['String']['input'];
}>;


export type NewGroupMutation = { __typename?: 'Mutation', newGroup: Array<{ __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } }> };

export type DeleteGroupMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'Mutation', deleteGroup: boolean };

export type UpdateGroupMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateGroupMutation = { __typename?: 'Mutation', updateGroup: Array<{ __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } }> };

export type NewInstanceMutationVariables = Exact<{
  description: Scalars['String']['input'];
}>;


export type NewInstanceMutation = { __typename?: 'Mutation', newInstance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } };

export type DeleteInstanceMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteInstanceMutation = { __typename?: 'Mutation', deleteInstance: boolean };

export type UpdateInstanceMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateInstanceMutation = { __typename?: 'Mutation', updateInstance: Array<{ __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean }> };

export type NewStockPurchaseMutationVariables = Exact<{
  stockId: Scalars['Long']['input'];
  shareId: Scalars['Long']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type NewStockPurchaseMutation = { __typename?: 'Mutation', newStockPurchase: Array<{ __typename?: 'StudentStock', id: number, stockId: number, studentId: number, sharesOwned: number, netContribution: number, dateCreated: string, dateLastActive: string, stock: { __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string } }> };

export type NewShareMutationVariables = Exact<{
  shareTypeId: Scalars['Long']['input'];
  studentId: Scalars['Long']['input'];
}>;


export type NewShareMutation = { __typename?: 'Mutation', newShare: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }> };

export type DeleteShareMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteShareMutation = { __typename?: 'Mutation', deleteShare: boolean };

export type NewShareTypeMutationVariables = Exact<{
  name: Scalars['String']['input'];
  dividendRate: Scalars['Rate']['input'];
  withdrawalLimitCount?: InputMaybe<Scalars['Int']['input']>;
  withdrawalLimitPeriod?: InputMaybe<Period>;
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawalLimitFee?: InputMaybe<Scalars['Money']['input']>;
}>;


export type NewShareTypeMutation = { __typename?: 'Mutation', newShareType: Array<{ __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> }> };

export type DeleteShareTypeMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteShareTypeMutation = { __typename?: 'Mutation', deleteShareType: boolean };

export type PostDividendsMutationVariables = Exact<{
  shareTypeId: Scalars['Long']['input'];
  instances: Array<Scalars['Long']['input']> | Scalars['Long']['input'];
}>;


export type PostDividendsMutation = { __typename?: 'Mutation', postDividends: boolean };

export type LinkShareTypeMutationVariables = Exact<{
  shareTypeId: Scalars['Long']['input'];
  instanceId: Scalars['Long']['input'];
}>;


export type LinkShareTypeMutation = { __typename?: 'Mutation', linkShareType: Array<{ __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> }> };

export type UnlinkShareTypeMutationVariables = Exact<{
  shareTypeId: Scalars['Long']['input'];
  instanceId: Scalars['Long']['input'];
}>;


export type UnlinkShareTypeMutation = { __typename?: 'Mutation', unlinkShareType: Array<{ __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> }> };

export type UpdateShareTypeMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  dividendRate?: InputMaybe<Scalars['Rate']['input']>;
  withdrawalLimitCount?: InputMaybe<Scalars['Int']['input']>;
  withdrawalLimitPeriod?: InputMaybe<Period>;
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']['input']>;
  withdrawalLimitFee?: InputMaybe<Scalars['Money']['input']>;
}>;


export type UpdateShareTypeMutation = { __typename?: 'Mutation', updateShareType: Array<{ __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> }> };

export type NewStockMutationVariables = Exact<{
  name: Scalars['String']['input'];
  symbol: Scalars['String']['input'];
  rawDescription?: InputMaybe<Scalars['String']['input']>;
  currentValue: Scalars['Money']['input'];
}>;


export type NewStockMutation = { __typename?: 'Mutation', newStock: Array<{ __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> }> };

export type DeleteStockMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteStockMutation = { __typename?: 'Mutation', deleteStock: boolean };

export type PurgeStockHistoryMutationVariables = Exact<{
  stockId: Scalars['Long']['input'];
  date: Scalars['DateTime']['input'];
}>;


export type PurgeStockHistoryMutation = { __typename?: 'Mutation', purgeStockHistory: Array<{ __typename?: 'StockHistory', id: number, stockId: number, dateChanged: string, value: number }> };

export type LinkStockMutationVariables = Exact<{
  stockId: Scalars['Long']['input'];
  instanceId: Scalars['Long']['input'];
}>;


export type LinkStockMutation = { __typename?: 'Mutation', linkStock: Array<{ __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> }> };

export type RestoreStockMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type RestoreStockMutation = { __typename?: 'Mutation', restoreStock: Array<{ __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> }> };

export type UnlinkStockMutationVariables = Exact<{
  stockId: Scalars['Long']['input'];
  instanceId: Scalars['Long']['input'];
}>;


export type UnlinkStockMutation = { __typename?: 'Mutation', unlinkStock: Array<{ __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> }> };

export type UpdateStockMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  rawDescription?: InputMaybe<Scalars['String']['input']>;
  currentValue?: InputMaybe<Scalars['Money']['input']>;
}>;


export type UpdateStockMutation = { __typename?: 'Mutation', updateStock: Array<{ __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> }> };

export type UpdateBulkStudentMutationVariables = Exact<{
  students: Array<UpdateStudentRequestInput> | UpdateStudentRequestInput;
}>;


export type UpdateBulkStudentMutation = { __typename?: 'Mutation', updateBulkStudent: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> };

export type NewStudentMutationVariables = Exact<{
  accountNumber: Scalars['String']['input'];
  groupId: Scalars['Long']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
}>;


export type NewStudentMutation = { __typename?: 'Mutation', newStudent: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> };

export type DeleteStudentMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteStudentMutation = { __typename?: 'Mutation', deleteStudent: boolean };

export type StudentLoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type StudentLoginMutation = { __typename?: 'Mutation', studentLogin: { __typename?: 'AuthenticateResponse', jwtToken: string } };

export type StudentPreregistrationMutationVariables = Exact<{
  inviteCode: Scalars['String']['input'];
  accountNumber: Scalars['String']['input'];
}>;


export type StudentPreregistrationMutation = { __typename?: 'Mutation', studentPreregistration: string };

export type StudentRegistrationMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type StudentRegistrationMutation = { __typename?: 'Mutation', studentRegistration: boolean };

export type StudentRevokeRefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type StudentRevokeRefreshTokenMutation = { __typename?: 'Mutation', studentRevokeRefreshToken: boolean };

export type UpdateStudentMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['Long']['input']>;
}>;


export type UpdateStudentMutation = { __typename?: 'Mutation', updateStudent: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> };

export type NewBulkTransactionMutationVariables = Exact<{
  shares: Array<NewTransactionRequestInput> | NewTransactionRequestInput;
  skipNegative: Scalars['Boolean']['input'];
}>;


export type NewBulkTransactionMutation = { __typename?: 'Mutation', newBulkTransaction: Array<{ __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number }> };

export type NewTransactionMutationVariables = Exact<{
  shareId: Scalars['Long']['input'];
  amount: Scalars['Money']['input'];
  takeNegative?: InputMaybe<Scalars['Boolean']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type NewTransactionMutation = { __typename?: 'Mutation', newTransaction: { __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number } };

export type NewTransferMutationVariables = Exact<{
  sourceShareId: Scalars['Long']['input'];
  destinationShareId: Scalars['Long']['input'];
  amount: Scalars['Money']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type NewTransferMutation = { __typename?: 'Mutation', newTransfer: { __typename?: 'TupleOfTransactionAndTransaction', item1: { __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number }, item2: { __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number } } };

export type NewUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  roleId: Scalars['Long']['input'];
}>;


export type NewUserMutation = { __typename?: 'Mutation', newUser: Array<{ __typename?: 'User', id: number, email: string, roleId: number, dateCreated: string, dateRegistered?: string | null, dateLastLogin?: string | null, role: { __typename?: 'Role', id: number, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } }> } }> };

export type UserLoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type UserLoginMutation = { __typename?: 'Mutation', userLogin: { __typename?: 'AuthenticateResponse', jwtToken: string } };

export type UserRevokeRefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type UserRevokeRefreshTokenMutation = { __typename?: 'Mutation', userRevokeRefreshToken: boolean };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roleId?: InputMaybe<Scalars['Long']['input']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: Array<{ __typename?: 'User', id: number, email: string, roleId: number, dateCreated: string, dateRegistered?: string | null, dateLastLogin?: string | null, role: { __typename?: 'Role', id: number, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } }> } }> };

export type CurrentStudentQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentStudentQuery = { __typename?: 'Query', currentStudent: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: Array<{ __typename?: 'User', id: number, email: string, roleId: number, dateCreated: string, dateRegistered?: string | null, dateLastLogin?: string | null, role: { __typename?: 'Role', id: number, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } }> } }> };

export type GroupsByInstanceQueryVariables = Exact<{
  instanceId?: InputMaybe<Scalars['Long']['input']>;
}>;


export type GroupsByInstanceQuery = { __typename?: 'Query', groups?: { __typename?: 'GroupsConnection', nodes?: Array<{ __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } }> | null } | null };

export type AllInstancesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllInstancesQuery = { __typename?: 'Query', instances?: { __typename?: 'InstancesConnection', nodes?: Array<{ __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean }> | null } | null };

export type ShareTypesQueryVariables = Exact<{
  instances?: InputMaybe<Array<Scalars['Long']['input']> | Scalars['Long']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type ShareTypesQuery = { __typename?: 'Query', shareTypes?: { __typename?: 'ShareTypesConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> }> | null } | null };

export type SharesByStudentIdQueryVariables = Exact<{
  studentId: Scalars['Long']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type SharesByStudentIdQuery = { __typename?: 'Query', shares?: { __typename?: 'SharesConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }> | null } | null };

export type StockHistoryQueryVariables = Exact<{
  stockId: Scalars['Long']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type StockHistoryQuery = { __typename?: 'Query', stockHistory?: { __typename?: 'StockHistoryConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'StockHistory', id: number, stockId: number, dateChanged: string, value: number }> | null } | null };

export type StocksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  instances?: InputMaybe<Array<Scalars['Long']['input']> | Scalars['Long']['input']>;
  where?: InputMaybe<StockFilterInput>;
  order?: StockSortInput;
}>;


export type StocksQuery = { __typename?: 'Query', stocks?: { __typename?: 'StocksConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: number, instance: { __typename?: 'Instance', id: number, description: string, inviteCode: string, isActive: boolean } }> }> | null } | null };

export type StudentsByIdQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type StudentsByIdQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', nodes?: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> | null } | null };

export type StudentsFilterQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StudentFilterInput>;
}>;


export type StudentsFilterQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', accountNumber: string }> | null } | null };

export type StudentStockHistoryQueryVariables = Exact<{
  studentStockId: Scalars['Long']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  order?: StudentStockHistorySortInput;
}>;


export type StudentStockHistoryQuery = { __typename?: 'Query', studentStockHistory?: { __typename?: 'StudentStockHistoryConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'StudentStockHistory', id: number, count: number, amount: number, datePosted: string, transaction: { __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number } }> | null } | null };

export type StudentStocksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  order?: StudentStockSortInput;
  where?: InputMaybe<StudentStockFilterInput>;
  studentId: Scalars['Long']['input'];
}>;


export type StudentStocksQuery = { __typename?: 'Query', studentStocks?: { __typename?: 'StudentStocksConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'StudentStock', id: number, stockId: number, studentId: number, sharesOwned: number, netContribution: number, dateCreated: string, dateLastActive: string, stock: { __typename?: 'Stock', id: number, name: string, symbol: string, currentValue: number, rawDescription: string, formattedDescription: string } }> | null } | null };

export type StudentsByAccountNumberQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  order?: StudentSortInput;
  accountNumber: Scalars['String']['input'];
}>;


export type StudentsByAccountNumberQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> | null } | null };

export type StudentsByEmailQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  order?: StudentSortInput;
  email: Scalars['String']['input'];
}>;


export type StudentsByEmailQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> | null } | null };

export type StudentsByNameQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  order?: StudentSortInput;
  name: Scalars['String']['input'];
}>;


export type StudentsByNameQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> | null } | null };

export type StudentsWithSharesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  order?: StudentSortInput;
  groupId?: InputMaybe<Scalars['Long']['input']>;
}>;


export type StudentsWithSharesQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: number, accountNumber: string, firstName: string, lastName: string, groupId: number, email?: string | null, dateLastLogin?: string | null, dateRegistered?: string | null, shares: Array<{ __typename?: 'Share', id: number, shareTypeId: number, balance: number, studentId: number, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: number, name: string, dividendRate: number, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: string, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: number, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: number }> } }>, group: { __typename?: 'Group', id: number, instanceId: number, name: string, instance: { __typename?: 'Instance', id: number, description: string } } }> | null } | null };

export type TransactionsQueryVariables = Exact<{
  shareId: Scalars['Long']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  order?: TransactionSortInput;
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions?: { __typename?: 'TransactionsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Transaction', id: number, targetShareId: number, transactionType: string, effectiveDate: string, comment?: string | null, amount: number, newBalance: number }> | null } | null };

export type UsersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<UserFilterInput>;
  order?: UserSortInput;
}>;


export type UsersQuery = { __typename?: 'Query', users?: { __typename?: 'UsersConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'User', id: number, email: string, roleId: number, dateCreated: string, dateRegistered?: string | null, dateLastLogin?: string | null, role: { __typename?: 'Role', id: number, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: number, roleId: number, privilege: { __typename?: 'Privilege', id: number, name: string, description: string, dateCreated: string } }> } }> | null } | null };


      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    