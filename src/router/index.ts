import { createRouter, createWebHistory, type LocationQuery, type LocationQueryValue, type RouteParams } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useSessionStore } from '@/stores/session';
import { USER_GROUP } from '@/stores/types';
import localForage from "localforage";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/SpaceListView.vue')
      // redirect: '/space/list'
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
      component: () => import('../views/UserListView.vue'),
    },
    {
      path: '/space/list',
      name: 'spaceList',
      component: () => import('../views/SpaceListView.vue')
    },
    {
      path: '/space/view/:uuid',
      name: 'publicSpace',
      component: () => import('../views/Space3dPublic.vue')
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
    {
      path: '/error/404',
      name: 'error404',
      component: () => import('../views/Error404.vue')
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  const sessionStore = useSessionStore()

  if(to.name === 'publicSpace'){
    console.log('to.name: publicSpace')

    if(await isValidSpaceToken(to.params, to.query)){
      next()
    }else{
      console.error('Invalid token')
      router.push({name: 'error404'})
    }
    return 
  }

  if(to.name === 'error404'){
    next()
    return 
  }

  // sessionStore.isUserInSession

  const authLocal = await localForage.getItem("session")

  if(authLocal){
    sessionStore.session = JSON.parse(authLocal)
  }else{
    console.log('authLocal is undefined')
  }


  const allowedURLForAdmin = ['/user/login', '/space/list', '/space/3d', '/user/list']
  const allowedURLForNonAdmin = ['/user/login', '/space/list', '/space/3d']

  console.log("Route Accessing: ", to.name)
  console.log("Route Leaving: ", from.name)

  // if an authUser is Logged In, its user_group will be checked for its allowed URLS
  if (sessionStore.isLoggedIn) {
    console.log("Route, User is logged in", sessionStore.userRole)

    // An ADMIN User has access to all Pages
    if (sessionStore.userRole == USER_GROUP.Admin && allowedURLForAdmin){
      console.log("Route Admin Nagivation: ", to.name)
      next()
    }

    // A MANAGER/USER cannot access UserList, hence it will be redirected to SpaceList
    else if ((sessionStore.userRole == USER_GROUP.Manager || sessionStore.userRole == USER_GROUP.User) && allowedURLForNonAdmin){
      if (to.name === 'userList') {
        router.push('/space/list')
      } else {
        console.log("Route Non-Admin Nagivation: ", to.name)
        next()
      }
    }

  }

  // If no authUser is Logged, it will redirect to UserLogin Page
  else {
    console.log("Route No User is Logged", sessionStore.isLoggedIn)
    if (to.path !== '/user/login') {
      console.log("Route Not in User Login")
      router.push('/user/login')
    }
    next()
  }
});

const isValidSpaceToken = async(params: RouteParams, query: LocationQuery) :Promise<boolean> => {
  console.log('isValidSpaceToken()')
  console.log('params', params)
  console.log('query', query)

  if(!params['uuid']){
    console.error('undefined params: uuid')
    return false
  }

  if(!query['token']){
    console.error('undefined query: token')
    return false
  }

  const spaceId = params['uuid']
  const token = query['token']

  try {

    interface Response{
      status: 'success' | 'fail' 
      message: string
    }
    
    const res = await api.get(`/validateSpaceToken/${spaceId}`, {params: {token: token}})

    if(res.status === 200){
      const data: Response = res.data
      
      console.log('Response message: ', data.message)
      console.log('Response status', data.status)

      return data.status === 'success' ? true : false 

    }else{
      console.error('Error status: ' + res.status)
      console.error('Error msg: ' + res.statusText)
    }

  } catch (error) {
    console.error('Error ' + error)
  }

  return false 
}

export default router
