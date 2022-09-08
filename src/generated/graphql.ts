export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `DateTime` scalar represents an ISO-8601 compliant date time type. */
  DateTime: any;
  /** The built-in `Decimal` scalar type. */
  Decimal: any;
  /** The `Long` scalar type represents non-fractional signed whole 64-bit numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
  /** US Currency as a float (preferred) or string without the dollar symbol. E.g 10.33 is $10.33. */
  Money: any;
  /** API/Interest Rate represented as a float.  E.g. 0.02 is 0.02% */
  Rate: any;
};

export enum ApplyPolicy {
  AfterResolver = 'AFTER_RESOLVER',
  BeforeResolver = 'BEFORE_RESOLVER'
}

export type AuthenticateRequestInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type AuthenticateResponse = {
  __typename?: 'AuthenticateResponse';
  id: Scalars['Long'];
  jwtToken: Scalars['String'];
  username: Scalars['String'];
};

export type BooleanOperationFilterInput = {
  eq?: InputMaybe<Scalars['Boolean']>;
  neq?: InputMaybe<Scalars['Boolean']>;
};

export type ComparableDateTimeOperationFilterInput = {
  eq?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  neq?: InputMaybe<Scalars['DateTime']>;
  ngt?: InputMaybe<Scalars['DateTime']>;
  ngte?: InputMaybe<Scalars['DateTime']>;
  nin?: InputMaybe<Array<Scalars['DateTime']>>;
  nlt?: InputMaybe<Scalars['DateTime']>;
  nlte?: InputMaybe<Scalars['DateTime']>;
};

export type ComparableDecimalOperationFilterInput = {
  eq?: InputMaybe<Scalars['Decimal']>;
  gt?: InputMaybe<Scalars['Decimal']>;
  gte?: InputMaybe<Scalars['Decimal']>;
  in?: InputMaybe<Array<Scalars['Decimal']>>;
  lt?: InputMaybe<Scalars['Decimal']>;
  lte?: InputMaybe<Scalars['Decimal']>;
  neq?: InputMaybe<Scalars['Decimal']>;
  ngt?: InputMaybe<Scalars['Decimal']>;
  ngte?: InputMaybe<Scalars['Decimal']>;
  nin?: InputMaybe<Array<Scalars['Decimal']>>;
  nlt?: InputMaybe<Scalars['Decimal']>;
  nlte?: InputMaybe<Scalars['Decimal']>;
};

export type ComparableInt32OperationFilterInput = {
  eq?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  neq?: InputMaybe<Scalars['Int']>;
  ngt?: InputMaybe<Scalars['Int']>;
  ngte?: InputMaybe<Scalars['Int']>;
  nin?: InputMaybe<Array<Scalars['Int']>>;
  nlt?: InputMaybe<Scalars['Int']>;
  nlte?: InputMaybe<Scalars['Int']>;
};

export type ComparableInt64OperationFilterInput = {
  eq?: InputMaybe<Scalars['Long']>;
  gt?: InputMaybe<Scalars['Long']>;
  gte?: InputMaybe<Scalars['Long']>;
  in?: InputMaybe<Array<Scalars['Long']>>;
  lt?: InputMaybe<Scalars['Long']>;
  lte?: InputMaybe<Scalars['Long']>;
  neq?: InputMaybe<Scalars['Long']>;
  ngt?: InputMaybe<Scalars['Long']>;
  ngte?: InputMaybe<Scalars['Long']>;
  nin?: InputMaybe<Array<Scalars['Long']>>;
  nlt?: InputMaybe<Scalars['Long']>;
  nlte?: InputMaybe<Scalars['Long']>;
};

