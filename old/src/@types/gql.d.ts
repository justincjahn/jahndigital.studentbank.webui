// GraphQL-specific typings for querying/filtering/sorting/etc.

/**
 * GLOBAL
 */

type SortOperationKind = 'ASC' | 'DESC';
type SortBase<TOptions> = OneKey<TOptions, SortOperationKind>;

type FilterOperation = 'eq'
  | 'neq'
  | 'contains'
  | 'ncontains'
  | 'in'
  | 'nin'
  | 'startsWith'
  | 'nstartsWith'
  | 'startsWithInvariant'
  | 'endsWith'
  | 'nendsWith'
  | 'gt'
  | 'ngt'
  | 'gte'
  | 'ngte'
  | 'lt'
  | 'nlt'
  | 'lte'
  | 'nlte';

type FilterInput = OneKey<FilterOperation, string | number | string[] | number[]>;
interface FilterAndBase<TFilter> { and: TFilter[] }
interface FilterOrBase<TFilter> { or: TFilter[] }
type FilterBase<TOptions> = OneKey<TOptions, FilterInput>
  | FilterOrBase<OneKey<TOptions, FilterInput>>
  | FilterAndBase<OneKey<TOptions, FilterInput>>;

/**
 * STOCKS
 */

type StockSortOptions = 'name' | 'symbol' | 'rawCurrentValue';
type StockSort = SortBase<StockSortOptions>;

type StockFilterOptions = 'id' | 'name' | 'symbol';
type StockFilter = FilterBase<StockFilterOptions>;

type StudentStockFilterOptions = 'id' | 'stockId';
type StudentStockFilter = FilterBase<StudentStockFilterOptions>;

/**
 * STUDENTS
 */

type StudentSortOptions = 'id'
  | 'accountNumber'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'dateLastLogin'
  | 'dateCreated'
  | 'dateRegistered';

type StudentSort = SortBase<StudentSortOptions>;

type StudentFilterOptions =
  'accountNumber'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'groupId';

type StudentFilter = FilterBase<StudentFilterOptions>;
