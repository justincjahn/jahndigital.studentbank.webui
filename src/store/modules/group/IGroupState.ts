import Group from '@/@types/Group';

export default interface IGroupState {
  groups: Group[];

  selectedGroup?: Group;

  loading: boolean;
}
