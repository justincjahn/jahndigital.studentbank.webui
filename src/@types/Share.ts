import ShareType from './ShareType';

type Share = {
  id: number;
  typeId: number;
  balance: number;

  type?: ShareType;
}

export default Share;
