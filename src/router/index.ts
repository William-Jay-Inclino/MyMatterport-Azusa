import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // component: () => import('../views/SpaceListView.vue')
      redirect: '/space/list'
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/users',
      name: 'userList',
      component: () => import('../views/UserListView.vue')
    },
    {
      path: '/space/list',
      name: 'spaceList',
      component: () => import('../views/SpaceListView.vue')
    },
    {
      path: '/space/3d',
      name: 'space3d',
      component: () => import('../views/Space3dView.vue')
    },
    {
      path: '/user/login',
      name: 'userLogin',
      component: () => import('../views/UserView.vue')
    },
    {
      path: '/user/profile',
      name: 'userProfile',
      component: () => import('../views/UserView.vue')
    },
  ]
})

export default router
