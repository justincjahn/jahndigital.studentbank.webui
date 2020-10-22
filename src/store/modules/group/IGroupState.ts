import Group from '@/@types/Group';

export default interface IGroupState {
  groups: Group[];
  selectedGroup: Group|null;
  loading: boolean;
}
