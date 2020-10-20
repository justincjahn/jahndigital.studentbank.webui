import Instance from '@/@types/Instance';

export default interface IInstanceState {
  instances: Instance[];
  selectedInstance: Instance | null;
  loading: boolean;
}
