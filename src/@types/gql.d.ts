// GraphQL-specific typings for querying/filtering/sorting/etc.

/**
 * GLOBAL
 */

type SortOperationKind = 'ASC' | 'DESC';

/**
 * STOCKS
 */

type StockSortOptions = 'name' | 'symbol' | 'rawCurrentValue';
type StockSort = OneKey<StockSortOptions, SortOperationKind>;

type StockFilterOptions = 'name_contains'
  | 'name_not_contains'
  | 'name_starts_with'
  | 'name_ends_with'
  | 'symbol_contains'
  | 'symbol_not_contains'
  | 'symbol_starts_with'
  | 'symbol_ends_with'
  | 'symbol_in'
  | 'symbol_not_in';

type StockFilterFilters = OneKey<StockFilterOptions, string>;
interface StockFilterOr { OR: StockFilterFilters[] }
interface StockFilterAnd { AND: StockFilterFilters[] }
type StockFilter = StockFilterFilters | StockFilterOr | StockFilterAnd;

type StudentStockFilterOptions =
  'id'
  | 'id_not'
  | 'id_in'
  | 'id_not_in'
  | 'stockId'
  | 'stockId_not'
  | 'stockId_in'
  | 'stockId_not_in';

type StudentStockFilterFilters = OneKey<StudentStockFilterOptions, int | int[]>;
interface StudentStockFilterOr { OR: StudentStockFilterFilters[] }
interface StudentStockFilterAnd { AND: StudentStockFilterFilters[] }
type StudentStockFilter = StudentStockFilterFilters | StudentStockFilterOr | StudentStockFilterAnd;
