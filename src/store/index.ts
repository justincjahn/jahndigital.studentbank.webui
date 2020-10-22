import Vuex from 'vuex';
import IUserState from './modules/user/IUserState';
import IInstanceState from './modules/instance/IInstanceState';
import IGroupState from './modules/group/IGroupState';
import IStudentState from './modules/student/IStudentState';

export interface IRootState {
  user: IUserState;
  instance: IInstanceState;
  group: IGroupState;
  student: IStudentState;
}

export default new Vuex.Store<IRootState>({});
