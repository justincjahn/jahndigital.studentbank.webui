import { RouteRecordRaw } from 'vue-router';

// Route Names
import RouteNames from './routeNames';

// Components
import GroupsModule from './GroupsModule.vue';
import GroupsIndex from './pages/GroupsIndex.vue';

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