export type ComparableNullableOfDateTimeOperationFilterInput = {
  eq?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  neq?: InputMaybe<Scalars['DateTime']>;
  ngt?: InputMaybe<Scalars['DateTime']>;
  ngte?: InputMaybe<Scalars['DateTime']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['DateTime']>>>;
  nlt?: InputMaybe<Scalars['DateTime']>;
  nlte?: InputMaybe<Scalars['DateTime']>;
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedGroupsEdge = {
  __typename?: 'DeletedGroupsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedInstancesEdge = {
  __typename?: 'DeletedInstancesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedProductsEdge = {
  __typename?: 'DeletedProductsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedShareTypesEdge = {
  __typename?: 'DeletedShareTypesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedSharesEdge = {
  __typename?: 'DeletedSharesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedStocksEdge = {
  __typename?: 'DeletedStocksEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type DeletedStudentsEdge = {
  __typename?: 'DeletedStudentsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Student;
};

export type Group = {
  __typename?: 'Group';
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  id: Scalars['Long'];
  instance: Instance;
  instanceId: Scalars['Long'];
  name: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type GroupsEdge = {
  __typename?: 'GroupsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Group;
};

export type Instance = {
  __typename?: 'Instance';
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  description: Scalars['String'];
  groups: Array<Group>;
  id: Scalars['Long'];
  inviteCode: Scalars['String'];
  isActive: Scalars['Boolean'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type InstancesEdge = {
  __typename?: 'InstancesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Instance;
};

export type LinkProductRequestInput = {
  instanceId: Scalars['Long'];
  productId: Scalars['Long'];
};

/** Request to link or unlink a share type to an Instance. */
export type LinkShareTypeRequestInput = {
  /** The instance to link to. */
  instanceId: Scalars['Long'];
  /** The share type to link. */
  shareTypeId: Scalars['Long'];
};

/** Request to link or unlink a stock to an Instance. */
export type LinkStockRequestInput = {
  /** The instance to link to. */
  instanceId: Scalars['Long'];
  /** The stock to link. */
  stockId: Scalars['Long'];
};

export type ListFilterInputTypeOfGroupFilterInput = {
  all?: InputMaybe<GroupFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<GroupFilterInput>;
  some?: InputMaybe<GroupFilterInput>;
};

export type ListFilterInputTypeOfProductImageFilterInput = {
  all?: InputMaybe<ProductImageFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<ProductImageFilterInput>;
  some?: InputMaybe<ProductImageFilterInput>;
};

export type ListFilterInputTypeOfProductInstanceFilterInput = {
  all?: InputMaybe<ProductInstanceFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<ProductInstanceFilterInput>;
  some?: InputMaybe<ProductInstanceFilterInput>;
};

export type ListFilterInputTypeOfRefreshTokenFilterInput = {
  all?: InputMaybe<RefreshTokenFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<RefreshTokenFilterInput>;
  some?: InputMaybe<RefreshTokenFilterInput>;
};

export type ListFilterInputTypeOfRolePrivilegeFilterInput = {
  all?: InputMaybe<RolePrivilegeFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<RolePrivilegeFilterInput>;
  some?: InputMaybe<RolePrivilegeFilterInput>;
};

export type ListFilterInputTypeOfShareFilterInput = {
  all?: InputMaybe<ShareFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<ShareFilterInput>;
  some?: InputMaybe<ShareFilterInput>;
};

export type ListFilterInputTypeOfShareTypeInstanceFilterInput = {
  all?: InputMaybe<ShareTypeInstanceFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<ShareTypeInstanceFilterInput>;
  some?: InputMaybe<ShareTypeInstanceFilterInput>;
};

export type ListFilterInputTypeOfStockHistoryFilterInput = {
  all?: InputMaybe<StockHistoryFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StockHistoryFilterInput>;
  some?: InputMaybe<StockHistoryFilterInput>;
};

export type ListFilterInputTypeOfStockInstanceFilterInput = {
  all?: InputMaybe<StockInstanceFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StockInstanceFilterInput>;
  some?: InputMaybe<StockInstanceFilterInput>;
};

export type ListFilterInputTypeOfStudentFilterInput = {
  all?: InputMaybe<StudentFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StudentFilterInput>;
  some?: InputMaybe<StudentFilterInput>;
};

export type ListFilterInputTypeOfStudentPurchaseFilterInput = {
  all?: InputMaybe<StudentPurchaseFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StudentPurchaseFilterInput>;
  some?: InputMaybe<StudentPurchaseFilterInput>;
};

export type ListFilterInputTypeOfStudentPurchaseItemFilterInput = {
  all?: InputMaybe<StudentPurchaseItemFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StudentPurchaseItemFilterInput>;
  some?: InputMaybe<StudentPurchaseItemFilterInput>;
};

export type ListFilterInputTypeOfStudentStockFilterInput = {
  all?: InputMaybe<StudentStockFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StudentStockFilterInput>;
  some?: InputMaybe<StudentStockFilterInput>;
};

export type ListFilterInputTypeOfStudentStockHistoryFilterInput = {
  all?: InputMaybe<StudentStockHistoryFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
  none?: InputMaybe<StudentStockHistoryFilterInput>;
  some?: InputMaybe<StudentStockHistoryFilterInput>;
};

export type ListFilterInputTypeOfTransactionFilterInput = {
  all?: InputMaybe<TransactionFilterInput>;
  any?: InputMaybe<Scalars['Boolean']>;
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
  deleteGroup: Scalars['Boolean'];
  /** Soft-delete an Instance. */
  deleteInstance: Scalars['Boolean'];
  /** Soft-delete a Product. */
  deleteProduct: Scalars['Boolean'];
  /** Soft-delete a Share . */
  deleteShare: Scalars['Boolean'];
  /** Soft-delete a ShareType. */
  deleteShareType: Scalars['Boolean'];
  /** Soft-delete a stock. */
  deleteStock: Scalars['Boolean'];
  /** Delete a student. */
  deleteStudent: Scalars['Boolean'];
  /** Delete a user. */
  deleteUser: Scalars['Boolean'];
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
  postDividends: Scalars['Boolean'];
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
  studentPreregistration: Scalars['String'];
  /** Obtain a new JWT token using a refresh token. */
  studentRefreshToken: AuthenticateResponse;
  /**
   * Register a student using the preauthorization token and provided input.
   *
   *
   * **Returns:**
   * True if registration is successful, otherwise an error message.
   */
  studentRegistration: Scalars['Boolean'];
  /** Revoke a refresh token. */
  studentRevokeRefreshToken: Scalars['Boolean'];
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
  userRevokeRefreshToken: Scalars['Boolean'];
};


/** CRUD operations for User entities. */
export type MutationDeleteGroupArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteInstanceArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteProductArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteShareArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteShareTypeArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteStockArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteStudentArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationDeleteUserArgs = {
  id: Scalars['Long'];
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
  skipBelowNegative?: Scalars['Boolean'];
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
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationRestoreInstanceArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationRestoreProductArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationRestoreShareArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationRestoreShareTypeArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationRestoreStockArgs = {
  id: Scalars['Long'];
};


/** CRUD operations for User entities. */
export type MutationRestoreStudentArgs = {
  id: Scalars['Long'];
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
  token?: InputMaybe<Scalars['String']>;
};


/** CRUD operations for User entities. */
export type MutationStudentRegistrationArgs = {
  input: StudentRegisterRequestInput;
};


/** CRUD operations for User entities. */
export type MutationStudentRevokeRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']>;
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
  token?: InputMaybe<Scalars['String']>;
};


/** CRUD operations for User entities. */
export type MutationUserRevokeRefreshTokenArgs = {
  token?: InputMaybe<Scalars['String']>;
};

/** Request data to create a group. */
export type NewGroupRequestInput = {
  /** Get or set the Instance ID of the group. */
  instanceId: Scalars['Long'];
  /** Get or set the name of the group. */
  name?: InputMaybe<Scalars['String']>;
};

export type NewInstanceRequestInput = {
  /** Get or set the description of the instance. */
  description?: InputMaybe<Scalars['String']>;
};

export type NewProductRequestInput = {
  cost?: InputMaybe<Scalars['Money']>;
  description?: InputMaybe<Scalars['String']>;
  isLimitedQuantity: Scalars['Boolean'];
  name?: InputMaybe<Scalars['String']>;
  quantity: Scalars['Int'];
};

export type NewShareRequestInput = {
  shareTypeId: Scalars['Long'];
  studentId: Scalars['Long'];
};

/** Request data to create a Share Type. */
export type NewShareTypeRequestInput = {
  /** Get or set the dividend rate. */
  dividendRate: Scalars['Rate'];
  /** Get or set the name of the share type. */
  name: Scalars['String'];
  /** Get or set the number of withdrawals allowed per period.  Use zero to disable. */
  withdrawalLimitCount?: InputMaybe<Scalars['Int']>;
  /** Get or set the amount to fee if WithdrawalLimitShouldFee is true. */
  withdrawalLimitFee?: InputMaybe<Scalars['Money']>;
  /** Get or set the withdrawal limit period to use when resetting the withdrawal limit counters. */
  withdrawalLimitPeriod?: InputMaybe<Period>;
  /** Get or set if withdrawals over the WithdrawalLimitCount should fee instead of being declined. */
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']>;
};

export type NewStockRequestInput = {
  /** The current value of the stock. */
  currentValue: Scalars['Money'];
  /** Name of the company */
  name: Scalars['String'];
  /** The description of the stock. */
  rawDescription?: InputMaybe<Scalars['String']>;
  /** Unique symbol of the stock. */
  symbol: Scalars['String'];
};

/** Data fields for a new student. */
export type NewStudentRequestInput = {
  /** Get or set the student's account number. */
  accountNumber?: InputMaybe<Scalars['String']>;
  /** Get or set the student's email address. */
  email?: InputMaybe<Scalars['String']>;
  /** Get or set the student's first name. */
  firstName?: InputMaybe<Scalars['String']>;
  /** Get or set the student's group ID. */
  groupId: Scalars['Long'];
  /** Get or set the student's last name. */
  lastName?: InputMaybe<Scalars['String']>;
  /** Get or set the student's password. */
  password?: InputMaybe<Scalars['String']>;
};

/** Represents a request to post a monetary transaction. */
export type NewTransactionRequestInput = {
  /** Get or set the amount to post. */
  amount: Scalars['Money'];
  /** Get or set an optional comment for the transaction. */
  comment?: InputMaybe<Scalars['String']>;
  /** Get or set the Share ID to post to. */
  shareId: Scalars['Long'];
  /** Allow the transaction to take the account negative. */
  takeNegative?: InputMaybe<Scalars['Boolean']>;
};

/** Request to transfer funds from one share to another. */
export type NewTransferRequestInput = {
  /** The amount to transfer. */
  amount: Scalars['Money'];
  /** Get or set an optional comment. */
  comment?: InputMaybe<Scalars['String']>;
  /** The destination Share ID. */
  destinationShareId: Scalars['Long'];
  /** The source Share ID. */
  sourceShareId: Scalars['Long'];
};

/** Data fields to create a user. */
export type NewUserRequestInput = {
  /** Get or set the user's email address. */
  email?: InputMaybe<Scalars['String']>;
  /** Get or set the user's password. */
  password?: InputMaybe<Scalars['String']>;
  /** Get or set the user's role. */
  roleId: Scalars['Long'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicates whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean'];
  /** Indicates whether more edges exist prior the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
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
  instances: Array<Scalars['Long']>;
  shareTypeId: Scalars['Long'];
};

export type Privilege = {
  __typename?: 'Privilege';
  dateCreated: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['Long'];
  name: Scalars['String'];
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
  cost: Scalars['Money'];
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  description: Scalars['String'];
  id: Scalars['Long'];
  images: Array<ProductImage>;
  isLimitedQuantity: Scalars['Boolean'];
  name: Scalars['String'];
  productInstances: Array<ProductInstance>;
  quantity: Scalars['Int'];
  rawCost: Scalars['Long'];
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
  id: Scalars['Long'];
  url: Scalars['String'];
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
  instanceId: Scalars['Long'];
  product: Product;
  productId: Scalars['Long'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type ProductsEdge = {
  __typename?: 'ProductsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Product;
};

export type PurchaseRequestInput = {
  items: Array<PurchaseRequestItemInput>;
  shareId: Scalars['Long'];
};

export type PurchaseRequestItemInput = {
  count: Scalars['Int'];
  productId: Scalars['Long'];
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
  quantity: Scalars['Int'];
  shareId: Scalars['Long'];
  stockId: Scalars['Long'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type PurchasesEdge = {
  __typename?: 'PurchasesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: StudentPurchase;
};

/** A request to purge the history of a given stock. */
export type PurgeStockRequestInput = {
  /** A cutoff date.  Stock history entries older than this date will be purged. */
  date: Scalars['DateTime'];
  /** The stock for which to purge history. */
  stockId: Scalars['Long'];
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
  isAuthenticated: Scalars['Boolean'];
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
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<GroupSortInput>>;
  where?: InputMaybe<GroupFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedInstancesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<InstanceSortInput>>;
  where?: InputMaybe<InstanceFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedProductsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<ProductSortInput>>;
  where?: InputMaybe<ProductFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedShareTypesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<ShareTypeSortInput>>;
  where?: InputMaybe<ShareTypeFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedSharesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<ShareSortInput>>;
  where?: InputMaybe<ShareFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedStocksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StockSortInput>>;
  where?: InputMaybe<StockFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryDeletedStudentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StudentSortInput>>;
  where?: InputMaybe<StudentFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<GroupSortInput>>;
  where?: InputMaybe<GroupFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryInstancesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<InstanceSortInput>>;
  where?: InputMaybe<InstanceFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<ProductSortInput>>;
  where?: InputMaybe<ProductFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryPurchasesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StudentPurchaseSortInput>>;
  where?: InputMaybe<StudentPurchaseFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryShareTypesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  instances?: InputMaybe<Array<Scalars['Long']>>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<ShareTypeSortInput>>;
  where?: InputMaybe<ShareTypeFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QuerySharesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<ShareSortInput>>;
  where?: InputMaybe<ShareFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStockHistoryArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StockHistorySortInput>>;
  stockId: Scalars['Long'];
  where?: InputMaybe<StockHistoryFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStocksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  instances?: InputMaybe<Array<Scalars['Long']>>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StockSortInput>>;
  where?: InputMaybe<StockFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentArgs = {
  studentId: Scalars['Long'];
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentStockHistoryArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StudentStockHistorySortInput>>;
  studentStockId: Scalars['Long'];
  where?: InputMaybe<StudentStockHistoryFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentStocksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StudentStockSortInput>>;
  studentId: Scalars['Long'];
  where?: InputMaybe<StudentStockFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryStudentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<StudentSortInput>>;
  where?: InputMaybe<StudentFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Array<TransactionSortInput>>;
  shareId: Scalars['Long'];
  where?: InputMaybe<TransactionFilterInput>;
};


/** Allows students to list their purchases and admins to list all purchases. */
export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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
  dateCreated: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Long'];
  isBuiltIn: Scalars['Boolean'];
  name: Scalars['String'];
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
  privilegeId: Scalars['Long'];
  role: Role;
  roleId: Scalars['Long'];
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
  balance: Scalars['Money'];
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  dateLastActive: Scalars['DateTime'];
  dividendLastAmount: Scalars['Money'];
  id: Scalars['Long'];
  limitedWithdrawalCount: Scalars['Int'];
  rawBalance: Scalars['Long'];
  rawDividendLastAmount: Scalars['Long'];
  rawTotalDividends: Scalars['Long'];
  shareType: ShareType;
  shareTypeId: Scalars['Long'];
  student: Student;
  studentId: Scalars['Long'];
  totalDividends: Scalars['Money'];
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
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  dividendRate: Scalars['Rate'];
  id: Scalars['Long'];
  name: Scalars['String'];
  rawDividendRate: Scalars['Long'];
  rawWithdrawalLimitFee: Scalars['Long'];
  shareTypeInstances: Array<ShareTypeInstance>;
  shares: Array<Share>;
  withdrawalLimitCount: Scalars['Int'];
  withdrawalLimitFee: Scalars['Money'];
  withdrawalLimitLastReset: Scalars['DateTime'];
  withdrawalLimitPeriod: Period;
  withdrawalLimitShouldFee: Scalars['Boolean'];
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
  instanceId: Scalars['Long'];
  shareType: ShareType;
  shareTypeId: Scalars['Long'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type ShareTypesEdge = {
  __typename?: 'ShareTypesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type SharesEdge = {
  __typename?: 'SharesEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Share;
};

export enum SortEnumType {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Stock = {
  __typename?: 'Stock';
  currentValue: Scalars['Money'];
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  formattedDescription: Scalars['String'];
  history: Array<StockHistory>;
  id: Scalars['Long'];
  name: Scalars['String'];
  rawCurrentValue: Scalars['Long'];
  rawDescription: Scalars['String'];
  stockInstances: Array<StockInstance>;
  studentStock: Array<StudentStock>;
  symbol: Scalars['String'];
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
  dateChanged: Scalars['DateTime'];
  id: Scalars['Long'];
  rawValue: Scalars['Long'];
  stock: Stock;
  stockId: Scalars['Long'];
  value: Scalars['Money'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type StockHistoryEdge = {
  __typename?: 'StockHistoryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  instanceId: Scalars['Long'];
  stock: Stock;
  stockId: Scalars['Long'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type StocksEdge = {
  __typename?: 'StocksEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Stock;
};

export type StringOperationFilterInput = {
  and?: InputMaybe<Array<StringOperationFilterInput>>;
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  ncontains?: InputMaybe<Scalars['String']>;
  nendsWith?: InputMaybe<Scalars['String']>;
  neq?: InputMaybe<Scalars['String']>;
  nin?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  nstartsWith?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<StringOperationFilterInput>>;
  startsWith?: InputMaybe<Scalars['String']>;
  startsWithInvariant?: InputMaybe<Scalars['String']>;
};

export type Student = {
  __typename?: 'Student';
  accountNumber: Scalars['String'];
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  dateLastLogin?: Maybe<Scalars['DateTime']>;
  dateRegistered?: Maybe<Scalars['DateTime']>;
  email?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  group: Group;
  groupId: Scalars['Long'];
  id: Scalars['Long'];
  lastName: Scalars['String'];
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
  accountNumber: Scalars['String'];
  inviteCode: Scalars['String'];
};

export type StudentPurchase = {
  __typename?: 'StudentPurchase';
  dateCreated: Scalars['DateTime'];
  id: Scalars['Long'];
  items: Array<StudentPurchaseItem>;
  rawTotalCost: Scalars['Long'];
  status: PurchaseStatus;
  student: Student;
  studentId: Scalars['Long'];
  totalCost: Scalars['Money'];
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
  id: Scalars['Long'];
  product: Product;
  productId: Scalars['Long'];
  purchasePrice: Scalars['Money'];
  quantity: Scalars['Int'];
  rawPurchasePrice: Scalars['Long'];
  studentPurchase: StudentPurchase;
  studentPurchaseId: Scalars['Long'];
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
  email: Scalars['String'];
  password: Scalars['String'];
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
  calculatePurchaseAmount: Scalars['Money'];
  dateCreated: Scalars['DateTime'];
  dateLastActive: Scalars['DateTime'];
  history: Array<StudentStockHistory>;
  id: Scalars['Long'];
  netContribution: Scalars['Money'];
  rawNetContribution: Scalars['Long'];
  sharesOwned: Scalars['Long'];
  stock: Stock;
  stockId: Scalars['Long'];
  student: Student;
  studentId: Scalars['Long'];
};


export type StudentStockCalculatePurchaseAmountArgs = {
  quantity: Scalars['Int'];
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
  amount: Scalars['Money'];
  count: Scalars['Int'];
  datePosted: Scalars['DateTime'];
  id: Scalars['Long'];
  rawAmount: Scalars['Long'];
  studentStock: StudentStock;
  studentStockId: Scalars['Long'];
  transaction: Transaction;
  transactionId: Scalars['Long'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type StudentStockHistoryEdge = {
  __typename?: 'StudentStockHistoryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type StudentStocksEdge = {
  __typename?: 'StudentStocksEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type StudentsEdge = {
  __typename?: 'StudentsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: Student;
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Money'];
  comment?: Maybe<Scalars['String']>;
  effectiveDate: Scalars['DateTime'];
  id: Scalars['Long'];
  newBalance: Scalars['Money'];
  rawAmount: Scalars['Long'];
  rawNewBalance: Scalars['Long'];
  targetShare: Share;
  targetShareId: Scalars['Long'];
  transactionType: Scalars['String'];
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
  amount: Scalars['Money'];
  comment?: InputMaybe<Scalars['String']>;
  effectiveDate?: InputMaybe<Scalars['DateTime']>;
  shareId: Scalars['Long'];
  takeNegative?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<Scalars['String']>;
  withdrawalLimit?: InputMaybe<Scalars['Boolean']>;
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type TransactionsEdge = {
  __typename?: 'TransactionsEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
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
  id: Scalars['Long'];
  /** Get or set the Instance ID of the group. */
  instanceId?: InputMaybe<Scalars['Long']>;
  /** Get or set the name of the group. */
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateInstanceRequestInput = {
  /** Get or set the description of the instance. */
  description?: InputMaybe<Scalars['String']>;
  /** Get or set the ID number of the instance. */
  id: Scalars['Long'];
  /** Get or set if the instance is active. */
  isActive?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateProductRequestInput = {
  cost?: InputMaybe<Scalars['Money']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Long'];
  isLimitedQuantity?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  quantity?: InputMaybe<Scalars['Int']>;
};

export type UpdateShareRequestInput = {
  id: Scalars['Long'];
  shareTypeId: Scalars['Long'];
};

/** Request data to update a Share Type. */
export type UpdateShareTypeRequestInput = {
  /** Get or set the dividend rate. */
  dividendRate?: InputMaybe<Scalars['Rate']>;
  /** Get or set the ID number of the share type. */
  id: Scalars['Long'];
  /** Get or set the name of the share type. */
  name?: InputMaybe<Scalars['String']>;
  /** Get or set the number of withdrawals allowed per period.  Use zero to disable. */
  withdrawalLimitCount?: InputMaybe<Scalars['Int']>;
  /** Get or set the amount to fee if WithdrawalLimitShouldFee is true. */
  withdrawalLimitFee?: InputMaybe<Scalars['Money']>;
  /** Get or set the withdrawal limit period to use when resetting the withdrawal limit counters. */
  withdrawalLimitPeriod?: InputMaybe<Period>;
  /** Get or set if withdrawals over the WithdrawalLimitCount should fee instead of being declined. */
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateStockRequestInput = {
  /** The current value of the stock. */
  currentValue?: InputMaybe<Scalars['Money']>;
  /** The ID number of the stock */
  id: Scalars['Long'];
  /** Name of the company */
  name?: InputMaybe<Scalars['String']>;
  /** Description of the stock. */
  rawDescription?: InputMaybe<Scalars['String']>;
  /** Unique symbol of the stock. */
  symbol?: InputMaybe<Scalars['String']>;
};

/** Data fields to update a student. */
export type UpdateStudentRequestInput = {
  /** Get or set the student's account number. */
  accountNumber?: InputMaybe<Scalars['String']>;
  /** Get or set the student's current password. */
  currentPassword?: InputMaybe<Scalars['String']>;
  /** Get or set the student's email address. */
  email?: InputMaybe<Scalars['String']>;
  /** Get or set the student's first name. */
  firstName?: InputMaybe<Scalars['String']>;
  /** Get or set the student's group ID. */
  groupId?: InputMaybe<Scalars['Long']>;
  /** Get or set the student ID. Required when updating students. */
  id: Scalars['Long'];
  /** Get or set the student's last name. */
  lastName?: InputMaybe<Scalars['String']>;
  /** Get or set the student's password. */
  password?: InputMaybe<Scalars['String']>;
};

/** Data fields to update a user. */
export type UpdateUserRequestInput = {
  /** If a password change is requested, then this field must be set to the user's current password. */
  currentPassword?: InputMaybe<Scalars['String']>;
  /** Get or set the user's email address. */
  email?: InputMaybe<Scalars['String']>;
  /** Get or set the user's ID. */
  id: Scalars['Long'];
  /** Get or set the user's password. */
  password?: InputMaybe<Scalars['String']>;
  /** Get or set the user's role. */
  roleId?: InputMaybe<Scalars['Long']>;
};

export type User = {
  __typename?: 'User';
  dateCreated: Scalars['DateTime'];
  dateDeleted?: Maybe<Scalars['DateTime']>;
  dateLastLogin?: Maybe<Scalars['DateTime']>;
  dateRegistered?: Maybe<Scalars['DateTime']>;
  email: Scalars['String'];
  id: Scalars['Long'];
  role: Role;
  roleId: Scalars['Long'];
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
  totalCount: Scalars['Int'];
};

/** An edge in a connection. */
export type UsersEdge = {
  __typename?: 'UsersEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node: User;
};

export type GroupPartsFragment = { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } };

export type InstancePartsFragment = { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean };

export type PageInfoPartsFragment = { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null };

export type PrivilegePartsFragment = { __typename?: 'Privilege', id: any, name: string, description: string, dateCreated: any };

export type RolePartsFragment = { __typename?: 'Role', id: any, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: any, roleId: any, privilege: { __typename?: 'Privilege', id: any, name: string, description: string, dateCreated: any } }> };

export type RolePrivilegePartsFragment = { __typename?: 'RolePrivilege', privilegeId: any, roleId: any, privilege: { __typename?: 'Privilege', id: any, name: string, description: string, dateCreated: any } };

export type SharePartsFragment = { __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } };

export type ShareTypePartsFragment = { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> };

export type StockPartsFragment = { __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> };

export type StockBasePartsFragment = { __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string };

export type StockHistoryPartsFragment = { __typename?: 'StockHistory', id: any, stockId: any, dateChanged: any, value: any };

export type StudentPartsFragment = { __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } };

export type StudentBasePartsFragment = { __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } };

export type StudentStockPartsFragment = { __typename?: 'StudentStock', id: any, stockId: any, studentId: any, sharesOwned: any, netContribution: any, dateCreated: any, dateLastActive: any, stock: { __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string } };

export type StudentStockHistoryPartsFragment = { __typename?: 'StudentStockHistory', id: any, count: number, amount: any, datePosted: any, transaction: { __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any } };

export type TransactionPartsFragment = { __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any };

export type UserPartsFragment = { __typename?: 'User', id: any, email: string, roleId: any, dateCreated: any, dateRegistered?: any | null, dateLastLogin?: any | null, role: { __typename?: 'Role', id: any, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: any, roleId: any, privilege: { __typename?: 'Privilege', id: any, name: string, description: string, dateCreated: any } }> } };

export type NewGroupMutationVariables = Exact<{
  instanceId: Scalars['Long'];
  name: Scalars['String'];
}>;


export type NewGroupMutation = { __typename?: 'Mutation', newGroup: Array<{ __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } }> };

export type DeleteGroupMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type DeleteGroupMutation = { __typename?: 'Mutation', deleteGroup: boolean };

export type UpdateGroupMutationVariables = Exact<{
  id: Scalars['Long'];
  name: Scalars['String'];
}>;


export type UpdateGroupMutation = { __typename?: 'Mutation', updateGroup: Array<{ __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } }> };

export type NewInstanceMutationVariables = Exact<{
  description: Scalars['String'];
}>;


export type NewInstanceMutation = { __typename?: 'Mutation', newInstance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } };

export type DeleteInstanceMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type DeleteInstanceMutation = { __typename?: 'Mutation', deleteInstance: boolean };

export type UpdateInstanceMutationVariables = Exact<{
  id: Scalars['Long'];
  description?: InputMaybe<Scalars['String']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
}>;


export type UpdateInstanceMutation = { __typename?: 'Mutation', updateInstance: Array<{ __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean }> };

export type NewStockPurchaseMutationVariables = Exact<{
  stockId: Scalars['Long'];
  shareId: Scalars['Long'];
  quantity: Scalars['Int'];
}>;


export type NewStockPurchaseMutation = { __typename?: 'Mutation', newStockPurchase: Array<{ __typename?: 'StudentStock', id: any, stockId: any, studentId: any, sharesOwned: any, netContribution: any, dateCreated: any, dateLastActive: any, stock: { __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string } }> };

export type NewShareMutationVariables = Exact<{
  shareTypeId: Scalars['Long'];
  studentId: Scalars['Long'];
}>;


export type NewShareMutation = { __typename?: 'Mutation', newShare: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }> };

export type DeleteShareMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type DeleteShareMutation = { __typename?: 'Mutation', deleteShare: boolean };

export type NewShareTypeMutationVariables = Exact<{
  name: Scalars['String'];
  dividendRate: Scalars['Rate'];
  withdrawalLimitCount?: InputMaybe<Scalars['Int']>;
  withdrawalLimitPeriod?: InputMaybe<Period>;
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']>;
  withdrawalLimitFee?: InputMaybe<Scalars['Money']>;
}>;


export type NewShareTypeMutation = { __typename?: 'Mutation', newShareType: Array<{ __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> }> };

export type DeleteShareTypeMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type DeleteShareTypeMutation = { __typename?: 'Mutation', deleteShareType: boolean };

export type PostDividendsMutationVariables = Exact<{
  shareTypeId: Scalars['Long'];
  instances: Array<Scalars['Long']> | Scalars['Long'];
}>;


export type PostDividendsMutation = { __typename?: 'Mutation', postDividends: boolean };

export type LinkShareTypeMutationVariables = Exact<{
  shareTypeId: Scalars['Long'];
  instanceId: Scalars['Long'];
}>;


export type LinkShareTypeMutation = { __typename?: 'Mutation', linkShareType: Array<{ __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> }> };

export type UnlinkShareTypeMutationVariables = Exact<{
  shareTypeId: Scalars['Long'];
  instanceId: Scalars['Long'];
}>;


export type UnlinkShareTypeMutation = { __typename?: 'Mutation', unlinkShareType: Array<{ __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> }> };

export type UpdateShareTypeMutationVariables = Exact<{
  id: Scalars['Long'];
  name?: InputMaybe<Scalars['String']>;
  dividendRate?: InputMaybe<Scalars['Rate']>;
  withdrawalLimitCount?: InputMaybe<Scalars['Int']>;
  withdrawalLimitPeriod?: InputMaybe<Period>;
  withdrawalLimitShouldFee?: InputMaybe<Scalars['Boolean']>;
  withdrawalLimitFee?: InputMaybe<Scalars['Money']>;
}>;


export type UpdateShareTypeMutation = { __typename?: 'Mutation', updateShareType: Array<{ __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> }> };

export type NewStockMutationVariables = Exact<{
  name: Scalars['String'];
  symbol: Scalars['String'];
  rawDescription?: InputMaybe<Scalars['String']>;
  currentValue: Scalars['Money'];
}>;


export type NewStockMutation = { __typename?: 'Mutation', newStock: Array<{ __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> }> };

export type DeleteStockMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type DeleteStockMutation = { __typename?: 'Mutation', deleteStock: boolean };

export type PurgeStockHistoryMutationVariables = Exact<{
  stockId: Scalars['Long'];
  date: Scalars['DateTime'];
}>;


export type PurgeStockHistoryMutation = { __typename?: 'Mutation', purgeStockHistory: Array<{ __typename?: 'StockHistory', id: any, stockId: any, dateChanged: any, value: any }> };

export type LinkStockMutationVariables = Exact<{
  stockId: Scalars['Long'];
  instanceId: Scalars['Long'];
}>;


export type LinkStockMutation = { __typename?: 'Mutation', linkStock: Array<{ __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> }> };

export type RestoreStockMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type RestoreStockMutation = { __typename?: 'Mutation', restoreStock: Array<{ __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> }> };

export type UnlinkStockMutationVariables = Exact<{
  stockId: Scalars['Long'];
  instanceId: Scalars['Long'];
}>;


export type UnlinkStockMutation = { __typename?: 'Mutation', unlinkStock: Array<{ __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> }> };

export type UpdateStockMutationVariables = Exact<{
  id: Scalars['Long'];
  name?: InputMaybe<Scalars['String']>;
  symbol?: InputMaybe<Scalars['String']>;
  rawDescription?: InputMaybe<Scalars['String']>;
  currentValue?: InputMaybe<Scalars['Money']>;
}>;


export type UpdateStockMutation = { __typename?: 'Mutation', updateStock: Array<{ __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> }> };

export type UpdateBulkStudentMutationVariables = Exact<{
  students: Array<UpdateStudentRequestInput> | UpdateStudentRequestInput;
}>;


export type UpdateBulkStudentMutation = { __typename?: 'Mutation', updateBulkStudent: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> };

export type NewStudentMutationVariables = Exact<{
  accountNumber: Scalars['String'];
  groupId: Scalars['Long'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  password: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
}>;


export type NewStudentMutation = { __typename?: 'Mutation', newStudent: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> };

export type DeleteStudentMutationVariables = Exact<{
  id: Scalars['Long'];
}>;


export type DeleteStudentMutation = { __typename?: 'Mutation', deleteStudent: boolean };

export type StudentLoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type StudentLoginMutation = { __typename?: 'Mutation', studentLogin: { __typename?: 'AuthenticateResponse', jwtToken: string } };

export type StudentPreregistrationMutationVariables = Exact<{
  inviteCode: Scalars['String'];
  accountNumber: Scalars['String'];
}>;


export type StudentPreregistrationMutation = { __typename?: 'Mutation', studentPreregistration: string };

export type StudentRegistrationMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type StudentRegistrationMutation = { __typename?: 'Mutation', studentRegistration: boolean };

export type StudentRevokeRefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type StudentRevokeRefreshTokenMutation = { __typename?: 'Mutation', studentRevokeRefreshToken: boolean };

export type UpdateStudentMutationVariables = Exact<{
  id: Scalars['Long'];
  accountNumber?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  currentPassword?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  groupId?: InputMaybe<Scalars['Long']>;
}>;


export type UpdateStudentMutation = { __typename?: 'Mutation', updateStudent: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> };

export type NewBulkTransactionMutationVariables = Exact<{
  shares: Array<NewTransactionRequestInput> | NewTransactionRequestInput;
  skipNegative: Scalars['Boolean'];
}>;


export type NewBulkTransactionMutation = { __typename?: 'Mutation', newBulkTransaction: Array<{ __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any }> };

export type NewTransactionMutationVariables = Exact<{
  shareId: Scalars['Long'];
  amount: Scalars['Money'];
  takeNegative?: InputMaybe<Scalars['Boolean']>;
  comment?: InputMaybe<Scalars['String']>;
}>;


export type NewTransactionMutation = { __typename?: 'Mutation', newTransaction: { __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any } };

export type NewTransferMutationVariables = Exact<{
  sourceShareId: Scalars['Long'];
  destinationShareId: Scalars['Long'];
  amount: Scalars['Money'];
  comment?: InputMaybe<Scalars['String']>;
}>;


export type NewTransferMutation = { __typename?: 'Mutation', newTransfer: { __typename?: 'TupleOfTransactionAndTransaction', item1: { __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any }, item2: { __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any } } };

export type UserLoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type UserLoginMutation = { __typename?: 'Mutation', userLogin: { __typename?: 'AuthenticateResponse', jwtToken: string } };

export type UserRevokeRefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type UserRevokeRefreshTokenMutation = { __typename?: 'Mutation', userRevokeRefreshToken: boolean };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['Long'];
  email?: InputMaybe<Scalars['String']>;
  currentPassword?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  roleId?: InputMaybe<Scalars['Long']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: Array<{ __typename?: 'User', id: any, email: string, roleId: any, dateCreated: any, dateRegistered?: any | null, dateLastLogin?: any | null, role: { __typename?: 'Role', id: any, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: any, roleId: any, privilege: { __typename?: 'Privilege', id: any, name: string, description: string, dateCreated: any } }> } }> };

export type CurrentStudentQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentStudentQuery = { __typename?: 'Query', currentStudent: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: Array<{ __typename?: 'User', id: any, email: string, roleId: any, dateCreated: any, dateRegistered?: any | null, dateLastLogin?: any | null, role: { __typename?: 'Role', id: any, name: string, description?: string | null, isBuiltIn: boolean, rolePrivileges: Array<{ __typename?: 'RolePrivilege', privilegeId: any, roleId: any, privilege: { __typename?: 'Privilege', id: any, name: string, description: string, dateCreated: any } }> } }> };

export type GroupsByInstanceQueryVariables = Exact<{
  instanceId?: InputMaybe<Scalars['Long']>;
}>;


export type GroupsByInstanceQuery = { __typename?: 'Query', groups?: { __typename?: 'GroupsConnection', nodes?: Array<{ __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } }> | null } | null };

export type AllInstancesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllInstancesQuery = { __typename?: 'Query', instances?: { __typename?: 'InstancesConnection', nodes?: Array<{ __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean }> | null } | null };

export type ShareTypesQueryVariables = Exact<{
  instances?: InputMaybe<Array<Scalars['Long']> | Scalars['Long']>;
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type ShareTypesQuery = { __typename?: 'Query', shareTypes?: { __typename?: 'ShareTypesConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> }> | null } | null };

export type SharesByStudentIdQueryVariables = Exact<{
  studentId: Scalars['Long'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type SharesByStudentIdQuery = { __typename?: 'Query', shares?: { __typename?: 'SharesConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }> | null } | null };

export type StockHistoryQueryVariables = Exact<{
  stockId: Scalars['Long'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type StockHistoryQuery = { __typename?: 'Query', stockHistory?: { __typename?: 'StockHistoryConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'StockHistory', id: any, stockId: any, dateChanged: any, value: any }> | null } | null };

export type StocksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  instances?: InputMaybe<Array<Scalars['Long']> | Scalars['Long']>;
  where?: InputMaybe<StockFilterInput>;
  order?: StockSortInput;
}>;


export type StocksQuery = { __typename?: 'Query', stocks?: { __typename?: 'StocksConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string, stockInstances: Array<{ __typename?: 'StockInstance', instanceId: any, instance: { __typename?: 'Instance', id: any, description: string, inviteCode: string, isActive: boolean } }> }> | null } | null };

export type StudentsByIdQueryVariables = Exact<{
  id: Scalars['Long'];
}>;


export type StudentsByIdQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', nodes?: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> | null } | null };

export type StudentsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<StudentFilterInput>;
}>;


export type StudentsQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', accountNumber: string }> | null } | null };

export type StudentStockHistoryQueryVariables = Exact<{
  studentStockId: Scalars['Long'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  order?: StudentStockHistorySortInput;
}>;


export type StudentStockHistoryQuery = { __typename?: 'Query', studentStockHistory?: { __typename?: 'StudentStockHistoryConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'StudentStockHistory', id: any, count: number, amount: any, datePosted: any, transaction: { __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any } }> | null } | null };

export type StudentStocksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  order?: StudentStockSortInput;
  where?: InputMaybe<StudentStockFilterInput>;
  studentId: Scalars['Long'];
}>;


export type StudentStocksQuery = { __typename?: 'Query', studentStocks?: { __typename?: 'StudentStocksConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'StudentStock', id: any, stockId: any, studentId: any, sharesOwned: any, netContribution: any, dateCreated: any, dateLastActive: any, stock: { __typename?: 'Stock', id: any, name: string, symbol: string, currentValue: any, rawDescription: string, formattedDescription: string } }> | null } | null };

export type StudentsWithSharesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  order?: StudentSortInput;
  groupId?: InputMaybe<Scalars['Long']>;
}>;


export type StudentsWithSharesQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> | null } | null };

export type StudentsByAcccountNumberQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  order?: StudentSortInput;
  accountNumber: Scalars['String'];
}>;


export type StudentsByAcccountNumberQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> | null } | null };

export type StudentsByEmailQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  order?: StudentSortInput;
  email: Scalars['String'];
}>;


export type StudentsByEmailQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> | null } | null };

export type StudentsByNameQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  order?: StudentSortInput;
  name: Scalars['String'];
}>;


export type StudentsByNameQuery = { __typename?: 'Query', students?: { __typename?: 'StudentsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Student', id: any, accountNumber: string, firstName: string, lastName: string, groupId: any, email?: string | null, dateLastLogin?: any | null, dateRegistered?: any | null, shares: Array<{ __typename?: 'Share', id: any, shareTypeId: any, balance: any, studentId: any, limitedWithdrawalCount: number, shareType: { __typename?: 'ShareType', id: any, name: string, dividendRate: any, withdrawalLimitCount: number, withdrawalLimitPeriod: Period, withdrawalLimitLastReset: any, withdrawalLimitShouldFee: boolean, withdrawalLimitFee: any, shareTypeInstances: Array<{ __typename?: 'ShareTypeInstance', instanceId: any }> } }>, group: { __typename?: 'Group', id: any, instanceId: any, name: string, instance: { __typename?: 'Instance', id: any, description: string } } }> | null } | null };

export type TransactionsQueryVariables = Exact<{
  shareId: Scalars['Long'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  order?: TransactionSortInput;
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions?: { __typename?: 'TransactionsConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ __typename?: 'Transaction', id: any, targetShareId: any, transactionType: string, effectiveDate: any, comment?: string | null, amount: any, newBalance: any }> | null } | null };


      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    