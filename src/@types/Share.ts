import ShareType from './ShareType';

type Share = {
  id: number;
  typeId: number;
  balance: number;
  shareType?: ShareType;
}

export default Share;
