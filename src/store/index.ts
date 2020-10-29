import Vuex from 'vuex';
import IUserState from './modules/user/IUserState';
import IInstanceState from './modules/instance/IInstanceState';
import IGroupState from './modules/group/IGroupState';
import IStudentState from './modules/student/IStudentState';
import IGlobalState from './modules/global/IGlobalState';

export interface IRootState {
  user: IUserState;
  instance: IInstanceState;
  group: IGroupState;
  student: IStudentState;
  global: IGlobalState;
}

export default new Vuex.Store<IRootState>({});
