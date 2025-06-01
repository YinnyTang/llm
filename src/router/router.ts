import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Chat from "../pages/Chat.vue";
import Test from "../pages/test.vue";
const routes = [
  { path: "/", component: Home },
  { path: "/chat", component: Chat },
  { path: "/test", component: Test },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
