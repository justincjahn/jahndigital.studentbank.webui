import { RouteRecordRaw } from 'vue-router';
import GroupsModule from './GroupsModule.vue';
import GroupsIndex from './pages/GroupsIndex.vue';

export enum RouteNames {
  index = 'groups',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/groups',
    component: GroupsModule,

    children: [
      {
        path: '',
        name: RouteNames.index,
        component: GroupsIndex,
      },
    ],
  },
];

export default routes;
