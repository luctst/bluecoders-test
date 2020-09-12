import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import EditTask from '../views/EditTask.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Login,
  },
  {
    path: '/task/:id',
    name: 'editTask',
    component: EditTask,
    props: true,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
