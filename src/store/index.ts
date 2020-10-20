import Vuex from 'vuex';
import IUserState from './modules/user/IUserState';
import IInstanceState from './modules/instance/IInstanceState';
import IGroupState from './modules/group/IGroupState';

export interface IRootState {
  user: IUserState;
  instance: IInstanceState;
  group: IGroupState;
}

export default new Vuex.Store<IRootState>({});
