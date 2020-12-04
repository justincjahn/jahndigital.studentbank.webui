import PageInfo from '../PageInfo';
import Transaction from '../Transaction';

type PagedTransactionResponse = {
  transactions: {
    pageInfo: PageInfo;
    totalCount: number;
    nodes: Transaction[];
  };
}

export default PagedTransactionResponse;
