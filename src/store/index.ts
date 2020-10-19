import Vuex from 'vuex';
import IUserState from './modules/user/IUserState';
import IInstanceState from './modules/instance/IInstanceState';

export interface IRootState {
  user: IUserState;
  instance: IInstanceState;
}

export default new Vuex.Store<IRootState>({});
