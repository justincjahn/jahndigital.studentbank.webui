import Group from '../Group';
import PageInfo from '../PageInfo';

type PagedGroupResponse = {
  groups: {
    pageInfo: PageInfo;
    nodes: Group[];
  };
}

export default PagedGroupResponse;
