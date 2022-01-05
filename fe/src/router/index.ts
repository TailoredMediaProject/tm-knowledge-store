import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router';
import VocabListView from '@/components/VocabListView.vue';
import EntityListView from '@/components/EntityListView.vue';
import Create from '@/views/Create.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/vocab'
  },
  {
    path: '/vocab',
    name: 'VocabListView',
    component: VocabListView
  },
  {
    path: '/vocab/:vocabID/entities',
    name: 'EntityListView',
    component: EntityListView,
    props: true
  },
  {
    path: '/create/:vocabID?',
    name: 'Create',
    component: Create,
    props: true
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
