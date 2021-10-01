import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Overview from "../views/Overview.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Overview,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
